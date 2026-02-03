/**
 * ============================================================================
 * GENERATOR USAGE EXAMPLES
 * ============================================================================
 * Contoh cara pakai generator.ts untuk bikin agent file
 * ============================================================================
 */

import {
  generateAgentFile,
  generateOrchestratorFile,
  generateTorResponse,
  AgentConfig
} from './generator';

// ============================================================================
// EXAMPLE 1: Generate Simple Agent File
// ============================================================================

async function example1_SimpleAgent() {
  const config: AgentConfig = {
    meta: {
      name: 'index-my-custom-agent',
      description: 'Handle custom task dengan ToR protocol',
      tools: ['Read', 'Write', 'Edit', 'Bash', 'Grep'],
      color: 'blue'
    },
    role: {
      identity: 'Custom Task Handler',
      task: 'Execute custom task dengan validasi dan error handling',
      spawnedBy: '/my-command atau manual call',
      coreResponsibilities: [
        'Parse user input',
        'Validate input menggunakan Zod',
        'Execute task dengan proper error handling',
        'Generate structured output'
      ]
    },
    logicKernel: {
      principles: [
        'Validate semua input sebelum proses',
        'Gunakan ToR protocol di setiap response',
        'Handle error dengan graceful message',
        'Return structured output bukan raw data'
      ],
      antiPatterns: [
        'Skip validation',
        'Return system detail ke user',
        'Hardcode path konfigurasi'
      ]
    },
    executionFlow: {
      steps: [
        'Load project state dari STATE.md',
        'Parse user input',
        'Validate input (throw jika invalid)',
        'Execute task logic',
        'Generate structured output'
      ],
      notes: [
        'Gunakan Zod schema untuk validation',
        'ToR harus muncul di awal response',
        'Error harus user-friendly, bukan system trace'
      ]
    },
    verificationGate: {
      criteria: [
        'Input validated sebelum proses',
        'ToR muncul di response',
        'Output structured dan documented',
        'Error handling proper'
      ],
      successIndicators: [
        'User input sanitized',
        'No system detail di error message',
        'Output follows template'
      ]
    }
  };

  const result = await generateAgentFile(config);

  if (result.success) {
    console.log(result.message);
    console.log(`File: ${result.filePath}`);
  } else if (result.skipped) {
    console.log('Skipped:', result.message);
  } else {
    console.error('Errors:', result.errors);
  }
}

// ============================================================================
// EXAMPLE 2: Generate Orchestrator File (Command Trigger)
// ============================================================================

async function example2_Orchestrator() {
  const config = {
    meta: {
      name: 'my-custom-command',
      description: 'Execute custom task via index-my-custom-agent',
      tools: ['Read', 'Write', 'Bash']
    },
    command: 'my-command',
    usage: '/my-command <parameter> atau /my-command <parameter> --flag',
    agentReference: 'index-my-custom-agent.md',
    agentDescription: 'Validate input, execute task, return structured output',
    executionSteps: [
      'Parse command arguments',
      'Call index-my-custom-agent dengan parsed input',
      'Agent executes task',
      'Return structured result'
    ]
  };

  const result = await generateOrchestratorFile(config);

  if (result.success) {
    console.log(result.message);
  }
}

// ============================================================================
// EXAMPLE 3: Generate ToR Response (Runtime)
// ============================================================================

function example3_TorResponse() {
  const tor = generateTorResponse(
    'User mau bikin auth system',
    'Project exists, auth belum ada',
    'Bikin JWT auth dengan refresh token',
    'Auth endpoint ready + dokumentasi',
    'Input → Validate → Plan → Execute → Verify'
  );

  console.log(tor);
  /*
  Output:
  [Trace of Reasoning]
  ├─ Intent: User mau bikin auth system
  ├─ Current State: Project exists, auth belum ada
  ├─ Plan: Bikin JWT auth dengan refresh token
  └─ Expected Outcome: Auth endpoint ready + dokumentasi

  [Quick Map]
  └─ Input → Validate → Plan → Execute → Verify

  **NON-NEGOTIABLE:** 70% token digunakan buat internal processing & tracing.
  */
}

// ============================================================================
// EXAMPLE 4: Generate dengan Overwrite
// ============================================================================

async function example4_WithOverwrite() {
  const config: AgentConfig = {
    meta: {
      name: 'index-test-agent',
      description: 'Test agent untuk demo',
      tools: ['Read', 'Write'],
      color: 'green'
    },
    role: {
      identity: 'Test Agent',
      task: 'Test task execution',
      coreResponsibilities: ['Do test stuff']
    },
    logicKernel: {
      principles: ['Test principle']
    },
    executionFlow: {
      steps: ['Step 1', 'Step 2']
    },
    verificationGate: {
      criteria: ['Test passed']
    }
  };

  // Dengan overwrite enabled
  const result = await generateAgentFile(
    config,
    'C:\\Users\\Rekabit\\.claude\\agents',
    { overwrite: true } // ← ini akan menimpa file kalau sudah ada
  );

  console.log(result.message);
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

// Uncomment untuk jalankan:
// example1_SimpleAgent();
// example2_Orchestrator();
// example3_TorResponse();
// example4_WithOverwrite();

export {
  example1_SimpleAgent,
  example2_Orchestrator,
  example3_TorResponse,
  example4_WithOverwrite
};
