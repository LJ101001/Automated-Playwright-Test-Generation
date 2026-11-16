#!/usr/bin/env node
/**
 * Statistical Analysis of Evaluation Results
 * Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
 *
 * Reads docs/evaluation/results.json and produces docs/evaluation/ANALYSIS.md
 * containing:
 *   - Summary table: mean ± SD per metric per condition
 *   - Wilcoxon signed-rank test per metric (paired by requirement+run)
 *   - Vargha-Delaney A12 effect size per metric
 *   - Qualitative summary of Evaluator artefact evidence (H3)
 *
 * Usage:  node scripts/analyse-results.js
 *
 * Dependencies: simple-statistics (npm install simple-statistics)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const RESULTS_FILE = path.join(ROOT, 'docs/evaluation/results.json');
const OUTPUT_FILE  = path.join(ROOT, 'docs/evaluation/ANALYSIS.md');
const EVAL_DIR     = path.join(ROOT, 'docs/evaluation');

// simple-statistics is used for mean and sampleStandardDeviation
let ss;
try {
  ss = require('simple-statistics');
} catch (_) {
  console.error('simple-statistics not installed. Run: npm install simple-statistics');
  process.exit(1);
}

// ── Statistical helpers (Wilcoxon and A12 implemented from scratch) ────────

/** Normal CDF using Abramowitz & Stegun approximation (error < 7.5e-8). */
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp((-x * x) / 2);
  const poly =
    t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  const p = d * poly;
  return x > 0 ? 1 - p : p;
}

/**
 * Two-sided Wilcoxon signed-rank test (normal approximation with continuity
 * correction).  Returns { W, z, p }.
 * @param {number[]} x
 * @param {number[]} y  (same length as x, paired)
 */
function wilcoxonSignedRank(x, y) {
  if (x.length !== y.length) throw new Error('Arrays must be equal length');

  // Differences, excluding zeros
  const diffs = x.map((xi, i) => xi - y[i]).filter((d) => d !== 0);
  const m = diffs.length;

  if (m === 0) return { W: 0, z: 0, p: 1.0 };

  // Sort by |d|
  const items = diffs.map((d) => ({ abs: Math.abs(d), sign: d > 0 ? 1 : -1 }));
  items.sort((a, b) => a.abs - b.abs);

  // Assign average ranks (handle ties)
  const ranks = new Array(m);
  let i = 0;
  while (i < m) {
    let j = i;
    while (j < m - 1 && items[j + 1].abs === items[j].abs) j++;
    const avg = (i + j) / 2 + 1; // 1-indexed
    for (let k = i; k <= j; k++) ranks[k] = avg;
    i = j + 1;
  }

  let Wplus = 0;
  let Wminus = 0;
  for (let k = 0; k < m; k++) {
    if (items[k].sign > 0) Wplus  += ranks[k];
    else                   Wminus += ranks[k];
  }

  const W = Math.min(Wplus, Wminus);

  // Normal approximation
  const mu    = (m * (m + 1)) / 4;
  const sigma = Math.sqrt((m * (m + 1) * (2 * m + 1)) / 24);

  // Continuity correction: shift W toward mu by 0.5
  const Wcorr = W > mu ? W - 0.5 : W + 0.5;
  const z = (Wcorr - mu) / sigma;

  const p = 2 * normalCDF(-Math.abs(z));

  return { W, z, p };
}

/**
 * Vargha-Delaney A12 effect size.
 * A12 = P(X > Y) + 0.5·P(X = Y)
 * Interpretation thresholds (Vargha & Delaney, 2000):
 *   |A12 - 0.5| < 0.06  → negligible
 *   |A12 - 0.5| < 0.14  → small
 *   |A12 - 0.5| < 0.21  → medium
 *   else                → large
 */
function varghaDelaney(x, y) {
  let greater = 0;
  let equal   = 0;
  const n = x.length * y.length;

  for (const xi of x) {
    for (const yj of y) {
      if (xi > yj)      greater++;
      else if (xi === yj) equal++;
    }
  }

  const A12 = (greater + 0.5 * equal) / n;

  const d = Math.abs(A12 - 0.5);
  let interpretation;
  if (d < 0.06)      interpretation = 'negligible';
  else if (d < 0.14) interpretation = 'small';
  else if (d < 0.21) interpretation = 'medium';
  else               interpretation = 'large';

  return { A12, interpretation };
}

/** Round to N decimal places. */
function round(v, n = 4) {
  return Number(v.toFixed(n));
}

/** Format p-value for display. */
function fmtP(p) {
  if (p < 0.001) return '< 0.001';
  return p.toFixed(3);
}

