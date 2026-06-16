# PR-014A｜Finish / Brew Log / History Polish Plan

> Docs-only planning PR. No runtime code is changed here. This document inspects
> the current Finish / Brew Log / History / Rebrew / My Recipes flows and defines
> the implementation contract for a later **PR-014B** runtime polish pass.

---

## 1. Status

- **Type:** docs-only planning / spec PR
- **Branch:** `pr-014a-finish-history-polish-plan`
- **Base:** `main` @ `a7c9f62` (PR-013D merged)
- **Runtime files changed:** none
- **Implementation:** deferred to PR-014B

This PR decides *what PR-014B should implement*; it does not implement it.

---

## 2. Baseline

| Area | State |
| --- | --- |
| My Recipes MVP | complete |
| Timer Ver.2.0 | complete (implementation + local/public QA) |
| Timer hidden-context cleanup | complete (PR-013D, merge `a7c9f62`) |
| History schema | `pouroFable5.history.v1`, `schemaVersion: 1` |
| My Recipes schema | `pouroFable5.myRecipes.v1` |
| Settings schema | `pouroFable5.settings.v1` |

Inspected source of truth:

- `index.html` — `#screen-log` (577–699), `#screen-history` (705–780), `#screen-detail` (786–911)
- `app.js` — Finish handler (`btn-brew-next`, 3042–3080), `renderLog` (2366+), save handler (`btn-save-log`, 3111–3158), `_applyCurrentBrewAgain` (2800–2835), `renderHistory` (2423–2521), `renderDetail` (2524–2600), `_applyRebrewEntry` (2751–2767), `_applySelectedMyRecipe` (2775–2793), Preview origin pill (2238–2264)

All section/line references below are to these files at the PR-014A base commit.

---

## 3. Current Finish / Brew Log flow

**Transition (Timer → Brew Log).** On the final Timer step, `btn-brew-next`
(app.js:3052) calls `stopTimer()`, sets `t.isFinished = true` and
`t.finishedAtWall`, then builds an **in-memory only** `state.brewResultDraft`
(methodId, method, dose, ratio, totalWater, hotWater, ice, steps, elapsedSec,
startedAt, finishedAt, completedAt). It then `clearLogEquipmentInputs()`,
`renderLog()`, and `showScreen('log')`.

> **NOTE** `brewResultDraft` is a session draft. Nothing is written to History at
> Finish — saving is a later, explicit user action.

**Brew Log screen `#screen-log`** (top → bottom):

1. **Header** — close button `#btn-log-close` (X icon, `aria-label="記録せず閉じる"`), title `抽出記録`, method sub-label.
2. **Method recap card** — method icon, name, sub, `#log-summary-grid` (dose / water / ratio columns).
3. **Contextual finish TIPS** `#finish-tips` — hidden when the method has none.
4. **評価 (rating)** — 5 tap dots `#log-rating-dots`; label shows `n / 5 ・ {RATING_LABEL}` or `未評価（タップで設定）`.
5. **テイスト (taste tags)** `#log-taste-tags`.
6. **抽出の詳細 (equipment)** — 豆 / 挽き目 / 湯温 / ドリッパー / 落ちきり text inputs.
7. **メモ** `#log-memo` (free text).
8. **次回の調整** `#log-next-note` (free text).

**CTA bar** (index.html:686–698):

- Primary `#btn-save-log` — `記録を保存` (arrow icon).
- Secondary `#btn-brew-again` — `同じ条件でもう一度` (refresh icon).
- Hint line — `保存せずに、同じ条件の確認画面へ戻ります`.

**Save to History (`#btn-save-log`, app.js:3111–3158).** Builds the History
`entry` (see §9), `state.history.unshift(entry)`, `safeWriteHistory(...)`. On
success: toast `履歴に保存しました`, then after ~600ms `renderHistory()` +
`showScreen('history')`. On failure: toast about device storage capacity. Save is
explicit and writes History; the Timer never auto-saves.

**Finish Same Setup (`#btn-brew-again` → `_applyCurrentBrewAgain`, app.js:2800).**
Reads only in-memory `activeRecipe` / `brewResultDraft` / `draft`. Does **not**
read or write History. Restores method + dose/ratio/flavor/strength, sets
`state.rebrewFrom = { id:null, source:'finish', date:'', nextNote }` (carrying the
typed 次回の調整 note), `recipeFrom = null`, then `renderPreview()` +
`showScreen('preview')`. Routes to **Preview, not Timer**.

**Close without saving (`#btn-log-close`, app.js:3086).** If `_logHasInput()` is
true it shows a confirm sheet (`記録せずに閉じますか？`); otherwise goes straight Home.

