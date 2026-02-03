---
description: Direct access ke roadmapper agent via zahrs-skill MCP
---

# /roadmapper

Panggil MCP tool `index_roadmapper` untuk detailed roadmap creation.

## Usage
```
/roadmapper <project> [research path]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_roadmapper`
2. Create phase breakdown
3. Output ROADMAP.md

## Example
```
/roadmapper my-saas-app
/roadmapper mobile-app .planning/research/SUMMARY.md
```