// ── Load and validate results ──────────────────────────────────────────────

if (!fs.existsSync(RESULTS_FILE)) {
  console.error(`results.json not found: ${RESULTS_FILE}`);
  console.error('Run scripts/run-evaluation.sh first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
const runs = data.runs || [];

if (runs.length === 0) {
  console.error('results.json contains no runs.');
  process.exit(1);
}

const METRICS = ['success_rate', 'fr_coverage', 'fault_detection_capacity'];

// ── Group by condition ─────────────────────────────────────────────────────

const byCondition = { 'multi-agent': [], 'single-agent': [] };
for (const run of runs) {
  if (byCondition[run.condition]) byCondition[run.condition].push(run);
}

function valuesFor(condition, metric) {
  return byCondition[condition]
    .map((r) => r[metric])
    .filter((v) => v != null && !Number.isNaN(v));
}

// ── Summary statistics per condition per metric ────────────────────────────

function summaryStats(values) {
  if (values.length === 0) return { mean: 'N/A', sd: 'N/A', n: 0 };
  const m  = ss.mean(values);
  const sd = values.length > 1 ? ss.sampleStandardDeviation(values) : 0;
  return { mean: round(m, 4), sd: round(sd, 4), n: values.length };
}

// ── Paired test: match multi-agent and single-agent by requirement+run ─────

function buildPairedSeries(metric) {
  const multiMap  = new Map();
  const singleMap = new Map();

  for (const run of runs) {
    const key = `${run.requirement}||${run.run}`;
    if (run.condition === 'multi-agent'  && run[metric] != null) multiMap.set(key, run[metric]);
    if (run.condition === 'single-agent' && run[metric] != null) singleMap.set(key, run[metric]);
  }

  const xArr = [];
  const yArr = [];
  for (const [key, xVal] of multiMap) {
    if (singleMap.has(key)) {
      xArr.push(xVal);
      yArr.push(singleMap.get(key));
    }
  }
  return { x: xArr, y: yArr };
}

// ── Qualitative summary: scan EVAL_*.md for flagged failures ──────────────

function scanEvalArtefacts() {
  const entries = [];
  if (!fs.existsSync(EVAL_DIR)) return entries;

  const files = fs.readdirSync(EVAL_DIR).filter(
    (f) => f.startsWith('EVAL_') && f.endsWith('.md')
  );

  for (const file of files) {
    const feature = file.replace(/^EVAL_/, '').replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(EVAL_DIR, file), 'utf8');

    // Look for failure-indicating sections
    const failureMatches = [];

    // Match lines under "Failures Analysis" or individual test rows marked "failed"
    const lines = content.split('\n');
    let inFailureSection = false;
    for (const line of lines) {
      if (/^#{1,3}\s+(Failures|Failure)/i.test(line)) {
        inFailureSection = true;
        continue;
      }
      if (/^#{1,3}/.test(line)) inFailureSection = false;

      if (inFailureSection && line.trim() && !line.startsWith('#')) {
        failureMatches.push(line.trim());
      }

      // Also catch table rows with "failed" status
      if (/\|\s*failed\s*\|/i.test(line)) {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) failureMatches.push(parts.slice(0, 3).join(' | '));
      }
    }

    if (failureMatches.length > 0) {
      entries.push({
        feature,
        file,
        summary: failureMatches[0].slice(0, 120),
        count: failureMatches.length,
      });
    }
  }

  return entries;
}

// ── Build the markdown report ──────────────────────────────────────────────

const lines = [];

lines.push(`# Evaluation Analysis`);
lines.push(`\n**Dissertation**: Lewis Watson, 40619754, Edinburgh Napier University`);
lines.push(`**Generated**: ${new Date().toISOString().slice(0, 10)}`);
lines.push(`**Total runs in dataset**: ${runs.length} (multi-agent: ${byCondition['multi-agent'].length}, single-agent: ${byCondition['single-agent'].length})`);
lines.push('');

// ── 1. Summary table ──────────────────────────────────────────────────────

lines.push(`## 1. Summary Statistics\n`);
lines.push(`| Metric | Condition | N | Mean | SD |`);
lines.push(`|--------|-----------|---|------|----|`);

for (const metric of METRICS) {
  for (const condition of ['multi-agent', 'single-agent']) {
    const vals = valuesFor(condition, metric);
    const s = summaryStats(vals);
    const meanStr = s.mean === 'N/A' ? 'N/A' : s.mean.toFixed(4);
    const sdStr   = s.sd   === 'N/A' ? 'N/A' : s.sd.toFixed(4);
    lines.push(`| ${metric} | ${condition} | ${s.n} | ${meanStr} | ${sdStr} |`);
  }
}
lines.push('');

// ── 2. Wilcoxon signed-rank tests ─────────────────────────────────────────

lines.push(`## 2. Wilcoxon Signed-Rank Tests (paired by requirement × run)\n`);
lines.push(`*H0: no difference between multi-agent and single-agent for this metric.*`);
lines.push(`*Two-sided test with normal approximation and continuity correction.*\n`);
lines.push(`| Metric | n pairs | W statistic | z | p-value | p < 0.05? |`);
lines.push(`|--------|---------|-------------|---|---------|-----------|`);

for (const metric of METRICS) {
  const { x, y } = buildPairedSeries(metric);
  if (x.length < 2) {
    lines.push(`| ${metric} | ${x.length} | — | — | — | insufficient data |`);
    continue;
  }
  const result = wilcoxonSignedRank(x, y);
  const sig = result.p < 0.05 ? 'Yes' : 'No';
  lines.push(`| ${metric} | ${x.length} | ${round(result.W, 2)} | ${round(result.z, 3)} | ${fmtP(result.p)} | ${sig} |`);
}
lines.push('');

// ── 3. Vargha-Delaney A12 effect sizes ────────────────────────────────────

lines.push(`## 3. Vargha-Delaney A12 Effect Sizes\n`);
lines.push(`*A12 > 0.5 favours multi-agent; A12 < 0.5 favours single-agent.*`);
lines.push(`*Thresholds: negligible < 0.56, small < 0.64, medium < 0.71, large ≥ 0.71.*\n`);
lines.push(`| Metric | A12 | Interpretation | Favours |`);
lines.push(`|--------|-----|----------------|---------|`);

for (const metric of METRICS) {
  const x = valuesFor('multi-agent',  metric);
  const y = valuesFor('single-agent', metric);
  if (x.length === 0 || y.length === 0) {
    lines.push(`| ${metric} | — | — | insufficient data |`);
    continue;
  }
  const { A12, interpretation } = varghaDelaney(x, y);
  const favours = A12 > 0.5 ? 'multi-agent' : A12 < 0.5 ? 'single-agent' : 'neither';
  lines.push(`| ${metric} | ${round(A12, 4)} | ${interpretation} | ${favours} |`);
}
lines.push('');

// ── 4. H3 Qualitative Evidence: Evaluator Artefact Review ─────────────────

lines.push(`## 4. H3 — Evaluator Artefact Evidence (Independent-Validation Effect)\n`);
lines.push(`*The Evaluator agent catches failures not apparent from raw pass/fail counts.*`);
lines.push(`*The following EVAL_*.md artefacts contain flagged failures or analysis notes.*\n`);

const evalEvidence = scanEvalArtefacts();

if (evalEvidence.length === 0) {
  lines.push('No EVAL_*.md artefacts with flagged failures found yet.');
  lines.push('Run the full pipeline (scripts/run-evaluation.sh) to generate evaluator reports.');
} else {
  lines.push(`| Feature | File | Flagged failures | One-line summary |`);
  lines.push(`|---------|------|-----------------|-----------------|`);
  for (const e of evalEvidence) {
    lines.push(`| ${e.feature} | ${e.file} | ${e.count} | ${e.summary} |`);
  }
}
lines.push('');

// ── 5. Raw per-metric values (appendix) ────────────────────────────────────

lines.push(`## 5. Raw Values by Condition\n`);

for (const metric of METRICS) {
  lines.push(`### ${metric}\n`);
  lines.push(`| Condition | Values |`);
  lines.push(`|-----------|--------|`);
  for (const condition of ['multi-agent', 'single-agent']) {
    const vals = valuesFor(condition, metric);
    lines.push(`| ${condition} | ${vals.map((v) => v.toFixed ? v.toFixed(4) : v).join(', ')} |`);
  }
  lines.push('');
}

// ── Write output ───────────────────────────────────────────────────────────

fs.mkdirSync(EVAL_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, lines.join('\n') + '\n');

console.log(`\nAnalysis written to: ${OUTPUT_FILE}`);

// Print quick summary to console
console.log('\n=== Quick Summary ===');
for (const metric of METRICS) {
  const mx = valuesFor('multi-agent',  metric);
  const sx = valuesFor('single-agent', metric);
  const mm = mx.length ? ss.mean(mx).toFixed(3) : 'N/A';
  const sm = sx.length ? ss.mean(sx).toFixed(3) : 'N/A';
  console.log(`${metric}: multi=${mm}  single=${sm}`);
}
