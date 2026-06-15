# PR-012E — My Recipes Rename / Delete / QA Polish — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-012e-my-recipes-rename-delete-polish`
- Base: `main` (at PR-012D merge `97a0d5e`)
- PR: PR-012E: My Recipes Rename Delete and QA Polish (Draft)

## Commit
- `PR-012E: add My Recipes rename delete polish`

## Changed files
- `app.js` — transient `state.myRecipeEditingId`; per-item rename/delete controls +
  inline rename panel in `renderMyRecipes()`; `_beginRenameMyRecipe()`,
  `_cancelRenameMyRecipe()`, `_commitRenameMyRecipe()`, `_deleteMyRecipe()`,
  `showMyRecipesListFeedback()`; extended the delegated list click handler and added
  a keydown handler (Enter commits / Escape cancels); reset of editing state +
  feedback when the screen opens. Updated two stale "out of scope (PR-012E)" comments.
- `index.html` — `#my-recipes-feedback` polite live region at the top of the My
  Recipes screen scroll area.
- `styles.css` — `.my-recipe-item-actions`, `.my-recipe-item-btn` (`.is-rename` /
  `.is-delete`), `.my-recipe-rename*` (inline panel: input + 保存 / キャンセル).
- `docs/design/PR-012E_MEMORY_HANDOFF.md` — this handoff.
- No other files. `sw.js`, manifest, assets, `docs/data/*`, package files **not
  changed**. Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) **not touched**.

## Source of truth used
- `docs/design/PR-012A_MY_RECIPES_PLANNING.md`, `PR-012A/B/C/D_MEMORY_HANDOFF.md`.
- Existing `app.js`: `STORAGE_KEYS.myRecipes`, `safeReadMyRecipes()`,
  `safeWriteMyRecipes()`, `normalizeMyRecipe()`, `findMyRecipeById()`,
  `buildMyRecipeFromDraft()`, `renderMyRecipes()`, `_applySelectedMyRecipe()`,
  `handleSaveMyRecipe()`, `state.recipeFrom`, `renderPreview()`, `showScreen()`.

## What changed
My Recipes is now minimally manageable. Each saved-recipe list item keeps
プレビューで確認 as its single dominant action and gains a quiet secondary row with
two controls:

- **名前を変更** — opens an inline rename panel in that item (a text input
  pre-filled with the current name, plus 保存 / キャンセル). Committing writes only
  `name` + `updatedAt` and re-renders the list. Enter commits, Escape cancels.
- **削除** — a quiet, muted-red control. Asks `confirm('このマイレシピを削除しますか？')`,
  then removes only that one recipe id and re-renders (empty state if none remain).

A polite `#my-recipes-feedback` live region shows a short result message
(名前を変更しました / 削除しました / failure copy). Opening the screen resets the
transient editing state and clears any stale message.

## What did not change
- RecipeEngine and builders, recipe schedules, pour amounts, timings, switchState.
- History schema/key, Settings schema/key, Timer UI, Rebrew / Finish-same-setup
  behavior, the PR-012D select→Preview flow, and the PR-012C Save flow.
- `sw.js`, manifest, assets, `docs/data/*`, package files. No PR-013 Timer work.
- No edit-setup, duplicate, detail screen, sort, search, tags, folders, or import/export.

## Rename behavior
1. 名前を変更 → `_beginRenameMyRecipe(id)` sets `state.myRecipeEditingId`, clears any
   message, re-renders. The edited item shows the inline panel (input focused, text
   selected) instead of the secondary action row.
2. 保存 / Enter → `_commitRenameMyRecipe(id)` reads the input, `safeReadMyRecipes()`,
   `findMyRecipeById()`, then maps the array updating **only** `name` + `updatedAt`
   on the matched id, and `safeWriteMyRecipes()`.
3. Empty/whitespace input falls back to the recipe's **current name** (never an empty
   visible name); `normalizeMyRecipe()` (via `safeWriteMyRecipes`) applies the same
   trim/fallback rules used elsewhere.
4. キャンセル / Escape → `_cancelRenameMyRecipe()` clears editing state, no write.
- Preserved on rename: `schemaVersion`, `id`, `methodId`, `dose`, `ratio`, `flavor`,
  `strength`, `createdAt`. Updated: `name`, `updatedAt`. Recipe IDs never change.

