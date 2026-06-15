# PR-012D — My Recipes List and Select to Preview — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-012d-my-recipes-list-select-preview`
- Base: `main` (at PR-012C merge `869d6da`)
- PR: PR-012D: My Recipes List and Select to Preview (Draft)

## Commit
- `PR-012D: add My Recipes list and preview loading`

## Changed files
- `app.js` — `recipeFrom` state field; `renderMyRecipes()` + `_myRecipeParamLine()`;
  `_applySelectedMyRecipe()`; Preview banner branch for the My Recipes origin;
  cleared `recipeFrom` in the Home→Setup, Rebrew, and Finish paths; wired the Home
  entry / back / empty-home buttons and the delegated list-select handler.
- `index.html` — quiet "マイレシピ" entry on Home (below the 4-method choice); new
  `#screen-myrecipes` list screen with `#my-recipes-list` and `#my-recipes-empty`.
- `styles.css` — `.home-myrecipes-entry*`, `.my-recipe-item*`, `.my-recipe-empty-home`.
- `docs/design/PR-012D_MEMORY_HANDOFF.md` — this handoff.
- No other files. `sw.js`, manifest, assets, `docs/data/*`, package files **not
  changed**. Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) **not touched**.

## Source of truth used
- `docs/design/PR-012A_MY_RECIPES_PLANNING.md` (M1 scope, Candidate-A data, §4
  History/Rebrew boundary, §5.2 select flow).
- `docs/design/PR-012C_MEMORY_HANDOFF.md` (existing save flow on Preview).
- Existing `app.js`: `STORAGE_KEYS.myRecipes`, `safeReadMyRecipes()`,
  `findMyRecipeById()`, `normalizeMyRecipe()`, `RecipeEngine.build()`,
  `renderHome()`, `renderPreview()`, `showScreen()`, `_applyRebrewEntry()`,
  `_applyCurrentBrewAgain()`, `state.draft`, `state.selectedMethodId`,
  `state.rebrewFrom`.

## What changed
The M1 round-trip is now complete: a saved setup preset can be opened and run.

- **Home entry point**: a quiet, secondary "マイレシピ" card below the 4-method
  choice opens the list. It never competes with method selection.
- **My Recipes screen** (`#screen-myrecipes`): a back-header sub-screen (no tab
  bar) listing saved presets newest-first, or an empty state.
- **List rendering** (`renderMyRecipes()`): reads `safeReadMyRecipes()` and shows
  name, a method/param line (method name ・ dose ・ ratio ・ flavor/strength), and
  a compact date. Ice omits ratio; only `hasFlavorStrength` methods show flavor/
  strength. The recipe **name** is rendered via DOM `textContent` (not innerHTML
  interpolation) because it is free user input.
- **Select → Preview** (`_applySelectedMyRecipe()`): finds by id via
  `findMyRecipeById()`, restores `state.selectedMethodId` + `state.draft`
  (dose/ratio/flavor/strength), sets a neutral origin marker, re-derives the
  recipe through the existing `renderPreview()` → `RecipeEngine.build()` path, and
  `showScreen('preview')`. The user starts the Timer manually.

## What did not change
- RecipeEngine and builders, recipe schedules, pour amounts, timings, switchState.
- History schema/key, Settings schema/key, Timer UI, Rebrew / Finish-same-setup
  behavior (both still route to Preview; both now also clear `recipeFrom`).
- The PR-012C Save flow (still uses `safeWriteMyRecipes()` — preserved).
- `sw.js`, manifest, assets, `docs/data/*`, package files. No PR-013 Timer work.

## List UI placement
Home: a single quiet secondary card (`.home-myrecipes-entry`) below the method
list. List itself is its own screen reached from that card, with a back button to
Home. Not added to History, History Detail, or Timer.

## Empty state
When no recipes exist: `#my-recipes-list` is hidden and `#my-recipes-empty` shows
"まだマイレシピはありません / Previewで現在の条件を保存すると、ここに表示されます。"
plus a "ホームに戻る" button. No fake examples, no auto-creation.

