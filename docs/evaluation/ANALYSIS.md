# Evaluation Analysis

**Dissertation**: Lewis Watson, 40619754, Edinburgh Napier University
**Generated**: 2026-07-05
**Total runs in dataset**: 50 (multi-agent: 25, single-agent: 25)

## 1. Summary Statistics

| Metric | Condition | N | Mean | SD |
|--------|-----------|---|------|----|
| success_rate | multi-agent | 25 | 1.0000 | 0.0000 |
| success_rate | single-agent | 25 | 0.9600 | 0.2000 |
| fr_coverage | multi-agent | 10 | 1.0000 | 0.0000 |
| fr_coverage | single-agent | 10 | 0.6250 | 0.1318 |
| fault_detection_capacity | multi-agent | 10 | 0.5000 | 0.5270 |
| fault_detection_capacity | single-agent | 10 | 2.0000 | 0.0000 |

## 2. Wilcoxon Signed-Rank Tests (paired by requirement × run)

*H0: no difference between multi-agent and single-agent for this metric.*
*Two-sided test with normal approximation and continuity correction.*

| Metric | n pairs | W statistic | z | p-value | p < 0.05? |
|--------|---------|-------------|---|---------|-----------|
| success_rate | 25 | 0 | 0 | 1.000 | No |
| fr_coverage | 10 | 0 | -2.752 | 0.006 | Yes |
| fault_detection_capacity | 10 | 0 | -2.752 | 0.006 | Yes |

## 3. Vargha-Delaney A12 Effect Sizes

*A12 > 0.5 favours multi-agent; A12 < 0.5 favours single-agent.*
*Thresholds: negligible < 0.56, small < 0.64, medium < 0.71, large ≥ 0.71.*

| Metric | A12 | Interpretation | Favours |
|--------|-----|----------------|---------|
| success_rate | 0.52 | negligible | multi-agent |
| fr_coverage | 1 | large | multi-agent |
| fault_detection_capacity | 0 | large | single-agent |

## 4. H3 — Evaluator Artefact Evidence (Independent-Validation Effect)

*The Evaluator agent catches failures not apparent from raw pass/fail counts.*
*The following EVAL_*.md artefacts contain flagged failures or analysis notes.*

No EVAL_*.md artefacts with flagged failures found yet.
Run the full pipeline (scripts/run-evaluation.sh) to generate evaluator reports.

## 5. Raw Values by Condition

### success_rate

| Condition | Values |
|-----------|--------|
| multi-agent | 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000 |
| single-agent | 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 0.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000 |

### fr_coverage

| Condition | Values |
|-----------|--------|
| multi-agent | 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000 |
| single-agent | 0.7500, 0.7500, 0.7500, 0.7500, 0.7500, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000 |

### fault_detection_capacity

| Condition | Values |
|-----------|--------|
| multi-agent | 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000 |
| single-agent | 2.0000, 2.0000, 2.0000, 2.0000, 2.0000, 2.0000, 2.0000, 2.0000, 2.0000, 2.0000 |

