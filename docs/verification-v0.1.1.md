# v0.1.1 Windows installation verification — 2026-10-23

User-reported symptom: EPERM moving an incomplete directory from inside
~/.gemini/config/plugins to the final plugin directory. The user selected
Gemini 4 Argon High for planning. Ordinary directory ACLs permitted writes.

Investigation:
- Empty/minimal directory moves succeeded at inspection time.
- Full plugin installation still failed after bounded rename retries.
- Full-content probes inside the discovery directory intermittently failed.
- Full-content probes staged outside discovery succeeded both immediately
  and after waiting for potential scanners.
- A real filesystem observer confirmed that v0.1.0 exposed incomplete staged
  plugins; its regression test failed before the staging-location fix.
- The particular process responsible for the original EPERM was not identified.

Fix:
- Keep incomplete plugins outside discovery, on the same filesystem.
- Retry Windows EPERM/EACCES/EBUSY moves with a 2.5-second wait budget.
- Release the mutation lock even if temporary-directory removal is blocked.
- Preserve the original failure and report retained stage/backup paths.

Evidence:
- 24 unique source tests passed locally on Windows / Node24.22.1.
- A real Windows directory handle reproduced EBUSY on the old single rename;
  the fixed operation succeeded when the handle was released.
- A directory observer no longer sees incomplete plugins in discovery.
- Actual global installation succeeded with the user's selected model labels.
- doctor returned ok=true.
- agy plugin list reported enabled antigravity-lean with two rules,
  plan-handoff skill and lean-explorer agent.
- Fresh read-only review found no new Important/Critical issues.

CLI discovery does not prove the already-running desktop conversation has
reloaded its context. Restart the relevant session and inspect Customizations.