---

## 4. Current History list flow

`renderHistory()` (app.js:2423):

- **Empty state** `#history-empty` — when `state.history` is empty: method glyph,
  `記録はまだありません`, `一杯淹れて、最初の記録を残しましょう`.
- **Featured card** (`history[0]`) — icon, method name, sub, date; `#hist-feat-summary`
  grid; optional テイスト tags row; optional `前回のメモ` note row (single-line,
  ellipsised). Footer has two split actions:
  - `#btn-hist-detail` — `詳細を見る` → opens Detail for `history[0]`.
  - `#btn-hist-rebrew` — `もう一度淹れる` → `_applyRebrewEntry(history[0])`.
- **History list** `#history-list` — `history.slice(1)` rows. Each row:
  - method icon, method name + date,
  - meta line: standard methods `{dose}g ｜ {water}ml`; Ice / `ratio === null`
    show `{dose}g ｜ HOT {hotWater}g / ICE {ice}g` (fallback `Ice Brew`),
  - rating stars or a dashed `未評価` badge,
  - up to **2** taste tags,
  - chevron.
  - Row tap → set `currentDetailId`, `renderDetail()`, `showScreen('detail')`.

> **NOTE** The featured card and list rows are separate render paths with
> different metadata density: the featured card shows full summary columns + note,
> rows show a compact single meta line. This is the main list-readability surface.

---

## 5. Current History Detail / Rebrew flow

`renderDetail()` (app.js:2524), `#screen-detail`:

1. **Header** — back `#btn-detail-back` → History; title `記録の詳細`; date sub.
2. **Entry card** — icon, name, sub, rating stars (or `未評価`).
3. **次回の調整 card** `#detail-next-note-card` — shown only when `nextNote` exists.
4. **レシピ snapshot** — flavor/strength chips (methods with `hasFlavorStrength`) + summary grid.
5. **抽出ステップ** — full steps timeline from the saved recipe snapshot.
6. **テイスト card** — shown when tags exist.
7. **メモ card** — shown when a note exists.
8. **Contextual reflection TIPS** `#detail-tips`.
9. **Equipment card** — 豆 / 挽き目 / 湯温 / ドリッパー / 落ちきり (from `entry.log`).

**Rebrew CTA bar** (index.html:903–910): label `次の一杯`, primary
`#btn-detail-rebrew` `この記録でもう一度淹れる`, hint
`保存時の条件をプレビューで確認してから開始します。`

**Rebrew behavior (`_applyRebrewEntry`, app.js:2751).** Restores method +
dose/ratio/flavor/strength from the entry (recipe snapshot preferred, rebuild
fallback), sets `state.rebrewFrom = { id, date, nextNote }`, `recipeFrom = null`,
then `renderPreview()` + `showScreen('preview')`. Routes to **Preview, not Timer**.
Both the featured `#btn-hist-rebrew` and Detail `#btn-detail-rebrew` use this path.

---

## 6. Current My Recipes relation

My Recipes (`pouroFable5.myRecipes.v1`) is a **setup-preset store**: method +
the four tuning parameters (dose, ratio, flavor, strength). It carries **no** brew
result, rating, tags, memo, or timing — that is what distinguishes it from History.

- **Save as My Recipe** lives on **Preview** (`handleSaveMyRecipe`, app.js:2324),
  a quiet secondary action separate from the Brew Log `記録を保存` History save.
- **Select a My Recipe** (`_applySelectedMyRecipe`, app.js:2775) restores the
  preset, sets `state.recipeFrom = { source:'myRecipe', id, name }`,
  `rebrewFrom = null`, then routes to **Preview, not Timer**. Strictly read-only.

**Preview origin pill** (app.js:2238–2264) is the shared affordance that
differentiates origins:

| Origin | `state` flag | Pill text | Next-note card |
| --- | --- | --- | --- |
| My Recipe select | `recipeFrom.source==='myRecipe'` | `マイレシピから読み込み` | hidden |
| Finish same setup | `rebrewFrom.source==='finish'` | `同じ条件でもう一度` | shown if note |
| History rebrew | `rebrewFrom` (history) | `履歴から再現 ・ {date} の記録` | shown if note |
| Fresh setup | neither | hidden | hidden |

> **NOTE** All three replay origins (History rebrew, Finish same setup, My Recipe
> select) converge on Preview and require an explicit Start on the Timer. None
> auto-starts the Timer. This invariant must be preserved by PR-014B.

---

## 7. UX issues found

Findings only — **PR-014A does not fix anything**. Each item is labelled for PR-014B.

