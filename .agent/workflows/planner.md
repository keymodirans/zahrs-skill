---
description: Direct access ke planner agent via zahrs-skill MCP
---

# /planner

Panggil MCP tool `index_planner` untuk direct planning.

## Usage
```
/planner <task> [--mode standard|gaps|tdd]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_planner`
2. Create detailed plans dengan task breakdown
3. Output PLAN.md

## Example
```
/planner "Create API endpoints for user management"
/planner "Fix payment flow" --mode gaps
```
