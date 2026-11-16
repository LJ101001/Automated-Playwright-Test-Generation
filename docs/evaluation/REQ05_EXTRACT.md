# REQ-05 Data Extract — Navigate to the Next Page of Results

**Dissertation**: Lewis Watson, 40619754, Edinburgh Napier University
**Target application**: http://books.toscrape.com
**Extracted**: 2026-07-06 (from the clean/accepted req5 run; two earlier attempts were discarded due to a proxy crash bug and evaluator hangs)

---

## 1. Requirement String

```
http://books.toscrape.com — navigate to the next page of results
```

---

## 2. Per-Run Results (from `results.json`)

| Condition | Run | Passed | Failed | success_rate | fr_coverage | fault_detection_capacity |
|---|---|---|---|---|---|---|
| multi-agent | 1 | 20 | 0 | 1.0 | 1.0 | 1 |
| multi-agent | 2 | 20 | 0 | 1.0 | 1.0 | 1 |
| multi-agent | 3 | 24 | 0 | 1.0 | 1.0 | 1 |
| multi-agent | 4 | 24 | 0 | 1.0 | 1.0 | 1 |
| multi-agent | 5 | 24 | 0 | 1.0 | 1.0 | 1 |
| single-agent | 1 | 8 | 0 | 1.0 | 0.5 | 2 |
| single-agent | 2 | 8 | 0 | 1.0 | 0.5 | 2 |
| single-agent | 3 | 8 | 0 | 1.0 | 0.5 | 2 |
| single-agent | 4 | 8 | 0 | 1.0 | 0.5 | 2 |
| single-agent | 5 | 8 | 0 | 1.0 | 0.5 | 2 |

---

## 3. Per-Fault Breakdown (FAULT_01–05)

Detection rule: failures under the fault > failures under a clean (no-fault) run of the same spec. Clean comparison this run: multi-agent 24/0, single-agent 8/0 (both genuinely zero — no proxy-crash contamination this time).

| Fault | Multi-agent caught? | Single-agent caught? | Failing assertion / error |
|---|---|---|---|
| **FAULT_01** — swap price of first two homepage books | ❌ No (24/24 passed) | ❌ No (8/8 passed) | n/a |
| **FAULT_02** — "In stock" → "Out of stock" text | ❌ No (24/24 passed) | ❌ No (8/8 passed) | n/a |
| **FAULT_03** — remove star-rating elements | ❌ No (24/24 passed) | ❌ No (8/8 passed) | n/a |
| **FAULT_04** — break the "next" pagination link (`href="#"`) | ✅ Yes (11 passed, 13 failed) | ✅ Yes (6 passed, 2 failed) | **Multi-agent**: 13 tests timed out or failed, e.g. `should navigate to page 2 when "next" is clicked from page 1` — `Test timeout of 30000ms exceeded`; `should reach page 50 without error when clicking "next" from page 49` — `expect(received).toContain(expected)`, expected substring `"page-50"`, received `"http://localhost:3001/catalogue/page-49.html#"`. **Single-agent**: `TC-003-P` and `TC-005-P` — `expect(page).toHaveURL(expected)` failed, expected pattern `/\/catalogue\/page-2.html$/`, received `"http://localhost:3001/index.html#"` |
| **FAULT_05** — category h1 → "ERROR" | ❌ No (24/24 passed) | ⚠️ Marginal (7 passed, 1 failed) | **Single-agent** `TC-005-P: repeated next clicks advance sequentially through pages 1, 2 and 3` — `Test timeout of 30000ms exceeded`. Flagged as likely a **false-positive detection** — see caveat in Section 6; this fault targets category-page headings, unrelated to the homepage pagination flow this test exercises. |
| **Total detected** | **1 / 5** | **2 / 5** | |

---

## 4. FR Coverage Table (multi-agent `EVAL_...md`)

| FR | Description | Tests Covering It | Covered? |
|---|---|---|---|
| FR-01 | "Next" pagination control is visible when further pages exist | TC-001-P, TC-002-P, TC-003-F | Yes |
| FR-02 | Clicking "next" navigates to the following page | TC-004-P, TC-005-F, TC-006-F | Yes |
| FR-03 | New set of book items is displayed after navigating to page 2 | TC-007-P, TC-008-F, TC-009-P | Yes |
| FR-04 | Repeated "next" navigation advances sequentially through multiple pages | TC-010-P, TC-011-F, TC-012-P | Yes |
| FR-05 | "Next" control is absent or disabled on the last page | TC-013-P, TC-014-F, TC-015-P | Yes |
| FR-06 | Page indicator reflects current page position | TC-016-P, TC-017-F, TC-018-P | Yes |
| FR-07 | Direct navigation beyond the last page is handled gracefully | TC-019-P, TC-020-F, TC-021-P | Yes |
| FR-08 | Browser back navigation restores the expected prior page | TC-022-P, TC-023-F, TC-024-P | Yes |