1. **`RECOMMENDED`** — On Brew Log, the primary `記録を保存` and the secondary
   `同じ条件でもう一度` sit in the same CTA bar with similar visual weight; the
   "saving writes History" relationship is implied by copy, not made explicit. The
   primary save CTA could be visually stronger / clearer about its outcome.
2. **`NOTE`** — `#btn-brew-again` (Finish same setup) does **not** show the unsaved
   confirm sheet that `#btn-log-close` shows, even though it also leaves the Brew
   Log without saving. The hint says `保存せずに…` but a user with a filled-in
   rating/memo/next-note can navigate away silently. Decide in PR-014B whether to
   surface this (copy-only clarification preferred over a new confirm, to avoid
   adding friction to a deliberate "repeat now" action).
3. **`RECOMMENDED`** — History list rows compress a lot into one meta line
   (`dose ｜ water`, rating, 2 tags). Method + date scannability and brew-parameter
   readability can be improved with spacing/typography only.
4. **`RECOMMENDED`** — The featured card and list rows present the same record type
   with different density and labelling, which can read as two different things.
   Tightening their visual relationship (without merging the render paths) helps.
5. **`RECOMMENDED`** — History Detail and the (Preview) My Recipe surfaces both
   show "recipe parameters"; the **distinction** (a *recorded brew* vs a *saved
   setup preset*) is not labelled. A quiet section/label clarification helps users
   understand what they are looking at and what Rebrew will do.
6. **`NOTE`** — Detail's result sections (rating / テイスト / メモ / 次回の調整) are
   each conditionally shown, so a sparse record can look empty with no indication
   that fields were intentionally left blank. Consider calm empty hints (copy only).
7. **`DEFER`** — There is no list-level filter/search/sort, and the featured card
   always tracks `history[0]`. Adding navigation/filtering is **out of scope** and
   deferred (see §9).

---

## 8. Low-risk polish opportunities

All achievable **without** schema, storage-key, or data-shape changes — spacing,
typography, copy, CTA hierarchy, and conditional empty-hint copy only.

**Brew Log / Finish — `RECOMMENDED`:**

- Clearer completion summary at the top of `#screen-log` (calmer recap framing).
- Strengthen `記録を保存` as the primary CTA; make the "saving writes History"
  outcome explicit via copy near the button.
- Visually calm the secondary `同じ条件でもう一度`, and separate "record this brew"
  from "do the next brew" intent within the existing CTA bar.

**History list — `RECOMMENDED`:**

- Stronger method + date summary per row; easier-to-scan brew parameters.
- Clearer Rebrew affordance on the featured card.
- Confirm/keep the existing empty state; refine its copy/spacing only if needed.
- Spacing / typography refinements only.

**History Detail — `RECOMMENDED`:**

- Clearer labelling of the saved recipe parameters (it is a *record*, not a preset).
- Clearer grouping of result / memo / taste / next-adjustment sections.
- Clearer Rebrew CTA and its "confirm in Preview first" framing (copy already
  present; reinforce rather than replace).
- A quiet label distinguishing a History record from a My Recipe preset.

---

## 9. Items requiring schema change or later PR

These are **`DEFER`** — explicitly out of scope for PR-014B because they would
touch the History schema, storage key, or data shape, or expand the product.

- Adding any new saved field to the History `entry` (e.g. new structured taste,
  scores, water-temperature-as-number, dripper enum).
- Changing `schemaVersion`, the `entry` shape, or the `pouroFable5.history.v1` key.
- Any storage migration / backfill.
- New My Recipes fields or behavior.
- History list filter / search / sort / pagination; multi-record featured slot.
- Charts, analytics, taste scoring overhaul, bean inventory, cloud sync, accounts.
- Export/import format changes (current JSON/CSV export stays as-is).

**Current History `pouroFable5.history.v1` `entry` shape (DO NOT CHANGE in PR-014B):**

```text
entry = {
  schemaVersion: 1,
  id, createdAt, completedAt,
  methodId, methodName, dose, ratio,
  recipe: { …full recipe snapshot: steps[], totalWater, hotWater, ice, flavor, strength, … },
  brew:   { elapsedSec, startedAt, finishedAt },
  log:    { rating, tags[], note, nextNote, actualDrawdown, bean, grind, temperature, equipment },
}
```

Rendering already tolerates legacy/flat fallbacks (`h.tags`, `h.note`, `h.rating`,
`entry.equip`, `feat.date`). PR-014B must preserve these fallbacks.

---

## 10. Recommended PR-014B scope

A **small, schema-safe, presentation-only** set:

