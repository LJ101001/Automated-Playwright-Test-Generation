#!/usr/bin/env node
/**
 * FR Coverage Measurement
 * Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
 *
 * For multi-agent: reads FUNCTIONAL_SPEC_<feature>.md (FR count) and
 * TC_<feature>.md (FR traceability), computes coverage.
 *
 * For single-agent: invokes the business-analyst agent post-hoc to generate
 * a functional spec, counts total FRs, then matches against [FR-NN] references
 * in the baseline spec file.
 *
 * Appends fr_coverage (0.0–1.0) to the matching entries in results.json.
 *
 * Usage:
 *   node scripts/measure-fr-coverage.js <feature> <condition>
 *   node scripts/measure-fr-coverage.js httpbookstoscrapecom-browse-all-books-on-h multi-agent
 *   node scripts/measure-fr-coverage.js httpbookstoscrapecom-browse-all-books-on-h single-agent
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RESULTS_FILE = path.join(ROOT, 'docs/evaluation/results.json');

const [,, FEATURE, CONDITION] = process.argv;

if (!FEATURE || !CONDITION) {
  console.error('Usage: node scripts/measure-fr-coverage.js <feature> <condition>');
  console.error('  condition must be "multi-agent" or "single-agent"');
  process.exit(1);
}

if (!['multi-agent', 'single-agent'].includes(CONDITION)) {
  console.error('condition must be "multi-agent" or "single-agent"');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Count numbered functional requirements in a FUNCTIONAL_SPEC markdown file. */
function countFRsInSpec(specPath) {
  if (!fs.existsSync(specPath)) return 0;
  const content = fs.readFileSync(specPath, 'utf8');
  const matches = content.match(/^#{1,3}\s+FR-\d+[:\s]/gm) || [];
  return matches.length;
}

/**
 * Extract the set of FR IDs (e.g. {"FR-01","FR-02"}) from a markdown or
 * TypeScript file, looking for patterns like FR-01, FR-1, [FR-01], [FR-1].
 */
function extractFRRefs(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/FR-\d+/gi) || [];
  return new Set(matches.map((m) => m.toUpperCase()));
}

/** Find the Claude binary using the same pattern as qa-pipeline. */
function findClaudeBinary() {
  try {
    const result = execSync(
      "find ~/.vscode/extensions/anthropic.claude-code-*/resources/native-binary/claude -type f 2>/dev/null | sort -V | tail -1",
      { encoding: 'utf8' }
    ).trim();
    if (result && fs.existsSync(result)) return result;
  } catch (_) {}
  return null;
}

