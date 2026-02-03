---
name: debug
description: Investigate bugs menggunakan scientific method. Manage persistent debug sessions, handle checkpoints.
tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

<orchestrator>
## Orchestrator: /debug

Manggil **index-debugger-indo** untuk investigasi bugs.

**Usage:** `/debug <bug description>`

**Output:** Root cause identified atau DEBUG COMPLETE
</orchestrator>

<agent_reference>
**Agent:** `@index-debugger-indo.md`

Agent ini akan:
- Investigate secara otonom (user reports symptoms → agent finds cause)
- Maintain persistent debug file (.planning/debug/)
- Use scientific method (hypothesis → test → evidence)
- Return ROOT CAUSE FOUND atau DEBUG COMPLETE

**Critical:** User = Reporter, Claude = Investigator
- User knows: expected, actual, errors, when started
- User does NOT know: cause, which file, fix (don't ask these)

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. User reports bug symptoms
2. Call index-debugger-indo dengan bug description
3. Agent investigates → creates debug file
4. Agent returns findings or checkpoint for user input
```
</execution_flow>
