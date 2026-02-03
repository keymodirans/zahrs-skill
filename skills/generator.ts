/**
 * ============================================================================
 * AGENT FILE GENERATOR
 * ============================================================================
 * Module untuk generate file agent .md dengan:
 * - Zod validation + sanitasi input
 * - Auto persona_anchor injection ke custom-indo.md
 * - XML tags lengkap (role_definition, logic_kernel, dll)
 * - ToR protocol di awal output
 * - Overwrite protection
 *
 * Usage:
 *   import { generateAgentFile, AgentConfig } from './generator';
 *
 *   const config: AgentConfig = {
 *     meta: { name: 'my-agent', description: '...', tools: ['Read', 'Write'], color: 'blue' },
 *     role: { identity: '...', task: '...', responsibilities: ['...'] },
 *     logicKernel: { principles: ['...'] },
 *     executionFlow: { steps: ['...'] },
 *     verificationGate: { criteria: ['...'] }
 *   };
 *
 *   await generateAgentFile(config, '/path/to/agents');
 * ============================================================================
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// ZOD DEPENDENCY - Pastikan installed: npm install zod
// ============================================================================
// Kalau zod belum terinstall:
//   npm install zod
//   npm install --save-dev @types/node
// ============================================================================

// Try importing zod, provide helpful message if not found
let z: any;
try {
  z = require('zod');
} catch (e) {
  console.error('❌ Zod not found. Install dengan: npm install zod');
  throw e;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Metadata agent untuk frontmatter YAML
 */
export interface AgentMeta {
  name: string;
  description: string;
  tools: string[];
  color?: string;
}

/**
 * Inheritance configuration ke custom-indo.md
 */
export interface InheritanceConfig {
  enabled?: boolean;
  basePath?: string;
}

/**
 * Role definition untuk <role_definition> tag
 */
export interface RoleDefinition {
  identity: string;
  task: string;
  spawnedBy?: string;
  coreResponsibilities: string[];
}

/**
 * Logic kernel untuk <logic_kernel> tag
 */
export interface LogicKernel {
  principles: string[];
  rules?: string[];
  antiPatterns?: string[];
}

/**
 * Execution flow untuk <execution_flow> tag
 */
export interface ExecutionFlow {
  steps: string[];
  notes?: string[];
}

/**
 * Verification gate untuk <verification_gate> tag
 */
export interface VerificationGate {
  criteria: string[];
  successIndicators?: string[];
}

/**
 * Additional XML tags (optional)
 */
export interface AdditionalTags {
  discoveryProtocol?: string;
  taskAnatomy?: string;
  dependencyGraph?: string;
  tddProtocol?: string;
  returnFormats?: string;
}

/**
 * Complete agent configuration
 */
export interface AgentConfig {
  meta: AgentMeta;
  inheritance?: InheritanceConfig;
  role: RoleDefinition;
  logicKernel: LogicKernel;
  executionFlow: ExecutionFlow;
  verificationGate: VerificationGate;
  additionalTags?: AdditionalTags;
}

/**
 * Generator options
 */
export interface GeneratorOptions {
  outputDir?: string;
  overwrite?: boolean;
  includeTorProtocol?: boolean;
  customIndoPath?: string;
}

// ============================================================================
// ZOD SCHEMAS - Validation + Sanitization
// ============================================================================

/**
 * Sanitize string: trim, remove extra whitespace, escape special chars
 */
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["'`]/g, '')
    .replace(/[<>]/g, '');
}

/**
 * Validate tools list against allowed tools
 */
const VALID_TOOLS = [
  'Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob', 'Task', 'AskUserQuestion',
  'WebFetch', 'WebSearch', 'mcp__context7__*', 'mcp__zread__*', '*'
];

/**
 * Zod schema untuk AgentMeta
 */
const AgentMetaSchema = z.object({
  name: z.string()
    .min(1, 'Nama agent tidak boleh kosong')
    .max(50, 'Nama agent terlalu panjang (max 50 karakter)')
    .transform(sanitizeString)
    .refine(
      (val) => /^[a-z][a-z0-9-]*$/.test(val),
      'Nama harus kecil, dimulai huruf, gunakan hyphen untuk pemisah (contoh: my-agent)'
    ),
  description: z.string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(200, 'Deskripsi maksimal 200 karakter')
    .transform(sanitizeString),
  tools: z.array(z.string())
    .min(1, 'Minimal 1 tool harus dipilih')
    .max(20, 'Terlalu banyak tools (max 20)')
    .transform((tools) => tools.map(t => t.trim()).filter(t => VALID_TOOLS.includes(t) || t === '*'))
    .refine((tools) => tools.length > 0, 'Tidak ada valid tools yang dipilih'),
  color: z.string()
    .optional()
    .transform(val => val?.trim())
    .refine(
      (val) => !val || /^(blue|green|yellow|red|purple|orange|cyan|gray|white)$/i.test(val),
      'Color harus salah satu: blue, green, yellow, red, purple, orange, cyan, gray, white'
    )
});

