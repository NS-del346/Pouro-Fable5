# PR-012A — My Recipes Planning — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-012a-my-recipes-planning`
- Base: `main`
- PR: PR-012A: My Recipes Planning (Draft)

## Commit
- `PR-012A: plan My Recipes MVP`

## Changed files
- `docs/design/PR-012A_MY_RECIPES_PLANNING.md` — planning document (15 sections)
- `docs/design/PR-012A_MEMORY_HANDOFF.md` — this handoff
- No other files. `app.js`, `index.html`, `styles.css`, `sw.js`, `manifest`,
  `assets`, `docs/data/*`, and package files are **not changed**.

## What changed
- Added a docs-only planning specification for **My Recipes**, defining it as
  **user-named, persistent, reusable setup presets** that route to **Preview** and
  are **not** tied to a completed brew.
- Drew an explicit boundary table separating **My Recipes** vs **History Rebrew**
  vs **Finish Same-Setup** by source / persistence / intent (all three converge on
  Preview, never the Timer).
- Compared three data-model candidates and three MVP scopes; recommended
  **Candidate A** (setup parameters only, steps re-derived by RecipeEngine) and
  **M1** (Save + Select → Preview).
- Recommended a new localStorage key `pouroFable5.myRecipes.v1` (planned only).
- Proposed a five-PR implementation split (PR-012B → PR-012F).
- Documented risk/regression analysis, preserved invariants, and checkable QA
  criteria for future implementation.

## What did not change
- `app.js` — RecipeEngine, recipe schedules, pour amounts, timings, switchState,
  `state.draft`, `_applyRebrewEntry`, `_applyCurrentBrewAgain`, `STORAGE_KEYS`.
- `index.html`, `styles.css`, `sw.js`, manifest, assets.
- History schema (`pouroFable5.history.v1`) and settings schema
  (`pouroFable5.settings.v1`).
- Existing Rebrew behavior, Finish Same-Setup behavior, Timer behavior.
- PWA / GitHub Pages relative paths, build config, `docs/data/*`.
- **No My Recipes runtime, storage, or UI was implemented.**

## Key decisions
- **My Recipes definition**: user-named, persistent, reusable **setup** preset
  derived from app-defined methods + user-selected parameters; routes to Preview;
  not tied to a completed brew. Not History replay, not a brew log, not a recipe
  builder, not cloud/sharing.
- **History Rebrew boundary**: source = a completed History record; persistent as
  a history entry; carries log/result; `_applyRebrewEntry` → `rebrewFrom={id,date,
  nextNote}` → Preview.
- **Finish Same-Setup boundary** (PR-011R5A): source = the just-finished
  in-memory brew; no persistence unless separately saved;
  `_applyCurrentBrewAgain` → `rebrewFrom={id:null,source:'finish'}` → Preview.
- **Recommended MVP**: **M1** — Save current setup as a named preset; list;
  select → Preview. Excludes edit/rename/delete/tags/cloud in v1.
- **Recommended data model**: **Candidate A** — setup parameters only
  (`name, methodId, dose, ratio, flavor, strength, createdAt, updatedAt`); steps
  re-derived by `RecipeEngine.build()` at select time (no cached steps → no
  drift). `roast`/`grind`/`temp` excluded (not in `state.draft` today).
- **Recommended storage**: new key `pouroFable5.myRecipes.v1` with safe
  read/write helpers mirroring history; History/settings keys untouched.
- **Preview marker**: reuse `state.rebrewFrom` with a new `source: 'recipe'`.

## Recommended implementation split
- **PR-012B** — Data model + localStorage helpers + docs (no UI).
- **PR-012C** — Save current setup as My Recipe (Preview/Setup button).
- **PR-012D** — My Recipes list / select / route to Preview (completes M1).
- **PR-012E** — Rename / delete / empty states / QA polish.
- **PR-012F** — Public / Local Smoke QA + verification report.

## Guardrails
- RecipeEngine remains the single source of truth for steps; the select path
  **calls** `build()` with stored params, never edits the engine.
- No cached/frozen step lists (avoids FIX-406 "official/complete-reproduction"
  drift); neutral copy only (`マイレシピ` / `保存した設定`, never `公式` / `完全再現`).
- My Recipes never reads/writes the `history` or `settings` keys.
- All preserved invariants hold through PR-012B–F unless explicitly re-planned:
  RecipeEngine, recipe schedules, History schema, Rebrew, Finish Same-Setup,
  Timer, PWA / relative paths.
- PR-013 Timer Countdown Sequence UI stays deferred until PR-012 completes.

## Validation results
- `git status --short` — only the two new docs under `docs/design/`
  (plus pre-existing untracked `.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`, unrelated to this PR).
- `git diff --name-only origin/main...HEAD` — the two new docs only.
- `node --check app.js` — **OK**.
- `node docs/data/validate_tips_master.mjs` — **PASS: 40  FAIL: 0  ALL CHECKS
  PASS**.

## Known limitations
- The localStorage key name, schema, and PR split are **proposals**; the
  implementing PRs may refine them. Nothing here is wired into the app.
- `roast`/`grind`/`temp` are deliberately excluded from v1 because Setup does not
  expose them as live draft fields today; revisit only if that changes.
- UI entry-point (Home card vs dedicated tab) is recommended but not finalized;
  PR-012D should choose the lightest viable surface.

## Next recommended step
Independent Verification for PR-012A. If PASS, mark Ready for review and squash
& merge, then begin **PR-012B** (My Recipes data model + localStorage helpers).
