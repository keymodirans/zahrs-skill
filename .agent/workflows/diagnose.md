---
description: Diagnose UAT issues secara parallel via zahrs-skill MCP
---

# /diagnose

Panggil MCP tool `diagnose_issues` untuk multi-issue analysis.

## Usage
```
/diagnose <issues source or UAT.md path>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_diagnose_issues`
2. Spawn parallel debugger agents
3. Report root causes

## Example
```
/diagnose .planning/UAT.md
/diagnose "Button tidak responsive, form validation gagal"
```