/**
 * Zod schema untuk InheritanceConfig
 */
const InheritanceConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  basePath: z.string()
    .optional()
    .default('C:\\Users\\Rekabit\\.claude\\agents\\custom-indo.md')
    .transform(sanitizeString)
});

/**
 * Zod schema untuk RoleDefinition
 */
const RoleDefinitionSchema = z.object({
  identity: z.string()
    .min(5, 'Identity minimal 5 karakter')
    .transform(sanitizeString),
  task: z.string()
    .min(10, 'Task description minimal 10 karakter')
    .transform(sanitizeString),
  spawnedBy: z.string()
    .optional()
    .transform(sanitizeString),
  coreResponsibilities: z.array(z.string())
    .min(1, 'Minimal 1 core responsibility')
    .transform(respons => respons.map(r => `    - ${r.trim()}`))
});

/**
 * Zod schema untuk LogicKernel
 */
const LogicKernelSchema = z.object({
  principles: z.array(z.string())
    .min(1, 'Minimal 1 principle')
    .transform(princs => princs.map(p => `    - ${p.trim()}`)),
  rules: z.array(z.string()).optional()
    .transform(rules => rules?.map(r => `    - ${r.trim()}`)),
  antiPatterns: z.array(z.string()).optional()
    .transform(anti => anti?.map(a => `    ❌ ${a.trim()}`))
});

/**
 * Zod schema untuk ExecutionFlow
 */
const ExecutionFlowSchema = z.object({
  steps: z.array(z.string())
    .min(1, 'Minimal 1 execution step')
    .transform(steps => steps.map((s, i) => `    ${i + 1}. ${s.trim()}`)),
  notes: z.array(z.string()).optional()
    .transform(notes => notes?.map(n => `    > ${n.trim()}`))
});

/**
 * Zod schema untuk VerificationGate
 */
const VerificationGateSchema = z.object({
  criteria: z.array(z.string())
    .min(1, 'Minimal 1 verification criterion')
    .transform(crit => crit.map(c => `- [ ] ${c.trim()}`)),
  successIndicators: z.array(z.string()).optional()
    .transform(ind => ind?.map(i => `    ✅ ${i.trim()}`))
});

/**
 * Zod schema untuk AdditionalTags
 */
const AdditionalTagsSchema = z.object({
  discoveryProtocol: z.string().optional(),
  taskAnatomy: z.string().optional(),
  dependencyGraph: z.string().optional(),
  tddProtocol: z.string().optional(),
  returnFormats: z.string().optional()
}).optional();

/**
 * Master Zod schema untuk AgentConfig
 */
const AgentConfigSchema = z.object({
  meta: AgentMetaSchema,
  inheritance: InheritanceConfigSchema.optional(),
  role: RoleDefinitionSchema,
  logicKernel: LogicKernelSchema,
  executionFlow: ExecutionFlowSchema,
  verificationGate: VerificationGateSchema,
  additionalTags: AdditionalTagsSchema
});

// ============================================================================
// TEMPLATE GENERATORS
// ============================================================================

/**
 * Generate frontmatter YAML section
 */
function generateFrontmatter(meta: AgentMeta): string {
  const tools = meta.tools.map(t => `'${t}'`).join(', ');
  const colorLine = meta.color ? `color: ${meta.color}` : '';

  return `---
name: ${meta.name}
description: ${meta.description}
tools: ${tools}
${colorLine}
---`;
}

/**
 * Generate persona_anchor section (auto-inject custom-indo.md)
 */
function generatePersonaAnchor(basePath: string): string {
  return `<persona_anchor>
Inherits from @${basePath}:
  - <persona>: Indonesia informal, 70% mikir/30% output
  - <global_constraints>: Code preservation, style, security
  - <trigger_logic>: ToR + QuickMap mandatory first
</persona_anchor>`;
}

/**
 * Generate role_definition XML tag
 */
function generateRoleDefinition(role: any): string {
  return `<role_definition>
## IDENTITY: ${role.identity}

**Tugas:** ${role.task}
${role.spawnedBy ? `**Spawned by:** ${role.spawnedBy}` : ''}
**Core Responsibilities:**
${role.coreResponsibilities.join('\n')}
</role_definition>`;
}

/**
 * Generate logic_kernel XML tag
 */
