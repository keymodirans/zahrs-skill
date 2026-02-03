/**
 * ============================================================================
 * MCP SERVER - AGENT SKILL PLUGIN
 * ============================================================================
 * MCP Server yang auto-scan folder agents dan expose setiap .md sebagai tool.
 *
 * Usage:
 *   npx agent-mcp                    # Start server di agents folder
 *   npx agent-mcp --path /custom/path # Start server di custom path
 *
 * Tool Naming: agent:{filename}
 * Example: agent:index_planner_indo
 * ============================================================================
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// CONFIGURATION
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ServerConfig {
  agentsPath: string;
  toolPrefix: string;
  watchMode: boolean;
}

/**
 * Default config - auto-resolve agents folder
 */
function getConfig(): ServerConfig {
  const args = process.argv.slice(2);

  // Parse command line args
  const pathIndex = args.indexOf('--path');
  const customPath = pathIndex !== -1 ? args[pathIndex + 1] : null;
  const watchMode = args.includes('--watch');

  return {
    agentsPath: customPath || __dirname,
    toolPrefix: 'agent:',
    watchMode
  };
}

const config = getConfig();

// ============================================================================
// FILE SCANNER - Discover Agent Files
// ============================================================================

interface AgentFile {
  name: string;
  path: string;
  toolName: string;
  description: string;
  size: number;
  isIndex: boolean;
}

/**
 * Sanitize filename untuk tool name
 * - Remove .md extension
 * - Replace hyphens dengan underscores
 * - Lowercase
 */
function sanitizeToolName(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, '_')
    .toLowerCase();
}

/**
 * Extract description dari frontmatter YAML
 */
function extractDescription(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find description line dalam frontmatter
    const descLine = lines.find(line =>
      line.trim().startsWith('description:') &&
      !line.trim().startsWith('//')
    );

    if (descLine) {
      const match = descLine.match(/description:\s*(.+)/);
      return match ? match[1].trim() : 'No description';
    }

    // Fallback: ambil first non-empty line setelah frontmatter
    const afterFrontmatter = lines.slice(
      lines.findIndex(l => l.trim() === '---') + 1
    );
    const firstContent = afterFrontmatter.find(l => l.trim() && !l.startsWith('---'));

    return firstContent?.trim().substring(0, 100) || 'Agent instruction file';
  } catch {
    return 'Agent instruction file';
  }
}

/**
 * Scan folder untuk discover agent .md files
 */
function scanAgentFiles(dirPath: string): AgentFile[] {
  const agents: AgentFile[] = [];

  if (!existsSync(dirPath)) {
    console.error(`❌ Folder tidak ada: ${dirPath}`);
    return agents;
  }

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      // Skip non-files and hidden files
      if (!entry.isFile() || entry.name.startsWith('.')) {
        continue;
      }

      // Only process .md files
      if (!entry.name.endsWith('.md')) {
        continue;
      }

      // Skip known non-agent files
      const skipFiles = [
        'generator.ts',
        'generator-example.ts',
        'package.json',
        'package-lock.json',
        'node_modules',
        'README.md',
        '.gitignore'
      ];

      if (skipFiles.some(sf => entry.name.includes(sf))) {
        continue;
      }

      const stats = statSync(fullPath);
      const toolName = sanitizeToolName(entry.name);
      const description = extractDescription(fullPath);

      agents.push({
        name: entry.name,
        path: fullPath,
        toolName: `${config.toolPrefix}${toolName}`,
        description,
        size: stats.size,
        isIndex: entry.name.startsWith('index-')
      });
    }

    // Sort: index- files first, then alphabetically
    agents.sort((a, b) => {
      if (a.isIndex && !b.isIndex) return -1;
      if (!a.isIndex && b.isIndex) return 1;
      return a.name.localeCompare(b.name);
    });

  } catch (error: any) {
    console.error(`❌ Error scanning folder: ${error.message}`);
  }

  return agents;
}

