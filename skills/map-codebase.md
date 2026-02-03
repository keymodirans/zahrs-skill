---
name: map-codebase
description: Explore codebase → write structured analysis. Focus: tech/arch/quality/concerns.
tools: Read, Bash, Grep, Glob, Write
---

<orchestrator>
## Orchestrator: /map-codebase

Manggil **index-codebase-mapper-indo** untuk mapping codebase.

**Usage:** `/map-codebase <focus-area>`
- `tech` → STACK.md, INTEGRATIONS.md
- `arch` → ARCHITECTURE.md, STRUCTURE.md
- `quality` → CONVENTIONS.md, TESTING.md
- `concerns` → CONCERNS.md

**Output:** Documentation files di .planning/codebase/
</orchestrator>

<agent_reference>
**Agent:** `@index-codebase-mapper-indo.md`

Agent ini akan:
- Explore codebase untuk focus area tertentu
- Write documentation dengan file paths (backticks)
- Use standard templates
- Return confirmation (not document contents)

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. User specifies focus area
2. Call index-codebase-mapper-indo dengan focus
3. Agent explores → writes docs ke .planning/codebase/
4. Return file locations
```
</execution_flow>
