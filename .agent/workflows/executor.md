---
description: Direct access ke executor agent via zahrs-skill MCP
---

# /executor

Panggil MCP tool `index_executor` untuk execute plans atomically.

## Usage
```
/executor <plan path> [--resume]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_executor`
2. Per-task commits
3. Pause di checkpoints

## Example
```
/executor .planning/phase-1/PLAN-001.md
/executor .planning/phase-2/PLAN-003.md --resume
```
