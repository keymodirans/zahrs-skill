# zahrs-skill

Indonesian workflow skills untuk AI coding agents. Dual entry points: Claude Plugin + MCP Server.

## Features

- **10 Orchestrator Tools**: debug, plan-phase, execute-phase, research, dll
- **11 Index Agent Tools**: planner, debugger, executor, verifier, researcher, dll
- **3 Meta-Tools**: list_skills, get_skill, search_skills
- **Total: 24 MCP Tools**
- **62 MD Files**: Complete skill documentation
- **ToR Protocol**: Trace of Reasoning mandatory di setiap response
- **Indonesian Informal**: Ngobrol santai tapi profesional

## Installation (Personal Use)

### Claude Desktop

Add ke `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zahrs-skill": {
      "command": "node",
      "args": ["C:/Users/Rekabit/zahrs-skill/src/index.js"]
    }
  }
}
```

### Antigravity / Codex

Add ke MCP config:

```json
{
  "mcpServers": {
    "zahrs-skill": {
      "command": "node",
      "args": ["C:/Users/Rekabit/zahrs-skill/src/index.js"]
    }
  }
}
```

### Factory Droid CLI

```bash
droid mcp add zahrs-skill node C:/Users/Rekabit/zahrs-skill/src/index.js
```

### Run Server Manually

```bash
cd C:\Users\Rekabit\zahrs-skill
npm start
```


## Tools

### Orchestrator Tools (10)

| Tool | Description |
|------|-------------|
| `debug` | Investigate bugs dengan scientific method |
| `map_codebase` | Explore dan document codebase structure |
| `plan_phase` | Create phase plans dengan task breakdown |
| `execute_phase` | Execute plans secara sequential |
| `research_project` | Deep research untuk project baru |
| `create_roadmap` | Break project into phases + milestones |
| `check_plans` | Verify plan quality sebelum execution |
| `diagnose_issues` | Parallel diagnosis dari UAT results |
| `verify_phase` | Verify phase completion |
| `verify_work` | Verify work against criteria |

### Index Agent Tools (11)

| Tool | Description |
|------|-------------|
| `index_planner` | Direct planning agent access |
| `index_debugger` | Direct debugging agent access |
| `index_executor` | Direct execution agent access |
| `index_verifier` | Direct verification agent access |
| `index_codebase_mapper` | Codebase documentation agent |
| `index_project_researcher` | Project research agent |
| `index_phase_researcher` | Phase-specific research agent |
| `index_research_synthesizer` | Research synthesis agent |
| `index_roadmapper` | Roadmap creation agent |
| `index_plan_checker` | Plan quality verification agent |
| `index_integration_checker` | Integration verification agent |

### Meta-Tools (3)

| Tool | Description |
|------|-------------|
| `list_skills` | List semua available skills |
| `get_skill` | Baca content skill tertentu |
| `search_skills` | Search skills by keyword |

## Skills Structure

```
skills/
├── custom-indo.md          # Base persona (semua index-* inherit ini)
├── debug.md                # Orchestrator
├── map-codebase.md         # Orchestrator
├── plan-phase.md           # Orchestrator
├── execute-phase.md        # Orchestrator
├── ...
├── index-planner-indo.md   # Role agent
├── index-debugger-indo.md  # Role agent
├── ...
├── references/             # Reference docs (9 files)
│   ├── checkpoints.md
│   ├── tdd.md
│   └── ...
└── templates/              # Template files (19 files + subdirs)
    ├── project.md
    ├── codebase/           # 7 files
    └── research-project/   # 5 files
```

## ToR Protocol

Setiap response WAJIB dimulai dengan:

```
[Trace of Reasoning]
├─ Intent: apa yang user mau
├─ Current State: observasi awal
├─ Plan: rencana eksekusi
└─ Expected Outcome: yang diharapkan

[Quick Map]
└─ Box-and-arrow flow visualization
```

## Development

```bash
# Test tools detection
node src/test-tools.js

# Run server
npm start
```

## License

MIT
