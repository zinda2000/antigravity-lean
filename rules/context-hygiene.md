---
trigger: always_on
description: "Conserve context and avoid repeated exploration while completing the requested work."
---

# Antigravity Lean: context hygiene
- Use targeted searches and line ranges; inspect outlines before large reads.
- Exclude generated output, lockfiles, dependency trees and raw dumps unless needed.
- Prefer concise tool output; on failure retain the useful error and diagnostics.
- Reuse findings. For broad exploration only, delegate a bounded read-only task to lean-explorer if available; small searches stay local.
- After two failures with the same cause, stop blind retries, summarize evidence, and change approach. Ask only when user input is necessary.
- For architecture or complex multi-file work, use the plan-handoff skill. Do not impose planning ceremonies on trivial edits.
- These are workflow preferences, not a quota enforcement mechanism.
