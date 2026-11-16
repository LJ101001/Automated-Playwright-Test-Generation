#!/bin/bash
# Single-Requirement Evaluation Runner
# Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
#
# Runs qa-pipeline and qa-baseline 5 times each for ONE requirement (rather
# than looping over every requirement in docs/benchmark.md like
# run-evaluation.sh does). Appends results to docs/evaluation/results.json,
# then runs FR-coverage and fault-detection measurement, then regenerates
# docs/evaluation/ANALYSIS.md.
#
# Usage:  bash scripts/run-single-requirement.sh "<requirement text>"
# Example: bash scripts/run-single-requirement.sh "http://books.toscrape.com — filter books by the Mystery category"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

RESULTS_FILE="docs/evaluation/results.json"
RUNS_PER_CONDITION=5

if [[ -z "${1:-}" ]]; then
  echo "Usage: bash scripts/run-single-requirement.sh \"<requirement text>\""
  exit 1
fi
REQUIREMENT="$1"

mkdir -p docs/evaluation test-results

if [[ ! -f "$RESULTS_FILE" ]]; then
  echo '{"runs":[]}' > "$RESULTS_FILE"
fi

feature_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | cut -c1-40
}

parse_pw_report() {
  local report_path="$1"
  if [[ ! -f "$report_path" ]]; then
    echo "0 0"
    return
  fi
  node -e "
    const fs = require('fs');
    try {
      const data = JSON.parse(fs.readFileSync('$report_path', 'utf8'));
      const passed = data.stats ? (data.stats.expected || 0) : 0;
      const failed = data.stats ? (data.stats.unexpected || 0) : 0;
      console.log(passed + ' ' + failed);
    } catch (e) {
      console.log('0 0');
    }
  "
}

append_result() {
  local requirement="$1"
  local condition="$2"
  local run_num="$3"
  local passed="$4"
  local failed="$5"
  local spec_file="$6"

  local total=$(( passed + failed ))
  local success_rate
  if [[ $total -eq 0 ]]; then
    success_rate="0.0"
  else
    success_rate=$(node -e "console.log(($passed / $total).toFixed(4))")
  fi

  node -e "
    const fs = require('fs');
    const path = '$RESULTS_FILE';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data.runs.push({
      requirement: $(printf '%s' "$requirement" | node -e "const s = require('fs').readFileSync('/dev/stdin','utf8'); process.stdout.write(JSON.stringify(s.trim()));"),
      condition: '$condition',
      run: $run_num,
      passed: $passed,
      failed: $failed,
      success_rate: $success_rate,
      spec_file: '$spec_file',
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  "
}

FEATURE=$(feature_name "$REQUIREMENT")

echo ""
echo "============================================================"
echo "  Single-Requirement Evaluation Runner"
echo "  Requirement  : $REQUIREMENT"
echo "  Feature name : $FEATURE"
echo "  Runs/condition: $RUNS_PER_CONDITION"
echo "============================================================"
echo ""

# ── Multi-agent runs ─────────────────────────────────────────────────────
for RUN in $(seq 1 $RUNS_PER_CONDITION); do
  echo ""
  echo "[multi-agent] Run $RUN/$RUNS_PER_CONDITION"

  ./qa-pipeline "$REQUIREMENT" 2>&1 || true

  SPEC="tests/playwright/${FEATURE}.spec.ts"
  RUN_REPORT="docs/evaluation/pw-report-multi-${FEATURE}-run${RUN}.json"
  if [[ -f "$SPEC" ]]; then
    echo "  Running spec: $SPEC"
    npx playwright test "$SPEC" --reporter=json --project=chromium 2>/dev/null > "$RUN_REPORT" || true
  else
    echo "  WARNING: spec file not found: $SPEC"
    echo '{"stats":{"expected":0,"unexpected":0}}' > "$RUN_REPORT"
  fi

  ARCHIVE_SPEC="tests/playwright/${FEATURE}-multi-run${RUN}.spec.ts"
  [[ -f "$SPEC" ]] && cp "$SPEC" "$ARCHIVE_SPEC" || true

  read -r PASSED FAILED <<< "$(parse_pw_report "$RUN_REPORT")"
  echo "  Result: passed=$PASSED failed=$FAILED"
  append_result "$REQUIREMENT" "multi-agent" "$RUN" "$PASSED" "$FAILED" "$SPEC"
done

# ── Single-agent (baseline) runs ─────────────────────────────────────────
for RUN in $(seq 1 $RUNS_PER_CONDITION); do
  echo ""
  echo "[single-agent] Run $RUN/$RUNS_PER_CONDITION"

  ./qa-baseline "$REQUIREMENT" 2>&1 || true

  SPEC="tests/playwright/baseline-${FEATURE}.spec.ts"
  RUN_REPORT="docs/evaluation/pw-report-baseline-${FEATURE}-run${RUN}.json"
  if [[ -f "$SPEC" ]]; then
    echo "  Running spec: $SPEC"
    npx playwright test "$SPEC" --reporter=json --project=chromium 2>/dev/null > "$RUN_REPORT" || true
  else
    echo "  WARNING: spec file not found: $SPEC"
    echo '{"stats":{"expected":0,"unexpected":0}}' > "$RUN_REPORT"
  fi

  ARCHIVE_SPEC="tests/playwright/baseline-${FEATURE}-run${RUN}.spec.ts"
  [[ -f "$SPEC" ]] && cp "$SPEC" "$ARCHIVE_SPEC" || true

  read -r PASSED FAILED <<< "$(parse_pw_report "$RUN_REPORT")"
  echo "  Result: passed=$PASSED failed=$FAILED"
  append_result "$REQUIREMENT" "single-agent" "$RUN" "$PASSED" "$FAILED" "$SPEC"
done

# ── Post-processing: FR coverage, fault detection, analysis ─────────────
echo ""
echo "============================================================"
echo "  Measuring FR coverage..."
echo "============================================================"
node scripts/measure-fr-coverage.js "$FEATURE" multi-agent || true
node scripts/measure-fr-coverage.js "$FEATURE" single-agent || true

echo ""
echo "============================================================"
echo "  Measuring fault detection capacity..."
echo "============================================================"
bash scripts/measure-fault-detection.sh "$FEATURE" || true

echo ""
echo "============================================================"
echo "  Regenerating ANALYSIS.md..."
echo "============================================================"
node scripts/analyse-results.js || true

echo ""
echo "============================================================"
echo "  Done. Requirement complete: $REQUIREMENT"
echo "============================================================"
