---
description: Execute phase plans secara sequential via zahrs-skill MCP
---

# /execute

Panggil MCP tool `execute_phase` untuk jalankan plans.

## Usage
```
/execute <phase name> [--plan N] [--resume]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_execute_phase`
2. Execute tasks satu per satu sesuai PLAN.md
3. Commit per task, pause di checkpoints

## Example
```
/execute authentication-system
/execute payment-integration --plan 2
/execute user-management --resume
```
