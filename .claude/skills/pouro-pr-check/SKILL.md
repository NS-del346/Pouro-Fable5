---
description: Final PR checklist for Pouro-Fable5. Use before opening or updating a pull request to confirm scope, design-source fidelity, QA, and repo hygiene.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash
---

# Pouro PR Check

Run this before opening or updating a PR.

## Checks

Confirm:

- PR scope is respected
- Fable5 artifact remains the visual source of truth
- Pourō-Claude UI layout was not copied
- no source ZIP files are committed
- no unnecessary generated artifacts are committed
- production app does not depend on Claude Design runtime unless explicitly intended
- assets are referenced with correct relative paths
- 375px mobile layout is safe
- Active Brew hides Bottom Tab
- Rebrew returns to Preview state
- Settings sections remain Default brew / Brew assist / Data / About
- git diff --check passes

## Commands

Run:

```sh
git status --short
git diff --check
```

If package scripts exist, also run the relevant build or lint command.

## Output format

Return:

1. Pass / Needs revision
2. Scope violations
3. Design drift risks
4. Repo hygiene issues
5. QA results
6. Recommended PR title and PR body summary
