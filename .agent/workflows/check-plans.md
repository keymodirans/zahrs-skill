---
description: Check plan quality sebelum execution via zahrs-skill MCP
---

# /check-plans

Panggil MCP tool `check_plans` untuk verify plan completeness.

## Usage
```
/check-plans <phase name>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_check_plans`
2. Goal-backward analysis dari plan completeness
3. Report issues atau APPROVED

## Example
```
/check-plans authentication-system
```
