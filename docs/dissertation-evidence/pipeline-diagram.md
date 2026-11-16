# Multi-Agent Test Generation Pipeline

Dissertation: Lewis Watson, 40619754, Edinburgh Napier University

Sequential dispatch — each agent reads the previous agent's output artefact.

```mermaid
flowchart TD
    subgraph Row1[" "]
        direction LR
        IN([Input: URL + feature description]) --> PO[/"@product-owner\nProduct Owner"/]
        PO -->|"USER_STORY_*.md"| BA[/"@business-analyst\nBusiness Analyst"/]
        BA -->|"FUNCTIONAL_SPEC_*.md"| DEV[/"@developer\nDeveloper"/]
    end

    subgraph Row2[" "]
        direction LR
        TEST[/"@tester\nTester"/] -->|"TC_*.md\n+ *.spec.ts"| EVAL[/"@evaluator\nEvaluator"/]
        EVAL -->|"EVAL_*.md"| OUT([Output: evaluation report])
    end

    DEV -->|"IMPL_SUMMARY_*.md"| TEST

    classDef agent fill:#e8f0fe,stroke:#4285f4,stroke-width:1px;
    class PO,BA,DEV,TEST,EVAL agent;
    style Row1 fill:none,stroke:none;
    style Row2 fill:none,stroke:none;
```

## Stage Summary

| Stage | Agent | SDLC Role | Input | Output |
|---|---|---|---|---|
| 1 | `@product-owner` | Product Owner | Raw requirement (URL + feature description) | `docs/specs/USER_STORY_*.md` |
| 2 | `@business-analyst` | Business Analyst | USER_STORY | `docs/specs/FUNCTIONAL_SPEC_*.md` |
| 3 | `@developer` | Developer | FUNCTIONAL_SPEC (+ live site inspection) | `docs/specs/IMPL_SUMMARY_*.md` |
| 4 | `@tester` | Tester | FUNCTIONAL_SPEC + IMPL_SUMMARY | `docs/test-cases/TC_*.md` + `tests/playwright/*.spec.ts` |
| 5 | `@evaluator` | Evaluator | Playwright test-run results + TC/EVAL artefacts | `docs/evaluation/EVAL_*.md` |
