# PR-011R5 — Finish-to-Rebrew Flow Planning (Memory / Handoff)

## Status

Docs-only planning PR. **Draft** (open). Independent Verification: **pending**.

- This is **docs-only**. No app behavior changed.
- PR-011R5A (the recommended implementation PR) **not started**.
- PR-012 / My Recipes **not started**, **not implemented**.

## Branch / PR info

- Base branch: `main` (at R4C merge `cc44060`)
- Feature branch: `pr-011r5-finish-rebrew-flow-planning`
- Commit message: `docs: plan PR-011R5 finish-to-rebrew flow`
- PR title: `PR-011R5: Finish-to-Rebrew Flow Planning`
- PR state: **Draft**
- Independent Verification: **pending**

(PR number / URL and commit hash recorded in the self-report.)

## Changed files

- `docs/design/PR-011R5_FINISH_REBREW_FLOW_PLANNING.md` — planning document
  (12 required sections + candidate-flow comparison, Rebrew/My Recipes boundary,
  recommended next PR, risks, QA criteria).
- `docs/design/PR-011R5_MEMORY_HANDOFF.md` (this file).

Docs-only. No source, runtime, data, schema, or UI files touched. No separate QA
checklist file was created — two docs files match the planning-PR convention.

## What changed

- Documented the current Finish (Brew Log / 抽出記録) screen behavior and CTAs.
- Documented the in-memory brew/session state available at Finish.
- Documented the Save→History flow and the **already-built** History rebrew.
- Defined the explicit **Rebrew vs My Recipes** boundary.
- Compared candidate flows A–D and marked **Flow A** for first implementation.
- Recommended **PR-011R5A: Brew Finish Next Action Polish** as the next PR.
- Decided the rebrew entry point: **Preview** (state complete) / Setup (ambiguous)
  / never Timer directly.

## What did NOT change

- `index.html`, `app.js`, `styles.css`, `sw.js`, manifest — untouched.
- `docs/data/*` (master JSON / audit CSV / validator) — untouched.
- RecipeEngine, `_buildYonRoku/_buildHybrid/_buildNeo/_buildIce`, recipe
  schedules, pour amounts, timings, switchState.
- History, History Detail, Method Detail, Settings, localStorage schema.
- CSV export, JSON export, import logic, PWA / service worker / manifest.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not staged, not modified.

## Key findings

- **Finish screen = Brew Log (`#screen-log` / 抽出記録)** with one primary CTA
  "記録を保存" → History, plus a header close → Home. No "brew again" CTA exists.
- **Session state is complete at Finish** (`state.selectedMethodId`,
  `state.draft`, `state.activeRecipe`, `state.brewResultDraft`) — repeating the
  same brew needs **no** new storage and **no** History read.
- **Rebrew → Preview is already built** for the History path
  (`_applyRebrewEntry` at [app.js:2208](app.js:2208), wired to History featured
  card and History Detail). It rebuilds via Preview/RecipeEngine, mutates no
  schedule, and stores no custom recipe — the safe model to reuse.
- The only missing affordance is a rebrew/next-action CTA **on Finish itself**.

## Recommended next PR

**PR-011R5A: Brew Finish Next Action Polish** — implement **Flow A**
(Finish → "同じ条件でもう一度" → Preview) reusing the in-memory session state and
the proven `_applyRebrewEntry`-style Preview entry; keep Save primary. Small,
isolated, hand-testable. Flow B (Finish → Setup) is a later optional follow-up;
Flows C (History rebrew) and D (Save→History) already ship.

## Out-of-scope guardrails

- No recipe schedule mutation; no generated/custom recipe; no hidden dose/ratio
  change; no stale state from the previous method; no lost History data; no
  localStorage schema migration unless explicitly scoped; no PR-012/My Recipes
  dependency; always Preview (or Setup) before Timer — never Timer directly.
- PR-011R5A must **not** become My Recipes (custom recipe creation/editing/store).

## Validation results

- `git status --short` / `git diff --name-only` → only the two
  `docs/design/PR-011R5_*` files (docs-only).
- `node --check app.js` → **OK**.
- `node docs/data/validate_tips_master.mjs` → **PASS: 40  FAIL: 0  ALL CHECKS PASS**.

## Known limitations

- This is a **planning** document, not an implementation. The Finish-screen CTA
  hierarchy and the "brew again" action described here are **not** built by this PR.
- The Flow A wiring details (clean-up of `state.rebrewFrom` / timer /
  `brewResultDraft` before re-entering Preview) must be re-checked against the
  live code when PR-011R5A is implemented.

## Next

Independent Verification for PR-011R5, then post-merge handoff update once merged.
