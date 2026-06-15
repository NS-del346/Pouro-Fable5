# PR-012C — Save Current Setup as My Recipe — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-012c-save-current-setup-as-my-recipe`
- Base: `main`
- PR: PR-012C: Save Current Setup as My Recipe (Draft)

## Commit
- `PR-012C: save current setup as My Recipe`

## Changed files
- `app.js` — wired a quiet "Save as My Recipe" handler on Preview using the
  PR-012B helpers; reset of the save field/feedback added to `renderPreview()`.
- `index.html` — added the secondary Save-as-My-Recipe card to the Preview scroll
  area (name input + 保存 button + feedback line), placed below メソッド詳細 and
  above the primary 抽出を開始 CTA.
- `styles.css` — styles for the save card input/button/feedback.
- `docs/design/PR-012C_MEMORY_HANDOFF.md` — this handoff.
- No other files. `sw.js`, manifest, assets, `docs/data/*`, and package files are
  **not changed**. Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) were not touched.

## Source of truth used
- `docs/design/PR-012A_MY_RECIPES_PLANNING.md` (data model, MVP scope, guardrails).
- `docs/design/PR-012A_MEMORY_HANDOFF.md`, `docs/design/PR-012B_MEMORY_HANDOFF.md`.
- Existing `app.js`: `STORAGE_KEYS.myRecipes`, `safeReadMyRecipes()`,
  `safeWriteMyRecipes()`, `normalizeMyRecipe()`, `buildMyRecipeFromDraft()`,
  `state.draft`, `state.selectedMethodId`, `renderPreview()`, and the existing
  Preview event-listener wiring (`btn-method-detail`, `btn-start-brew`).

## What changed
A minimal, secondary user-facing way to save the current Preview setup as a My
Recipe preset:

- New Preview card "マイレシピに保存" with a name input (`#my-recipe-name-input`,
  `maxlength=40`), a 保存 button (`#btn-save-my-recipe`), and an `aria-live`
  feedback line (`#my-recipe-save-feedback`).
- `handleSaveMyRecipe()` builds a setup descriptor
  (`{ methodId: state.selectedMethodId, dose, ratio, flavor, strength }` read from
  `state.draft`), calls `buildMyRecipeFromDraft(setup, name)`, then
  `safeReadMyRecipes()` → append → `safeWriteMyRecipes()`. Shows success/failure
  feedback.
- `resetMyRecipeSaveUI(recipe.name)` is called at the end of `renderPreview()` so
  the field clears and the placeholder defaults to the previewed recipe name each
  time Preview is shown; stale feedback never lingers.
- Listener wired alongside the existing Preview handlers.

## What did not change
- RecipeEngine and its builders (`_buildYonRoku` / `_buildHybrid` / `_buildNeo` /
  `_buildIce`), recipe schedules, pour amounts, timings, `switchState`.
- History schema/key (`pouroFable5.history.v1`), Settings schema/key
  (`pouroFable5.settings.v1`), Rebrew / Finish-same-setup behavior, Timer UI.
- `state.draft`, `state.activeRecipe`, `brewResultDraft`, `rebrewFrom` — the save
  path reads `state.draft` but mutates none of these.
- The My Recipes storage key/data model from PR-012B (unchanged; reused as-is).
- `sw.js`, manifest, assets, `docs/data/*`, package files.
- No PR-013 Timer countdown work.

## Save UI placement
Preview screen only, as a compact secondary card in the scroll area, below the
メソッド詳細 button and above the primary 抽出を開始 CTA. It is intentionally quiet
and never competes with the brew flow.

## Save behavior
1. Read the name from the input (empty allowed).
2. Build a normalized recipe from `state.draft` + `state.selectedMethodId` via
   `buildMyRecipeFromDraft()`.
3. `safeReadMyRecipes()` → `push(recipe)` → `safeWriteMyRecipes()`.
4. Show success (`マイレシピに保存しました`) or failure (`保存できませんでした`).
5. On success, clear the input. No navigation, no timer start, no History write.

Duplicate handling: **duplicate names are allowed** (append-only). Rename/delete
management is deferred to a later PR (PR-012E).

## Data written
Allowed fields only (PR-012B Candidate-A model): `schemaVersion`, `id`, `name`,
`methodId`, `dose`, `ratio`, `flavor`, `strength`, `createdAt`, `updatedAt`. Empty
name falls back to the method display name via `normalizeMyRecipe()`.

## Data not written
Generated steps, pour schedule, timer/elapsed state, history result, rating, taste
tags, memo, next note, `brewResultDraft`, `rebrewFrom`, custom Switch ops, custom
water-per-pour schedule.

## Storage behavior
- Writes only to `pouroFable5.myRecipes.v1`, capped at `MAX_MY_RECIPES = 200` by the
  helper. History/Settings keys are never read or written.
- Malformed existing storage is tolerated by `safeReadMyRecipes()` (returns `[]`),
  so a save still succeeds and overwrites with a valid array. No crash.
- Failure path: if `safeWriteMyRecipes()` returns `false` (e.g. localStorage write
  error), the failure message is shown.

## QA results
Local preview (port 4005; stale SW unregistered + caches cleared for preview only,
`sw.js` not modified). No console errors.

- 4:6 save — stored object has only the 10 allowed keys; feedback success; input
  cleared.
- Hybrid save — OK.
- Ice save — OK.
- NEO save with empty name — fallback name `10 Pour`; feedback success.
- Malformed storage (`'{not valid json'`) — `safeReadMyRecipes()` → `[]`; save
  afterward succeeds; mixed-junk array filters down to valid entries only; no crash.
- Start Brew after save — routes to `screen-brew`; `state.draft` unchanged by save;
  `state.activeRecipe` has steps.
- No horizontal overflow at 375px (`scrollWidth === innerWidth === 375`).
- `node --check app.js` → OK. `node docs/data/validate_tips_master.mjs` → PASS: 40
  FAIL: 0 ALL CHECKS PASS.
- Reference checks: `safeWriteMyRecipes` / `buildMyRecipeFromDraft` used by the save
  action in `app.js`; `pouroFable5.myRecipes.v1` storage key unchanged.

(History list / History Detail Rebrew → Preview and Finish Same Setup → Preview
code paths are untouched by this diff; `renderPreview()` only gained the harmless
save-UI reset call.)

## Known limitations
- No My Recipes list yet.
- No select/load recipe → Preview yet.
- No rename / delete / edit management yet (PR-012E).
- No Home entry point (deferred to PR-012D).
- Duplicate names are allowed for now.

## Next recommended step
Independent Verification for PR-012C. If PASS, mark Ready for review and squash &
merge, then proceed to **PR-012D** (My Recipes list / Home entry point).
