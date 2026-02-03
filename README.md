# zahrs-skill

Indonesian workflow skills untuk AI coding agents. 

**Triple entry points:**
- 🔧 **MCP Server** - 24 tools untuk Claude Desktop, Antigravity, Codex
- 📝 **Claude Plugin** - Skills reference documents
- ⚡ **Slash Commands** - 22 commands untuk Claude Code

## Features

- **24 MCP Tools**: 10 orchestrators + 11 index agents + 3 meta-tools
- **22 Slash Commands**: `/debug`, `/plan`, `/execute`, dll
- **62 MD Files**: Complete skill documentation
- **ToR Protocol**: Trace of Reasoning mandatory di setiap response
- **Indonesian Informal**: Ngobrol santai tapi profesional

---

## Installation

### Option 1: Claude Code (Local Plugin)

```bash
# Clone repository
git clone https://github.com/keymodirans/zahrs-skill.git
cd zahrs-skill

# Install as local plugin
/plugin install ./
```

**Verify installation:**
```bash
/help
```

Should see:
```
# /debug - Investigate bugs dengan scientific method
# /plan - Create phase plans
# /execute - Execute plans
# /skills - List all skills
# ... + 18 more commands
```

### Option 1b: Plugin Marketplace

```bash
# Register marketplace
/plugin marketplace add keymodirans/zahrs-skill-marketplace

# Install plugin
/plugin install zahrs-skill@zahrs-skill-marketplace
```


### Option 2: Claude Desktop (MCP Server)

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

### Option 3: Antigravity / Gemini

Add ke `~/.gemini/antigravity/mcp_config.json`:

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

### Option 4: Factory Droid CLI

```bash
droid mcp add zahrs-skill node C:/Users/Rekabit/zahrs-skill/src/index.js
```

### Option 5: Run Server Manually

```bash
cd C:\Users\Rekabit\zahrs-skill
npm install
npm start
```

---

## Slash Commands (22 total)

### Orchestrators

| Command | Description | Example |
|---------|-------------|---------|
| `/debug` | Investigate bugs | `/debug login error` |
| `/plan` | Create phase plans | `/plan auth-system` |
| `/execute` | Execute plans | `/execute phase-1` |
| `/research` | Deep research | `/research e-commerce` |
| `/roadmap` | Create roadmap | `/roadmap my-app` |
| `/map` | Analyze codebase | `/map tech` |
| `/verify` | Verify phase | `/verify auth` |
| `/verify-work` | Verify work | `/verify-work "login done"` |
| `/check-plans` | Check plan quality | `/check-plans phase-1` |
| `/diagnose` | Multi-issue analysis | `/diagnose UAT.md` |

### Index Agents (Direct Access)

| Command | Description | Example |
|---------|-------------|---------|
| `/planner` | Direct planning | `/planner API endpoints` |
| `/debugger` | Scientific debugging | `/debugger 500 error` |
| `/executor` | Atomic execution | `/executor PLAN.md` |
| `/verifier` | Verification | `/verifier auth-phase` |
| `/mapper` | Codebase docs | `/mapper all` |
| `/researcher` | Domain research | `/researcher payments` |
| `/phase-research` | Phase research | `/phase-research auth` |
| `/synthesize` | Combine research | `/synthesize files` |
| `/roadmapper` | Detailed roadmap | `/roadmapper my-saas` |
| `/plan-checker` | Plan verification | `/plan-checker phase-1` |
| `/integration-check` | E2E check | `/integration-check flow` |

### Meta

| Command | Description | Example |
|---------|-------------|---------|
| `/skills` | List all skills | `/skills` |

---

## MCP Tools (24 total)

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

---

## Project Structure

```
zahrs-skill/
├── .agent/
│   └── workflows/          # 22 slash commands
│       ├── debug.md
│       ├── plan.md
│       └── ...
├── .claude-plugin/         # Claude Plugin
│   ├── plugin.json
│   └── marketplace.json
├── configs/                # Pre-made configs
│   ├── mcp_config.json
│   ├── antigravity_config.json
│   └── codex_config.json
├── skills/                 # 62 MD skill files
│   ├── debug.md
│   ├── plan-phase.md
│   ├── index-planner-indo.md
│   ├── references/         # 9 files
│   └── templates/          # 19 files
├── src/
│   ├── index.js            # MCP Server
│   └── test-tools.js
├── install-configs.bat     # Auto-installer
├── package.json
└── README.md
```

---

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

---

## Development

```bash
# Test tools detection
npm test

# Run server
npm start

# Watch mode
npm run dev
```

## License

MIT

