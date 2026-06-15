# PR-012F｜My Recipes Public / Local Smoke QA

## 1. Status
Draft / pending Independent Verification.

This is a **docs-only QA PR**. No runtime files were changed. It records local
preview and GitHub Pages public smoke QA of the merged My Recipes MVP (PR-012B → E).
Result: **local QA passed**, **public QA passed** (after required service-worker /
cache cleanup on the public origin — see §12). No blocker found.

## 2. Target baseline
- Repository: `NS-del346/Pouro-Fable5`
- Base branch: `main`
- QA branch: `pr-012f-my-recipes-public-local-smoke-qa`
- `main` HEAD at QA time: `3c3473983ea188f7c8e7d98aaecd63f7dc5dcf9e`
  (PR-012E: My Recipes Rename Delete and QA Polish — MERGED).
- Validation:
  - `git log -1 --oneline` → `3c34739 PR-012E: My Recipes Rename Delete and QA Polish`
  - `git rev-parse HEAD` (branch point) → `3c3473983ea188f7c8e7d98aaecd63f7dc5dcf9e`
  - `node --check app.js` → OK
  - `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`
- PR-013 (Timer Countdown Sequence UI) remains deferred and is **not** started here.

## 3. Environment
| | Local preview | Public GitHub Pages |
|---|---|---|
| URL | `http://localhost:4005/` (launch config `pouro-fable5`, `npx serve .`) | `https://ns-del346.github.io/Pouro-Fable5/` |
| Date/time | 2026-06-15 (JST evening) | 2026-06-15 ~22:59–23:01 JST |
| Driver | Preview headless browser (DOM + localStorage inspection, real event handlers via element `.click()`) | Chrome (connected extension), real browser |
| Viewport | 375 × 812 (exact, mobile preset) | mobile window; innerWidth bottomed out at 400 (Chrome min window width) |
| SW/cache cleanup | Required (local `pouro-app-v2` / `pouro-fonts-v2` cleared; 1 SW unregistered) | **Required** — see §12 (stale cached build initially served) |

Notes on method: the preview tool's synthetic pointer click landed on a child SVG of
the My Recipes entry button, so navigation was driven by invoking the element's real
`click()` (which fires the exact production event handlers in `app.js`). All assertions
read live DOM / `localStorage`, not mocked state.

## 4. Local preview QA
375 px viewport. Every step re-checked `document.documentElement.scrollWidth` vs
`window.innerWidth` (always `375 === 375`). No console output at warn/error level
throughout.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | App loads | PASS | `screen-home` active on load |
| 2 | Home renders | PASS | Method selector + tab bar present |
| 3 | My Recipes entry appears & stays secondary | PASS | Entry button rendered below the method selector, above the tab bar |
| 4 | Empty My Recipes state renders | PASS | `#my-recipes-empty` visible, list empty |
| 5 | Save current setup as My Recipe works | PASS | 4:6 / Hybrid / Ice / NEO each saved; feedback `マイレシピに保存しました` |
| 6 | Saved recipe appears in list | PASS | List renders newest-first (NEO, Ice, Hybrid, 4:6) |
| 7 | Select saved recipe → Preview | PASS | Active screen `screen-preview` after プレビューで確認 |
| 8 | Select routes to Preview, not Timer | PASS | `screen-preview` (not `screen-brew`) |
| 9 | Preview shows selected setup | PASS | Banner `マイレシピから読み込み` + correct 4:6 setup |
| 10 | Start Brew from Preview works | PASS | `screen-brew`, step `1 / 4`, 60 g |
| 11 | Rename saved My Recipe works | PASS | Inline panel → `名前を変更しました` |
| 12 | Rename changes only name + updatedAt | PASS | Diff of stored object = `["name","updatedAt"]` |
| 13 | Rename preserves id/methodId/dose/ratio/flavor/strength/createdAt/schemaVersion | PASS | All eight fields byte-identical before/after |
| 14 | Delete works after confirmation | PASS | confirm-cancel keeps all; confirm-OK removes; `削除しました` |
| 15 | Delete removes only targeted recipe | PASS | Ice removed; `yon-roku/hybrid/neo` preserved |
| 16 | Delete last recipe → empty state | PASS | Final store `[]`, empty state visible |
| 17 | Rename/Delete do not create History entry | PASS | `history.v1` unchanged across both ops |
| 18 | Select does not mutate My Recipes storage | PASS | `myRecipes.v1` byte-identical before/after select |
| 19 | Select does not write History | PASS | `history.v1` byte-identical before/after select |
| 20 | Save to History still works | PASS | `h_…` entry appended (22 → 23), `schemaVersion:1` |
| 21 | History list still works | PASS | 21 records render (recent card + list) |
| 22 | History Detail Rebrew → Preview still works | PASS | Detail → `履歴から再現 ・ … の記録` → Preview |
| 23 | Finish Same Setup → Preview still works | PASS | Log → `同じ条件でもう一度` → Preview, no write |
| 24 | No console errors | PASS | No warn/error messages captured |
| 25 | No horizontal overflow at 375px | PASS | `scrollWidth === innerWidth === 375` at every step |

