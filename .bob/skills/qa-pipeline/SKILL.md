---
name: qa-pipeline
description: >-
  Runs the full five-agent pipeline PO → BA → Dev → Tester → Evaluator for a
  given website and feature description.
metadata:
  user-invocable: true
  disable-model-invocation: true
---

Run the complete multi-agent test generation pipeline for the dissertation prototype.

Usage: /qa-pipeline "<website_url> — <feature description>"
Example: /qa-pipeline "https://www.apple.com — user can add an iPhone to the bag"

Parse the argument to extract:
- WEBSITE_URL: the full URL of the site under test (e.g. https://www.apple.com)
- FEATURE: the feature description (e.g. "user can add an iPhone to the bag")
- FEATURE_NAME: kebab-case slug derived from the feature (e.g. apple-add-iphone-to-bag)

Execute these steps in order — wait for each agent to complete and write its output file before invoking the next.
Pass WEBSITE_URL, FEATURE, and FEATURE_NAME explicitly in every agent invocation so no agent has to guess the target.

Step 1: Invoke product-owner with WEBSITE_URL and FEATURE. Wait for docs/specs/USER_STORY_<FEATURE_NAME>.md.
Step 2: Invoke business-analyst with FEATURE_NAME and WEBSITE_URL. Wait for docs/specs/FUNCTIONAL_SPEC_<FEATURE_NAME>.md.
Step 3: Invoke developer with FEATURE_NAME and WEBSITE_URL. Wait for docs/specs/IMPL_SUMMARY_<FEATURE_NAME>.md.
Step 4: Invoke tester with FEATURE_NAME. Wait for docs/test-cases/TC_<FEATURE_NAME>.md and tests/playwright/<FEATURE_NAME>.spec.ts.
Step 5: Invoke evaluator with FEATURE_NAME. Wait for docs/evaluation/EVAL_<FEATURE_NAME>.md.

After all steps, output a pipeline summary table showing each agent, its output file, and the final evaluation metrics (success rate, FR coverage, fault detection rate).

Each agent reads from files written by the previous — never skip a step.
The EVAL output is dissertation research data — treat it as a formal artefact.
