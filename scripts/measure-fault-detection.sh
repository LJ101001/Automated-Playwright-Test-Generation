#!/bin/bash
# Fault Detection Measurement
# Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
#
# For a given feature, starts the seeded fault server (all 5 faults active),
# runs both the multi-agent spec and the baseline spec against it, counts how
# many of the 5 fault categories caused at least one test failure per condition,
# then appends fault_detection_capacity to results.json.
#
# Usage:  bash scripts/measure-fault-detection.sh <feature>
# Example: bash scripts/measure-fault-detection.sh httpbookstoscrapecom-browse-all-books-on-h

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

FEATURE="${1:-}"
if [[ -z "$FEATURE" ]]; then
  echo "Usage: bash scripts/measure-fault-detection.sh <feature>"
  exit 1
fi

RESULTS_FILE="docs/evaluation/results.json"
FAULT_COUNT=5

MULTI_SPEC="tests/playwright/${FEATURE}.spec.ts"
BASELINE_SPEC="tests/playwright/baseline-${FEATURE}.spec.ts"

echo ""
echo "============================================================"
echo "  Fault Detection Measurement"
echo "  Feature  : $FEATURE"
echo "  Multi-agent spec  : $MULTI_SPEC"
echo "  Baseline spec     : $BASELINE_SPEC"
echo "============================================================"
echo ""

# ── Validate spec files ────────────────────────────────────────────────────
if [[ ! -f "$MULTI_SPEC" && ! -f "$BASELINE_SPEC" ]]; then
  echo "ERROR: Neither spec file found. Run qa-pipeline and qa-baseline first."
  exit 1
fi

# ── Create URL-substituted copies of the specs for localhost:3001 ──────────
# The generated specs hardcode http://books.toscrape.com; swap to localhost.

MULTI_FAULT_SPEC="tests/playwright/${FEATURE}-fault.spec.ts"
BASELINE_FAULT_SPEC="tests/playwright/baseline-${FEATURE}-fault.spec.ts"

if [[ -f "$MULTI_SPEC" ]]; then
  sed 's|http://books\.toscrape\.com|http://localhost:3001|g' \
    "$MULTI_SPEC" > "$MULTI_FAULT_SPEC"
  echo "Created fault spec: $MULTI_FAULT_SPEC"
fi

if [[ -f "$BASELINE_SPEC" ]]; then
  sed 's|http://books\.toscrape\.com|http://localhost:3001|g' \
    "$BASELINE_SPEC" > "$BASELINE_FAULT_SPEC"
  echo "Created fault spec: $BASELINE_FAULT_SPEC"
fi

# ── Helper: parse Playwright JSON for pass/fail counts ────────────────────
parse_counts() {
  local report="$1"
  if [[ ! -f "$report" ]]; then
    echo "0 0"
    return
  fi
  node -e "
    const fs = require('fs');
    try {
      const d = JSON.parse(fs.readFileSync('$report','utf8'));
      const passed = d.stats ? (d.stats.expected || 0) : 0;
      const failed = d.stats ? (d.stats.unexpected || 0) : 0;
      console.log(passed + ' ' + failed);
    } catch(e) { console.log('0 0'); }
  "
}

# ── Run fault specs against each individual fault, then all-active ─────────
# Strategy:
#  1. Run all-faults-active → get total failures
#  2. For each fault, run with only that fault active and count failures
#  3. A fault is "detected" if running with that fault produces more failures
#     than a clean (no-fault) run.
# We compare against a clean baseline run on localhost:3001 (no faults).

run_spec_json() {
  local spec="$1"
  local report="$2"
  if [[ ! -f "$spec" ]]; then
    echo '{"stats":{"expected":0,"unexpected":0}}' > "$report"
    return
  fi
  # BASE_URL covers specs that rely on playwright.config.ts's default baseURL
  # (e.g. multi-agent specs using relative page.goto() paths). The sed-based
  # rewrite above still handles specs that hardcode baseURL via test.use(),
  # which takes precedence over the env var.
  BASE_URL=http://localhost:3001 npx playwright test "$spec" \
    --reporter=json \
    --project=chromium \
    2>/dev/null > "$report" || true
}

# ── Start fault server ─────────────────────────────────────────────────────
echo "Starting fault server (all 5 faults active)..."

FAULT_01=true FAULT_02=true FAULT_03=true FAULT_04=true FAULT_05=true \
  node scripts/seed-faults.js &
FAULT_SERVER_PID=$!

# Give the server a moment to bind
sleep 2

cleanup() {
  echo "Stopping fault server (PID $FAULT_SERVER_PID)..."
  kill "$FAULT_SERVER_PID" 2>/dev/null || true
  # Remove temporary fault spec copies
  rm -f "$MULTI_FAULT_SPEC" "$BASELINE_FAULT_SPEC"
}
trap cleanup EXIT

# ── Verify the fault server is up ─────────────────────────────────────────
if ! curl -s -o /dev/null --max-time 5 http://localhost:3001/ ; then
  echo "ERROR: Fault server did not start on port 3001."
  exit 1
fi
echo "Fault server ready."
echo ""

