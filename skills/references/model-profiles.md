# Model Profiles

Model profiles control which Claude model each Index agent uses. This allows balancing quality vs token spend.

## Profile Definitions

| Agent | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| index-planner-indo | opus | opus | sonnet |
| index-roadmapper-indo | opus | sonnet | sonnet |
| index-executor-indo | opus | sonnet | sonnet |
| index-phase-researcher-indo | opus | sonnet | haiku |
| index-project-researcher-indo | opus | sonnet | haiku |
| index-research-synthesizer-indo | sonnet | sonnet | haiku |
| index-debugger-indo | opus | sonnet | sonnet |
| index-codebase-mapper-indo | sonnet | haiku | haiku |
| index-verifier-indo | sonnet | sonnet | haiku |
| index-plan-checker-indo | sonnet | sonnet | haiku |
| index-integration-checker-indo | sonnet | sonnet | haiku |

## Profile Philosophy

**quality** - Maximum reasoning power
- Opus for all decision-making agents
- Sonnet for read-only verification
- Use when: quota available, critical architecture work

**balanced** (default) - Smart allocation
- Opus only for planning (where architecture decisions happen)
- Sonnet for execution and research (follows explicit instructions)
- Sonnet for verification (needs reasoning, not just pattern matching)
- Use when: normal development, good balance of quality and cost

**budget** - Minimal Opus usage
- Sonnet for anything that writes code
- Haiku for research and verification
- Use when: conserving quota, high-volume work, less critical phases

## Resolution Logic

Orchestrators resolve model before spawning:

```
1. Read .planning/config.json
2. Get model_profile (default: "balanced")
3. Look up agent in table above
4. Pass model parameter to Task call
```

## Switching Profiles

Runtime: `index set-profile <profile>`

Per-project default: Set in `.planning/config.json`:
```json
{
  "model_profile": "balanced"
}
```

## Design Rationale

**Why Opus for index-planner?**-indo
Planning involves architecture decisions, goal decomposition, and task design. This is where model quality has the highest impact.

**Why Sonnet for index-executor?**-indo
Executors follow explicit PLAN.md instructions. The plan already contains the reasoning; execution is implementation.

**Why Sonnet (not Haiku) for verifiers in balanced?**
Verification requires goal-backward reasoning - checking if code *delivers* what the phase promised, not just pattern matching. Sonnet handles this well; Haiku may miss subtle gaps.

**Why Haiku for index-codebase-mapper?**-indo
Read-only exploration and pattern extraction. No reasoning required, just structured output from file contents.
