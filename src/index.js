#!/usr/bin/env node

/**
 * zahrs-skill MCP Server
 * 
 * Dynamic MCP server yang:
 * 1. Scan skills folder untuk identifikasi orchestrators dari YAML frontmatter
 * 2. Generate 16 tools: 13 orchestrators + 3 meta-tools
 * 3. Handle tool execution yang return MD content
 * 
 * Jadi ini server MCP via stdio transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// =============================================================================
// PATH RESOLUTION
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_DIR = path.join(__dirname, '..', 'skills');

// =============================================================================
// YAML FRONTMATTER PARSER
// Jadi ini parse frontmatter dari MD files buat extract name, description, tools
// =============================================================================

/**
 * Parse YAML frontmatter dari markdown content
 * @param {string} content - Raw markdown content
 * @returns {object} - Parsed frontmatter { name, description, tools, color }
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1];
  const result = {};

  // Parse each line
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    result[key] = value;
  }

  return result;
}

/**
 * Detect apakah file adalah orchestrator berdasarkan content patterns
 * Orchestrators punya <orchestrator> tag atau pattern tertentu
 * @param {string} content - File content
 * @param {object} frontmatter - Parsed frontmatter
 * @returns {boolean}
 */
function isOrchestrator(content, frontmatter) {
  // Check untuk <orchestrator> tag
  if (content.includes('<orchestrator>')) {
    return true;
  }

  // Check untuk pattern "Orchestrator:" di content
  if (content.includes('## Orchestrator:')) {
    return true;
  }

  // Root-level files dengan frontmatter yang punya tools field
  // dan BUKAN index-* files (those are agents, not orchestrators)
  if (frontmatter && frontmatter.tools && !frontmatter.name?.startsWith('index-')) {
    return true;
  }

  return false;
}

// =============================================================================
// SKILL SCANNER
// Scan skills folder dan build registry
// =============================================================================

/**
 * Scan skills directory dan build orchestrator registry
 * @returns {Promise<Map>} - Map of orchestrator name -> config
 */
async function buildOrchestratorRegistry() {
  const orchestrators = new Map();

  try {
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      // Only process root-level .md files
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      // Skip custom-indo.md (base persona, bukan tool)
      if (entry.name === 'custom-indo.md') continue;

      // Skip test files
      if (entry.name.startsWith('test-')) continue;

      const filePath = path.join(SKILLS_DIR, entry.name);
      const content = await fs.readFile(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      // Check if this is an index agent (all index-* files are tools)
      const isIndexAgent = entry.name.startsWith('index-');

      // Include orchestrators AND all index agents
      if (isOrchestrator(content, frontmatter) || isIndexAgent) {
        const toolName = entry.name
          .replace('.md', '')
          .replace(/-indo$/, '')
          .replace(/-/g, '_'); // debug.md -> debug, index-planner-indo.md -> index_planner

        orchestrators.set(toolName, {
          file: entry.name,
          name: frontmatter?.name || toolName,
          description: frontmatter?.description || `Execute ${toolName} workflow`,
          tools: frontmatter?.tools || '',
          content: content,
          isAgent: isIndexAgent
        });
      }
    }
  } catch (error) {
    console.error('Error scanning skills:', error);
  }

  return orchestrators;
}

// =============================================================================
// SKILL FILE UTILITIES
// =============================================================================

/**
 * Read skill file content
 * @param {string} relativePath - Path relative ke skills folder
 * @returns {Promise<string>}
 */
