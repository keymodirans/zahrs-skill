#!/usr/bin/env node

/**
 * zahrs-skill MCP Server (McpServer Pattern)
 * 
 * Compatible with both Claude Code and Gemini/Antigravity
 * Uses the higher-level McpServer API like sequential-thinking
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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

const server = new McpServer({
  name: "zahrs-skill",
  version: "1.0.0",
});

log('Starting zahrs-skill MCP server...');

// =============================================================================
// TOOL: get_skill - Get skill content
// =============================================================================

server.registerTool(
  "get_skill",
  {
    title: "Get Skill",
    description: `Baca content dari skill file tertentu. Returns full markdown content.
    
IMPORTANT: Call this first dengan file_path: "custom-indo.md" untuk load persona rules.`,
    inputSchema: {
      file_path: z.string().describe('Path ke skill file relative ke skills folder. Contoh: custom-indo.md, debug.md, templates/project.md')
    }
  },
  async (args) => {
    log(`TOOL CALLED: get_skill`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

    try {
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
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// =============================================================================
// TOOL: list_skills - List all available skills
// =============================================================================

server.registerTool(
  "list_skills",
  {
    title: "List Skills",
    description: "List semua skills yang available. Returns name, file path, description.",
    inputSchema: {
      folder: z.string().optional().describe('Optional: filter by folder (references, templates, dll)')
    }
  },
  async (args) => {
    log(`TOOL CALLED: list_skills`);

    try {
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
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// =============================================================================
// TOOL: brainstorm - Brainstorming workflow
// =============================================================================

server.registerTool(
  "brainstorm",
  {
    title: "Brainstorm",
    description: "Execute brainstorm workflow untuk generate ideas",
    inputSchema: {
      topic: z.string().describe('Topic yang mau dibrainstorm')
    }
  },
  async (args) => {
    log(`TOOL CALLED: brainstorm`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: debug - Debug workflow
// =============================================================================

server.registerTool(
  "debug",
  {
    title: "Debug",
    description: "Investigate bugs menggunakan scientific method",
    inputSchema: {
      bug_description: z.string().describe('Deskripsi bug: symptoms, expected vs actual behavior, error messages')
    }
  },
  async (args) => {
    log(`TOOL CALLED: debug`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: plan_phase - Planning workflow
// =============================================================================

server.registerTool(
  "plan_phase",
  {
    title: "Plan Phase",
    description: "Create phase plans dengan task breakdown dan goal-backward verification",
    inputSchema: {
      phase_name: z.string().describe('Nama phase yang mau diplan'),
      mode: z.enum(['standard', 'gaps']).optional().describe('Mode: standard atau gaps')
    }
  },
  async (args) => {
    log(`TOOL CALLED: plan_phase`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: execute_phase - Execution workflow  
// =============================================================================

server.registerTool(
  "execute_phase",
  {
    title: "Execute Phase",
    description: "Execute PLAN.md secara atomik dengan per-task commits",
    inputSchema: {
      phase_name: z.string().describe('Nama phase yang mau diexecute'),
      plan_number: z.number().optional().describe('Specific plan number'),
      resume: z.boolean().optional().describe('Resume dari checkpoint terakhir')
    }
  },
  async (args) => {
    log(`TOOL CALLED: execute_phase`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: security_scan - Security scanning workflow
// =============================================================================

server.registerTool(
  "security_scan",
  {
    title: "Security Scan",
    description: "Scan codebase untuk security vulnerabilities",
    inputSchema: {
      path: z.string().optional().describe('Path ke folder atau file. Kosongkan untuk scan seluruh project.')
    }
  },
  async (args) => {
    log(`TOOL CALLED: security_scan`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: verify_phase - Verification workflow
// =============================================================================

server.registerTool(
  "verify_phase",
  {
    title: "Verify Phase",
    description: "Verify phase goal achievement melalui goal-backward analysis",
    inputSchema: {
      phase_name: z.string().describe('Phase yang mau diverify')
    }
  },
  async (args) => {
    log(`TOOL CALLED: verify_phase`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// TOOL: map_codebase - Codebase exploration
// =============================================================================

server.registerTool(
  "map_codebase",
  {
    title: "Map Codebase",
    description: "Explore codebase dan write structured analysis",
    inputSchema: {
      focus_area: z.enum(['tech', 'arch', 'quality', 'concerns', 'all']).describe('Area focus')
    }
  },
  async (args) => {
    log(`TOOL CALLED: map_codebase`);
    log(`ARGUMENTS: ${JSON.stringify(args)}`);

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
);

// =============================================================================
// RUN SERVER
// =============================================================================

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('zahrs-skill MCP Server running on stdio');
}

runServer().catch((error) => {
  log(`Fatal error: ${error}`);
  process.exit(1);
});
