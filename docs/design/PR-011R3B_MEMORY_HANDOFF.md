# PR-011R3B｜Contextual POINT/TIPS UI integration - Finish only｜Memory / Handoff

## 1. Status

- PR status: **DRAFT (open, not merged)** — awaiting independent verification.
- Nature: narrow runtime/UI integration. Extends the PR-011R3A contextual
  POINT/TIPS mechanism to the **Finish / Brew Complete** surface only.
- Builds on: PR-011R1 (data foundation), PR-011R2 (IA policy), PR-011R3A
  (Setup/Preview runtime integration) — all merged.
- Does **not** modify PR-011R1 data, PR-011R2 IA docs, recipe logic, timer
  logic/semantics, or any storage/export schema.

## 2. Branch / PR info

- Branch: `pr-011r3b-contextual-tips-finish-only`
- Base: `main` (branched from `origin/main` @ PR #22 merge `b3e9048`)
- PR title: `PR-011R3B Contextual POINT/TIPS UI integration - Finish only`
- Commit: `feat: add contextual tips to finish screen`

## 3. What changed

- **`app.js`** (runtime):
  - Extended `TIPS_DATA` with 4 new items whose `displayContext` includes
    `finish` (content copied verbatim from v2.1 master): `P-406-002`,
    `P-ICE-004`, `T-ICE-003`, `T-NEO-003`.
  - Extended `selectContextualTips()` ordering: `setup` leads with `POINT`,
    `finish` leads with `TIPS` (next-adjustment focus). Filter/fallback logic
    unchanged. Still deterministic, still never throws.
  - Wired one call into `renderLog()` (the Brew Complete / 抽出記録 screen):
    `renderContextualTips(#finish-tips, '次回のヒント', selectContextualTips(recipe.id,'finish'))`.
    No other new call sites.
- **`index.html`**: added one empty container `#finish-tips`
  (`.ctx-tip-card ctx-tip-card--preview hidden`) after the method recap card on
  the log screen, before the Rating section. Starts `hidden`.
- **`styles.css`**: **unchanged** — reused the existing PR-011R3A
  `.ctx-tip-card` (+ `--preview` modifier) directly.
- **`docs/design/PR-011R3B_MEMORY_HANDOFF.md`**: this file.

## 4. What did NOT change

- `RecipeEngine` / `_buildYonRoku` / all recipe logic (406 / ICE / HYB_* / NEO).
- Timer logic and timer semantics.
- History schema, localStorage schema, CSV/JSON export schema, Brew Log schema,
  Recent values.
- `docs/data/coffee_app_tips_master_v2.1.json`, its audit CSV, and
  `validate_tips_master.mjs`.
- `sw.js` / `manifest.webmanifest` — intentionally untouched.
- `styles.css` — reused existing card styles, no edit needed.
- PR-011R2 IA docs — not contradicted.
- Setup `POINT` (PR-011R3A) and Preview `TIPS` (PR-011R3A) behavior — preserved.

## 5. Data integration approach

Continues PR-011R3A **approach B**: a static, read-only data adapter embedded in
`app.js`, derived from `coffee_app_tips_master_v2.1.json`. No runtime fetch, no
`sw.js` change, works offline (app.js is already in the service-worker
`APP_SHELL`). Content is copied verbatim — not rewritten or invented.

## 6. Newly included finish item IDs

| ID | type | recipeCode | displayContext | contentShortJa |
|----|------|-----------|----------------|----------------|
| `P-406-002` | POINT | 406 | finish, historyDetail | 3分半を目安に |
| `P-ICE-004` | POINT | ICE | finish | 氷を溶かして完成 |
| `T-ICE-003` | TIPS | ICE | finish, historyDetail | 3分超なら少し粗く |
| `T-NEO-003` | TIPS | NEO | finish, historyDetail | 3分半までかける |

All four are `appAdoption: "adoptable"` and in app-mapped recipeCodes. Excluded:
`P-HYB-DEV-004` (HYB_DEVIL — out of scope). No adoptable `HYB_NEW` or `ALL`
`finish` item exists in v2.1, so Hybrid Finish shows no card (graceful hide).
`P-OTHER-001`, quarantine items, and source/verification metadata remain
excluded.

## 7. Method identifier → recipeCode mapping (unchanged from PR-011R3A)

| App method id (`METHODS`) | v2.1 `recipeCode` |
|---------------------------|-------------------|
| `yon-roku` (4:6 Method)   | `406`             |
| `ice` (Ice Brew)          | `ICE`             |
| `hybrid` (Hybrid)         | `HYB_NEW`         |
| `neo` (10 Pour)           | `NEO`             |
| —                         | `ALL` (global supplement only) |

`HYB_BASE` / `HYB_DEVIL` are never represented in the app and never surfaced.

## 8. Selector policy

`selectContextualTips(methodId, 'finish', limit=2)`:

1. Resolve `methodId → recipeCode`; unknown id → `[]`.
2. Keep items where `type` is `POINT`/`TIPS`, `displayContext` (array)
   **includes `finish`**, and `recipeCode` equals the method code **or** `ALL`.
3. Deterministic ordering: `TIPS` before `POINT` (finish lead) → method-specific
   before `ALL` → stable ascending item `id`.
4. `slice(0, 2)` → at most 2 items.
5. Wrapped in try/catch → always an array, never throws.

## 9. Finish display behavior

- Compact `次回のヒント` card rendered on the Brew Complete / 抽出記録 screen,
  after the method recap (completion summary) card, before the Rating section.
  Label is `次回のヒント` to match the Japanese UI tone and avoid duplicating the
  existing "次回の調整" user-input section further down the screen.
- Re-rendered by `renderLog()` (called on every log re-render). Each item shows
  `contentShortJa` (bold) + `contentJa` (muted). No modal. Reuses
  `.ctx-tip-card--preview`.
- Does not block save / close / rating / navigation. When no finish item exists
  for the method, the container hides and the screen stays clean and usable.
- Observed selection: `406` → `P-406-002`; `ice` → `T-ICE-003`, `P-ICE-004`;
  `neo` → `T-NEO-003`; `hybrid` → none (card hidden).

## 10. Validation results

- `node docs/data/validate_tips_master.mjs` → **PASS: 40, FAIL: 0, ALL CHECKS PASS**.
- `node --check app.js` → OK.
- Selector self-test (loaded shipped `TIPS_DATA` + `selectContextualTips` from
  `app.js`): **37 PASS, 0 FAIL** — finish recipeCode + context correctness for
  406/ICE/NEO, HYB_NEW finish → empty (hide), TIPS-before-POINT ordering,
  determinism, verbatim content vs master, no quarantine / no `P-OTHER-001` / no
  `HYB_DEVIL` / no forbidden wording / no source-metadata fields, unknown-method
  fallback, and Setup/Preview regression.
- Browser preview (local serve, port 4005): finish card appears on Brew Complete
  and updates per method; Hybrid hides the card; save/rating/close remain usable;
  **no console errors/warnings**. (A stale cache-first service worker was
  unregistered once to load fresh assets — expected local-dev behavior.)
- Regression: Setup `POINT` and Preview `TIPS` still render;
  `RecipeEngine.build('yon-roku',20,15,'balanced','standard')` → total 300g,
  pours 60/60/90/90, times 0/45/90/135 — matches PR #16.

## 11. Known limitations

- No adoptable `HYB_NEW` or `ALL` `finish` item exists in v2.1, so the Hybrid
  Finish screen intentionally shows no card. This is by-data, not a defect.
- `406` finish has only one source `finish` item, which is a `POINT`
  (`P-406-002`); shown as a single tip. Acceptable per policy (TIPS preferred but
  POINT allowed for finish).
- Embedded `TIPS_DATA` is a derived copy; if the master JSON changes, the embed
  must be regenerated. Scoped to setup/preview/finish items only.

## 12. Follow-up PRs (not started)

- **PR-011R3C**: History Detail or Method Detail integration, if approved.
- **PR-011R4**: Timer semantics audit / recipe timeline alignment.
