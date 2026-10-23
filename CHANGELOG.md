# Changelog
## 0.1.1 — 2026-10-23
- Stage incomplete plugins outside plugin discovery before publishing the complete directory.
- Always release the installation lock even if staging cleanup is blocked; report preserved backups on rollback failure.
- Retry Windows EPERM/EACCES/EBUSY directory moves with a 2.5-second wait budget.
- Apply the same protection to installation, upgrade backups and rollback.
- Preserve error codes and show actionable guidance after retries are exhausted.
- Reproduce transient sharing violations with a real Windows directory handle test.
- Restrict test discovery to source tests, excluding temporary release-smoke copies.

## 0.1.0 — 2026-10-23
- Chinese/English interactive installer; global and workspace plugin scopes.
- Balanced, Gemini-first and Claude-first suggestions with manual pool snapshots.
- Compact context hygiene, on-demand planning handoffs, read-only Flash explorer.
- Preview, integrity checks, protected upgrades with backups, edit-preserving uninstall.
- No account collection, live family quota access, automatic model switch or server.
