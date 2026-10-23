# Release verification — 2026-10-23

## Local environment
Windows; Node.js 24.22.1; Antigravity CLI 1.4.5.
No installation into the maintainer's global Antigravity configuration was performed.

## Results
- 20 automated integration tests passed before release preparation.
- Interactive wizard tested with complete piped answers, cancellation and EOF.
- Project and isolated temporary home/global installations checked.
- Repeat installation, upgrades and retained backups checked.
- User-modified files, unrelated files and empty user directories survive uninstall.
- Tampered manifest paths, symlinked ancestors and extra symlinks rejected.
- Installation and uninstallation share the mutation lock.
- Invalid options rejected before destructive operations.
- Real agy plugin validate . --strict --json: zero findings; 2 rules, 1 skill, 1 agent.
- npm pack --dry-run: package contains the wizard, runtime sources and plugin assets.

## Independent review
A fresh read-only reviewer found four P2 uninstall issues: missing shared lock,
empty-directory state loss, ignored invalid destructive options, and late
unrelated-symlink detection. Regression tests reproduced all four before fixes.
All four were fixed and the complete suite passed afterward.

## Limits
CI configuration targets Windows/macOS/Linux on Node 20/22/24; until Actions
finishes, local Windows results are the observed evidence. No live quota reading,
family aggregation, automatic model switching, or measured savings was tested or claimed.

## Implementation decisions
- Local Node wizard instead of a hosted service: portable filesystem behavior and no account backend.
- Each member installs locally; availability values are manual snapshots, not telemetry.
- Use current plugin format and documented paths; no guarantee for legacy versions.
