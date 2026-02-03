---
description: Create phase plans dengan task breakdown via zahrs-skill MCP
---

# /plan

Panggil MCP tool `plan_phase` untuk create execution plans.

## Usage
```
/plan <phase name> [--mode standard|gaps]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_plan_phase` dengan phase_name
2. Follow planning workflow dari skill content
3. Output PLAN.md file

## Example
```
/plan authentication-system
/plan payment-integration --mode gaps
```
