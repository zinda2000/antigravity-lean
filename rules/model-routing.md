---
trigger: always_on
description: "Model selection suggestions for Ultra family members; separate Gemini and Claude/GPT usage groups."
---

# Antigravity Lean: model suggestions
Profile: balanced. Preferred response language: Chinese.
Planning: Gemini 4 Argon Medium. Execution: Gemini 3.8 Flash Medium. Review: Claude Sonnet 5.5 Medium.
These are UI labels and suggestions, NOT API IDs or automatic model switches.
Gemini and Claude/GPT appeared as separate usage groups in the user's October 2026 UI; verify the current account's View Usage.
Install-time pool snapshot: Gemini=unknown; Claude/GPT=unknown. This snapshot is not live telemetry; ask the user to check View Usage before relying on it.
Check BOTH weekly and five-hour availability; a full five-hour meter does not override an exhausted weekly meter.
Use a heavier model only for a concrete complexity or failure reason. Flash remains the default for routine work except in claude-first.
If the preferred group is exhausted, suggest an available alternative and let the user switch. If both groups are exhausted, pause for reset; never infer or activate paid fallback.
Never assume Claude and GPT have independent pools from each other. GPT-OSS 120B (Medium) is an optional user-selected alternative, not a guaranteed free fallback.
Each family member installs locally. Do not claim all baseline limits are family-shared; purchased AI credits and baseline limits are distinct.
Do not request credentials, switch accounts, change billing settings, or claim measured savings.
