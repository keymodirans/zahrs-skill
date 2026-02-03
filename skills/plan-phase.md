---
name: plan-phase
description: Create phase plans dengan task breakdown, dependency analysis, goal-backward verification. 2-3 tasks/plan, ~50% context.
tools: Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__*
---

<orchestrator>
## Orchestrator: /plan-phase

Manggil **index-planner-indo** untuk create PLAN.md files dari phase goal.

**Usage:** `/plan-phase <phase-number>` atau `/plan-phase <phase-number> --gaps`

**Output:** PLAN.md files di .planning/phases/
</orchestrator>

<agent_reference>
**Agent:** `@index-planner-indo.md`

Agent ini akan:
- Load phase goal dari ROADMAP.md
- Break phase → parallel-optimized plans (2-3 tasks/plan)
- Build dependency graphs → assign execution waves
- Derive must_haves dengan goal-backward methodology
- Return structured planning outcome

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Verify prerequisites → ROADMAP.md exists, phase specified
2. Call index-planner-indo agent dengan context
3. Agent produces PLAN.md files
4. Return wave structure + next steps
```
</execution_flow>