**FR coverage**: 8/8 (100%).

For reference, the single-agent baseline was scored against a mirrored 8-FR post-hoc spec (`FUNCTIONAL_SPEC_BASELINE_...md`, same FR-01–FR-08 list) and only self-assigned/covered FR-01–FR-04 (previous/next navigation and last-page/beyond-boundary behaviour) — giving its 4/8 = 0.5 fr_coverage in Section 2. It did not address page-indicator text (FR-06) or back-navigation restoration (FR-08) at all.

---

## 5. Total Test Count Per Run

| Run | Multi-agent | Single-agent |
|---|---|---|
| 1 | 20 | 8 |
| 2 | 20 | 8 |
| 3 | 24 | 8 |
| 4 | 24 | 8 |
| 5 | 24 | 8 |

Multi-agent's test count grew from 20 to 24 partway through (runs 1–2 vs 3–5) because each run regenerates the spec fresh rather than re-executing one fixed suite — see Section 6.

---

## 6. Data Quality Issues, Repair Notes, and Construct-Validity Caveats

1. **No `_repaired_note` fields exist in `results.json`.** Checked programmatically across all 50 entries — none present. The one prior repair action (converting 35 string-typed `success_rate` values back to numbers after the req1–4 reconstruction) was done in place with no audit-trail field left on the affected rows; if you need that traceable in the dissertation, it should be cited from this conversation/commit history rather than the data file itself.

2. **This req5 result is the third attempt; two earlier attempts were discarded entirely** (not blended into this data):
   - **Attempt 1**: completed all 10 runs, but the fault-detection phase's fault-mirror proxy (`scripts/seed-faults.js`) crashed repeatedly with `ERR_HTTP_HEADERS_SENT` (an unguarded `res.status().send()` call after headers were already sent on a late socket error), inflating the "clean" comparison failure counts to 4/18 and 8/8 and making that attempt's fault-detection numbers (1/5 multi, 0/5 single) unreliable. The bug was fixed (`res.headersSent` guard added) and the fault-detection step alone was re-run cleanly on that attempt's specs before it was superseded.
   - **Attempt 2**: hit two evaluator hangs (idle at 0% CPU for 20–35 min, both following an `API Error: Connection closed mid-response` from the underlying model API) — the first was killed and the pipeline auto-recovered, but a second hang during the baseline phase led to discarding the whole attempt rather than patching further.
   - **This (3rd) attempt** completed cleanly end-to-end with no hangs and no proxy crashes, and is the one reflected in this document and in `results.json`.

3. **Known flaky test in the multi-agent spec — `TC-012-P`.** The Evaluator's own `EVAL_...md` self-reports 23/24 passed (95.83%) for one specific execution, due to a race condition: `clickNext()` resolves on URL match before the page-50 catalogue grid finishes painting, and the test reads `Locator.count()` once without an auto-retrying assertion. The Evaluator reproduced this failure once more, then got a clean 24/24 on an immediate retry with no code changes — confirming it's test-timing flakiness, not a real site defect or a fault-detection failure. **All 5 runs actually recorded in `results.json` show 24/24 or 20/20 (0 failures)**, so this flake did not end up affecting the aggregate metrics used for the dissertation, but the underlying race condition is still present in the spec file and could resurface on a future run.

4. **Test-suite size is not fixed across runs (20 vs 24, multi-agent).** As with req4, each of the 5 "runs" re-invokes the full pipeline, and the LLM regenerates the spec fresh each time (deciding to keep or rewrite existing artefacts) rather than re-executing one static suite 5 times. Runs 1–2 produced an 20-test suite; runs 3–5 produced a 24-test suite (adding boundary/back-navigation coverage). fr_coverage and fault_detection_capacity are computed from whichever spec/EVAL existed at measurement time (the last run), not aggregated across all 5 independently-generated suites — the same caveat noted for req4.

5. **Construct-validity mismatch in the fault battery (same pattern as REQ-04).** Only FAULT_04 (breaking the "next" pagination link) is actually relevant to this feature; FAULT_01/02/03/05 (price, stock text, star rating, category heading) test unrelated UI surface area. So the "1/5" and "2/5" detection scores are really "1/1 and 1/1 of the *relevant* fault, plus one likely-spurious extra hit" rather than genuine 20%/40% detection capability. This is expected and mirrors the req4 finding — recommend the same dissertation footnote treatment.

6. **Possible false-positive fault detection: single-agent + FAULT_05.** The failing test (`TC-005-P`, repeated next-clicks) timed out under FAULT_05 (category h1 title change) — a fault that has no logical connection to homepage pagination. This is more likely transient network/proxy latency (a timeout, not a content-mismatch assertion failure) than genuine detection. Recommend treating single-agent's true FAULT_04-only detection as 1/5, with the FAULT_05 hit flagged as noise, unless you want to keep the raw uncorrected 2/5 for consistency with the automated measurement.