- **`RECOMMENDED`** Brew Log: clearer completion recap; stronger primary
  `記録を保存`; explicit "saving writes History" copy; calmer secondary
  `同じ条件でもう一度`; clearer separation of result-input vs next-action.
- **`RECOMMENDED`** History list: stronger method/date summary; easier-to-scan
  parameters; clearer featured Rebrew CTA; spacing/typography only.
- **`RECOMMENDED`** History Detail: clearer recipe-parameter labelling; clearer
  result/memo/taste/next grouping; clearer Rebrew CTA; quiet record-vs-preset label.
- **`RECOMMENDED`** Copy clarifying the unsaved-navigation behavior of
  `同じ条件でもう一度` (issue §7.2) — copy/affordance, not a new blocking confirm
  unless QA shows it is needed.

PR-014B should be implementable by editing **`index.html` + `styles.css`** with at
most light, additive **`app.js`** copy/label changes — no logic, routing, schema,
or data-shape changes.

---

## 11. PR-014B out of scope

**`DO NOT CHANGE` / `DEFER`:**

- New saved History fields; History schema/key/`schemaVersion` changes; migrations.
- New Brew Log fields (beyond labels/copy on existing fields).
- My Recipes schema or behavior changes.
- Filters / search / sort; charts / analytics; taste-scoring overhaul.
- Export/import changes; bean inventory; cloud sync; accounts.
- RecipeEngine, recipe schedules, recipe truth (see §14).
- Timer Ver.2.0 UI/behavior; service worker; manifest / PWA; public cache strategy.

If a bug is found during PR-014B, **document it; do not expand scope to fix it**
unless it is a direct regression caused by the polish itself.

---

## 12. Runtime files likely affected by PR-014B

| File | Expected change | Risk |
| --- | --- | --- |
| `index.html` | `#screen-log`, `#screen-history`, `#screen-detail` markup/copy/CTA | medium |
| `styles.css` | spacing, typography, CTA hierarchy, row layout | medium |
| `app.js` | label/copy text only (e.g. CTA strings, empty hints); **no logic** | low |
| `sw.js` | none | — |
| `manifest.webmanifest` | none | — |
| `assets/*`, `docs/data/*` | none | — |

> If PR-014B finds it *needs* `app.js` logic, routing, or schema changes to land a
> polish item, that item should be **dropped or re-scoped**, not forced in.

---

## 13. Regression constraints

PR-014B **must preserve**:

- Timer Ver.2.0 UI; Target Total / Countdown hierarchy; Countdown does **not**
  auto-advance.
- RecipeEngine; recipe schedules; recipe truth (§14).
- History schema, `schemaVersion`, and `pouroFable5.history.v1` storage key.
- My Recipes schema and behavior; `pouroFable5.myRecipes.v1` key.
- Service worker; manifest; public cache strategy.

History/replay behavior **must remain**:

- Timer does **not** auto-save History; Save to History is **explicit**.
- History Detail Rebrew routes to **Preview**, not directly to Timer.
- Finish Same Setup routes to **Preview**, not directly to Timer.
- My Recipes select routes to **Preview**, not directly to Timer.
- Preview origin pill correctly distinguishes My Recipe / Finish / History origins.

---

## 14. Recipe truth constraints

PR-014B must **not** propose or make recipe changes. Preserve:

- **4:6** — `60/60/90/90` baseline where applicable; **no** regression to old
  `48/72` or `72/48` for balanced/basic.
- **Hybrid** — Switch OPEN/CLOSED text remains visible; **no** fixed room-temp
  water amount; **no** fixed `20°C` / `20℃`.
- **Ice** — HOT/ICE context preserved; hot-water / ice context unchanged.
- **NEO** — 10-pour rhythm; `1:45` / `210g` preserved.

These are display/record surfaces only; the underlying schedules are owned by
RecipeEngine and are **`DO NOT CHANGE`**.

---

## 15. Mobile 375px requirements

- Target a 375px viewport (current screens use ~18px horizontal padding).
- Featured-card footer (`詳細を見る` / `もう一度淹れる`) must stay a stable
  two-button split with no text wrapping/overflow at 375px.
- History rows (`.history-row`) must keep `min-width:0` flex behavior so long
  method names / meta lines truncate instead of pushing the chevron off-screen.
- Detail CTA bar (`次の一杯` + `この記録でもう一度淹れる`) must not overlap the
  scroll content or the tab bar.
- Any new copy must fit one line where the current design uses one line, or wrap
  gracefully without clipping.
- Verify rating stars, tag chips, and the meta line do not collide on narrow rows.

---

## 16. Accessibility / copy requirements

