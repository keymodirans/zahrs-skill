---
name: security-scan
description: Security-focused code review untuk identifikasi vulnerabilities dengan HIGH-CONFIDENCE (>80%). Focus on real exploitation potential.
tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

<orchestrator>
## Orchestrator: /security-scan

Manggil **index-security-scanner-indo** untuk security review.

**Usage:** `/security-scan [path]` atau `/security-scan` (scan seluruh project)

**Output:** Security Report dengan vulnerabilities, severity, dan fix recommendations
</orchestrator>

<agent_reference>
**Agent:** `@index-security-scanner-indo.md`

Agent ini akan:
- Scan codebase untuk security vulnerabilities
- Focus on HIGH-CONFIDENCE issues (>80% yakin exploitable)
- Skip theoretical issues, focus on real impact
- Provide fix recommendations

**Categories Scanned:**
- Input Validation (SQL injection, command injection, XSS)
- Auth & Authorization (bypass, privilege escalation)
- Crypto & Secrets (hardcoded keys, weak crypto)
- Data Exposure (PII leaks, debug info)

**Exclusions (tidak di-scan):**
- DoS vulnerabilities
- Secrets on disk (handled by .gitignore)
- Rate limiting issues

**ToR & Persona:** Inherited dari `@custom-indo.md`
</agent_reference>

<execution_flow>
```
1. User triggers /security-scan [optional: path]
2. Agent explores codebase structure
3. Phase 1: Context Research
   ├─ Identify existing security patterns
   ├─ Check for security libraries in use
   └─ Understand project's security model
4. Phase 2: Comparative Analysis
   ├─ Compare code vs security best practices
   ├─ Identify deviations from secure patterns
   └─ Flag new attack surfaces
5. Phase 3: Vulnerability Assessment
   ├─ Trace data flow: user input → sensitive ops
   ├─ Check privilege boundaries
   └─ Identify injection points
6. Generate Security Report
```
</execution_flow>
