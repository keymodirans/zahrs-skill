---
name: research-project
description: Research domain ecosystem sebelum roadmap creation. Output: STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY.
tools: Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, mcp__context7__*
---

<orchestrator>
## Orchestrator: /research-project

Manggil **index-project-researcher-indo** (4 agents parallel) + **index-research-synthesizer-indo**.

**Usage:** `/research-project <domain>`

**Output:** .planning/research/*.md + SYNTHESIS.md
</orchestrator>

<agent_reference>
**Agents:**
1. `@index-project-researcher-indo.md` (4x parallel for STACK, FEATURES, ARCHITECTURE, PITFALLS)
2. `@index-research-synthesizer-indo.md` (synthesize ke SUMMARY.md)
3. `@index-roadmapper-indo.md` (create ROADMAP.md dari research)

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. Spawn 4 researcher agents in parallel (domain partitioned)
2. Each produces: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
3. Synthesizer creates SUMMARY.md
4. Commit ALL research files
5. Return synthesis + roadmap implications
```
</execution_flow>