// ============================================================================
// MCP TOOL REGISTRATION
// ============================================================================

/**
 * Convert AgentFile ke MCP Tool schema
 */
function agentFileToTool(agent: AgentFile): Tool {
  return {
    name: agent.toolName,
    description: `Load agent: ${agent.description}\nFile: ${agent.name}`,
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'User prompt/instruction untuk agent ini'
        },
        context: {
          type: 'string',
          description: 'Additional context (optional)',
          default: ''
        }
      },
      required: ['prompt']
    }
  };
}

/**
 * Register tools ke MCP Server
 */
function registerTools(server: Server, agents: AgentFile[]): void {
  const tools = agents.map(agentFileToTool);

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools
    };
  });

  console.log(`📝 Registered ${tools.length} agent tools:`);
  agents.forEach(agent => {
    const type = agent.isIndex ? '[INDEX]' : '[ORCH ]';
    console.log(`   ${type} ${agent.toolName.padEnd(35)} ← ${agent.name}`);
  });
}

// ============================================================================
// TOOL EXECUTION HANDLER
// ============================================================================

/**
 * Read agent file dan return content
 */
function loadAgentContent(agentPath: string): string {
  if (!existsSync(agentPath)) {
    throw new Error(`Agent file tidak ada: ${agentPath}`);
  }

  try {
    return readFileSync(agentPath, 'utf-8');
  } catch (error: any) {
    throw new Error(`Gagal baca agent file: ${error.message}`);
  }
}

/**
 * Handle tool execution
 */
function handleToolCall(server: Server, agents: AgentFile[]): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Find agent by tool name
    const agent = agents.find(a => a.toolName === name);

    if (!agent) {
      throw new Error(`Tool tidak dikenal: ${name}`);
    }

    try {
      // Load agent content
      const content = loadAgentContent(agent.path);

      // Parse user prompt
      const prompt = args?.prompt || '';
      const context = args?.context || '';

      // Build response
      const response = [
        `# AGENT: ${agent.name}`,
        `# Tool: ${agent.toolName}`,
        `# Description: ${agent.description}`,
        '',
        '---',
        '',
        '## Agent Instructions',
        '',
        content,
        '',
        '---',
        '',
        '## User Request',
        '',
        `Prompt: ${prompt}`,
        context ? `Context: ${context}` : '',
        '',
        '> Silakan ikuti instruksi agent di atas untuk memproses request ini.'
      ].filter(Boolean).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: response
          }
        ]
      };

    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error executing ${name}: ${error.message}`
          }
        ],
        isError: true
      };
    }
  });
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start MCP Server
 */
async function startServer(): Promise<void> {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          AGENT SKILL PLUGIN - MCP SERVER                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Agents Path: ${config.agentsPath}`);
  console.log(`🔧 Tool Prefix: ${config.toolPrefix}`);
  console.log(`👀 Watch Mode: ${config.watchMode ? 'ON' : 'OFF'}`);
  console.log('');

  // Scan agent files
  console.log('🔍 Scanning agent files...');
  const agents = scanAgentFiles(config.agentsPath);

  if (agents.length === 0) {
    console.warn('⚠️  No agent files found!');
    console.log('   Pastikan folder berisi file .md agent.');
  }

  console.log('');

  // Create MCP Server
  const server = new Server(
    {
      name: 'agent-skill-plugin',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Register tools
  registerTools(server, agents);

  // Register tool handler
  handleToolCall(server, agents);

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('');
  console.log('✅ MCP Server started!');
  console.log('   Ready to receive tool calls via stdio...');
  console.log('');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down MCP Server...');
    server.close();
    process.exit(0);
  });
}

// ============================================================================
// MAIN
// ============================================================================

startServer().catch((error) => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});

// ============================================================================
// EXPORTS (untuk testing)
// ============================================================================

export {
  getConfig,
  sanitizeToolName,
  extractDescription,
  scanAgentFiles,
  agentFileToTool,
  loadAgentContent
};
