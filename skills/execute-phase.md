---
name: execute-phase
description: Execute PLAN.md secara atomik. Per-task commits, auto-handle deviations, pause di checkpoints.
tools: Read, Write, Edit, Bash, Grep, Glob
---

<orchestrator>
## Orchestrator: /execute-phase

Manggil **index-executor-indo** untuk execute PLAN.md files.

**Usage:** `/execute-phase <phase-number>`

**Output:** SUMMARY.md + STATE.md + commits
</orchestrator>

<agent_reference>
**Agent:** `@index-executor-indo.md`

Agent ini akan:
- Load PLAN.md dan STATE.md
- Execute tasks secara atomik (per-task commits)
- Auto-handle deviations (rules 1-3 fix, rule 4 asks)
- Pause di checkpoints
- Create SUMMARY.md
- Update STATE.md

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Verify prerequisites → PLAN.md exists untuk phase
2. Call index-executor-indo agent dengan plan context
3. Agent executes → commits → SUMMARY.md → STATE.md
4. Return completion status atau checkpoint
```
</execution_flow>
