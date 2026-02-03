---
description: Verify phase completion via zahrs-skill MCP
---

# /verify

Panggil MCP tool `verify_phase` untuk check phase goal achievement.

## Usage
```
/verify <phase name>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_verify_phase`
2. Goal-backward analysis: check deliverables
3. Report gaps atau VERIFIED

## Example
```
/verify authentication-system
/verify payment-integration
```
