# PR-011R3A｜Contextual POINT/TIPS UI integration - Setup / Preview｜Memory / Handoff

## 1. Status

- PR status: **MERGED**
- Independent Verification: **PASS WITH MINOR NOTES**
- Nature: first runtime/UI integration of POINT/TIPS Master v2.1.
- Scope is limited to **Recipe Setup** and **Preview** surfaces only.
- Builds on: PR-011R1 (data foundation, merged) and PR-011R2 (IA policy, merged).
- Does **not** modify PR-011R1 data, PR-011R2 IA docs, recipe logic, timer logic,
  or any storage/export schema.

## 2. Branch / PR info

- Branch: `pr-011r3a-contextual-tips-setup-preview`
- Base: `main` (branched from `origin/main` @ PR #20 merge `90f21f7`)
- PR title: `PR-011R3A Contextual POINT/TIPS UI integration - Setup / Preview`
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/21 (merged)
- Commit: `9b78d60`
- Merge method: Squash and merge
- Merge commit: `bf9cccbad790c7bbd0c663023bd113a21b85280d`

## 3. What changed

- **`app.js`** (runtime):
  - Added `TIPS_DATA` — a scoped, read-only data adapter **derived from**
    `docs/data/coffee_app_tips_master_v2.1.json`. 14 items embedded (verbatim
    content), covering only `adoptable` items in app-mapped recipeCodes whose
    `displayContext` includes `setup` or `preview`.
  - Added `METHOD_RECIPE_CODE` — app method id → v2.1 recipeCode map.
  - Added `selectContextualTips(methodId, surface, limit=2)` — deterministic,
    non-throwing selector.
  - Added `renderContextualTips(container, label, items)` — compact card renderer
    that hides the container when there are no items.
  - Wired one call each into `renderSetup()` (`'setup'`, label `POINT`) and
    `renderPreview()` (`'preview'`, label `TIPS`). No other call sites.
- **`index.html`**: added two empty containers, `#setup-tips` (after the Recipe
  summary card on Setup) and `#preview-tips` (after the pre-brew checklist, before
  the Start Brew CTA on Preview). Both start `hidden`.
- **`styles.css`**: added `.ctx-tip-card` (+ `--preview` modifier, head/label/item
  styles) — quiet, compact card with a soft left accent border, reusing existing
  design tokens.
- **`docs/design/PR-011R3A_MEMORY_HANDOFF.md`**: this file.

## 4. What did NOT change

- `RecipeEngine` / `_buildYonRoku` / all recipe logic (406 / ICE / HYB_* / NEO).
- Timer logic and timer semantics.
- History schema, localStorage schema, CSV/JSON export schema, Brew Log, Recent values.
- `docs/data/coffee_app_tips_master_v2.1.json`, its audit CSV, and `validate_tips_master.mjs`.
- `sw.js` / `manifest.webmanifest` — intentionally untouched (see §5).
- PR-011R2 IA docs — not contradicted.

## 5. Data loading approach

Chosen: **B — static in-app data adapter embedded in `app.js`** (derived from the
v2.1 JSON).

Rationale:
- `app.js` is already listed in the service worker `APP_SHELL` (cache-first), so
  the embedded data ships and works **offline with no `sw.js` change** and no
  extra network request.
- A runtime `fetch()` of `docs/data/...json` would NOT be in `APP_SHELL`; under the
  cache-first strategy it would return 503 offline, so the feature would silently
  disappear offline unless `sw.js` were modified and `CACHE_VERSION` bumped. Avoided.
- No GitHub Pages `/Pouro-Fable5/` relative-path concerns, since nothing is fetched.

Constraints honored:
- Content is copied verbatim — **not rewritten or invented**.
- Quarantine item `P-OTHER-001` and `appAdoption: quarantine` items are excluded.
- Out-of-scope reference codes `HYB_BASE` / `HYB_DEVIL` are **not embedded**, so no
  "devil" wording reaches the runtime or UI.
- Source / verification / confidence / notes metadata fields are **not embedded**.
- If `TIPS_DATA` is ever empty/unavailable, the selector returns `[]`, the card
  hides, and Setup/Preview/brewing continue normally (verified).

## 6. Method identifier → recipeCode mapping

| App method id (`METHODS`) | v2.1 `recipeCode` |
|---------------------------|-------------------|
| `yon-roku` (4:6 Method)   | `406`             |
| `ice` (Ice Brew)          | `ICE`             |
| `hybrid` (Hybrid)         | `HYB_NEW`         |
| `neo` (10 Pour)           | `NEO`             |
| —                         | `ALL` (global items, included alongside any method) |

The app exposes a single Hybrid recipe, so `hybrid → HYB_NEW`. `HYB_BASE` /
`HYB_DEVIL` are not represented in the app and are never surfaced.

## 7. Selector policy

`selectContextualTips(methodId, surface, limit=2)`:

1. Resolve `methodId → recipeCode`; unknown id → `[]`.
2. Keep items where: `type` is `POINT`/`TIPS`, `displayContext` (array) **includes
   the surface**, and `recipeCode` equals the method code **or** `ALL`.
3. Deterministic ordering (no randomness):
   - Setup only: `POINT` before `TIPS`.
   - Then method-specific before `ALL` (so `ALL` is a supplement and only fills
     remaining slots — i.e. used only when globally relevant).
   - Then stable ascending item `id`.
4. `slice(0, limit)` → at most 2 items.
5. Wrapped in try/catch → always returns an array, never throws.

## 8. Setup display behavior (`POINT`)

- Compact `POINT` card rendered after the Recipe summary card.
- Re-rendered by `renderSetup()` on every method change / dose / ratio update, so it
  updates when the method changes and when entering Setup from another method.
- Each item shows `contentShortJa` (bold) + `contentJa` (muted). No modal.
- Observed: `406`/`hybrid`/`neo` → two `ALL` prep POINTs; `ice` → `氷80gを先に入れる`
  (ICE) + `器具を温める` (ALL).

## 9. Preview display behavior (`TIPS`)

- Compact `TIPS` card rendered after the pre-brew checklist, before the Start Brew CTA.
- Re-rendered by `renderPreview()`; does not interrupt the start flow.
- Observed: `406` → T-406-001/002; `ice` → T-ICE-001/002; `hybrid` → T-HYB-NEW-001/002;
  `neo` → T-NEO-001/002. All method-specific; `T-ALL-001` only appears if a method
  has fewer than 2 specific preview items (none currently do).

## 10. Validation results

- `node docs/data/validate_tips_master.mjs` → **PASS: 40, FAIL: 0, ALL CHECKS PASS**.
- `node --check app.js` → OK.
- Throwaway selector self-test (loaded the shipped `TIPS_DATA` + `selectContextualTips`
  from `app.js`): **32 PASS, 0 FAIL** — covers 406/ICE/HYB_NEW/NEO setup+preview
  (recipeCode + context correctness, 1–2 items, method-specific-before-ALL ordering,
  determinism), no quarantine / no `P-OTHER-001` / no `HYB_BASE`/`HYB_DEVIL` /
  no source-metadata fields embedded, and unknown-method → empty fallback.
- Browser preview (local `npx serve`, port 4005): POINT block appears and updates per
  method on Setup; TIPS block appears and matches method on Preview; **no console
  errors/warnings**; empty/unknown data hides the card without throwing and leaves
  brewing usable. (Note: a stale cache-first service worker had to be unregistered
  once to load fresh assets — expected local-dev behavior, not a regression.)
- Regression: `RecipeEngine.build('yon-roku',20,15,'balanced','standard')` →
  total 300g, pours 60/60/90/90, times 0/45/90/135, drawdown 210s — matches PR #16.

## 11. Known limitations

- Embedded `TIPS_DATA` is a derived copy; if the master JSON changes, the embed must
  be regenerated. It is intentionally scoped to setup/preview items only.
- `displayPolicy` setup preference (POINT-first) means `406`/`hybrid`/`neo` Setup show
  generic `ALL` prep POINTs (no method-specific *setup* POINT exists for those codes in
  v2.1). This is by-policy, not a defect.
- No priority field exists in v2.1; ordering uses stable id ordering as specified.

## 12. Follow-up PRs (not started)

- **PR-011R3B**: Finish / History Detail or Method Detail integration, if approved.
- **PR-011R3C**: Timer compact POINT display, if approved.
- **PR-011R4**: Timer semantics audit / recipe timeline alignment.