/** Update results.json: set fr_coverage on all entries matching feature+condition. */
function updateResults(feature, condition, frCoverage) {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.warn(`WARNING: ${RESULTS_FILE} not found — skipping update`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  let updated = 0;
  for (const run of data.runs) {
    if (
      run.condition === condition &&
      (run.spec_file || '').includes(feature)
    ) {
      run.fr_coverage = frCoverage;
      updated++;
    }
  }
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  console.log(`Updated ${updated} result entries with fr_coverage=${frCoverage.toFixed(4)}`);
}

// ── Multi-agent path ───────────────────────────────────────────────────────

function measureMultiAgent() {
  const specPath = path.join(ROOT, `docs/specs/FUNCTIONAL_SPEC_${FEATURE}.md`);
  const tcPath   = path.join(ROOT, `docs/test-cases/TC_${FEATURE}.md`);

  if (!fs.existsSync(specPath)) {
    console.error(`FUNCTIONAL_SPEC not found: ${specPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(tcPath)) {
    console.error(`TC file not found: ${tcPath}`);
    process.exit(1);
  }

  const totalFRs = countFRsInSpec(specPath);
  if (totalFRs === 0) {
    console.warn('WARNING: No FRs found in functional spec. Coverage = 0.');
    updateResults(FEATURE, 'multi-agent', 0);
    return;
  }

  // All FR IDs defined in the spec
  const specFRs = extractFRRefs(specPath);

  // FR IDs referenced in test cases
  const tcFRs = extractFRRefs(tcPath);

  // Covered = FRs from spec that have at least one test case
  const covered = [...specFRs].filter((fr) => tcFRs.has(fr));

  const coverage = covered.length / totalFRs;

  console.log(`\n[multi-agent] FR Coverage for: ${FEATURE}`);
  console.log(`  Total FRs in spec : ${totalFRs}`);
  console.log(`  FRs in spec       : ${[...specFRs].sort().join(', ')}`);
  console.log(`  FRs in TCs        : ${[...tcFRs].sort().join(', ')}`);
  console.log(`  FRs covered       : ${covered.sort().join(', ')}`);
  console.log(`  Coverage          : ${covered.length}/${totalFRs} = ${(coverage * 100).toFixed(1)}%`);

  updateResults(FEATURE, 'multi-agent', coverage);
}

// ── Single-agent path ──────────────────────────────────────────────────────

function measureSingleAgent() {
  const baselineSpecPath = path.join(ROOT, `tests/playwright/baseline-${FEATURE}.spec.ts`);
  if (!fs.existsSync(baselineSpecPath)) {
    console.error(`Baseline spec not found: ${baselineSpecPath}`);
    process.exit(1);
  }

  // Check if a post-hoc functional spec already exists for this feature
  const postHocSpecPath = path.join(ROOT, `docs/specs/FUNCTIONAL_SPEC_BASELINE_${FEATURE}.md`);

  if (!fs.existsSync(postHocSpecPath)) {
    console.log(`\nNo post-hoc functional spec found — invoking business-analyst agent...`);

    const claudeBin = findClaudeBinary();
    if (!claudeBin) {
      console.error('ERROR: Claude binary not found. Cannot generate post-hoc functional spec.');
      process.exit(1);
    }

    // Read the BA agent prompt (strip YAML frontmatter)
    const baAgentRaw = fs.readFileSync(
      path.join(ROOT, '.claude/agents/business-analyst.md'),
      'utf8'
    );
    const baPromptBody = baAgentRaw.replace(/^---[\s\S]*?---\s*/m, '').trim();

    // We need the original requirement. Reconstruct from the feature name by reading
    // results.json if available, otherwise prompt manually.
    let requirement = '';
    if (fs.existsSync(RESULTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
      const match = data.runs.find(
        (r) => r.condition === 'single-agent' && (r.spec_file || '').includes(FEATURE)
      );
      if (match) requirement = match.requirement;
    }

    if (!requirement) {
      console.error(
        'Could not find the original requirement in results.json. ' +
        'Run qa-baseline first and ensure results.json is populated.'
      );
      process.exit(1);
    }

    const prompt =
      `You are the business-analyst agent. ${baPromptBody}\n\n` +
      `The feature name is '${FEATURE}'. ` +
      `The requirement is: ${requirement}\n` +
      `There is no existing USER_STORY file — derive the functional spec directly from the requirement.\n` +
      `Save the output to docs/specs/FUNCTIONAL_SPEC_BASELINE_${FEATURE}.md\n` +
      `Use the same FR-NN numbering format as normal.`;

    console.log('  Invoking BA agent...');
    try {
      execFileSync(claudeBin, ['-p', prompt, '--dangerously-skip-permissions'], {
        cwd: ROOT,
        stdio: 'inherit',
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch (err) {
      console.error('BA agent invocation failed:', err.message);
      process.exit(1);
    }
  } else {
    console.log(`Using existing post-hoc spec: ${postHocSpecPath}`);
  }

  if (!fs.existsSync(postHocSpecPath)) {
    console.error(`Post-hoc functional spec was not created: ${postHocSpecPath}`);
    process.exit(1);
  }

  const totalFRs = countFRsInSpec(postHocSpecPath);
  if (totalFRs === 0) {
    console.warn('WARNING: No FRs found in post-hoc functional spec. Coverage = 0.');
    updateResults(FEATURE, 'single-agent', 0);
    return;
  }

  const specFRs = extractFRRefs(postHocSpecPath);
  const baselineFRs = extractFRRefs(baselineSpecPath);

  const covered = [...specFRs].filter((fr) => baselineFRs.has(fr));
  const coverage = Math.min(covered.length / totalFRs, 1.0);

  console.log(`\n[single-agent] FR Coverage for: ${FEATURE}`);
  console.log(`  Total FRs in post-hoc spec : ${totalFRs}`);
  console.log(`  FRs in post-hoc spec       : ${[...specFRs].sort().join(', ')}`);
  console.log(`  FR refs in baseline spec   : ${[...baselineFRs].sort().join(', ')}`);
  console.log(`  FRs covered                : ${covered.sort().join(', ')}`);
  console.log(`  Coverage                   : ${covered.length}/${totalFRs} = ${(coverage * 100).toFixed(1)}%`);

  updateResults(FEATURE, 'single-agent', coverage);
}

// ── Dispatch ───────────────────────────────────────────────────────────────

if (CONDITION === 'multi-agent') {
  measureMultiAgent();
} else {
  measureSingleAgent();
}
