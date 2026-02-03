---
description: Check plan quality via zahrs-skill MCP
---

# /plan-checker

Panggil MCP tool `index_plan_checker` untuk verify plans before execution.

## Usage
```
/plan-checker <phase name>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_plan_checker`
2. Goal-backward analysis
3. Report APPROVED atau issues

## Example
```
/plan-checker authentication-phase
```
