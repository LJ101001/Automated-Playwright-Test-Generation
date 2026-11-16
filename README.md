# Multi-Agent Test Generation System

A dissertation research prototype (Lewis Watson, 40619754, Edinburgh Napier University) investigating whether a role-based multi-agent architecture produces higher-quality automated Playwright E2E tests than a single-agent baseline. A five-agent pipeline (Product Owner → Business Analyst → Developer → Tester → Evaluator) processes a natural-language requirement and a target URL, then generates and evaluates executable TypeScript Playwright tests. Three metrics are measured across 8 benchmark requirements: success rate (% of tests that pass), FR coverage (% of functional requirements with at least one test), and fault detection capacity (distinct fault categories caught by negative tests).

---

## Prerequisites

- **Node.js 18+** and **npm**
- **Claude Code VSCode extension** installed (provides the `claude` binary used by the pipeline)

```bash
npm install
npx playwright install
```

---

## Running the Multi-Agent Pipeline (one requirement)

```bash
./qa-pipeline "http://books.toscrape.com — browse all books on the homepage"
```

Produces in sequence:
- `docs/specs/USER_STORY_<feature>.md`
- `docs/specs/FUNCTIONAL_SPEC_<feature>.md`
- `docs/specs/IMPL_SUMMARY_<feature>.md`
- `docs/test-cases/TC_<feature>.md`
- `tests/playwright/<feature>.spec.ts`
- `docs/evaluation/EVAL_<feature>.md`

---

## Running the Single-Agent Baseline (one requirement)

```bash
./qa-baseline "http://books.toscrape.com — browse all books on the homepage"
```

Produces:
- `tests/playwright/baseline-<feature>.spec.ts`
- `docs/evaluation/BASELINE_EVAL_<feature>.md`

The baseline invokes Claude once with no role decomposition.

---

## Running the Full Evaluation

Runs all 8 benchmark requirements 5 times each for both conditions (~80 pipeline invocations total — expect several hours):

```bash
bash scripts/run-evaluation.sh
```

Results accumulate in `docs/evaluation/results.json`.

After completing runs, measure FR coverage per feature:

```bash
node scripts/measure-fr-coverage.js <feature> multi-agent
node scripts/measure-fr-coverage.js <feature> single-agent
```

Measure fault detection capacity per feature:

```bash
bash scripts/measure-fault-detection.sh <feature>
```

Produce the statistical analysis report:

```bash
node scripts/analyse-results.js
```

---

## Starting the Seeded Fault Server

Starts an Express proxy on port 3001 that forwards requests to `books.toscrape.com` with configurable injected faults:

```bash
# All 5 faults active
FAULT_01=true FAULT_02=true FAULT_03=true FAULT_04=true FAULT_05=true \
  node scripts/seed-faults.js

# Pass-through (no faults — for baseline comparison)
node scripts/seed-faults.js

# Single fault
FAULT_02=true node scripts/seed-faults.js
```

| Fault | Description |
|-------|-------------|
| FAULT_01 | Swap the price of the first two books on the homepage |
| FAULT_02 | Change all "In stock" text to "Out of stock" |
| FAULT_03 | Remove all star-rating elements |
| FAULT_04 | Break the "next" pagination link (sets href to "#") |
| FAULT_05 | Change category page h1 title to "ERROR" |

---

## Running Tests Manually

```bash
# Run all generated specs
npx playwright test

# Run a specific spec
npx playwright test tests/playwright/<feature>.spec.ts --headed

# View HTML report
npx playwright show-report
```

---

## Output File Locations

| Path | Contents |
|------|----------|
| `docs/specs/USER_STORY_*.md` | Product Owner user stories |
| `docs/specs/FUNCTIONAL_SPEC_*.md` | Business Analyst functional specifications |
| `docs/specs/IMPL_SUMMARY_*.md` | Developer implementation summaries |
| `docs/test-cases/TC_*.md` | Tester human-readable test cases |
| `docs/evaluation/EVAL_*.md` | Multi-agent evaluation reports |
| `docs/evaluation/BASELINE_EVAL_*.md` | Single-agent baseline evaluation reports |
| `docs/evaluation/results.json` | Aggregated evaluation results (all runs) |
| `docs/evaluation/ANALYSIS.md` | Statistical analysis (Wilcoxon, A12, summary tables) |
| `docs/benchmark.md` | 8 benchmark requirements for Books to Scrape |
| `tests/playwright/*.spec.ts` | Multi-agent Playwright test specs |
| `tests/playwright/baseline-*.spec.ts` | Single-agent Playwright test specs |

---

## Agent Architecture

| Agent | SDLC Role | Output |
|-------|-----------|--------|
| `@product-owner` | Product Owner | `USER_STORY_*.md` |
| `@business-analyst` | Business Analyst | `FUNCTIONAL_SPEC_*.md` |
| `@developer` | Developer | `IMPL_SUMMARY_*.md` |
| `@tester` | Tester | `TC_*.md` + `*.spec.ts` |
| `@evaluator` | Evaluator | `EVAL_*.md` |
