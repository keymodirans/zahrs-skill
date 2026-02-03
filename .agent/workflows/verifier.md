---
description: Direct access ke verifier agent via zahrs-skill MCP
---

# /verifier

Panggil MCP tool `index_verifier` untuk comprehensive verification.

## Usage
```
/verifier <target> [--mode quick|full|uat]
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_verifier`
2. Goal-backward analysis
3. Report verification results

## Example
```
/verifier authentication-phase
/verifier payment-flow --mode uat
```
