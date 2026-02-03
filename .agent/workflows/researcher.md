---
description: Direct access ke project researcher agent via zahrs-skill MCP
---

# /researcher

Panggil MCP tool `index_project_researcher` untuk domain research.

## Usage
```
/researcher <topic> [--depth quick|standard|deep]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_project_researcher`
2. Research domain ecosystem
3. Output research files

## Example
```
/researcher "Payment gateway integration"
/researcher "Real-time notification system" --depth deep
```
