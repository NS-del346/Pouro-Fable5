# PR-014A｜Finish / History Polish Handoff

## 1. Status

Docs-only planning PR. **No runtime code changed.** Defines the implementation
contract for a later PR-014B Finish / Brew Log / History runtime polish.

## 2. Branch / PR

- Branch: `pr-014a-finish-history-polish-plan`
- PR: Draft — "PR-014A: Finish and History Polish Plan" (NS-del346/Pouro-Fable5)
- Base: `main`

## 3. Commit

- Base: `main` @ `a7c9f62` (PR-013D merged)
- Commit message: `PR-014A: document Finish and History polish plan`

## 4. Changed files

- `docs/design/PR-014A_FINISH_HISTORY_POLISH_PLAN.md` (new)
- `docs/design/PR-014A_MEMORY_HANDOFF.md` (new)

No runtime files (`app.js`, `index.html`, `styles.css`, `sw.js`,
`manifest.webmanifest`, `assets/*`, `docs/data/*`) changed.

## 5. Source of truth

- `index.html` — `#screen-log` (577–699), `#screen-history` (705–780), `#screen-detail` (786–911)
- `app.js` — Finish (`btn-brew-next`, 3042–3080), `renderLog` (2366+),
  save (`btn-save-log`, 3111–3158), `_applyCurrentBrewAgain` (2800–2835),
  `renderHistory` (2423–2521), `renderDetail` (2524–2600),
  `_applyRebrewEntry` (2751–2767), `_applySelectedMyRecipe` (2775–2793),
  Preview origin pill (2238–2264)

## 6. What changed

- Added a full planning/spec doc covering current Finish / Brew Log / Save /
  Finish-same-setup / History list / History Detail / Rebrew / My Recipes flows,
  the History schema, UX issues, low-risk polish opportunities, deferred items, a
  recommended PR-014B scope + out-of-scope, regression and recipe-truth
  constraints, mobile 375px requirements, accessibility/copy rules, a QA checklist,
  open questions, and a final recommendation.
- Added this memory handoff.

## 7. What did not change

- No `app.js` / `index.html` / `styles.css` / `sw.js` / `manifest.webmanifest`.
- No RecipeEngine, recipe schedules, or recipe truth.
- No History schema, `schemaVersion`, or `pouroFable5.history.v1` key.
- No My Recipes schema or behavior.
- No Timer Ver.2.0 UI/behavior; no service worker; no manifest/PWA; no cache strategy.

## 8. Current flow summary

- **Finish / Brew Log:** Timer final step builds in-memory `brewResultDraft` (not
  saved) and opens `#screen-log` (recap, rating, taste, equipment, memo,
  next-note) with two CTAs.
- **Save to History:** `#btn-save-log` builds the `pouroFable5.history.v1` entry,
  `unshift`s it, writes, toasts, then lands on History. Explicit; never auto-saved.
- **Finish Same Setup:** `#btn-brew-again` → `_applyCurrentBrewAgain` → Preview
  (`同じ条件でもう一度` pill), in-memory only, no History write, no Timer start.
- **History list:** `renderHistory` — empty state, featured `history[0]` card
  (詳細を見る / もう一度淹れる), and `history.slice(1)` rows (method, date, meta,
  rating, ≤2 tags). Ice rows show HOT/ICE.
- **History Detail:** `renderDetail` — entry card, optional next-note, recipe
  snapshot, steps timeline, tags, memo, reflection TIPS, equipment.
- **History Rebrew:** featured `#btn-hist-rebrew` and Detail `#btn-detail-rebrew`
  both → `_applyRebrewEntry` → Preview (`履歴から再現 ・ {date}` pill), never Timer.
- **My Recipes relation:** setup-preset store (method + 4 params, no result);
  `_applySelectedMyRecipe` → Preview (`マイレシピから読み込み` pill), read-only.

## 9. Recommended PR-014B scope

Small, schema-safe, presentation-only:

- Brew Log: clearer recap; stronger primary `記録を保存` with explicit
  "writes History" copy; calmer secondary `同じ条件でもう一度`; separate
  result-input from next-action.
- History list: stronger method/date summary; scannable parameters; clearer
  featured Rebrew CTA; spacing/typography only.
- History Detail: clearer recipe-parameter labelling; clearer result/memo/taste/
  next grouping; clearer Rebrew CTA; quiet record-vs-preset label.
- Likely files: `index.html` + `styles.css`, with at most light `app.js`
  copy/label changes (no logic, routing, schema, or data-shape changes).

## 10. PR-014B out of scope

New History fields / schema / key / migrations; new Brew Log fields; My Recipes
changes; filters/search/sort; charts/analytics; taste-scoring overhaul;
export/import changes; bean inventory; cloud sync; accounts; RecipeEngine / recipe
schedule / recipe-truth changes; Timer Ver.2.0 changes; service worker; manifest/PWA.

## 11. Regression constraints

Preserve Timer Ver.2.0 UI, Target Total / Countdown hierarchy, non-auto-advance
Countdown, RecipeEngine, recipe schedules, History schema + `schemaVersion` +
`pouroFable5.history.v1` key, My Recipes schema/behavior, service worker, manifest,
public cache strategy. History behavior stays: no Timer auto-save; explicit Save;
History Rebrew / Finish Same Setup / My Recipe select all route to **Preview**,
never directly to Timer.

## 12. Recipe truth constraints

4:6 `60/60/90/90` (no `48/72`/`72/48` regression for balanced/basic); Hybrid Switch
OPEN/CLOSED text visible, no fixed room-temp water, no fixed `20°C`/`20℃`; Ice
HOT/ICE context preserved; NEO 10-pour `1:45` / `210g` preserved.

## 13. Known ambiguities

1. Whether `同じ条件でもう一度` should warn on unsaved Brew Log input (today
   `#btn-brew-again` does not, while `#btn-log-close` does). Recommended: copy
   clarification, not a new blocking confirm.
2. How explicit the History-record vs My-Recipe-preset distinction should be.
3. Whether to show calm "未記入" hints for blank Detail result sections.
4. Featured card always mirrors `history[0]`; changing that is a deferred
   navigation feature.

## 14. Next recommended step

Independent Verification for PR-014A. If PASS, merge PR-014A. Then proceed to
PR-014B Finish / History runtime polish.
