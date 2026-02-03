---
name: check-plans
description: Verify plan quality sebelum execution. Goal-backward analysis dari plan completeness.
tools: Read, Bash, Glob, Grep
---

<orchestrator>
## Orchestrator: /check-plans

Manggil **index-plan-checker-indo** untuk verify plan quality.

**Usage:** `/check-plans <phase-number>` (before execution)

**Output:** Plan quality report dengan issues/gaps
</orchestrator>

<agent_reference>
**Agent:** `@index-plan-checker-indo.md`

Agent ini akan:
- 6-dimension verification (requirement coverage, task completeness, dll)
- Check dependency graph validity
- Assess scope sanity (context budget)
- Identify gaps → ISSUES_FOUND
- Return structured issues

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Verify prerequisites → PLAN.md files exist
2. Call index-plan-checker-indo dengan phase context
3. Agent analyzes plans → returns issues or PASSED
4. If blocker issues found → must fix before execution
5. Return verification status
```
</execution_flow>
