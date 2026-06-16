# PR-014B｜Finish / History Runtime Polish Handoff

## 1. Status

Runtime UI polish PR. Presentation / copy / hierarchy only. **No logic, routing,
schema, storage-key, or data-shape changes.** Implements the PR-014A contract for a
small Finish / Brew Log / History / Detail / Rebrew polish pass.

## 2. Branch / PR

- Branch: `pr-014b-finish-history-runtime-polish`
- PR: Draft — "PR-014B: Finish and History Runtime Polish" (NS-del346/Pouro-Fable5)
- Base: `main` @ `175721b` (PR-014A merged)

## 3. Commit

- Commit message: `PR-014B: polish Finish and History runtime UI`

## 4. Changed files

- `index.html` — Brew Log CTA bar (save helper + `または` split + clarified
  secondary hint); History Detail record-type tag + recipe-card label.
- `styles.css` — `.cta-bar-save-hint`, `.cta-bar-split`; History row readability
  (`.history-row` padding/active, `.history-row-name/-date/-meta`);
  `.detail-record-tag`.
- `app.js` — History list row template: class-based name/date/meta (presentation
  only; no logic).
- `docs/design/PR-014B_MEMORY_HANDOFF.md` — this handoff.

No changes to `sw.js`, `manifest.webmanifest`, `assets/*`, `docs/data/*`, or package
files. Untracked `.claude/launch.json` and `docs/PR-006A-VISUAL-PARITY-AUDIT.md`
left untouched.

## 5. Source of truth

- `docs/design/PR-014A_FINISH_HISTORY_POLISH_PLAN.md`
- `docs/design/PR-014A_MEMORY_HANDOFF.md`

Scope was held to PR-014A §7–§10 RECOMMENDED items only; DEFER / DO-NOT-CHANGE
items were not implemented.

## 6. What changed

- **Brew Log CTA hierarchy (`#screen-log`).** Added an explicit save helper under
  the primary `記録を保存`: `保存すると、この抽出が履歴に追加されます（この端末に
  保存）`. Added a quiet `または` split (`.cta-bar-split`) separating "record this
  brew" (Save) from "do the next brew" (`同じ条件でもう一度`). Clarified the
  secondary hint to `保存せずにプレビューへ戻ります（この記録は残りません）`, making
  the unsaved-navigation behavior of §7.2 explicit by copy (no new blocking
  confirm). Button ids `#btn-save-log` / `#btn-brew-again` unchanged.
- **History list readability (`#screen-history`).** Row method name / date / meta
  moved to classes (`.history-row-name`, `.history-row-date`, `.history-row-meta`).
  The brew-parameter meta line is now stronger (serif, weight 600, `--color-text-mid`)
  for scannability; the method name truncates with ellipsis (min-width:0 on flex
  parents) so long names never push the date/chevron off-screen. Added row padding
  and an `:active` tap highlight. Featured-card behavior unchanged.
- **History Detail (`#screen-detail`).** Added a quiet `履歴の記録` record-type pill
  (`.detail-record-tag`) at the top of the scroll, labelling the screen as a saved
  History record (distinct from a My Recipe preset). Relabelled the recipe-snapshot
  card header `レシピ` → `保存された抽出条件`. Rebrew CTA copy/behavior unchanged.

## 7. What did not change

- No `app.js` logic, routing, save, rebrew, or storage code.
- No RecipeEngine, recipe schedules, or recipe truth.
- No History schema, `schemaVersion`, or `pouroFable5.history.v1` key.
- No My Recipes schema or behavior; `pouroFable5.myRecipes.v1` key unchanged.
- No Timer Ver.2.0 UI/behavior; no `sw.js`; no `manifest.webmanifest`; no cache
  strategy; no `assets/*` or `docs/data/*`.

## 8. Finish / Brew Log behavior

- Timer Finish → Brew Log unchanged (`btn-brew-next` builds in-memory
  `brewResultDraft`; nothing auto-saved).
- Save to History is explicit (`#btn-save-log`) and writes exactly one entry
  (verified live: count 22 → 23 on save). Toast `履歴に保存しました`, then lands on
  History with the new record featured.
- `同じ条件でもう一度` (`#btn-brew-again` → `_applyCurrentBrewAgain`) routes to
  Preview without saving; handler untouched.

## 9. History list behavior

- Empty state, featured `history[0]` card, and `history.slice(1)` rows unchanged
  structurally; only typography / spacing / class names polished.
- Ice / `ratio === null` rows still render HOT/ICE meta; standard rows still render
  `{dose}g ｜ {water}ml`. Legacy/flat field fallbacks (`h.tags`, `h.rating`)
  preserved.
- Row tap → Detail unchanged.

## 10. History Detail / Rebrew behavior

- Render path unchanged; added presentation-only record-type pill and recipe-card
  relabel. All conditional cards (next-note / tags / memo / tips / equipment) render
  as before.
- `#btn-detail-rebrew` → `_applyRebrewEntry` → Preview (verified live: lands on
  `screen-preview`). Featured `#btn-hist-rebrew` path unchanged.

## 11. My Recipes relation

- Untouched. My Recipes remains a setup-preset store (method + 4 params, no brew
  result). `_applySelectedMyRecipe` → Preview, read-only. The new `履歴の記録` pill
  reinforces the record-vs-preset distinction at the presentation layer only.

## 12. Storage / schema status

- `pouroFable5.history.v1` key and `schemaVersion: 1` unchanged.
- `pouroFable5.myRecipes.v1` unchanged.
- No migration, no new fields. QA-created entry was removed; live History restored
  to the original 22 entries (ids verified identical); My Recipes remained `[]`.

## 13. Timer Ver.2.0 status

- Not touched. Target Total / Countdown hierarchy, non-auto-advance Countdown,
  This-Pour `+` sign, sequence/progress, Back / Pause-Resume / Next all unchanged.

## 14. Recipe truth status

- No recipe values changed. Live spot-check: 4:6 Detail steps render
  `60 / 60 / 90 / 90` (cumulative 60/120/210/300). `node docs/data/validate_tips_master.mjs`
  passes all method-truth checks (4:6, Hybrid Switch OPEN/CLOSED, Ice HOT/ICE, NEO
  `1:45` / `210g`).

## 15. QA results

Local preview at 375×667, service worker unregistered + caches cleared for local
preview only (`sw.js` not modified).

- App loads, Home renders; no console errors/warnings across the session.
- History list polish renders; featured card unchanged; no overflow.
- History Detail polish renders (`履歴の記録` pill, `保存された抽出条件` header);
  Rebrew CTA intact.
- Brew Log CTA polish renders (prominent Save, save helper, `または` split, calm
  secondary, clarified hint).
- Save writes exactly one entry; QA entry removed afterward (back to 22).
- Detail Rebrew routes to Preview.
- No horizontal overflow at 375px (`documentElement.scrollWidth == clientWidth == 375`).
- Validation: `node --check app.js` → OK; `node docs/data/validate_tips_master.mjs`
  → `PASS: 40  FAIL: 0  ALL CHECKS PASS`; forbidden-wording grep → none.

## 16. Issues found

- None blocking. (Pre-existing, out of scope: the live History fixture contains
  duplicate ids among the seeded `h_1781475498…` NEO entries; this is existing data,
  not introduced or modified by PR-014B, and is left untouched per scope.)

## 17. Required fixes

- None for this PR.

## 18. Next recommended step

Independent Verification for PR-014B. If PASS, mark Ready for review and Squash and
merge. Then run PR-014C local/public smoke QA if the visual changes are judged
substantial.
