# PR-011R6: History / Rebrew Entry Point Polish Planning

> **Type:** docs-only planning
> **Status:** Draft / pending Independent Verification
> **Branch:** `pr-011r6-history-rebrew-entry-planning`
> **Base:** `main` (`311a7fc` — PR-011R5B merged)

---

## 1. Purpose

Decide the safest, smallest next implementation PR for polishing the **existing**
History / Rebrew entry points **before** starting PR-012 / My Recipes.

This document inspects current runtime behavior and recommends a minimal next PR.
It introduces **no runtime changes**. It exists to:

- record exactly how History list, History Detail, and Rebrew currently behave;
- clarify the boundary between History-origin Rebrew, Finish-origin Same Setup, and
  the future My Recipes feature;
- compare candidate polish directions;
- recommend one small, safe implementation PR (`PR-011R6A`).

Strategic intent reminder: Pourō-Fable5 is an **extraction execution tool**, not a
recipe platform / database / community / analytics app. The History / Rebrew polish
must only support *repeating a previous successful brew*, *understanding what was
brewed*, and *returning to Preview safely* — reinforcing the MVP value:
**easier than video + paper notes + phone timer**.

---

## 2. Baseline

| Item | Value |
|------|-------|
| Latest merged PR | PR-011R5B (PR #42) — Finish Rebrew Flow Smoke QA |
| Merge commit | `311a7fc` |
| Timer phase | PR-011R4A / R4B / R4C — closed |
| Finish / Rebrew phase | PR-011R5 / R5A / R5B — closed |
| Next planned milestone | PR-012 / My Recipes (not started) |

Relevant runtime modules (read-only inspection; **not** modified by this PR):

| Concern | Location |
|---------|----------|
| History list rendering | `app.js` — `renderHistory()` (~L1884) |
| History Detail rendering | `app.js` — `renderDetail()` (~L1985) |
| History-origin Rebrew | `app.js` — `_applyRebrewEntry()` (~L2212) |
| Finish-origin Same Setup | `app.js` — `_applyCurrentBrewAgain()` (~L2234, PR-011R5A) |
| Preview rebrew banner | `app.js` — `renderPreview()` rebrew block (~L1770) |
| Save-to-history | `app.js` — `btn-save-log` handler (~L2492) |
| Rebrew CTAs (markup) | `index.html` — featured card (L672–682), Detail CTA bar (L820–826), Finish Same-Setup (L614–619), Preview pill (L275–281) |

---

## 3. Current History list behavior

`renderHistory()` (`app.js:1884`) renders the History tab in two parts:

### 3.1 Empty state
If `state.history` is empty, `#history-content` is hidden and `#history-empty`
(an illustration + prompt) is shown. No Rebrew affordance exists in the empty state.

### 3.2 Featured card (most recent entry = `history[0]`)
A prominent card showing:

- method icon (`methodImgHTML`, 40px), method name, method sub-label, date;
- a summary grid (`buildSummaryCols`) from the persisted `recipe` snapshot
  (or rebuilt via `RecipeEngine.build` if the snapshot has no steps);
- an optional tags row and an optional (single-line, ellipsized) note row;
- a **two-button footer** separated by a divider:
  - **「詳細を見る」** → `btn-hist-detail` → opens History Detail for `history[0]`;
  - **「もう一度淹れる」** → `btn-hist-rebrew` → calls `_applyRebrewEntry(history[0])`
    → routes directly to **Preview** (a quick rebrew of the latest brew, *without*
    opening Detail first).

Both footer buttons are flat text buttons of **equal visual weight** (same font
size 13.5px, same weight 700, same accent-dark color).

### 3.3 History list rows (`history.slice(1)` — everything except the featured entry)
Each older entry renders as a **read-only** `.history-row`:

- method icon (30px), method name, date;
- meta line: `{dose}g ｜ {water}ml` (or `{dose}g ｜ HOT {hot}g / ICE {ice}g`
  for Ice Brew / `ratio === null`);
- rating stars (filled to `log.rating`) or a dashed **「未評価」** pill;
- up to **2** tag chips;
- a trailing chevron `>`.

The **entire row is clickable** → sets `state.currentDetailId` → `renderDetail()` →
History Detail. **There is no per-row Rebrew button.** List rows are browse-only.

> **Key observation:** A quick Rebrew already exists today, but **only for the single
> most-recent entry**, via the featured card. Older entries can only be rebrewed by
> opening their Detail first.

---

## 4. Current History Detail behavior

`renderDetail()` (`app.js:1985`) resolves the entry by `state.currentDetailId`
(falling back to `history[0]`) and renders a full reflection surface:

- date label, method icon (38px), method name, method sub;
- rating stars (or 「未評価」);
- summary grid (`buildSummaryCols`) and full step list (`buildStepsHTML`) from the
  persisted recipe snapshot (or rebuilt via `RecipeEngine.build`);
- optional **next-adjustment note** card (`log.nextNote`);
- flavor / strength chips (only for methods with `hasFlavorStrength`);
- optional tags card; optional memo (note) card;
- contextual reflection TIPS (`selectHistoryDetailTips`, `displayContext:"historyDetail"`);
- equipment block: bean / grind / temperature / dripper / actual drawdown
  (each `—` when absent).

**CTA bar (bottom):** a **single primary button**
**「この記録でもう一度淹れる」** (`btn-detail-rebrew`), with the supporting hint
**「プレビューで確認してから開始します」**. This is the strongest, most
review-first Rebrew entry point in the app.

---

## 5. Current Rebrew behavior

### 5.1 Entry points → handler
Both History-origin entry points call the same helper `_applyRebrewEntry(entry)`:

- featured card 「もう一度淹れる」 (`btn-hist-rebrew`) → `_applyRebrewEntry(history[0])`;
- Detail 「この記録でもう一度淹れる」 (`btn-detail-rebrew`) →
  `_applyRebrewEntry(history.find(id === currentDetailId))`.

### 5.2 `_applyRebrewEntry(entry)` (`app.js:2212`)
Restores **app-defined** setup into the draft and routes to Preview:

```
state.selectedMethodId  = entry.methodId
state.draft.dose        = entry.dose
state.draft.ratio       = entry.ratio !== null ? entry.ratio : 15
state.draft.flavor      = entry.recipe?.flavor   || entry.flavor   || 'balanced'
state.draft.strength    = entry.recipe?.strength || entry.strength || 'standard'
state.draft.customRatio = false
state.rebrewFrom        = { id: entry.id, date: <formatted>, nextNote: <entry note> }
renderPreview(); showScreen('preview');
```

Key properties:

- **Routes to Preview, never the Timer.** The user reviews Preview and starts the
  Timer manually.
- Restores only **app-defined** parameters (method / dose / ratio / flavor /
  strength). It does **not** reconstruct a custom recipe definition — Preview rebuilds
  the schedule deterministically from these parameters.
- `customRatio` is reset to `false` (no stale custom-ratio flag).
- Writes **nothing** to `localStorage`; no history mutation; no schedule mutation.
- Carries `rebrewFrom` (history id + date + next-note) for the Preview banner.

### 5.3 Preview rebrew banner (`app.js:1770`)
On Preview, if `state.rebrewFrom` is set, `#rebrew-banner` is shown:

- **History-origin** (no `source:'finish'`): **「履歴から再現 ・ {date} の記録」**;
- **Finish-origin** (`source:'finish'`): **「同じ条件でもう一度」**.

If `rebrewFrom.nextNote` exists, the next-note card is shown so the user sees their
own “next time, adjust X” reminder before re-running. The default HTML text on the
pill is 「履歴から再現」 (replaced at render time).

`rebrewFrom` is cleared when a fresh brew is started normally (see `app.js:1632`).

---

## 6. Finish-origin same-setup behavior (PR-011R5A)

Distinct flow, **not** routed through History:

- Trigger: **「同じ条件でもう一度」** (`btn-brew-again`) on the Finish / Log screen,
  hint **「保存せずに、同じ条件の確認画面へ戻ります」**.
- Handler: `_applyCurrentBrewAgain()` (`app.js:2234`).
- Reads only **in-memory session** state (`activeRecipe` / `brewResultDraft` /
  `draft`). It does **not** read or write history, mutate schedules, or persist.
- **Guard:** if neither `activeRecipe` nor `brewResultDraft` exists, it fails safely
  to Home rather than guessing missing recipe data.
- Carries the typed next-adjustment note (`#log-next-note`) forward, and sets
  `state.rebrewFrom = { id: null, source: 'finish', date: '', nextNote }`.
- Routes to **Preview** (never Timer); **no auto-save** of the current brew.

> The two repeat flows are deliberately distinct: History Rebrew re-runs a **saved**
> entry; Finish Same Setup re-runs the **current in-memory** session. They converge
> only at Preview, where the banner wording disambiguates origin.

---

## 7. Rebrew vs My Recipes boundary

| | History Rebrew | Finish Same Setup | My Recipes (future, PR-012+) |
|---|---|---|---|
| Source | saved history entry | current in-memory session | user-authored recipe definition |
| Reads | `state.history[*]` (read-only) | `activeRecipe`/`brewResultDraft`/`draft` | a persistent recipe library |
| Restores | app-defined method / dose / ratio / flavor / strength | same, from memory | a saved, **editable** recipe |
| Persists | nothing | nothing | yes — recipe CRUD |
| Routes to | Preview | Preview | (TBD) |
| Custom recipe definition | **none** | **none** | **yes** |
| Recipe editing / library | **none** | **none** | **yes** |

**This planning PR and any `PR-011R6A` must not blur this line.** Rebrew is *replay of
app-defined parameters*. My Recipes is *user-authored, editable, persistent recipe
management*. Any plan that adds recipe creation, editing, a recipe library, or
persistent custom recipe storage is **PR-012, not PR-011R6A** — and must be rejected
here.

---

## 8. Candidate polish options

### Flow A — History list quick Rebrew (per-row action)
Add a small 「もう一度」 action to **each** list row → Preview.

- **Pros:** fastest repeat from the list; fewer taps for older entries.
- **Risks:** clutters the calm read-only list; raises accidental-rebrew risk;
  weakens History Detail’s review-before-repeat role; partially duplicates the
  featured card’s existing quick rebrew.

### Flow B — History Detail CTA hierarchy polish *(expected recommendation)*
Keep Detail as the primary Rebrew surface; refine the CTA’s clarity, wording
consistency, and visual hierarchy.

- **Pros:** safest; preserves *review before repeat*; preserves the Preview
  confirmation step; resolves current wording drift (see §9).
- **Risks:** one extra tap vs a list quick action (acceptable — it is the safe path).

### Flow C — History list visual clarity only
Leave rows read-only; make method / dose / date / notes clearer.

- **Pros:** low risk; better browsing.
- **Risks:** does little for the Rebrew *entry* itself.

### Flow D — Defer History polish; start PR-012
Skip History polish; begin My Recipes planning.

- **Pros:** moves toward the larger feature.
- **Risks:** starts My Recipes before the existing Rebrew / History flow is fully
  settled; higher regression surface.

---

## 9. Recommended minimal next PR

**`PR-011R6A: History Detail Rebrew CTA Polish` (Flow B).**

Rationale from inspection:

1. History Detail is already the strongest, most review-first Rebrew entry, with a
   correct Preview-first route and supporting hint. It is the right surface to make
   *clearer*, not to bypass.
2. There is **wording drift** across the three repeat CTAs that a small polish can
   harmonize:
   - featured card: **「もう一度淹れる」**
   - History Detail: **「この記録でもう一度淹れる」**
   - Finish Same Setup: **「同じ条件でもう一度」**
   A consistent, origin-clear vocabulary (history = “この記録で…”, finish =
   “同じ条件で…”) reduces ambiguity without changing behavior.
3. List rows are calm and read-only today — a desirable property. Adding per-row
   quick Rebrew (Flow A) would trade that calm for marginal speed and raise
   accidental-rebrew risk. **Do not do this yet.**

### Minimum implementation concept for `PR-011R6A` (future PR, not this one)
- Keep History Detail as the main Rebrew entry point.
- Make 「この記録でもう一度…」 visually consistent and unambiguous; align the
  featured-card and Detail wording vocabulary.
- Preserve the route to **Preview**, never Timer.
- Preserve the History schema and `localStorage` schema (no migration).
- Do **not** add quick Rebrew buttons to every History list row.
- Do **not** implement My Recipes.

### Explicit answers to the required questions
| Question | Answer |
|----------|--------|
| Expose Rebrew from list, Detail, or both? | Keep current: featured-card quick rebrew + Detail CTA. Do **not** add per-row list quick rebrew. |
| First polish: Detail CTA or list quick action? | **Detail CTA** (wording + hierarchy). |
| Rebrew enters Preview or Timer? | **Preview**, never Timer directly. |
| Should `PR-011R6A` change schema? | **No.** |
| Should `PR-011R6A` include My Recipes? | **No.** |

---

## 10. Out of scope

This planning PR changes **no** runtime files. The future `PR-011R6A` must also avoid:

- `app.js`, `index.html`, `styles.css`, `sw.js`, manifest behavior changes beyond a
  tightly-scoped Detail CTA wording / hierarchy polish;
- `docs/data/*`, package / build config;
- RecipeEngine and builders (`_buildYonRoku` / `_buildHybrid` / `_buildNeo`
  / `_buildIce`), recipe schedules, pour amounts, timings, `switchState`;
- History / History Detail data logic, Settings, Method Detail;
- `localStorage` / History schema (no migration);
- CSV / JSON export, import logic, PWA behavior.

Never (PR-012+ / out of program scope): My Recipes, custom recipe creation / editing /
library / persistent custom recipe storage, Dark Mode, Brew Log / Taste Tags
expansion, analytics, account / cloud / community, Bluetooth scale, TDS / water
quality, new recipe methods, additional Rebrew behavior, additional Finish UI changes.

Do not touch pre-existing untracked files: `.claude/launch.json`,
`docs/PR-006A-VISUAL-PARITY-AUDIT.md`.

---

## 11. Risks and regression cautions

Any future History Rebrew polish must preserve:

- **no direct Timer start** (always Preview-first);
- **no auto-save** of a brew on rebrew;
- **no recipe schedule mutation**;
- **no History schema migration**;
- **no `localStorage` schema migration**;
- **no custom recipe storage**;
- **no PR-012 / My Recipes dependency**;
- **no stale method / dose / recipe mismatch** (rebrew must restore a coherent set;
  `customRatio` stays reset to `false`).

If a saved history entry is incomplete:

- **fail safely** — return to History or Setup;
- **do not guess** missing recipe data. (The current `_applyRebrewEntry` relies on
  the persisted snapshot or a deterministic `RecipeEngine.build` from stored
  parameters; a polish PR must not weaken this and must not fabricate steps.)

Specific cautions:

- The featured-card quick rebrew (`history[0]`) bypasses Detail review. Wording
  polish should make its intent clear; do not silently turn it into a no-confirm
  Timer start.
- Keep the Preview banner’s origin disambiguation intact (`source:'finish'` vs
  history-origin) — it is the only place the two repeat flows are visually
  distinguished.

---

## 12. QA criteria for the next implementation PR (`PR-011R6A`)

When `PR-011R6A` is implemented, it must pass:

- `node --check app.js` → OK
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`
- Manual smoke (Preview screenshots):
  1. History Detail → Rebrew CTA routes to **Preview** (not Timer); banner reads
     「履歴から再現 ・ {date} の記録」.
  2. Featured-card quick rebrew routes to Preview with the same banner.
  3. Finish Same Setup still routes to Preview with banner 「同じ条件でもう一度」.
  4. No new per-row Rebrew buttons appear on the History list.
  5. No history entry is created or mutated by a rebrew.
  6. Incomplete / synthetic history entry → fails safely (no crash, no fabricated
     steps).
  7. CTA wording is consistent and origin-clear across the three surfaces.

---

## 13. Final recommendation

Proceed with a small, safe **`PR-011R6A: History Detail Rebrew CTA Polish`** (Flow B)
as the next implementation PR:

- **First polish the History Detail CTA** (wording consistency + hierarchy).
- **Do not** add History-list per-row quick Rebrew yet.
- **Rebrew enters Preview, never the Timer directly.**
- **No schema change.**
- **No My Recipes.**

Defer Flow A (list quick action) and Flow D (start PR-012) until the Detail-centric
Rebrew entry is confirmed stable. This keeps History calm, preserves
review-before-repeat, and keeps Pourō-Fable5 an extraction execution tool rather than
a recipe platform.