function generateLogicKernel(kernel: any): string {
  let output = `<logic_kernel>
## Core Principles

${kernel.principles.join('\n')}`;

  if (kernel.rules && kernel.rules.length > 0) {
    output += `\n\n**Rules:**\n${kernel.rules.join('\n')}`;
  }

  if (kernel.antiPatterns && kernel.antiPatterns.length > 0) {
    output += `\n\n**Anti-Patterns:**\n${kernel.antiPatterns.join('\n')}`;
  }

  output += '\n</logic_kernel>';
  return output;
}

/**
 * Generate execution_flow XML tag
 */
function generateExecutionFlow(flow: any): string {
  let output = `<execution_flow>
## Execution Flow

\`\`\`
${flow.steps.join('\n')}
\`\`\``;

  if (flow.notes && flow.notes.length > 0) {
    output += `\n\n**Notes:**\n${flow.notes.join('\n')}`;
  }

  output += '\n</execution_flow>';
  return output;
}

/**
 * Generate verification_gate XML tag
 */
function generateVerificationGate(gate: any): string {
  let output = `<verification_gate>
## Completion Verification

- ToR+QuickMap muncul → inherited

**Success Criteria:**
${gate.criteria.join('\n')}`;

  if (gate.successIndicators && gate.successIndicators.length > 0) {
    output += `\n\n**Success Indicators:**\n${gate.successIndicators.join('\n')}`;
  }

  output += '\n</verification_gate>';
  return output;
}

/**
 * Generate additional XML tags (optional)
 */
function generateAdditionalTags(tags?: AdditionalTags): string {
  if (!tags) return '';

  const sections: string[] = [];

  if (tags.discoveryProtocol) {
    sections.push(`<discovery_protocol>
## Discovery Protocol

${tags.discoveryProtocol}
</discovery_protocol>`);
  }

  if (tags.taskAnatomy) {
    sections.push(`<task_anatomy>
## Task Anatomy

${tags.taskAnatomy}
</task_anatomy>`);
  }

  if (tags.dependencyGraph) {
    sections.push(`<dependency_graph>
## Dependency Graph

${tags.dependencyGraph}
</dependency_graph>`);
  }

  if (tags.tddProtocol) {
    sections.push(`<tdd_protocol>
## TDD Protocol

${tags.tddProtocol}
</tdd_protocol>`);
  }

  if (tags.returnFormats) {
    sections.push(`<return_formats>
## Return Formats

${tags.returnFormats}
</return_formats>`);
  }

  return sections.join('\n\n');
}

/**
 * Generate ToR Protocol comment (untuk response output)
 */
function generateTorProtocol(): string {
  return `<!--
[Trace of Reasoning]
├─ Intent: {apa yang user mau}
├─ Current State: {observasi awal}
├─ Plan: {rencana eksekusi}
└─ Expected Outcome: {yang diharapkan}

[Quick Map]
└─ {box-and-arrow flow visualization}

**NON-NEGOTIABLE:** 70% token digunakan buat internal processing & tracing.
-->
`;
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Result type dari generateAgentFile
 */
export interface GeneratorResult {
  success: boolean;
  filePath?: string;
  message: string;
  skipped?: boolean;
  errors?: string[];
}

/**
 * Check apakah file sudah ada
 */
export function checkFileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Validate input menggunakan Zod schema
 */
export function validateAgentConfig(config: unknown): {
  success: boolean;
  data?: AgentConfig;
  errors?: string[];
} {
  try {
    const validated = AgentConfigSchema.parse(config);
    return { success: true, data: validated };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message];
    return { success: false, errors };
  }
}

/**
 * Generate complete agent file markdown content
 */
export function generateAgentMarkdown(
  config: AgentConfig,
  options: GeneratorOptions = {}
): string {
  const inheritancePath = config.inheritance?.basePath ||
    options.customIndoPath ||
    'C:\\Users\\Rekabit\\.claude\\agents\\custom-indo.md';

  const sections: string[] = [];

  // 1. Frontmatter
  sections.push(generateFrontmatter(config.meta));
  sections.push('');

  // 2. Role Definition
  sections.push(generateRoleDefinition(config.role));
  sections.push('');

  // 3. Persona Anchor (auto-inject)
  if (config.inheritance?.enabled !== false) {
    sections.push(generatePersonaAnchor(inheritancePath));
    sections.push('');
  }

  // 4. Logic Kernel
  sections.push(generateLogicKernel(config.logicKernel));
  sections.push('');

  // 5. Execution Flow
  sections.push(generateExecutionFlow(config.executionFlow));

  // 6. Additional Tags (optional)
  const additional = generateAdditionalTags(config.additionalTags);
  if (additional) {
    sections.push('');
    sections.push(additional);
  }

  // 7. Verification Gate
  sections.push('');
  sections.push(generateVerificationGate(config.verificationGate));

  return sections.join('\n');
}

/**
 * Generate ToR protocol string (untuk response awal)
 */
