---
name: verify-phase
description: Verify phase goal achievement melalui goal-backward analysis. Check codebase delivers what phase promised.
tools: Read, Bash, Grep, Glob
---

<orchestrator>
## Orchestrator: /verify-phase

Manggil **index-verifier-indo** untuk verify phase completion.

**Usage:** `/verify-phase <phase-number>`

**Output:** VERIFICATION.md dengan passed/gaps_found status
</orchestrator>

<agent_reference>
**Agent:** `@index-verifier-indo.md`

Agent ini akan:
- Verify phase achieved GOAL (bukan cuma completed tasks)
- 3-Level artifact verification (Exists → Substantive → Wired)
- Check observable truths, key links, requirements coverage
- Scan anti-patterns (stubs, TODOs, console.log)
- Return VERIFICATION.md

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Verify prerequisites → Phase executed, SUMMARY exists
2. Call index-verifier-indo agent dengan phase context
3. Agent produces VERIFICATION.md
4. If gaps_found → user must fix or run gap closure
```
</execution_flow>