# ── Run clean (no-fault) baseline for comparison ──────────────────────────
echo "--- Running clean (no-fault) comparison ---"

# Restart without faults
kill "$FAULT_SERVER_PID" 2>/dev/null || true
sleep 1
node scripts/seed-faults.js &
FAULT_SERVER_PID=$!
sleep 2

CLEAN_MULTI_REPORT="docs/evaluation/fault-clean-multi-${FEATURE}.json"
CLEAN_BASELINE_REPORT="docs/evaluation/fault-clean-baseline-${FEATURE}.json"

[[ -f "$MULTI_FAULT_SPEC" ]]   && run_spec_json "$MULTI_FAULT_SPEC"   "$CLEAN_MULTI_REPORT"
[[ -f "$BASELINE_FAULT_SPEC" ]] && run_spec_json "$BASELINE_FAULT_SPEC" "$CLEAN_BASELINE_REPORT"

read -r CLEAN_MULTI_PASS CLEAN_MULTI_FAIL <<< "$(parse_counts "$CLEAN_MULTI_REPORT")"
read -r CLEAN_BASE_PASS  CLEAN_BASE_FAIL  <<< "$(parse_counts "$CLEAN_BASELINE_REPORT")"
echo "  Clean multi-agent  : passed=$CLEAN_MULTI_PASS failed=$CLEAN_MULTI_FAIL"
echo "  Clean single-agent : passed=$CLEAN_BASE_PASS  failed=$CLEAN_BASE_FAIL"

# Kill clean server and restart with faults
kill "$FAULT_SERVER_PID" 2>/dev/null || true
sleep 1

# ── Run each fault in isolation ────────────────────────────────────────────
declare -a FAULT_VARS=("FAULT_01" "FAULT_02" "FAULT_03" "FAULT_04" "FAULT_05")

MULTI_DETECTED=0
BASE_DETECTED=0

for FAULT_VAR in "${FAULT_VARS[@]}"; do
  echo ""
  echo "--- Testing $FAULT_VAR in isolation ---"

  # Start server with only this fault
  env "${FAULT_VAR}=true" node scripts/seed-faults.js &
  FAULT_SERVER_PID=$!
  sleep 2

  MULTI_REPORT="docs/evaluation/fault-${FAULT_VAR}-multi-${FEATURE}.json"
  BASE_REPORT="docs/evaluation/fault-${FAULT_VAR}-baseline-${FEATURE}.json"

  [[ -f "$MULTI_FAULT_SPEC" ]]    && run_spec_json "$MULTI_FAULT_SPEC"    "$MULTI_REPORT"
  [[ -f "$BASELINE_FAULT_SPEC" ]] && run_spec_json "$BASELINE_FAULT_SPEC" "$BASE_REPORT"

  read -r MPASS MFAIL <<< "$(parse_counts "$MULTI_REPORT")"
  read -r BPASS BFAIL <<< "$(parse_counts "$BASE_REPORT")"

  MULTI_CAUGHT=0
  BASE_CAUGHT=0
  if [[ "$MFAIL" -gt "$CLEAN_MULTI_FAIL" ]]; then
    MULTI_CAUGHT=1
    MULTI_DETECTED=$(( MULTI_DETECTED + 1 ))
  fi
  if [[ "$BFAIL" -gt "$CLEAN_BASE_FAIL" ]]; then
    BASE_CAUGHT=1
    BASE_DETECTED=$(( BASE_DETECTED + 1 ))
  fi

  echo "  multi-agent  : passed=$MPASS failed=$MFAIL  → fault detected: $MULTI_CAUGHT"
  echo "  single-agent : passed=$BPASS failed=$BFAIL  → fault detected: $BASE_CAUGHT"

  kill "$FAULT_SERVER_PID" 2>/dev/null || true
  sleep 1
done

# ── Results ────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  Fault Detection Results for: $FEATURE"
echo "  Faults tested             : $FAULT_COUNT"
echo "  multi-agent  detected     : $MULTI_DETECTED / $FAULT_COUNT"
echo "  single-agent detected     : $BASE_DETECTED  / $FAULT_COUNT"
echo "============================================================"

# ── Update results.json ────────────────────────────────────────────────────
if [[ -f "$RESULTS_FILE" ]]; then
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_FILE','utf8'));
    let updatedMulti = 0, updatedBase = 0;
    for (const run of data.runs) {
      if ((run.spec_file || '').includes('$FEATURE')) {
        if (run.condition === 'multi-agent') {
          run.fault_detection_capacity = $MULTI_DETECTED;
          updatedMulti++;
        } else if (run.condition === 'single-agent') {
          run.fault_detection_capacity = $BASE_DETECTED;
          updatedBase++;
        }
      }
    }
    fs.writeFileSync('$RESULTS_FILE', JSON.stringify(data, null, 2));
    console.log('Updated multi-agent entries: ' + updatedMulti);
    console.log('Updated single-agent entries: ' + updatedBase);
  "
  echo "Results appended to $RESULTS_FILE"
else
  echo "WARNING: $RESULTS_FILE not found — run scripts/run-evaluation.sh first."
fi
