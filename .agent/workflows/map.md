---
description: Map/analyze codebase structure via zahrs-skill MCP
---

# /map

Panggil MCP tool `map_codebase` untuk explore dan document codebase.

## Usage
```
/map <focus: tech|arch|quality|concerns|all>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_map_codebase`
2. Analyze codebase berdasarkan focus area
3. Output documentation ke .planning/codebase/

## Example
```
/map tech
/map arch
/map all
```
