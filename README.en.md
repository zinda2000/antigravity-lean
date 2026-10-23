# Antigravity Lean

**Conserve quota. Keep work moving.** Context-conscious workflows and a local installation wizard for Google AI Ultra family members using Antigravity.

[简体中文](README.md) · [Latest release](https://github.com/zinda2000/antigravity-lean/releases/latest) · [Compatibility](docs/compatibility.md)

**Each family member installs on their own computer. No account information is collected, and the tool does not assume access to the whole family's live quota.** Community project, not affiliated with Google. No API keys, sign-in, telemetry or hosted services.

## Community acknowledgment

This project recognizes and thanks the [LINUX DO community](https://linux.do/) for its platform for discussion and sharing. Community feedback and open-source discussions are welcome.

## Save quota and work faster

Flash models typically respond faster and suit code searches, log analysis, routine edits and execution of an agreed plan. Faster feedback reduces waiting. Use stronger reasoning models for complex architecture, difficult debugging and consequential decisions.

Antigravity Lean allocates work according to task difficulty, model capabilities and available quota. Finish simple work quickly; concentrate reasoning on complex work; reduce repeated analysis through clear plans and handoffs. Actual speed, quality and usage vary with models, tasks and service conditions.

## Install

Requires Node.js >=20 ([official download](https://nodejs.org/)) and Antigravity App or agy CLI. No npm install or administrator privileges required.

**Recommended: one command starts the interactive wizard on Windows/macOS/Linux.**

```bash
npx --yes https://github.com/zinda2000/antigravity-lean/releases/download/v0.1.1/antigravity-lean-0.1.1.tgz
```

No Git, clone or manual extraction required. npx downloads a pinned GitHub Release package. The wizard previews changes and asks for `yes` before writing plugin files. In PowerShell, use `npx.cmd` if script policy blocks `npx.ps1`; no policy changes needed. Append `doctor` or `uninstall --yes` to the same command to manage global installations; add `--scope project --project "PATH"` for project scope.

Alternatively, download and extract the ZIP from [Releases](https://github.com/zinda2000/antigravity-lean/releases/latest). On Windows double-click `install.cmd`; on macOS/Linux run `sh install.sh`. Or:

```bash
git clone https://github.com/zinda2000/antigravity-lean.git
cd antigravity-lean
node bin/antigravity-lean.mjs
```

Choose English with `en`. The wizard asks for global/project scope, a profile, manual Gemini and Claude/GPT availability snapshots, and editable model labels. It previews changes and writes only after `yes`.

Profiles: balanced (Flash execution, Argon planning, optional Sonnet review); gemini-first; claude-first (Sonnet execution, Opus planning). Labels reflect a supplied October 2026 UI, not universal API IDs. There is no automatic model switching or live usage access.

Global target: `~/.gemini/config/plugins/antigravity-lean/`. Project target: `<project>/.agents/plugins/antigravity-lean/`. Restart your session, inspect Customizations, and validate the output directory with `agy plugin validate "DIRECTORY"`. If CLI does not discover it, import that directory using `agy plugin install "DIRECTORY"` and inspect the CLI's actual staged copy.

## Management

```bash
node bin/antigravity-lean.mjs install --scope global --dry-run
node bin/antigravity-lean.mjs install --scope global --yes
node bin/antigravity-lean.mjs doctor
node bin/antigravity-lean.mjs uninstall --dry-run
node bin/antigravity-lean.mjs uninstall --yes
```

Add `--scope project --project "PATH"` for project installations. See `--help` for model overrides. Update the checkout with `git pull --ff-only` and rerun the wizard. Upgrades preserve backups in the sibling `.antigravity-lean-backups/` directory and refuse modified/unmanaged files. Uninstall preserves user edits, extras and backups. Symlinked locations are rejected. Do not run installation and uninstallation concurrently.

Doctor checks local file integrity, not agent compliance or real savings. Gemini and Claude/GPT were separate groups in the supplied UI; do not assume Claude and GPT have separate pools from each other. Check weekly AND five-hour availability in View Usage. If both are exhausted, wait for reset. Marking Gemini exhausted omits the Flash explorer. This tool never activates paid fallback.

Family membership does not imply that every baseline allowance is pooled. Baseline limits and shareable AI credits are different; current entitlements vary by product, plan and region. [Google One documentation](https://support.google.com/googleone/answer/16287445).

## Native default plugin (alternative)

```bash
agy plugin install https://github.com/zinda2000/antigravity-lean
agy plugin list
```

This installs default balanced assets without running the wizard. Choose ONE installation method to avoid duplicate rules. Native installations use `agy plugin uninstall antigravity-lean`; wizard management only covers wizard-owned directories. Uninstall using the original method before switching.

## Development

```bash
npm test
agy plugin validate . --strict
npm pack --dry-run
```

No production dependencies. CI matrix: Windows/macOS/Linux and Node 20/22/24. Natural-language guidance is advisory, not a hard quota cap. No guaranteed savings or exact token-size claims. MIT.
