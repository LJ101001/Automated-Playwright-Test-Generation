# Multi-Agent Test Generation System

## Research Context

This system tests the hypothesis that a role-based multi-agent architecture produces higher-quality automated software tests than a single-agent approach. Each subagent simulates a distinct SDLC stakeholder role. The three primary evaluation metrics are:
- Success rate — % of generated tests that pass
- FR coverage — % of functional requirements with at least one test
- Fault detection capacity — distinct fault categories caught by negative tests

## Agent Team

| Agent | SDLC Role | Output |
|-------|-----------|--------|
| @product-owner | Product Owner | docs/specs/USER_STORY_*.md |
| @business-analyst | Business Analyst | docs/specs/FUNCTIONAL_SPEC_*.md |
| @developer | Developer | docs/specs/IMPL_SUMMARY_*.md |
| @tester | Tester | docs/test-cases/TC_*.md + tests/playwright/*.spec.ts |
| @evaluator | Evaluator | docs/evaluation/EVAL_*.md |

## Sub-Agent Routing Rules

Sequential dispatch always — each agent reads from the previous agent's output:
  PO → BA → Dev → Tester → Evaluator

## Running the Pipeline

  /qa-pipeline "<website_url> — <feature description>"

Examples:
  /qa-pipeline "https://www.saucedemo.com — user can log in with valid credentials"
  /qa-pipeline "https://www.apple.com — user can add an iPhone to the bag"
  /qa-pipeline "http://books.toscrape.com — user can search for a book by title"

The pipeline accepts any publicly accessible website. The developer agent visits the live site to discover real selectors — no hardcoded app knowledge required.

## Running Tests

  npm install && npx playwright install
  npx playwright test
  npx playwright test tests/playwright/.spec.ts --headed
  npx playwright show-report
