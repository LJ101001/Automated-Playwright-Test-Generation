#!/bin/bash
# Evaluation Runner
# Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
#
# Loops over all 8 requirements in docs/benchmark.md and runs qa-pipeline and
# qa-baseline 5 times each. After every run the Playwright JSON report is parsed
# and results are appended to docs/evaluation/results.json.
#
# Usage:  bash scripts/run-evaluation.sh
#
# Prerequisites:
#   npm install
#   npx playwright install
#   Claude Code VSCode extension installed (needed by qa-pipeline / qa-baseline)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

RESULTS_FILE="docs/evaluation/results.json"
REPORT_FILE="docs/evaluation/pw-report.json"
BENCHMARK_FILE="docs/benchmark.md"
RUNS_PER_CONDITION=5

# ── Initialise results.json ────────────────────────────────────────────────
mkdir -p docs/evaluation test-results

if [[ ! -f "$RESULTS_FILE" ]]; then
  echo '{"runs":[]}' > "$RESULTS_FILE"
fi

# ── Read requirements from benchmark.md ───────────────────────────────────
# Extracts the text inside `"..."` on each numbered requirement line
mapfile -t REQUIREMENTS < <(grep -oP '`"\K[^"]+(?="`)'  "$BENCHMARK_FILE")

if [[ ${#REQUIREMENTS[@]} -eq 0 ]]; then
  echo "ERROR: No requirements found in $BENCHMARK_FILE"
  exit 1
fi

echo ""
echo "============================================================"
echo "  Evaluation Runner"
echo "  Requirements : ${#REQUIREMENTS[@]}"
echo "  Runs per condition : $RUNS_PER_CONDITION"
echo "  Total pipeline runs : $((${#REQUIREMENTS[@]} * 2 * RUNS_PER_CONDITION))"
echo "  Results file : $RESULTS_FILE"
echo "============================================================"
echo ""

TOTAL_RUNS=0
TOTAL_REQS=${#REQUIREMENTS[@]}

# ── Helper: derive feature name (identical logic to qa-pipeline) ───────────
feature_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | cut -c1-40
}

# ── Helper: parse Playwright JSON report ──────────────────────────────────
# Returns "passed failed" on stdout
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

# ── Helper: append one run record to results.json ─────────────────────────
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

# ── Main loop ──────────────────────────────────────────────────────────────
REQ_NUM=0
for REQUIREMENT in "${REQUIREMENTS[@]}"; do
  REQ_NUM=$(( REQ_NUM + 1 ))
  FEATURE=$(feature_name "$REQUIREMENT")

  echo "------------------------------------------------------------"
  echo "Requirement $REQ_NUM/$TOTAL_REQS: $REQUIREMENT"
  echo "Feature name: $FEATURE"
  echo "------------------------------------------------------------"

  # ── Multi-agent runs ────────────────────────────────────────────────────
  for RUN in $(seq 1 $RUNS_PER_CONDITION); do
    TOTAL_RUNS=$(( TOTAL_RUNS + 1 ))
    echo ""
    echo "[multi-agent] Run $RUN/$RUNS_PER_CONDITION  (overall $TOTAL_RUNS)"

    # Generate spec via multi-agent pipeline
    ./qa-pipeline "$REQUIREMENT" 2>&1 || true

    SPEC="tests/playwright/${FEATURE}.spec.ts"

    # Run the spec with JSON reporter; capture to per-run file
    RUN_REPORT="docs/evaluation/pw-report-multi-${FEATURE}-run${RUN}.json"
    if [[ -f "$SPEC" ]]; then
      echo "  Running spec: $SPEC"
      npx playwright test "$SPEC" \
        --reporter=json \
        --project=chromium \
        2>/dev/null > "$RUN_REPORT" || true
    else
      echo "  WARNING: spec file not found: $SPEC"
      echo '{"stats":{"expected":0,"unexpected":0}}' > "$RUN_REPORT"
    fi

    # Copy spec for archival before next run overwrites it
    ARCHIVE_SPEC="tests/playwright/${FEATURE}-multi-run${RUN}.spec.ts"
    [[ -f "$SPEC" ]] && cp "$SPEC" "$ARCHIVE_SPEC" || true

    # Parse results
    read -r PASSED FAILED <<< "$(parse_pw_report "$RUN_REPORT")"
    TOTAL=$(( PASSED + FAILED ))
    if [[ $TOTAL -gt 0 ]]; then
      RATE=$(node -e "console.log((${PASSED}/${TOTAL}*100).toFixed(1))")
    else
      RATE="N/A"
    fi

    echo "  Result: passed=$PASSED failed=$FAILED success_rate=${RATE}%"
    append_result "$REQUIREMENT" "multi-agent" "$RUN" "$PASSED" "$FAILED" "$SPEC"
  done

  # ── Single-agent (baseline) runs ─────────────────────────────────────────
  for RUN in $(seq 1 $RUNS_PER_CONDITION); do
    TOTAL_RUNS=$(( TOTAL_RUNS + 1 ))
    echo ""
    echo "[single-agent] Run $RUN/$RUNS_PER_CONDITION  (overall $TOTAL_RUNS)"

    # Generate spec via single-agent baseline
    ./qa-baseline "$REQUIREMENT" 2>&1 || true

    SPEC="tests/playwright/baseline-${FEATURE}.spec.ts"

    # Run the spec with JSON reporter
    RUN_REPORT="docs/evaluation/pw-report-baseline-${FEATURE}-run${RUN}.json"
    if [[ -f "$SPEC" ]]; then
      echo "  Running spec: $SPEC"
      npx playwright test "$SPEC" \
        --reporter=json \
        --project=chromium \
        2>/dev/null > "$RUN_REPORT" || true
    else
      echo "  WARNING: spec file not found: $SPEC"
      echo '{"stats":{"expected":0,"unexpected":0}}' > "$RUN_REPORT"
    fi

    # Archive
    ARCHIVE_SPEC="tests/playwright/baseline-${FEATURE}-run${RUN}.spec.ts"
    [[ -f "$SPEC" ]] && cp "$SPEC" "$ARCHIVE_SPEC" || true

    # Parse results
    read -r PASSED FAILED <<< "$(parse_pw_report "$RUN_REPORT")"
    TOTAL=$(( PASSED + FAILED ))
    if [[ $TOTAL -gt 0 ]]; then
      RATE=$(node -e "console.log((${PASSED}/${TOTAL}*100).toFixed(1))")
    else
      RATE="N/A"
    fi

    echo "  Result: passed=$PASSED failed=$FAILED success_rate=${RATE}%"
    append_result "$REQUIREMENT" "single-agent" "$RUN" "$PASSED" "$FAILED" "$SPEC"
  done

  echo ""
  echo "Requirement $REQ_NUM/$TOTAL_REQS complete."
done

# ── Final summary ──────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  Evaluation complete."
echo "  Total runs executed : $TOTAL_RUNS"
echo "  Results saved to    : $RESULTS_FILE"
echo ""
echo "  Next steps:"
echo "    node scripts/measure-fr-coverage.js <feature> multi-agent"
echo "    node scripts/measure-fr-coverage.js <feature> single-agent"
echo "    bash scripts/measure-fault-detection.sh <feature>"
echo "    node scripts/analyse-results.js"
echo "============================================================"
