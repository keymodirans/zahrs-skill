<ui_patterns>

Visual patterns for user-facing INDEX output. Orchestrators @-reference this file.

## Stage Banners

Use for major workflow transitions.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 INDEX ► {STAGE NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stage names (uppercase):**
- `QUESTIONING`
- `RESEARCHING`
- `DEFINING REQUIREMENTS`
- `CREATING ROADMAP`
- `PLANNING PHASE {N}`
- `EXECUTING WAVE {N}`
- `VERIFYING`
- `PHASE {N} COMPLETE [OK]`
- `MILESTONE COMPLETE [CELEBRATION]`

---

## Checkpoint Boxes

User action required. 62-character width.

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: {Type}                                          ║
╚══════════════════════════════════════════════════════════════╝

{Content}

──────────────────────────────────────────────────────────────
→ {ACTION PROMPT}
──────────────────────────────────────────────────────────────
```

**Types:**
- `CHECKPOINT: Verification Required` → `→ Type "approved" or describe issues`
- `CHECKPOINT: Decision Required` → `→ Select: option-a / option-b`
- `CHECKPOINT: Action Required` → `→ Type "done" when complete`

---

## Status Symbols

```
[OK]  Complete / Passed / Verified
[X]  Failed / Missing / Blocked
[IN PROGRESS]  In Progress
[PENDING]  Pending
[AUTO] Auto-approved
[!] Warning
[CELEBRATION] Milestone complete (only in banner)
```

---

## Progress Display

**Phase/milestone level:**
```
Progress: ████████░░ 80%
```

**Task level:**
```
Tasks: 2/4 complete
```

**Plan level:**
```
Plans: 3/5 complete
```

---

## Spawning Indicators

```
◆ Spawning researcher...

◆ Spawning 4 researchers in parallel...
  → Stack research
  → Features research
  → Architecture research
  → Pitfalls research

[OK] Researcher complete: STACK.md written
```

---

## Next Up Block

Always at end of major completions.

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**{Identifier}: {Name}** — {one-line description}

`{copy-paste command}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `alternative-command-1` — description
- `alternative-command-2` — description

───────────────────────────────────────────────────────────────
```

---

## Error Box

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

{Error description}

**To fix:** {Resolution steps}
```

---

## Tables

```
| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1     | [OK]      | 3/3   | 100%     |
| 2     | ◆      | 1/4   | 25%      |
| 3     | ○      | 0/2   | 0%       |
```

---

## Anti-Patterns

- Varying box/banner widths
- Mixing banner styles (`===`, `---`, `***`)
- Skipping `INDEX ►` prefix in banners
- Random markers (`[ROCKET]`, `[SPARKLE]`, `[STAR]`)
- Missing Next Up block after completions

</ui_patterns>