Methods saved & inspected: **4:6 (yon-roku)**, **Hybrid**, **Ice**, **NEO / 10 Pour** —
each stored object carried exactly the 10 canonical keys
(`schemaVersion, id, name, methodId, dose, ratio, flavor, strength, createdAt, updatedAt`).

## 5. Public GitHub Pages QA
Target: `https://ns-del346.github.io/Pouro-Fable5/`. Browser: Chrome (connected
extension). Tested 2026-06-15 ~22:59–23:01 JST.

**Deployment freshness:** GitHub Pages latest build (`gh api …/pages/builds/latest`)
reports `commit: 3c3473983ea188f7c8e7d98aaecd63f7dc5dcf9e`, `status: built` — i.e. the
public site is built from the exact PR-012E merge commit (`main` HEAD). Served
`index.html` and `app.js` contain all PR-012E markers (`btn-open-my-recipes`,
`my-recipes-feedback`, `_beginRenameMyRecipe`, `_commitRenameMyRecipe`,
`_deleteMyRecipe`, `handleSaveMyRecipe`, `showMyRecipesListFeedback`,
`myRecipeEditingId`, `safeWriteMyRecipes`). Public `app.js` is byte-identical to local
modulo line endings (both 3148 lines; size delta = CR bytes only).

**Initial stale-cache caveat (resolved):** the public origin first loaded a **stale
cached build without My Recipes** (3 service workers, caches incl. `pouro-gpt-pr-008b`).
After unregistering all SWs, clearing all caches, and a fresh reload, the current
deployment (with full PR-012E) loaded correctly. This is the documented SW cache-first
behavior, not a deployment failure. See §12.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Public app loads | PASS | `screen-home` active; title `Pourō` |
| 2 | Home renders | PASS | Screenshot captured (method selector + tabs) |
| 3 | My Recipes entry appears | PASS | `#btn-open-my-recipes` present (post cache-clear) |
| 4 | Empty My Recipes state after clearing test data | PASS | `#my-recipes-empty` visible, list empty |
| 5 | Save current setup as My Recipe works | PASS | `Public QA 4:6` stored; 10 canonical keys; feedback shown |
| 6 | List shows saved recipe | PASS | 1 item, params line `4:6 Method ・ 20g ・ 1:15 ・ バランス / 標準` |
| 7 | Select saved recipe → Preview | PASS | Banner `マイレシピから読み込み`; storage unchanged |
| 8 | Start Brew from Preview works | PASS | `screen-brew`, step `1 / 4` |
| 9 | Rename saved My Recipe works | PASS | Diff = `["name","updatedAt"]`; `名前を変更しました` |
| 10 | Delete saved My Recipe works | PASS | `削除しました` |
| 11 | Delete last recipe → empty state | PASS | Store `[]`, empty visible |
| 12 | Save to History still works | PASS | 5 → 6 entries, `schemaVersion:1` (test entry removed afterward) |
| 13 | History Detail Rebrew → Preview still works | PASS | `履歴から再現 ・ … の記録`; storage unchanged |
| 14 | Finish Same Setup → Preview still works | PASS | `同じ条件でもう一度`; no history write |
| 15 | No console errors | PASS WITH NOTE | Only Chrome-extension noise (see §11); no app-originated errors |
| 16 | No horizontal overflow at 375px | PASS WITH NOTE | `scrollWidth === innerWidth` at 400px (Chrome min window width); exact-375 verified locally with identical served CSS |

## 6. My Recipes flow results
- **Save (PR-012C):** PASS on local & public. Stored object = exactly the 10 candidate
  keys; History never written by save. Tested across all four methods locally.
- **List / Select → Preview (PR-012D):** PASS. List renders newest-first; primary
  action プレビューで確認 routes to **Preview** (never Timer); banner
  `マイレシピから読み込み`; select performs **no** storage write (My Recipes & History
  byte-identical before/after).
- **Rename (PR-012E):** PASS. Writes **only** `name` + `updatedAt`; preserves
  `id/methodId/dose/ratio/flavor/strength/createdAt/schemaVersion`; Enter/保存 commit,
  no History entry.
- **Delete (PR-012E):** PASS. `confirm()` gate (cancel keeps all; OK removes only the
  targeted id); deleting the last recipe shows the empty state; no History entry.

