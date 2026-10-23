# Antigravity Lean Implementation Plan
> Execute inline using superpowers:executing-plans.
**Goal:** Publish a portable Ultra family installation wizard and plugin.
**Architecture:** Profile renderer, filesystem installer, terminal wizard.
**Tech Stack:** Node >=20, built-in tests, no external production dependencies.
**Spec:** docs/design.md

## Global Constraints
No credentials or telemetry. No quota enforcement or paid fallback. Dedicated
plugin directory only. Each family member installs separately.

## Review Focus
Modified files survive; malicious manifests cannot escape; symlinks cannot redirect;
dry-run/cancellation writes nothing; invalid arguments fail before writes.

## Tasks
- [x] RED: filesystem tests; implement renderer/install/doctor/uninstall; GREEN; commit.
- [x] RED: CLI tests; implement bilingual wizard/launchers/docs/CI; GREEN; commit.
- [x] Fresh review and regression fixes; validate actual agy plugin.
- [x] Create public GitHub repository, push, tag, release ZIP; verify synchronization.
