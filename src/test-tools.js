/**
 * Test script buat verify MCP server tools
 * Run: node src/test-tools.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_DIR = path.join(__dirname, '..', 'skills');

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const result = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    result[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim();
  }
  return result;
}

// Check orchestrator
function isOrchestrator(content, frontmatter) {
  if (content.includes('<orchestrator>')) return true;
  if (content.includes('## Orchestrator:')) return true;
  if (frontmatter && frontmatter.tools && !frontmatter.name?.startsWith('index-')) return true;
  return false;
}

async function main() {
  console.log('='.repeat(70));
  console.log('ZAHRS-SKILL MCP SERVER - TOOLS VERIFICATION');
  console.log('='.repeat(70));
  console.log('');

  // Scan for all tools
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const orchestrators = [];
  const indexAgents = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (entry.name === 'custom-indo.md') continue;
    if (entry.name.startsWith('test-')) continue;

    const filePath = path.join(SKILLS_DIR, entry.name);
    const content = await fs.readFile(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    const isIndexAgent = entry.name.startsWith('index-');

    if (isOrchestrator(content, frontmatter) || isIndexAgent) {
      const toolName = entry.name
        .replace('.md', '')
        .replace(/-indo$/, '')
        .replace(/-/g, '_');

      const toolInfo = {
        tool: toolName,
        file: entry.name,
        name: frontmatter?.name || toolName,
        description: (frontmatter?.description || '').slice(0, 60)
      };

      if (isIndexAgent) {
        indexAgents.push(toolInfo);
      } else {
        orchestrators.push(toolInfo);
      }
    }
  }

  console.log(`ORCHESTRATORS (${orchestrators.length}):`);
  console.log('-'.repeat(70));
  orchestrators.forEach((o, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${o.tool.padEnd(25)} <- ${o.file}`);
  });
  console.log('');

  console.log(`INDEX AGENTS (${indexAgents.length}):`);
  console.log('-'.repeat(70));
  indexAgents.forEach((o, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${o.tool.padEnd(25)} <- ${o.file}`);
  });
  console.log('');

  // Meta-tools
  const metaTools = ['list_skills', 'get_skill', 'search_skills'];
  console.log(`META-TOOLS (${metaTools.length}):`);
  console.log('-'.repeat(70));
  metaTools.forEach((t, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${t}`);
  });
  console.log('');

  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Orchestrators:  ${orchestrators.length.toString().padStart(2)}`);
  console.log(`  Index Agents:   ${indexAgents.length.toString().padStart(2)}`);
  console.log(`  Meta-tools:     ${metaTools.length.toString().padStart(2)}`);
  console.log(`  ${'─'.repeat(20)}`);
  console.log(`  TOTAL TOOLS:    ${(orchestrators.length + indexAgents.length + metaTools.length).toString().padStart(2)}`);
  console.log('='.repeat(70));

  // Count all MD files
  async function countMdFiles(dir) {
    let count = 0;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += await countMdFiles(fullPath);
      } else if (entry.name.endsWith('.md')) {
        count++;
      }
    }
    return count;
  }

  const totalMd = await countMdFiles(SKILLS_DIR);
  console.log('');
  console.log(`Total MD files in skills/: ${totalMd}`);
}

main().catch(console.error);
