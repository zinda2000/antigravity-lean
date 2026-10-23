export const profiles = ['balanced', 'gemini-first', 'claude-first'];
export const statuses = ['unknown', 'available', 'exhausted'];
export function normalize(options = {}) {
 const profile = options.profile ?? 'balanced';
 const lang = options.lang ?? 'zh';
 if (!profiles.includes(profile)) throw new Error('Invalid profile: ' + profile);
 if (!['zh','en'].includes(lang)) throw new Error('Invalid language: ' + lang);
 const pools = {gemini: options.geminiStatus ?? 'unknown', claude: options.claudeStatus ?? 'unknown'};
 for (const status of Object.values(pools)) if (!statuses.includes(status)) throw new Error('Invalid pool status');
 const defaults = profile === 'claude-first'
  ? {planning:'Claude Opus 5.5 Medium',execution:'Claude Sonnet 5.5 Medium',review:'Claude Sonnet 5.5 Medium'}
  : {planning:'Gemini 4 Argon Medium',execution:'Gemini 3.8 Flash Medium',review:profile === 'balanced' ? 'Claude Sonnet 5.5 Medium':'Gemini 4 Argon Medium'};
 const models = {...defaults,...options.models};
 for (const [role,label] of Object.entries(models)) {
  if (!['planning','execution','review'].includes(role) || typeof label !== 'string' ||
      !label.trim() || label.length>100 || /[\r\n\x00-\x1f\x7f]/.test(label)) throw new Error('Invalid model label: ' + role);
 }
 return {profile,lang,pools,models};
}
export function render(options = {}) {
 const config=normalize(options);
 const {profile,lang,pools,models}=config;
 const hygiene = `---
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
`;
 const routing = `---
trigger: always_on
description: "Model selection suggestions for Ultra family members; separate Gemini and Claude/GPT usage groups."
---

# Antigravity Lean: model suggestions
Profile: ${profile}. Preferred response language: ${lang === 'zh' ? 'Chinese' : 'English'}.
Planning: ${models.planning}. Execution: ${models.execution}. Review: ${models.review}.
These are UI labels and suggestions, NOT API IDs or automatic model switches.
Gemini and Claude/GPT appeared as separate usage groups in the user's October 2026 UI; verify the current account's View Usage.
Install-time pool snapshot: Gemini=${pools.gemini}; Claude/GPT=${pools.claude}. This snapshot is not live telemetry; ask the user to check View Usage before relying on it.
Check BOTH weekly and five-hour availability; a full five-hour meter does not override an exhausted weekly meter.
Use a heavier model only for a concrete complexity or failure reason. Flash remains the default for routine work except in claude-first.
If the preferred group is exhausted, suggest an available alternative and let the user switch. If both groups are exhausted, pause for reset; never infer or activate paid fallback.
Never assume Claude and GPT have independent pools from each other. GPT-OSS 120B (Medium) is an optional user-selected alternative, not a guaranteed free fallback.
Each family member installs locally. Do not claim all baseline limits are family-shared; purchased AI credits and baseline limits are distinct.
Do not request credentials, switch accounts, change billing settings, or claim measured savings.
`;
 const skill = `---
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
`;
 const explorer = `---
name: lean-explorer
description: Read-only targeted code discovery; return exact paths and a concise summary.
tools:
  - view_file
  - grep_search
subagent: true
mainAgent: false
model: flash
---

# Lean explorer
Search only the requested area. Never modify files or execute shell commands.
Return paths, line references, relevant signatures, evidence and uncertainties.
Keep the summary under 400 tokens; do not paste whole files. Stop when the requested evidence is found.
If Flash is unavailable, report that fact instead of silently selecting a different model.
`;
 const files={
  'plugin.json':JSON.stringify({name:'antigravity-lean',description:'Context-conscious workflows for Antigravity Ultra family members'},null,2)+'\n',
  'rules/context-hygiene.md':hygiene,
  'rules/model-routing.md':routing,
  'skills/plan-handoff/SKILL.md':skill
 };
 if (pools.gemini !== 'exhausted') files['agents/lean-explorer.md']=explorer;
 return {config,files};
}
