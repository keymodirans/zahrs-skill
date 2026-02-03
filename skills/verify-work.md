---
name: verify-work
description: Verify completed work melalui goal-backward analysis. Check phase delivered what was promised.
tools: Read, Bash, Grep, Glob
---

<orchestrator>
## Orchestrator: /verify-work

Manggil **index-verifier-indo** + **index-integration-checker-indo**.

**Usage:** `/verify-work <phase-number>`

**Output:** VERIFICATION.md + INTEGRATION REPORT
</orchestrator>

<agent_reference>
**Agents:**
1. `@index-verifier-indo.md` - Phase-level verification
2. `@index-integration-checker-indo.md` - Cross-phase integration check

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Call index-verifier-indo → VERIFICATION.md
2. Call index-integration-checker-indo → INTEGRATION REPORT
3. Combine results
4. If gaps_found → identify required fixes
5. Return verification status
```
</execution_flow>
