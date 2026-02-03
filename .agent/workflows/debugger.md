---
description: Direct access ke debugger agent via zahrs-skill MCP
---

# /debugger

Panggil MCP tool `index_debugger` untuk scientific debugging.

## Usage
```
/debugger <bug report> [--mode investigate|fix|full]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_debugger`
2. Hypothesis testing approach
3. Report root cause atau apply fix

## Example
```
/debugger "API returns 500 on POST /users"
/debugger "Memory leak di dashboard" --mode full
```