export function generateTorResponse(
  intent: string,
  currentState: string,
  plan: string,
  expectedOutcome: string,
  quickMap?: string
): string {
  const quickMapSection = quickMap || `└─ ${plan}`;

  return `[Trace of Reasoning]
├─ Intent: ${intent}
├─ Current State: ${currentState}
├─ Plan: ${plan}
└─ Expected Outcome: ${expectedOutcome}

[Quick Map]
${quickMapSection}

**NON-NEGOTIABLE:** 70% token digunakan buat internal processing & tracing.
`;
}

/**
 * Main function: Generate agent file dengan safety checks
 */
export async function generateAgentFile(
  config: unknown,
  outputDir: string = 'C:\\Users\\Rekabit\\.claude\\agents',
  options: GeneratorOptions = {}
): Promise<GeneratorResult> {
  // Step 1: Validate input
  const validation = validateAgentConfig(config);
  if (!validation.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validation.errors
    };
  }

  const validatedConfig = validation.data!;
  const fileName = `${validatedConfig.meta.name}.md`;
  const filePath = join(outputDir, fileName);

  // Step 2: Check file exists
  if (checkFileExists(filePath) && !options.overwrite) {
    return {
      success: false,
      message: `File sudah ada: ${filePath}`,
      skipped: true,
      errors: [
        'File sudah ada. Gunakan options.overwrite = true untuk menimpa.'
      ]
    };
  }

  // Step 3: Generate markdown content
  const markdown = generateAgentMarkdown(validatedConfig, options);

  // Step 4: Write file
  try {
    writeFileSync(filePath, markdown, 'utf-8');

    return {
      success: true,
      filePath,
      message: `✅ Agent file berhasil dibuat: ${filePath}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal menulis file: ${error.message}`,
      errors: [error.message]
    };
  }
}

/**
 * Generate orchestrator file (non-index, command trigger)
 */
export interface OrchestratorConfig {
  meta: Omit<AgentMeta, 'color'>;
  command: string;
  usage: string;
  agentReference: string;
  agentDescription: string;
  executionSteps: string[];
}

export function generateOrchestratorMarkdown(config: OrchestratorConfig): string {
  const tools = config.meta.tools.map(t => `'${t}'`).join(', ');

  return `---
name: ${config.meta.name}
description: ${config.meta.description}
tools: ${tools}
---

<orchestrator>
## Orchestrator: /${config.command}

**Usage:** \`${config.usage}\`

**Output:** Agent execution result
</orchestrator>

<agent_reference>
**Agent:** \`@${config.agentReference}\`

Agent ini akan:
    - ${config.agentDescription}

**ToR & Persona:** Inherited dari \`@custom-indo.md\`
</agent_reference>

<execution_flow>
\`\`\`
${config.executionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
\`\`\`
</execution_flow>
`;
}

/**
 * Generate orchestrator file dengan safety checks
 */
export async function generateOrchestratorFile(
  config: OrchestratorConfig,
  outputDir: string = 'C:\\Users\\Rekabit\\.claude\\agents',
  options: GeneratorOptions = {}
): Promise<GeneratorResult> {
  const fileName = `${config.meta.name}.md`;
  const filePath = join(outputDir, fileName);

  if (checkFileExists(filePath) && !options.overwrite) {
    return {
      success: false,
      message: `File sudah ada: ${filePath}`,
      skipped: true
    };
  }

  const markdown = generateOrchestratorMarkdown(config);

  try {
    writeFileSync(filePath, markdown, 'utf-8');
    return {
      success: true,
      filePath,
      message: `✅ Orchestrator file berhasil dibuat: ${filePath}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal menulis file: ${error.message}`,
      errors: [error.message]
    };
  }
}

// ============================================================================
// CLI HELPER FUNCTIONS
// ============================================================================

/**
 * Prompt user untuk overwrite confirmation
 */
export async function promptOverwrite(filePath: string): Promise<boolean> {
  // Dalam environment CLI nyata, gunakan readline/prompt
  // Ini placeholder untuk demo
  console.log(`⚠️  File sudah ada: ${filePath}`);
  console.log('   Apakah ingin menimpa? (y/N)');
  return false; // Default: tidak overwrite
}

/**
 * List all existing agent files
 */
export function listAgentFiles(dir: string = 'C:\\Users\\Rekabit\\.claude\\agents'): string[] {
  const fs = require('fs');
  const path = require('path');

  if (!existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  return files.filter((f: string) => f.endsWith('.md') && (f.startsWith('index-') || !f.includes('-')));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateAgentFile,
  generateOrchestratorFile,
  generateAgentMarkdown,
  generateOrchestratorMarkdown,
  generateTorResponse,
  generateTorProtocol,
  validateAgentConfig,
  checkFileExists,
  listAgentFiles,
  promptOverwrite
};