- Preserve existing `aria-label`s (e.g. `#btn-log-close` `記録せず閉じる`) and add
  labels for any new icon-only controls.
- Keep tap targets ≥ ~44–48px (current CTAs and featured footer buttons comply).
- Maintain text contrast on muted/surface backgrounds when adjusting typography.
- **Copy must stay calm and non-overclaiming.** Allowed vocabulary: 保存 / 履歴 /
  再現 / 同じ条件でもう一度 / プレビューで確認 / 履歴から再現 / マイレシピ /
  非公式 / unofficial / implementation plan / polish plan.
- **Forbidden** (do not introduce, anywhere): `complete reproduction`,
  `supervised`, `certified`, `公式完全再現`, `完全再現`, `絶対に失敗しない`,
  `世界チャンピオンの味`, `公式レシピ`, `正解レシピ`, `プロ監修`.

---

## 17. QA checklist for PR-014B

Functional (must all hold after polish):

1. Finish a brew → Brew Log opens with the recap, rating, tags, equipment, memo,
   next-note, and both CTAs.
2. `記録を保存` writes a History entry, toasts success, and lands on History with
   the new record featured.
3. Re-open the saved record in Detail; all entered fields (rating, tags, memo,
   next-note, equipment) render correctly.
4. `同じ条件でもう一度` routes to **Preview** with the `同じ条件でもう一度` pill and
   carries the next-note; it does **not** write History or start the Timer.
5. Featured `もう一度淹れる` and Detail `この記録でもう一度淹れる` both route to
   **Preview** (`履歴から再現 ・ {date}` pill) and do **not** start the Timer.
6. My Recipe select routes to **Preview** (`マイレシピから読み込み` pill), read-only.
7. Empty History shows the empty state; first save replaces it with content.
8. Ice record shows HOT/ICE meta in the list and Detail; non-Ice shows water ml.
9. Clear History still empties the list and updates the Settings count.
10. JSON/CSV export still produces the same columns/shape (unchanged).

Regression / truth:

11. Timer Ver.2.0 UI, Target Total / Countdown hierarchy, and non-auto-advance
    Countdown unchanged.
12. 4:6 `60/60/90/90`; Hybrid Switch OPEN/CLOSED visible, no fixed room-temp/20℃;
    Ice HOT/ICE; NEO 10-pour `1:45` / `210g` — all unchanged.
13. `pouroFable5.history.v1` key and `schemaVersion: 1` unchanged; legacy/flat
    field fallbacks still render.
14. `node --check app.js` → OK.
15. `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`.

Mobile:

16. 375px: featured footer split, history rows, and Detail CTA bar render with no
    overflow, wrapping, or overlap.

---

## 18. Open questions / ambiguities

1. **Same-setup unsaved navigation (§7.2).** Should `同じ条件でもう一度` warn when
   the Brew Log has unsaved input, or is silent navigation intended for a
   deliberate "repeat now" action? Recommended default: clarify with copy, no new
   blocking confirm, unless QA shows confusion.
2. **Record-vs-preset labelling.** How explicit should the History-vs-My-Recipe
   distinction be — a small section label, or left to context? Recommended:
   minimal quiet label, consistent with the "research notebook" tone.
3. **Empty result sections in Detail (§7.6).** Show calm "未記入" hints for blank
   rating/memo/taste, or keep them hidden? Recommended: hidden by default; only add
   a hint if user testing shows the record reads as broken.
4. **Featured card identity.** It always mirrors `history[0]`; PR-014B keeps this.
   Any change to which record is featured is **`DEFER`** (navigation feature).

These are for the human owner / PR-014B author to resolve; none blocks PR-014A.

---

## 19. Final recommendation

Proceed with a **small, presentation-only PR-014B** limited to Brew Log CTA
hierarchy + copy, History list readability, and History Detail labelling/grouping,
edited primarily in `index.html` + `styles.css` with at most light `app.js`
copy/label changes. Preserve every constraint in §13–§16 and verify against §17.

`DEFER` all schema, storage-key, field, filter/search, analytics, and product-
expansion work. `DO NOT CHANGE` Timer Ver.2.0, RecipeEngine, recipe truth, History
schema/key, My Recipes, service worker, manifest, or the public cache strategy.

The post-brew experience should read like a **quiet research notebook**: a clear
next action after a brew, easy to save without confusion, easy to understand what
was saved, and easy to rebrew from History — with no analytics dashboard, no heavy
data app, and no social/feed behavior.

**Next recommended step:** Independent Verification for PR-014A. If PASS, merge
PR-014A, then proceed to PR-014B Finish / History runtime polish.
