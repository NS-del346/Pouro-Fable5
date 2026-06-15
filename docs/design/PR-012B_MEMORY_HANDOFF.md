# PR-012B — My Recipes Data Model and Storage Helpers — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-012b-my-recipes-data-storage-helpers`
- Base: `main`
- PR: PR-012B: My Recipes Data Model and Storage Helpers (Draft)

## Commit
- `PR-012B: add My Recipes storage helpers`

## Changed files
- `app.js` — added My Recipes storage key, schema/limit constants, and
  normalize/validate + safe read/write helpers (no UI).
- `docs/design/PR-012B_MEMORY_HANDOFF.md` — this handoff.
- No other files. `index.html`, `styles.css`, `sw.js`, `manifest`, `assets`,
  `docs/data/*`, and package files are **not changed**. Pre-existing untracked
  files (`.claude/launch.json`, `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) were not
  touched.

## Source of truth used
- `docs/design/PR-012A_MY_RECIPES_PLANNING.md` (Candidate A data model §6, storage
  strategy §7, MVP M1 §10, guardrails §11/§13).
- `docs/design/PR-012A_MEMORY_HANDOFF.md`.
- Existing `app.js` conventions: `STORAGE_KEYS`, `safeReadHistory` /
  `safeWriteHistory`, `safeReadSettings` / `safeWriteSettings`,
  `normalizeHistoryEntry`, `state.draft`, `METHODS`, `FLAVOR_LABELS`,
  `STRENGTH_LABELS`, `METHOD_DISPLAY_NAMES`, and the Settings dose/ratio steppers.

## What changed
Added the non-UI My Recipes storage foundation planned in PR-012A:

- New storage key `myRecipes: 'pouroFable5.myRecipes.v1'` added to `STORAGE_KEYS`
  (existing `history` / `settings` keys unchanged).
- Constants: `MY_RECIPES_SCHEMA_VERSION = 1`, `MAX_MY_RECIPES = 200`, and
  setup-parameter bounds (`MY_RECIPE_DOSE_MIN/MAX = 10/40`,
  `MY_RECIPE_RATIO_MIN/MAX = 10/20`) mirroring the Setup/Settings steppers.
- Helpers (all pure / defensive, none wired to any UI):
  - `createMyRecipeId()` — `mr_<ts>_<rand>` id.
  - `normalizeMyRecipe(input)` — returns a normalized Candidate-A object or `null`.
  - `isValidMyRecipe(recipe)` — `normalizeMyRecipe(recipe) !== null`.
  - `safeReadMyRecipes()` — tolerant read, returns `[]` on any failure.
  - `safeWriteMyRecipes(recipes)` — normalizes/filters/caps, returns `true|false`.
  - `findMyRecipeById(id, recipes?)` — lookup, returns entry or `null`.
  - `buildMyRecipeFromDraft(setup, name, now)` — **pure** transform of a setup
    descriptor into a normalized recipe; does not persist, mutate state, or touch
    the UI.
  - Internal helpers `_clampInt()` and `_isoOrFallback()`.

## What did not change
- RecipeEngine and its builders (`_buildYonRoku` / `_buildHybrid` / `_buildNeo` /
  `_buildIce`), recipe schedules, pour amounts, timings, `switchState`.
- `state.draft`, `_applyRebrewEntry`, `_applyCurrentBrewAgain`, `renderPreview`,
  Preview routing, Timer behavior.
- History schema/key (`pouroFable5.history.v1`) and settings schema/key
  (`pouroFable5.settings.v1`) — verified byte-unchanged in the smoke test.
- `index.html`, `styles.css`, `sw.js`, manifest, assets, `docs/data/*`.
- No My Recipes UI, Save action, list, detail, rename, delete, or Preview routing.

## Data model
Candidate A — setup parameters only (no stored steps):

```js
{
  schemaVersion: 1,
  id: "mr_<ts>_<rand>",
  name: "My Recipe",          // trimmed; falls back to method display name if empty
  methodId: "yon-roku",       // must be a key of METHODS
  dose: 20,                   // clamped 10–40
  ratio: 15,                  // clamped 10–20 (ignored by ice on rebuild)
  flavor: "balanced",         // sweet | balanced | bright
  strength: "standard",       // light | standard | strong
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

Generated steps, pour schedule, timer/elapsed state, history result, rating, taste
tags, memo, next note, `rebrewFrom`, and custom Switch/water schedules are **not**
stored. Steps are re-derived later via `RecipeEngine.build()` (Preview routing is a
later PR — not implemented here).

## Storage key
- New: `pouroFable5.myRecipes.v1` (JSON array of Candidate-A objects, capped at
  `MAX_MY_RECIPES = 200`).
- Unchanged: `pouroFable5.history.v1`, `pouroFable5.settings.v1`. My Recipes never
  reads or writes those keys.

## Helper functions
| Helper | Behavior |
| --- | --- |
| `createMyRecipeId()` | Returns `mr_<Date.now()>_<base36>` id. |
| `normalizeMyRecipe(input)` | Validates `methodId` against `METHODS` (only fatal field → `null`); trims `name` (fallback = method display name); clamps `dose`/`ratio`; validates `flavor`/`strength` against the app's label maps; normalizes ISO timestamps; sets `schemaVersion: 1`. |
| `isValidMyRecipe(recipe)` | `true` iff `normalizeMyRecipe` returns non-null. |
| `safeReadMyRecipes()` | Reads + normalizes; `[]` on missing key, malformed JSON, or non-array; never throws. |
| `safeWriteMyRecipes(recipes)` | Normalizes/filters/caps to `MAX_MY_RECIPES`, writes JSON, returns `true`/`false`; tolerates non-array input and localStorage errors. |
| `findMyRecipeById(id, recipes?)` | Looks up by `id` (reads store if no array passed); `null` if absent. |
| `buildMyRecipeFromDraft(setup, name, now)` | Pure transform → normalized recipe (or `null`). No persistence, no state mutation, no UI calls. Caller supplies `methodId` on `setup` (e.g. `{ ...state.draft, methodId: state.selectedMethodId }`). |

## Validation / normalization behavior
- `methodId` is the only hard requirement: an unknown/missing method yields `null`
  (filtered out by read/write).
- `name`: trimmed; empty → method display name (`METHOD_DISPLAY_NAMES[methodId]`),
  never an app "official/complete-reproduction" claim.
- `dose`/`ratio`: coerced to integer, clamped to Setup bounds, default 20/15 on NaN.
- `flavor`/`strength`: validated against `FLAVOR_LABELS` / `STRENGTH_LABELS`;
  unknown values default to `balanced` / `standard`.
- `createdAt`/`updatedAt`: parsed to ISO; invalid/missing fall back to now /
  createdAt.
- Reads/writes are wrapped in try/catch and never throw to the UI.

## UI non-implementation guarantee
- No new button, tab, screen, route, card, click handler, or visible copy.
- The only user-facing change is none. Helpers are defined but unreferenced by any
  render/handler path. `grep "myRecipes" index.html styles.css` → no hits.

## QA results
- `git status --short` — only `app.js` + this handoff modified/added (plus the two
  pre-existing untracked files, untouched).
- `git diff --name-only origin/main...HEAD` — `app.js`,
  `docs/design/PR-012B_MEMORY_HANDOFF.md`.
- `node --check app.js` — **OK**.
- `node docs/data/validate_tips_master.mjs` — **PASS: 40  FAIL: 0  ALL CHECKS
  PASS**.
- Reference checks — `pouroFable5.myRecipes.v1`, `safeReadMyRecipes`,
  `safeWriteMyRecipes` present in `app.js`; no `myRecipes` hits in
  `index.html` / `styles.css`.
- Local preview smoke check (port 4005, after clearing stale SW cache):
  - App loads; Home / Setup / Preview / Timer (`screen-brew`) / History all render;
    no console errors.
  - Helper behavior verified live: name trim, id prefix, invalid `methodId` → null,
    clamping (dose 999→40, ratio −5→10, bad flavor/strength → defaults, empty name
    → method display name), write filters invalid entries (3→2), `findMyRecipeById`
    hit/miss, malformed JSON → `[]`, missing key → `[]`, non-array write tolerated,
    `history`/`settings` keys unchanged. Test data cleaned up afterward.

## Known limitations
- No UI yet (no Save action, no list/select, no Preview routing).
- `buildMyRecipeFromDraft` is a pure helper only; it is not wired to any UI and the
  caller must attach `methodId` to the setup object (PR-012C will wire it).
- `roast`/`grind`/`temp` remain excluded from v1 (not live `state.draft` fields).
- No localStorage migration (new key only; nothing to migrate).

## Next recommended step
Independent Verification for PR-012B. If PASS, mark Ready for review and squash &
merge, then begin **PR-012C** (Save current setup as My Recipe).