## 7. Storage behavior
- Keys observed: `pouroFable5.myRecipes.v1`, `pouroFable5.history.v1`,
  `pouroFable5.settings.v1`. My Recipes store uses key `pouroFable5.myRecipes.v1`.
- **Select** is read-only against storage (verified byte-identical My Recipes & History).
- **Rename / Delete** write only `pouroFable5.myRecipes.v1`; never History/Settings.
- **Save-to-History** appends to `pouroFable5.history.v1` only (My Recipes untouched).
- Isolated QA data used throughout; cleanup performed (see §7 of memory handoff).

## 8. History / Rebrew regression
No regression found on local or public:
- Save-to-History appends a `schemaVersion:1` entry and routes to History.
- History list renders existing records.
- History **Detail → Rebrew** loads the record into Preview with the
  `履歴から再現 ・ <date> の記録` banner and writes nothing.
- **Finish Same Setup** (`同じ条件でもう一度`) loads the just-completed setup into
  Preview with a neutral same-setup banner and writes nothing.
- My Recipes select/rename/delete never created or altered a History entry.

## 9. Recipe truth spot-checks (local, via live Preview render)
- **4:6** (20 g, balanced/standard): pours `60 / 60 / 90 / 90` (cum. 60/120/210/300).
  No 48/72 or 72/48 regression at balanced. PASS.
- **Hybrid** (20 g): Switch context visible across steps —
  `OPEN → OPEN → CLOSED → OPEN (落とし切り)`; no fixed `20°C` / `20℃` copy; tips reference
  `液温70〜80℃`. PASS.
- **Ice** (20 g): `HOT 150g / ICE 80g` context visible; ratio omitted from summary
  (matches engine); 5 HOT pours of 30 g. PASS.
- **NEO / 10 Pour** (20 g): 10 pours; `1:45 → 210g` step preserved; total 300 g. PASS.

## 10. Mobile layout / 375px check
- Local: `scrollWidth === innerWidth === 375` at every screen exercised (home,
  My Recipes empty/list/rename panel, preview, brew, history, detail). PASS.
- Public: no horizontal overflow (`scrollWidth === innerWidth`) at the narrowest
  achievable Chrome window (innerWidth 400). The exact 375 px assertion was verified
  on local, where the served CSS (`styles.css`) is identical to public. PASS WITH NOTE.

## 11. Console / errors
- Local: no console messages at warn/error level across the full session. PASS.
- Public: the only console entries were 5 identical exceptions —
  `A listener indicated an asynchronous response by returning true, but the message
  channel closed before a response was received` — emitted at `(…:0:0)` with no app
  stack frame. This is a well-known **Chrome-extension** messaging artifact (the app
  uses no `chrome.runtime` messaging in `app.js`), not an app error. No app-originated
  errors observed. PASS WITH NOTE.

## 12. Service worker / cache notes
- The app registers a cache-first service worker (`sw.js`, caches `pouro-app-v2`,
  `pouro-fonts-v2`). `sw.js` was **not** modified.
- **Local:** unregistered the SW and cleared its caches for the preview origin only, so
  QA exercised the current build rather than a cached one.
- **Public (important):** the public origin initially served a **stale cached build
  without My Recipes** — 3 service workers and 3 caches (including a legacy
  `pouro-gpt-pr-008b`). Unregistering all SWs + clearing all caches + a fresh reload
  loaded the current deployment (full PR-012E). This confirms the deployment is live and
  correct, but **first-time users on an old cached SW may need a refresh / cache clear**
  to see My Recipes. This is a UX observation for the team, **not** a blocker for this
  docs-only PR. No repository files were changed to address it.

## 13. Issues found
- **None blocking.** All My Recipes flows and History/Rebrew regression checks passed on
  both local and public.
- **Observation (non-blocking):** public visitors with a previously-installed cache-first
  service worker may load a stale pre-My-Recipes build until the SW updates / caches are
  cleared. Worth a future cache-busting / SW-update-prompt consideration. Out of scope
  for PR-012F (no `sw.js` change permitted here).
- **Note (non-blocking):** public console shows Chrome-extension `message channel closed`
  exceptions unrelated to the app.

## 14. Required fixes
- **None required before merging this docs-only QA PR.**
- Suggested (future, separate PR — not PR-012F): consider a service-worker update / cache
  invalidation strategy so public users pick up new builds without a manual cache clear.

## 15. Final recommendation
- My Recipes MVP (PR-012B → E) is verified working on **local preview** and on the
  **public GitHub Pages** deployment (which is built from the exact PR-012E merge commit).
- **No blocker found.** Recommendation: proceed to Independent Verification for PR-012F;
  if PASS, mark Ready for review and squash & merge. After merge, proceed to PR-013
  (Timer Ver.2.0 / Countdown Sequence UI) planning — still deferred, not started here.
