---
name: create-roadmap
description: Create project roadmaps dengan phase breakdown, requirement mapping, success criteria derivation.
tools: Read, Write, Bash, Glob, Grep
---

<orchestrator>
## Orchestrator: /create-roadmap

Manggil **index-roadmapper-indo** untuk transform requirements → roadmap.

**Usage:** `/create-roadmap` (after REQUIREMENTS.md exists)

**Output:** ROADMAP.md + STATE.md
</orchestrator>

<agent_reference>
**Agent:** `@index-roadmapper-indo.md`

Agent ini akan:
- Derive phases dari requirements (not impose structure)
- Goal-backward success criteria (2-5 observable truths per phase)
- 100% requirement coverage (no orphans)
- Apply depth calibration (Quick/Standard/Comprehensive)

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Verify prerequisites → PROJECT.md + REQUIREMENTS.md exist
2. Call index-roadmapper-indo dengan requirements
3. Agent produces ROADMAP.md + STATE.md
4. Return phase structure + next steps
```
</execution_flow>
