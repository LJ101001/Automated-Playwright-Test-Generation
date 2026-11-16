#!/bin/bash
# One-off: run only the missing single-agent (baseline) runs for req4,
# then post-processing. The 5 multi-agent runs already completed and are
# recorded in results.json (recovered from pw-report-*.json after the
# results.json corruption incident).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

RESULTS_FILE="docs/evaluation/results.json"
RUNS_PER_CONDITION=5

REQUIREMENT="http://books.toscrape.com — add a book to the basket from the product page"
FEATURE="httpbookstoscrapecom-add-a-book-to-the-b"

parse_pw_report() {
  local report_path="$1"
  if [[ ! -f "$report_path" ]]; then
    echo "0 0"
    return
  fi
  node -e "
    const fs = require('fs');
    try {
      const raw = fs.readFileSync('$report_path', 'utf8');
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      const data = JSON.parse(raw.slice(start, end + 1));
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

echo ""
echo "============================================================"
echo "  req4 baseline-only completion run"
echo "  Requirement  : $REQUIREMENT"
echo "  Feature name : $FEATURE"
echo "============================================================"
echo ""

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
echo "  Done. req4 baseline completion finished."
echo "============================================================"