## Select-to-Preview behavior
1. `safeReadMyRecipes()` → `findMyRecipeById(id)` (normalized).
2. Restore `state.selectedMethodId` + `state.draft` (dose, ratio, flavor, strength;
   `customRatio=false`).
3. `state.recipeFrom = { source:'myRecipe', id, name }`; `state.rebrewFrom = null`.
4. `renderPreview()` (re-derives steps via RecipeEngine) → `showScreen('preview')`.
5. Preview shows the neutral pill "マイレシピから読み込み" (reusing the existing
   rebrew-pill affordance; no history date, no next-note card).

Selecting never starts the Timer, never writes History, never mutates or rewrites
the saved recipe, and never calls `safeWriteMyRecipes()`.

## Origin marker decision
A dedicated **`state.recipeFrom`** field (not `rebrewFrom`) marks the My Recipes
origin, per PR-012D guidance ("do not call it rebrew if source is My Recipes").
It is cleared in `_applyRebrewEntry`, `_applyCurrentBrewAgain`, and the Home→Setup
handler so the My Recipes banner never leaks into History/Finish/manual Previews.
`renderPreview()` checks `recipeFrom` first, then `rebrewFrom`.

## Data read
`safeReadMyRecipes()` (list + select), `findMyRecipeById()` (select). Read-only.

## Data not written
No `safeWriteMyRecipes()` / `localStorage.setItem`/`removeItem` on the myRecipes
key in the list/select path. No History write. No migration. No rename/delete/edit.

## Storage behavior
- List/select are read-only on `pouroFable5.myRecipes.v1`.
- Verified in preview: after 4 selects, both `pouroFable5.history.v1` and
  `pouroFable5.myRecipes.v1` are byte-identical (`===`) to their pre-select values.
- The PR-012C Save flow still writes via `safeWriteMyRecipes()` (unchanged).

## QA results
Local preview (port 4005; stale SW unregistered + caches cleared for preview only;
`sw.js` not modified). No console errors/warnings.

- Empty state renders (list hidden, empty shown, correct copy, tab bar hidden).
- Save flow still works: saved 4:6 / Hybrid / Ice / NEO via the Preview UI;
  feedback "マイレシピに保存しました"; stored objects have only the 10 Candidate-A keys.
- List renders newest-first; Ice line omits ratio; 4:6 shows flavor/strength.
- Select → Preview for all 4 methods: lands on `screen-preview` (Timer hidden),
  pill "マイレシピから読み込み", `recipeFrom` set / `rebrewFrom` null, draft restored.
- Recipe truth (re-derived): 4:6 24g/1:16 → totalWater 384, 40/60 split, no 48/72;
  Hybrid → switch open/closed context intact; Ice 18g → HOT 135 / ICE 72; NEO →
  10 pours, **1:45 → 210g** preserved, drawdown at 210s.
- Start Brew after select → `screen-brew`, `activeRecipe` set.
- History Detail Rebrew (`_applyRebrewEntry`) → Preview, banner "履歴から再現…",
  `recipeFrom` cleared. Finish Same Setup (`_applyCurrentBrewAgain`) → Preview,
  banner "同じ条件でもう一度", `recipeFrom` cleared.
- Selecting created no History entry (history key unchanged).
- No horizontal overflow at 375px on Home / list / empty / Preview (sw === iw).
- `node --check app.js` → OK. `node docs/data/validate_tips_master.mjs` → PASS: 40
  FAIL: 0 ALL CHECKS PASS.

## Known limitations
- No rename / delete / edit (PR-012E).
- No recipe detail screen, sorting, search, tags, folders, or import/export.
- Duplicate names allowed (append-only, carried from PR-012C).

## Next recommended step
Independent Verification for PR-012D. If PASS, mark Ready for review and squash &
merge, then proceed to **PR-012E** (rename / delete / empty-state polish).
