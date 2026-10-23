---
name: plan-handoff
description: Plan complex multi-file changes and produce a concise handoff that avoids repeated analysis.
---

# Plan and handoff
Use for architectural work or tasks needing coordinated changes. Skip for trivial edits.
1. Read existing project instructions, inspect only relevant areas, and reuse prior findings.
2. Write or update implementation_plan.md with goal, affected files, constraints, acceptance checks and open questions. Track atomic steps in task.md.
3. Provide a compact handoff: decisions, exact paths, next step, test commands, blockers, and unresolved risks.
4. Suggest a fresh session referencing both files or compaction IF the installed surface supports it. Do not invent slash commands or discard essential state.
5. Suggest the configured execution model. The user controls active model selection; do not claim the switch happened.
6. Continue authorized work unless the user wants a handoff now. Do not force a session reset or wait for approval on routine work.
7. During execution, update task.md, verify relevant behavior, and avoid repeating the full repository analysis.