async function readSkillFile(relativePath) {
  const fullPath = path.join(SKILLS_DIR, relativePath);
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Skill file not found: ${relativePath}`);
  }
}

/**
 * List all skill files recursively
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory untuk relative path
 * @returns {Promise<Array>}
 */
async function listSkillFiles(dir = SKILLS_DIR, baseDir = SKILLS_DIR) {
  const skills = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        const subSkills = await listSkillFiles(fullPath, baseDir);
        skills.push(...subSkills);
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const frontmatter = parseFrontmatter(content);

        skills.push({
          name: frontmatter?.name || entry.name.replace('.md', ''),
          file: relativePath,
          description: frontmatter?.description || '',
          tools: frontmatter?.tools || '',
          color: frontmatter?.color || ''
        });
      }
    }
  } catch (error) {
    // Directory might not exist
  }

  return skills;
}

/**
 * Search skills by keyword
 * @param {string} keyword
 * @returns {Promise<Array>}
 */
async function searchSkills(keyword) {
  const allSkills = await listSkillFiles();
  const lowerKeyword = keyword.toLowerCase();

  return allSkills.filter(skill =>
    skill.name.toLowerCase().includes(lowerKeyword) ||
    skill.description.toLowerCase().includes(lowerKeyword) ||
    skill.file.toLowerCase().includes(lowerKeyword)
  );
}

// =============================================================================
// INPUT SCHEMA GENERATOR
// Generate schema berdasarkan orchestrator type
// =============================================================================

/**
 * Generate input schema buat orchestrator tool
 * @param {string} toolName
 * @param {object} config
 * @returns {object} - JSON Schema
 */
function generateInputSchema(toolName, config) {
  // Common patterns berdasarkan tool name
  const schemas = {
    debug: {
      type: 'object',
      properties: {
        bug_description: {
          type: 'string',
          description: 'Deskripsi bug: symptoms, expected vs actual behavior, error messages'
        }
      },
      required: ['bug_description']
    },
    map_codebase: {
      type: 'object',
      properties: {
        focus_area: {
          type: 'string',
          enum: ['tech', 'arch', 'quality', 'concerns', 'all'],
          description: 'Area focus: tech (stack/integrations), arch (architecture/structure), quality (conventions/testing), concerns, atau all'
        }
      },
      required: ['focus_area']
    },
    plan_phase: {
      type: 'object',
      properties: {
        phase_name: {
          type: 'string',
          description: 'Nama phase yang mau diplan (dari ROADMAP.md)'
        },
        mode: {
          type: 'string',
          enum: ['standard', 'gaps'],
          description: 'Mode: standard (new plans) atau gaps (gap closure dari verification)'
        }
      },
      required: ['phase_name']
    },
    execute_phase: {
      type: 'object',
      properties: {
        phase_name: {
          type: 'string',
          description: 'Nama phase yang mau diexecute'
        },
        plan_number: {
          type: 'number',
          description: 'Optional: specific plan number'
        },
        resume: {
          type: 'boolean',
          description: 'Optional: resume dari checkpoint terakhir'
        }
      },
      required: ['phase_name']
    },
    research_project: {
      type: 'object',
      properties: {
        project_description: {
          type: 'string',
          description: 'Deskripsi project atau topic yang mau diresearch'
        }
      },
      required: ['project_description']
    },
    create_roadmap: {
      type: 'object',
      properties: {
        project_name: {
          type: 'string',
          description: 'Nama project untuk roadmap'
        }
      },
      required: ['project_name']
    },
    check_plans: {
      type: 'object',
      properties: {
        phase_name: {
          type: 'string',
          description: 'Phase yang plans-nya mau dicek'
        }
      },
      required: ['phase_name']
    },
    diagnose_issues: {
      type: 'object',
      properties: {
        issues_source: {
          type: 'string',
          description: 'Path ke UAT.md atau description of issues'
        }
      },
      required: ['issues_source']
    },
    verify_phase: {
      type: 'object',
      properties: {
        phase_name: {
          type: 'string',
          description: 'Phase yang mau diverify'
        }
      },
      required: ['phase_name']
    },
    verify_work: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Deskripsi work yang mau diverify'
        }
      },
      required: ['description']
    },
    brainstorm: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic yang mau dibrainstorm'
        }
      },
      required: ['topic']
    },
    security_scan: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path ke folder atau file yang mau di-scan. Kosongkan untuk scan seluruh project.'
        }
      },
      required: []
    },
    // Index agent direct access tools (13 agents)
    index_security_scanner: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path ke folder atau file yang mau di-scan'
        }
      },
      required: []
    },
    index_brainstormer: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic yang mau dibrainstorm'
        }
      },
      required: ['topic']
    },
    index_planner: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Planning task: phase name, scope, dan context yang mau diplan'
        },
        mode: {
          type: 'string',
          enum: ['standard', 'gaps', 'tdd'],
          description: 'Mode planning: standard, gaps (gap closure), atau tdd'
        }
      },
      required: ['task']
    },
    index_debugger: {
      type: 'object',
      properties: {
        bug_report: {
          type: 'string',
          description: 'Bug report: symptoms, expected vs actual, error messages, when started'
        },
        mode: {
          type: 'string',
          enum: ['investigate', 'fix', 'full'],
          description: 'Mode: investigate (find root cause only), fix (apply fix), full (both)'
        }
      },
      required: ['bug_report']
    },
    index_executor: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Path ke PLAN.md file yang mau diexecute'
        },
        resume: {
          type: 'boolean',
          description: 'Resume dari checkpoint terakhir'
        }
      },
      required: ['plan_path']
    },
    index_verifier: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Target verification: phase name atau path ke implementation'
        },
        mode: {
          type: 'string',
          enum: ['quick', 'full', 'uat'],
          description: 'Mode: quick (basic checks), full (comprehensive), uat (user acceptance)'
        }
      },
      required: ['target']
    },
    index_codebase_mapper: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          enum: ['tech', 'arch', 'quality', 'concerns', 'all'],
          description: 'Focus area: tech, arch, quality, concerns, atau all'
        },
        output_dir: {
          type: 'string',
          description: 'Optional: custom output directory (default: .planning/codebase/)'
        }
      },
      required: ['focus']
    },
    index_project_researcher: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Research topic atau project description'
        },
        depth: {
          type: 'string',
          enum: ['quick', 'standard', 'deep'],
          description: 'Research depth: quick (15min), standard (30min), deep (1hr+)'
        }
      },
      required: ['topic']
    },
    index_phase_researcher: {
      type: 'object',
      properties: {
        phase: {
          type: 'string',
          description: 'Phase name yang mau diresearch'
        },
        context: {
          type: 'string',
          description: 'Additional context atau specific questions'
        }
      },
      required: ['phase']
    },
    index_research_synthesizer: {
      type: 'object',
      properties: {
        research_files: {
          type: 'string',
          description: 'Paths ke research files yang mau disynthesis (comma-separated)'
        }
      },
      required: ['research_files']
    },
    index_roadmapper: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name untuk roadmap'
        },
        research_path: {
          type: 'string',
          description: 'Optional: path ke RESEARCH.md results'
        }
      },
      required: ['project']
    },
    index_plan_checker: {
      type: 'object',
      properties: {
        phase: {
          type: 'string',
          description: 'Phase name yang plans-nya mau dicek'
        }
      },
      required: ['phase']
    },
    index_integration_checker: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Target integration atau files yang mau dicek'
        }
      },
      required: ['target']
    }
  };

  // Return specific schema atau generic one
  return schemas[toolName] || {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: `Input untuk ${toolName} workflow`
      }
    },
    required: ['input']
  };
}

// =============================================================================
// MCP SERVER
// =============================================================================

async function main() {
  // Build orchestrator registry dari skill files
  console.error('Scanning skills directory...');
  const orchestrators = await buildOrchestratorRegistry();
  console.error(`Found ${orchestrators.size} orchestrators:`);
  for (const [name, config] of orchestrators) {
    console.error(`  - ${name}: ${config.file}`);
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'zahrs-skill',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ==========================================================================
  // LIST TOOLS HANDLER
  // ==========================================================================

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = [];

    // Add orchestrator tools (dynamically generated)
    for (const [toolName, config] of orchestrators) {
      tools.push({
        name: toolName,
        description: config.description,
        inputSchema: generateInputSchema(toolName, config)
      });
    }

    // Add meta-tools
    tools.push({
      name: 'list_skills',
      description: 'List semua skills yang available. Returns name, file path, description, tools, color. Bisa filter by folder.',
      inputSchema: {
        type: 'object',
        properties: {
          folder: {
            type: 'string',
            description: 'Optional: filter by folder (references, templates, templates/codebase, dll)'
          }
        }
      }
    });

    tools.push({
      name: 'get_skill',
      description: 'Baca content dari skill file tertentu. Returns full markdown content.',
      inputSchema: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path ke skill file relative ke skills folder. Contoh: debug.md, templates/project.md, references/tdd.md'
          }
        },
        required: ['file_path']
      }
    });

    tools.push({
      name: 'search_skills',
      description: 'Search skills by keyword. Cari di name, description, dan file path.',
      inputSchema: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'Keyword untuk search'
          }
        },
        required: ['keyword']
      }
    });

    console.error(`Exposing ${tools.length} tools`);
    return { tools };
  });

  // ==========================================================================
  // CALL TOOL HANDLER
  // ==========================================================================

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.error(`Tool called: ${name}`);
    console.error(`Arguments: ${JSON.stringify(args)}`);

    try {
      // Handle orchestrator tools
      if (orchestrators.has(name)) {
        const config = orchestrators.get(name);
        const content = await readSkillFile(config.file);

        // Auto-inject custom-indo.md for index-* agents
        let basePersona = '';
        if (config.isAgent && config.file.startsWith('index-')) {
          try {
            const customIndoContent = await readSkillFile('custom-indo.md');
            basePersona = [
              '# BASE PERSONA (WAJIB DIIKUTI)',
              '',
              customIndoContent,
              '',
              '---',
              '',
              '# AGENT-SPECIFIC INSTRUCTIONS (Inherits above)',
              ''
            ].join('\n');
          } catch (e) {
            // custom-indo.md not found, skip injection
            console.error('Warning: custom-indo.md not found for persona injection');
          }
        }

        // Build response dengan context
        const response = [
          `# ${config.name}`,
          '',
          `**Description:** ${config.description}`,
          `**Tools Available:** ${config.tools}`,
          '',
          '---',
          '',
          '## Input Parameters',
          '```json',
          JSON.stringify(args, null, 2),
          '```',
          '',
          '---',
          '',
          basePersona,
          '## Skill Content',
          '',
          content
        ].join('\n');

        return {
          content: [{ type: 'text', text: response }]
        };
      }


      // Handle meta-tools
      switch (name) {
        case 'list_skills': {
          let skills = await listSkillFiles();

          // Filter by folder kalau ada
          if (args?.folder) {
            const folder = args.folder.replace(/\\/g, '/');
            skills = skills.filter(s => s.file.startsWith(folder));
          }

          // Format output
          const output = [
            `# Skills List`,
            ``,
            `**Total:** ${skills.length} skills`,
            ``,
            '| Name | File | Description |',
            '|------|------|-------------|',
            ...skills.map(s => `| ${s.name} | \`${s.file}\` | ${s.description.slice(0, 60)}${s.description.length > 60 ? '...' : ''} |`)
          ].join('\n');

          return {
            content: [{ type: 'text', text: output }]
          };
        }

        case 'get_skill': {
          const content = await readSkillFile(args.file_path);
          return {
            content: [{ type: 'text', text: content }]
          };
        }

        case 'search_skills': {
          const results = await searchSkills(args.keyword);

          if (results.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No skills found for keyword: "${args.keyword}"`
              }]
            };
          }

          const output = [
            `# Search Results: "${args.keyword}"`,
            ``,
            `**Found:** ${results.length} skills`,
            ``,
            '| Name | File | Description |',
            '|------|------|-------------|',
            ...results.map(s => `| ${s.name} | \`${s.file}\` | ${s.description.slice(0, 60)}${s.description.length > 60 ? '...' : ''} |`)
          ].join('\n');

          return {
            content: [{ type: 'text', text: output }]
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${name}:`, error);
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  });

  // ==========================================================================
  // START SERVER
  // ==========================================================================

  const transport = new StdioServerTransport();

  // Handle graceful shutdown saat stdin closes (EOF)
  // Delay sedikit supaya pending responses bisa dikirim dulu
  process.stdin.on('end', () => {
    setTimeout(() => {
      console.error('stdin closed, shutting down gracefully...');
      process.exit(0);
    }, 100);
  });

  process.stdin.on('close', () => {
    setTimeout(() => {
      console.error('stdin closed');
      process.exit(0);
    }, 100);
  });

  // Handle SIGINT/SIGTERM
  process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down...');
    process.exit(0);
  });

  await server.connect(transport);

  console.error('');
  console.error('='.repeat(50));
  console.error('zahrs-skill MCP server running on stdio');
  console.error(`Skills directory: ${SKILLS_DIR}`);
  console.error(`Orchestrators: ${orchestrators.size}`);
  console.error(`Total tools: ${orchestrators.size + 3} (${orchestrators.size} orchestrators + 3 meta-tools)`);
  console.error('='.repeat(50));
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
