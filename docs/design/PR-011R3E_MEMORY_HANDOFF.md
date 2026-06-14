# PR-011R3E — History Detail contextual TIPS integration (Memory / Handoff)

## 1. Status
**MERGED.** Implemented, locally verified, independently verified (PASS), and
merged to `main` via PR #32 (squash merge `65983c0`).

Adds a quiet, reflection-oriented POINT/TIPS section ("次回の調整メモ") to the
existing History Detail screen. Display-only; no new logging system, no schema
migration. Unknown / unsupported method hides the section safely. Items come
from the curated runtime `TIPS_DATA` subset only.

## 2. Branch / PR info
- Base branch: `main`
- Feature branch: `pr-011r3e-history-detail-tips`
- Commit message: `feat: add history detail contextual tips`
- PR: [#32](https://github.com/NS-del346/Pouro-Fable5/pull/32) — **MERGED**
- PR title: `PR-011R3E History Detail contextual TIPS integration`
- Merge method: **Squash and merge**
- Merge commit: `65983c00795d0d6cc4573de856380b32cad2b3e8`
- Independent Verification: **PASS**

## 3. What changed
- `app.js`
  - `historyRecipeCode(entry)` — resolves a saved record's recipeCode. Primary
    path is `METHOD_RECIPE_CODE[entry.methodId]` (records store the canonical app
    methodId). Defensive fallback matches known method **names** to a code, for
    any older record that only carried a display name. Returns `null` when
    nothing safe maps (caller then hides the section). Reads nothing from
    localStorage; derives only.
  - `selectHistoryDetailTips(entry, limit = 3)` — deterministic, never throws.
    Filters the read-only `TIPS_DATA` adapter for `displayContext` including
    `historyDetail`, recipeCode `=== code || 'ALL'`, type POINT/TIPS. Orders
    method-specific before the ALL fallback, then stable id ascending, then
    slices to 3. Returns `[]` on any problem.
  - `renderDetail()` — one added call rendering the section via the existing
    `renderContextualTips(container, label, items)` helper, label
    `次回の調整メモ`. Hides when no safe item exists.
- `index.html`
  - One element added inside `#screen-detail`, below the メモ card and above the
    Equipment card: `<div class="ctx-tip-card hidden" id="detail-tips"></div>`.
- `docs/design/PR-011R3E_MEMORY_HANDOFF.md` (this file).

No other files changed. No new CSS — reuses the existing `.ctx-tip-card` style
(PR-011R3A), so the History Detail card matches Setup/Preview/Finish visually.

## 4. What did NOT change
- `docs/data/*` (master JSON / audit CSV / validator) — untouched.
- History record schema, normalization, save path, rebrew path.
- localStorage keys / contents / migration — none written, none migrated.
- CSV export / JSON export / import / sharing — untouched.
- Timer logic, Timer semantics, RecipeEngine, `_buildYonRoku`.
- PWA / manifest / service worker / build configuration.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not staged.

## 5. History Detail placement
Inside the existing `#screen-detail` scroll column (which uses `gap:12px`):
`… → メモ card → [次回の調整メモ card] → Equipment card → (rebrew CTA bar)`.
Below the record details / near the review (memo) area, before the secondary
rebrew action. No banner, no modal, no new tab/route, no new-feature CTA.

## 6. Recipe code mapping
Same policy as Setup / Preview / Finish / Method Detail
(`METHOD_RECIPE_CODE`):

| app methodId | recipeCode |
|---|---|
| `yon-roku` | `406` |
| `ice` | `ICE` |
| `hybrid` | `HYB_NEW` |
| `neo` | `NEO` |
| unknown | `null` → section hidden |

Defensive name fallback in `historyRecipeCode` (only used when `methodId` is not
in the map): 4:6/four-six/yon-roku/四六 → 406; ice/アイス/氷 → ICE;
hybrid/switch/スイッチ → HYB_NEW; neo/10投/十投/ネオ → NEO. The app does not
expose HYB_BASE / HYB_DEVIL, so that wording never surfaces.

## 7. POINT/TIPS filtering decisions
- Prefer `displayContext: historyDetail`. In `TIPS_DATA`, every adoptable
  `finish` item that supports next adjustment (P-406-002, T-ICE-003, T-NEO-003)
  already also carries `historyDetail`, so a single `historyDetail` filter
  covers both reflection and next-adjustment hints — no separate `finish` pass
  is needed, and no `finish`-only completion item (e.g. P-ICE-004) is pulled in.
- `timer` and `quarantine` contexts are never selected (and are absent from the
  runtime subset anyway).
- Excluded by construction: `appAdoption !== adoptable`, P-OTHER-001,
  HYB_DEVIL/HYB_BASE wording, and all raw source metadata
  (source/verificationLevel/confidence/notes) — none of these exist in the
  runtime `TIPS_DATA` subset.
- Up to 3 items, method-specific first; the ALL item (T-ALL-001) only appears as
  filler when a method has fewer than 3 of its own items (only HYB_NEW today).

Selected per method (verified, see §10):
- 406: P-406-002, T-406-001, T-406-002
- ICE: T-ICE-001, T-ICE-002, T-ICE-003
- HYB_NEW: T-HYB-NEW-001, T-HYB-NEW-002, T-ALL-001 (filler)
- NEO: T-NEO-002, T-NEO-003, T-NEO-004

## 8. Method-specific behavior
- **406** — pour balance for taste impression, later pours for strength, 3分半
  drawdown guide. No 48/72 or 72/48 baseline; no final-standard-pour-at-3:00
  claim. (Numbers come verbatim from existing items; nothing re-derived.)
- **ICE** — temp/苦味, 1・2投目 balance, and "3分超なら少し粗く" next-time
  grind guide. Flash-chilling premise preserved by the master content.
- **HYB_NEW** — low-temp phase + 常温水 counted in total 300g / 70–80℃ guide.
  Room-temperature water amount is **not** fixed; no HYB_DEVIL wording; no
  "official complete recipe" implication.
- **NEO** — many small pours / rhythm / 質感, "通常より粗く" start. History
  Detail does not repeat the full 10×30g schedule; nothing shown contradicts it
  (1:45 / 210g remains intact in Method Detail and the engine).

## 9. Safety / schema decisions
- No new localStorage fields; no history migration; no change to how records are
  saved or exported. The feature only *reads* a record's existing
  `methodId`/`methodName` to derive a code.
- Rendering reuses `renderContextualTips`. It builds markup with `innerHTML`, but
  **only from trusted static constants in `TIPS_DATA`** (no user-generated text,
  no record fields are interpolated into the markup), matching the existing
  Setup/Preview/Finish/Method Detail rationale.
- All selection helpers are wrapped to never throw; on any failure the section
  hides and the rest of History Detail renders normally.

## 10. Validation results
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`
- `node --check app.js` → OK
- `git diff --stat` → `app.js`, `index.html` (+ this doc); no `docs/data`, no
  schema/export/PWA/build files.

## 11. Manual QA results (local preview, mobile 375×812)
Seeded one saved record per method, opened History Detail for each:
- 406 / ICE / HYB_NEW / NEO — section visible, title `次回の調整メモ`, tips match
  the saved method (ids per §7), 2–3 items each.
- Unknown methodId — section correctly **hidden** (empty, no broken card).
- No P-OTHER-001 / quarantine / HYB_DEVIL / raw metadata in output.
- No console errors.
- Regression: Setup POINT, Preview TIPS, Finish TIPS, and Method Detail tip
  groups all still resolve their expected items; bottom nav and the save/history
  flow unaffected.

(Note: the local service worker pre-caches the app shell; a one-time SW/cache
clear + reload was needed in the preview browser to pick up the edited
`index.html`. This is a dev-cache artifact only — no SW/manifest change was made.)

## 12. Known limitations
- History Detail does not show the full NEO pour schedule by design; it provides
  reflection guidance only. Full schedules remain in Method Detail.
- HYB_NEW shows 2 method-specific items + 1 ALL filler (only two adoptable
  HYB_NEW `historyDetail` items exist in the runtime subset today). Adding more
  HYB_NEW reflection items would require copying adoptable items verbatim from
  `coffee_app_tips_master_v2.1.json` into `TIPS_DATA` (not done here).

## 13. Follow-up PRs
- **PR-011R4** — Timer semantics audit. **Not started.**
- **PR-012** — My Recipes / Custom Recipe. **Not started.**
- Timer POINT/TIPS implementation — out of scope, not started.

## 14. Merge metadata
- PR number: [#32](https://github.com/NS-del346/Pouro-Fable5/pull/32) — **MERGED**
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/32
- Branch: `pr-011r3e-history-detail-tips`
- Merge method: **Squash and merge**
- Merge commit: `65983c00795d0d6cc4573de856380b32cad2b3e8`
- Independent Verification: **PASS**
- Progress memory: updated

### Scope boundaries (final, as merged)
- History Detail contextual TIPS were implemented; card title is `次回の調整メモ`.
- The feature is **display-only**; unknown / unsupported method hides the
  section safely.
- Runtime `TIPS_DATA` only — no `docs/data` changes.
- No `styles.css` changes (reused `.ctx-tip-card`).
- No Timer, RecipeEngine, History schema, or localStorage schema changes.
- No CSV / JSON export / import changes.
- No PWA / manifest / service worker changes.
- No PR-011R4 work; no PR-012 / My Recipes work.

### Minor notes (carried from independent verification)
- `appAdoption` safety is enforced by the curated runtime `TIPS_DATA` subset, not
  an explicit field check.
- The independent verification regression check was code/structure-based.
- Local preview may require a one-time service-worker / cache clear due to
  cache-first behavior; no SW / manifest change was made.
