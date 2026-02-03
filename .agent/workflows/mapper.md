---
description: Direct access ke codebase mapper agent via zahrs-skill MCP
---

# /mapper

Panggil MCP tool `index_codebase_mapper` untuk structured codebase analysis.

## Usage
```
/mapper <focus: tech|arch|quality|concerns|all>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_codebase_mapper`
2. Deep analysis sesuai focus
3. Output ke .planning/codebase/

## Example
```
/mapper tech
/mapper all
```