## Delete behavior
1. 削除 → `_deleteMyRecipe(id)` resolves the recipe via `findMyRecipeById()`.
2. Native `confirm('このマイレシピを削除しますか？')`; on cancel, nothing happens.
3. On confirm: `recipes.filter(r => r.id !== id)` → `safeWriteMyRecipes()` →
   re-render. Only the targeted id is removed; all others are preserved verbatim.
4. If the deleted id was being renamed, the editing state is cleared.

## Empty state / list polish
- Empty state (`#my-recipes-empty`) is reused unchanged and appears after the last
  recipe is deleted (list hidden, empty shown). Readable at 375px.
- Per-item action hierarchy: primary プレビューで確認 (full-width, accent text);
  secondary 名前を変更 / 削除 share an equal-width row (`flex:1`, no fill); 削除 is the
  quietest (muted red `#B4532E`, no background). No destructive action is dominant.
- Inline rename panel keeps input + buttons on one row without horizontal overflow.

## Data written
- Rename writes `pouroFable5.myRecipes.v1` via `safeWriteMyRecipes()` (name + updatedAt).
- Delete writes `pouroFable5.myRecipes.v1` via `safeWriteMyRecipes()` (one id removed).
- The PR-012C Save flow still writes via `safeWriteMyRecipes()` (unchanged).

## Data not written
- Selecting a My Recipe still writes nothing (verified byte-identical storage).
- Rename/Delete write **no** History, Settings, or RecipeEngine output, and do not
  mutate `state.draft` / `activeRecipe` / `brewResultDraft` / `rebrewFrom`.
- No migration. No recipe-ID changes.

## Storage behavior
- Storage key unchanged: `pouroFable5.myRecipes.v1`.
- All My Recipes reads via `safeReadMyRecipes()` / `findMyRecipeById()`; all writes
  via `safeWriteMyRecipes()` (which normalizes + clamps to `MAX_MY_RECIPES`).
- `state.myRecipeEditingId` is in-memory only and never persisted.

## QA results
Local preview (port 4005; stale SW unregistered + caches cleared for preview only;
`sw.js` not modified). 375px viewport. No console errors/warnings throughout.

- Empty state renders after deleting all recipes (list hidden, empty shown, copy intact).
- Save flow still works (Preview → 保存): feedback "マイレシピに保存しました"; stored
  object has exactly the 10 Candidate-A keys; History untouched.
- List renders newest-first; Ice omits ratio; 4:6 shows flavor/strength; 名前を変更 /
  削除 controls present and secondary to プレビューで確認.
- Rename (4:6): `name` + `updatedAt` changed; `id`/`methodId`/`dose`/`ratio`/`flavor`/
  `strength`/`createdAt` unchanged; History untouched; feedback "名前を変更しました".
- Whitespace-only rename falls back to the current name (no empty name).
- Enter commits, Escape cancels; キャンセル discards with no write.
- Select renamed recipe → Preview (`screen-preview`); My Recipes + History storage
  byte-identical (no mutation on select).
- Delete (4:6): confirm-cancel keeps all; confirm-OK removes only the targeted id;
  others preserved; History untouched; feedback "削除しました".
- Delete with multiple recipes present removes exactly one; delete last → empty state.
- History Detail Rebrew ("この記録でもう一度淹れる") → Preview; My Recipes untouched.
- No horizontal overflow at 375px (scrollWidth === innerWidth === 375), incl. with
  the rename panel open.
- `node --check app.js` → OK. `node docs/data/validate_tips_master.mjs` → PASS: 40
  FAIL: 0 ALL CHECKS PASS.
- Test data cleaned up after QA (`pouroFable5.myRecipes.v1` removed).

## Known limitations
- No edit of saved setup parameters (method/dose/ratio/flavor/strength).
- No duplicate action.
- No sort / search / tags / folders / import / export.
- No custom recipe builder, no recipe detail screen.
- Duplicate names still allowed (carried from PR-012C/D).

## Next recommended step
Independent Verification for PR-012E. If PASS, mark Ready for review and squash &
merge, then proceed to **PR-013** (Timer Countdown Sequence UI), which remains deferred.
