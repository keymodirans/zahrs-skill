---
name: diagnose-issues
description: Diagnose UAT issues secara parallel. Spawn 4 debugger agents untuk multi-issue analysis.
tools: Read, Write, Bash, Grep, Glob
---

<orchestrator>
## Orchestrator: /diagnose-issues

Manggil **index-debugger-indo** (4x parallel) untuk UAT diagnosis.

**Usage:** `/diagnose-issues` (after UAT/test failures)

**Output:** 4 debug sessions + gap analysis
</orchestrator>

<agent_reference>
**Agents:**
- 4x `@index-debugger-indo.md` (parallel, each handles 1 UAT issue)
- Gap synthesizer → combined findings

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Parse UAT failures → identify symptoms
2. Spawn 4 debugger agents in parallel (each gets 1 issue)
3. Each agent investigates → ROOT CAUSE FOUND or INCONCLUSIVE
4. Synthesize findings → combined report
5. Return gap analysis untuk closure planning
```
</execution_flow>
