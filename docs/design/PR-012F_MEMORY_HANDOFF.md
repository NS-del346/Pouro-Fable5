# PR-012F — My Recipes Public / Local Smoke QA — Memory Handoff

## Status
Draft / pending Independent Verification.

## Branch / PR info
- Branch: `pr-012f-my-recipes-public-local-smoke-qa`
- Base: `main` (at PR-012E merge `3c3473983ea188f7c8e7d98aaecd63f7dc5dcf9e`)
- PR: PR-012F: My Recipes Public and Local Smoke QA (Draft)

## Commit
- `PR-012F: document My Recipes public and local smoke QA`

## Changed files
- `docs/design/PR-012F_MY_RECIPES_SMOKE_QA.md` — the QA report (local + public smoke).
- `docs/design/PR-012F_MEMORY_HANDOFF.md` — this handoff.
- **No runtime files changed.** `app.js`, `index.html`, `styles.css`, `sw.js`,
  `manifest.webmanifest`, `assets/*`, `docs/data/*`, package files **not touched**.
  Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) **not touched**.

## Source of truth used
- This task brief (PR-012F QA spec).
- `docs/design/PR-012E_MEMORY_HANDOFF.md` and the PR-012A–D handoffs.
- Live behavior of the merged build at `main` HEAD `3c34739` — local preview
  (`localhost:4005`) and the public GitHub Pages deployment.
- GitHub Pages build status via `gh api repos/NS-del346/Pouro-Fable5/pages/builds/latest`.

## What changed
- Added a docs-only QA record proving the My Recipes MVP (PR-012B → E: save / list /
  select→Preview / rename / delete / empty-state) works on both local preview and the
  public GitHub Pages URL, plus History/Rebrew non-interference, recipe-truth spot-checks,
  375 px layout, storage behavior, and console state.

## What did not change
- No app code, RecipeEngine, recipe schedules, History schema, Settings, service worker,
  PWA/manifest, or assets.
- No new My Recipes features (no edit-setup, duplicate, sort/search/tags/folders, detail
  screen, custom builder/pour editor, UI redesign).
- No PR-013 Timer / Countdown Sequence UI work.

## Local QA summary
- Driver: preview headless browser, 375 × 812, real handlers via element `.click()`.
- All 25 local checklist items **PASS**. Saved and inspected 4:6 / Hybrid / Ice / NEO
  (each: 10 canonical stored keys). Select→Preview routes to Preview (not Timer) and is
  read-only against storage. Rename writes only `name` + `updatedAt`. Delete is
  `confirm()`-gated and removes only the target; last delete → empty state. Save-to-History
  (22→23), History list, Detail Rebrew→Preview, and Finish-Same-Setup→Preview all PASS.
  No console warn/error; no horizontal overflow (`scrollWidth === innerWidth === 375`).
- Recipe truth: 4:6 `60/60/90/90` (no 48/72 or 72/48 regression); Hybrid Switch
  OPEN/CLOSED context visible, no fixed `20℃`; Ice `HOT 150 / ICE 80` visible, ratio
  omitted; NEO 10 pours, `1:45 → 210g`.

## Public QA summary
- URL `https://ns-del346.github.io/Pouro-Fable5/`; Chrome (connected extension),
  2026-06-15 ~22:59–23:01 JST.
- **Deployment is fresh:** GitHub Pages latest build = `3c34739` (the PR-012E merge
  commit), `status: built`; served `index.html`/`app.js` contain all PR-012E markers and
  are byte-identical to local modulo line endings.
- **SW/cache cleanup was REQUIRED:** the origin first served a stale cached build without
  My Recipes (3 SWs, 3 caches incl. `pouro-gpt-pr-008b`). After unregistering SWs +
  clearing caches + reload, the current PR-012E build loaded.
- All 16 public checklist items **PASS** (two as PASS WITH NOTE): console shows only
  Chrome-extension `message channel closed` noise (no app errors); overflow verified at
  Chrome's 400 px min window width (exact-375 verified locally with identical CSS).
  Save / list / select→Preview / Start Brew / rename / delete→empty, Save-to-History
  (5→6, restored), Detail Rebrew→Preview, and Finish-Same-Setup→Preview all PASS.

## Storage cleanup
- **Local:** history & settings backed up before QA. `myRecipes.v1` was `null` (no real
  data). Added 4 QA My Recipes + 1 QA history entry while exercising flows; removed the
  history test entry afterward (restored to original 22) and removed the `myRecipes.v1`
  key. Settings untouched. Exercising the real Save-to-History path also re-wrote the
  existing entries through the app's standard normalization (no data loss).
- **Public:** history (5 real entries) & settings backed up. `myRecipes.v1` was `null`.
  Added 1 QA My Recipe + 1 QA history entry; removed the history test entry (restored to
  5) and removed the `myRecipes.v1` key. Settings untouched. Clearing the stale SW/caches
  was a side benefit (public users get the fresh build), not data loss.
- No storage artifacts committed.

## Issues found
- None blocking. All flows PASS on local and public.
- Non-blocking observation: public users on an old cache-first SW may load a stale
  pre-My-Recipes build until the SW updates / caches clear (documented; `sw.js` change is
  out of scope here).
- Non-blocking note: public console shows extension-origin `message channel closed`
  exceptions unrelated to the app.

## Required fixes
- None required before merging this docs-only QA PR.
- Future (separate PR, not PR-012F): consider an SW-update / cache-busting strategy so
  public users adopt new builds without a manual cache clear.

## Known limitations
- No edit of saved setup parameters (method/dose/ratio/flavor/strength).
- No duplicate action.
- No sort / search / tags / folders / detail screen / custom builder.
- PR-013 Timer / Countdown Sequence UI not started.

## Next recommended step
Independent Verification for PR-012F. If PASS, merge PR-012F. After PR-012F merge,
proceed to PR-013 Timer Ver.2.0 / Countdown Sequence UI planning or implementation
(still deferred; not started in this PR).
