---
name: brainstorm
description: Diskusi interaktif untuk brainstorm ide, architecture, atau problem solving. Fokus pada exploration dan refinement ide sebelum masuk ke planning.
tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, Task, AskUserQuestion
---

<orchestrator>
## Orchestrator: /brainstorm

Manggil **index-brainstormer-indo** untuk sesi ideation interaktif.

**Usage:** `/brainstorm <topic>`

**Output:** Decision Record atau Concept Draft dengan actionable next steps
</orchestrator>

<agent_reference>
**Agent:** `@index-brainstormer-indo.md`

Agent ini akan:
- Clarify goal dan constraints dari user
- Explore 2-3 alternatif pendekatan (Conservative vs Radical)
- Analisis Pros/Cons setiap opsi
- Challenge assumptions (Red Teaming)
- Synthesize ke Concept Draft atau Decision Record
- Recommend next step: `/plan-phase`, `/research-project`, atau `/roadmap`

**Critical:** Jangan langsung setuju - Challenge them!
- Gunakan analogi untuk konsep kompleks
- Fokus pada *Why* dan *How*, bukan cuma *What*

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. User provides topic to brainstorm
2. Call index-brainstormer-indo dengan topic
3. Agent leads interactive discussion → asks probing questions
4. Agent explores alternatives → presents trade-offs
5. Agent synthesizes findings → produces Concept Draft
6. Agent recommends next action → /plan, /research, /roadmap
```
</execution_flow>
