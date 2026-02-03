#!/usr/bin/env node

/**
 * zahrs-skill MCP Server
 * 
 * Pattern: JSON Schema (compatible dengan SDK 1.25.3)
 * Compatible dengan Claude Code dan Gemini Antigravity
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
// LOGGING
// =============================================================================

function log(message) {
  console.error(`[zahrs-skill] ${new Date().toISOString()} - ${message}`);
}

// =============================================================================
// SKILL UTILITIES
// =============================================================================

function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const result = {};
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

async function readSkillFile(relativePath) {
  const fullPath = path.join(SKILLS_DIR, relativePath);
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Skill file not found: ${relativePath}`);
  }
}

async function listSkillFiles(dir = SKILLS_DIR, baseDir = SKILLS_DIR) {
  const skills = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
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

async function getBasePersona() {
  try {
    const customIndoPath = path.join(SKILLS_DIR, 'custom-indo.md');
    const content = await fs.readFile(customIndoPath, 'utf-8');
    return content;
  } catch (e) {
    return '';
  }
}

// =============================================================================
// SERVER SETUP
// =============================================================================

const server = new Server(
  { name: 'zahrs-skill', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

log('Starting zahrs-skill MCP server...');

// =============================================================================
// LIST TOOLS HANDLER - JSON Schema format
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('ListTools called');

  return {
    tools: [
      {
        name: 'get_skill',
        description: 'Baca content dari skill file tertentu. Returns full markdown content. IMPORTANT: Call this first dengan file_path: "custom-indo.md" untuk load persona rules.',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path ke skill file relative ke skills folder. Contoh: custom-indo.md, debug.md'
            }
          },
          required: ['file_path']
        }
      },
      {
        name: 'list_skills',
        description: 'List semua skills yang available. Returns name, file path, description.',
        inputSchema: {
          type: 'object',
          properties: {
            folder: {
              type: 'string',
              description: 'Optional: filter by folder (references, templates, dll)'
            }
          },
          required: []
        }
      },
      {
        name: 'brainstorm',
        description: 'Execute brainstorm workflow untuk generate ideas',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Topic yang mau dibrainstorm'
            }
          },
          required: ['topic']
        }
      },
      {
        name: 'debug',
        description: 'Investigate bugs menggunakan scientific method',
        inputSchema: {
          type: 'object',
          properties: {
            bug_description: {
              type: 'string',
              description: 'Deskripsi bug: symptoms, expected vs actual behavior, error messages'
            }
          },
          required: ['bug_description']
        }
      },
      {
        name: 'plan_phase',
        description: 'Create phase plans dengan task breakdown dan goal-backward verification',
        inputSchema: {
          type: 'object',
          properties: {
            phase_name: {
              type: 'string',
              description: 'Nama phase yang mau diplan'
            },
            mode: {
              type: 'string',
              enum: ['standard', 'gaps'],
              description: 'Mode: standard atau gaps'
            }
          },
          required: ['phase_name']
        }
      },
      {
        name: 'execute_phase',
        description: 'Execute PLAN.md secara atomik dengan per-task commits',
        inputSchema: {
          type: 'object',
          properties: {
            phase_name: {
              type: 'string',
              description: 'Nama phase yang mau diexecute'
            },
            plan_number: {
              type: 'number',
              description: 'Specific plan number'
            },
            resume: {
              type: 'boolean',
              description: 'Resume dari checkpoint terakhir'
            }
          },
          required: ['phase_name']
        }
      },
      {
        name: 'security_scan',
        description: 'Scan codebase untuk security vulnerabilities',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path ke folder atau file. Kosongkan untuk scan seluruh project.'
            }
          },
          required: []
        }
      },
      {
        name: 'verify_phase',
        description: 'Verify phase goal achievement melalui goal-backward analysis',
        inputSchema: {
          type: 'object',
          properties: {
            phase_name: {
              type: 'string',
              description: 'Phase yang mau diverify'
            }
          },
          required: ['phase_name']
        }
      },
      {
        name: 'map_codebase',
        description: 'Explore codebase dan write structured analysis',
        inputSchema: {
          type: 'object',
          properties: {
            focus_area: {
              type: 'string',
              enum: ['tech', 'arch', 'quality', 'concerns', 'all'],
              description: 'Area focus'
            }
          },
          required: ['focus_area']
        }
      }
    ]
  };
});

// =============================================================================
// CALL TOOL HANDLER
// =============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  log(`TOOL CALLED: ${name}`);
  log(`ARGUMENTS: ${JSON.stringify(args)}`);

  try {
    // get_skill
    if (name === 'get_skill') {
      const content = await readSkillFile(args.file_path);
      const frontmatter = parseFrontmatter(content);

      return {
        content: [{
          type: 'text',
          text: [
            `# Skill: ${frontmatter?.name || args.file_path}`,
            '',
            frontmatter?.description ? `**Description:** ${frontmatter.description}` : '',
            '',
            '---',
            '',
            content
          ].join('\n')
        }]
      };
    }

    // list_skills
    if (name === 'list_skills') {
      let skills = await listSkillFiles();

      if (args.folder) {
        skills = skills.filter(s => s.file.startsWith(args.folder));
      }

      const formatted = skills.map(s => `- **${s.name}** (${s.file}): ${s.description}`).join('\n');

      return {
        content: [{
          type: 'text',
          text: `# Available Skills\n\n${formatted}\n\nTotal: ${skills.length} skills`
        }]
      };
    }

    // brainstorm
    if (name === 'brainstorm') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-brainstormer-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# BRAINSTORM SKILL',
            '',
            `**Topic:** ${args.topic}`,
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // debug
    if (name === 'debug') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-debugger-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# DEBUG SKILL',
            '',
            `**Bug:** ${args.bug_description}`,
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // plan_phase
    if (name === 'plan_phase') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-planner-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# PLANNER SKILL',
            '',
            `**Phase:** ${args.phase_name}`,
            `**Mode:** ${args.mode || 'standard'}`,
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // execute_phase
    if (name === 'execute_phase') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-executor-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# EXECUTOR SKILL',
            '',
            `**Phase:** ${args.phase_name}`,
            args.plan_number ? `**Plan:** ${args.plan_number}` : '',
            args.resume ? '**Resume:** true' : '',
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // security_scan
    if (name === 'security_scan') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-security-scanner-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# SECURITY SCANNER SKILL',
            '',
            args.path ? `**Target:** ${args.path}` : '**Target:** entire project',
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // verify_phase
    if (name === 'verify_phase') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-verifier-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# VERIFIER SKILL',
            '',
            `**Phase:** ${args.phase_name}`,
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // map_codebase
    if (name === 'map_codebase') {
      const basePersona = await getBasePersona();
      const skillContent = await readSkillFile('index-codebase-mapper-indo.md');

      return {
        content: [{
          type: 'text',
          text: [
            '# BASE PERSONA (WAJIB DIIKUTI)',
            '',
            basePersona,
            '',
            '---',
            '',
            '# CODEBASE MAPPER SKILL',
            '',
            `**Focus:** ${args.focus_area}`,
            '',
            skillContent
          ].join('\n')
        }]
      };
    }

    // Unknown tool
    return {
      content: [{ type: 'text', text: `Error: Unknown tool ${name}` }],
      isError: true
    };

  } catch (error) {
    log(`Error: ${error.message}`);
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// =============================================================================
// RUN SERVER
// =============================================================================

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('zahrs-skill MCP Server running on stdio');
}

// Process lifecycle handlers
process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down...');
  await server.close();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

runServer().catch((error) => {
  log(`Fatal error: ${error}`);
  process.exit(1);
});
