---
description: Check cross-phase integration via zahrs-skill MCP
---

# /integration-check

Panggil MCP tool `index_integration_checker` untuk E2E verification.

## Usage
```
/integration-check <target>
```

## Steps
1. Trigger MCP tool `mcp_zahrs-skill_index_integration_checker`
2. Verify cross-phase flows
3. Report integration status

## Example
```
/integration-check "auth to payment flow"
/integration-check api-endpoints
```
