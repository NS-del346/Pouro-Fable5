# PR-011R3C｜Method Detail / Recipe Detail Planning｜Pouro-Fable5

> Status: **Planning doc only (docs-only PR)**
> This document defines the implementation plan for a future **Method Detail /
> Recipe Detail** surface. It does **not** implement any UI, does **not** import
> the POINT/TIPS Master v2.1 JSON into runtime code, and does **not** change any
> app behavior. It builds on the merged PR-011R1 data foundation, the PR-011R2
> information architecture, and the PR-011R3A/R3B contextual-tips integration,
> and it must not modify any of them.

---

## 1. Purpose

PR-011R3C produces the implementation plan for a dedicated **Method Detail /
Recipe Detail** reference surface — the one display surface defined in PR-011R2
that has **not yet** received any runtime/UI integration.

Current POINT/TIPS integration status (baseline for this PR):

```text
- Recipe Setup:                integrated   (PR-011R3A)
- Preview:                     integrated   (PR-011R3A)
- Finish / Brew Complete:      integrated   (PR-011R3B)
- Timer:                       not started  (waits for PR-011R4 semantics audit)
- History Detail:              not started
- Method Detail / Recipe Detail: not started   <-- planned here
```

This doc answers, for the Method Detail / Recipe Detail surface only:

- What Method Detail / Recipe Detail **should** show.
- What it **must not** show or become.
- Which POINT/TIPS Master v2.1 **fields** may be used, and how.
- Which **`displayContext`** values are relevant, and the safe fallback when no
  dedicated `methodDetail` context exists in the data.
- How **source / verification** information may be summarized safely.
- How **quarantine / `P-OTHER-001` / `HYB_DEVIL` / raw metadata** are excluded.
- How Method Detail **differs** from Setup / Preview / Finish / History Detail /
  Timer.
- What the **future implementation PR** should and should not touch.

This is a planning PR, not a UI implementation PR. It produces a deterministic,
safe blueprint that a future implementation PR can follow without re-deriving
recipe facts, re-litigating IA decisions, or risking regressions.

---

## 2. Source of truth

This document does not invent recipe facts, POINT/TIPS content, or schema. Every
value, caution, and policy is carried from the following already-merged,
read-only documents and data files:

```text
docs/data/coffee_app_tips_master_v2.1.json
docs/data/coffee_app_tips_master_v2.1_audit.csv
docs/data/validate_tips_master.mjs

docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md
docs/design/PR-011R1_MEMORY_HANDOFF.md

docs/design/PR-011R2_RECIPE_METHOD_DETAIL_INFORMATION_ARCHITECTURE.md
docs/design/PR-011R2_MEMORY_HANDOFF.md

docs/design/PR-011R3A_MEMORY_HANDOFF.md
docs/design/PR-011R3B_MEMORY_HANDOFF.md

docs/design/FIX_406_OFFICIAL_RECIPE_ALIGNMENT_HANDOFF.md
```

The 4:6 Method runtime behavior baseline is **PR #16**
(`fix-406-official-recipe-alignment`). This plan must not reintroduce any
pre-#16 incorrect value.

If a detail is not present in the source documents or v2.1 data, it is marked
`needs_review` here and left for a future research / verification PR. It is never
fabricated.

### 2.1 Observed v2.1 data facts (read-only inspection)

Inspection of `coffee_app_tips_master_v2.1.json` at this PR's baseline:

```text
- items: 39 adoptable + 1 quarantine  (40 total feeds the 40-check validator)
- item keys: id, type, scope, recipeCode, category, displayContext,
             contentJa, contentShortJa, whyJa, source,
             verificationLevel, confidence, appAdoption, notes
- displayContext is an ARRAY; distinct values present:
    setup (6), preview (14), timer (16), finish (5),
    historyDetail (17), quarantine (1)
- recipeCode distribution: 406 (5), ALL (4), HYB_BASE (3), HYB_DEVIL (6),
    HYB_NEW (6), ICE (7), NEO (7), OTHER (1)
- appAdoption: adoptable (38) + quarantine (1)   [+1 reference item]
- verificationLevel: primary_transcript_confirmed (32),
    primary_visual_confirmed (4), researched_summary (2), needs_review (1)
- confidence: high (36), medium (3)
```

> **Key data fact:** v2.1 contains **no** dedicated `methodDetail` or
> `recipeDetail` `displayContext` value. The Method Detail surface must therefore
> **aggregate** from existing contexts under the strict fallback rules in §8.
> This PR does **not** add a new `displayContext` value to the data.

---

## 3. Non-goals

PR-011R3C does **not**:

- Implement Method Detail UI or Recipe Detail UI.
- Implement Recipe Detail rendering, a Method Detail-specific selector, or any
  contextual POINT/TIPS rendering on this or any other surface.
- Import or consume `coffee_app_tips_master_v2.1.json` in runtime app code.
- Add a `methodDetail` / `recipeDetail` `displayContext` value, a `priority`
  field, or any other field to the data.
- Start History Detail POINT/TIPS integration.
- Start Timer POINT/TIPS integration.
- Start the PR-011R4 timer semantics audit.
- Change recipe schedules, RecipeEngine, or `_buildYonRoku`.
- Change the PR #16 4:6 Method behavior or any ICE / HYB_* / NEO behavior.

It does **not** modify any of:

```text
app.js  index.html  styles.css  src/  public/
RecipeEngine  _buildYonRoku
Timer logic / Timer semantics
Recipe Setup / Preview / Finish / Timer / History / History Detail /
  Method Detail / Settings UI
localStorage schema  History schema  CSV export  JSON export
PWA files / manifest / service worker
package dependencies  build configuration
docs/data/coffee_app_tips_master_v2.1.json
docs/data/coffee_app_tips_master_v2.1_audit.csv
docs/data/validate_tips_master.mjs
```

It also does **not** delete or modify the unrelated untracked files
`.claude/launch.json` or `docs/PR-006A-VISUAL-PARITY-AUDIT.md`.

---

## 4. Current integration baseline

Merged work treated as fixed baseline (must not be contradicted or regressed):

| PR | Title | Effect |
|----|-------|--------|
| #16 | 4:6 official recipe alignment | dose × 15, 40/60, 60g × 5 schedule |
| #17 | PR-011R1 POINT/TIPS Master v2.1 data foundation | the data + validator |
| #18 | PR-011R1 post-merge handoff | — |
| #19 | PR-011R2 Recipe / Method Detail IA | display-surface + field policy |
| #20 | PR-011R2 post-merge handoff | — |
| #21 | PR-011R3A Setup / Preview integration | `TIPS_DATA` adapter + selector |
| #22 | PR-011R3A post-merge handoff | — |
| #23 | PR-011R3B Finish integration | finish leads with TIPS |
| #24 | PR-011R3B post-merge handoff | — |

Runtime integration approach already in place (PR-011R3A/R3B, **must be reused,
not re-invented** by the future implementation PR):

- A static, read-only data adapter embedded in `app.js` (`TIPS_DATA`), derived
  verbatim from the v2.1 master. No runtime fetch; offline-safe via the existing
  service-worker `APP_SHELL`.
- `selectContextualTips(methodId, context, limit)`: resolves method id →
  `recipeCode`, filters by `type` ∈ {POINT, TIPS}, `displayContext` includes the
  requested context, and `recipeCode` equals the method code or `ALL`. Ordering
  is deterministic (lead type per surface → method-specific before `ALL` →
  stable ascending `id`). Wrapped in try/catch; always returns an array.
- Method id → recipeCode map: `yon-roku → 406`, `ice → ICE`, `hybrid → HYB_NEW`,
  `neo → NEO`. `HYB_BASE` / `HYB_DEVIL` are never represented in the app.

Method Detail is the **only** PR-011R2 surface still at "not started" that this
plan addresses. (Timer and History Detail remain out of scope here.)

---

## 5. Method Detail / Recipe Detail definition

**Method Detail / Recipe Detail is a non-active-brew explanatory surface for
understanding a method before or after brewing.** It is the dedicated reference
page for each in-scope method (`406` / `ICE` / `HYB_NEW` / `NEO`), separate from
the active brewing flow (Setup → Preview → Timer → Finish).

It **should support**:

```text
- method overview
- baseline recipe (dose / water / ratio)
- equipment / dripper premise
- grind / temperature guide
- pour schedule or progression model
- taste-adjustment model
- selected POINT/TIPS grouped by context
- neutral source / verification summary
- non-official / non-complete-reproduction disclaimer
- "What Pourō does not claim"
```

It **must not become**:

```text
- a Timer (no active step countdown / no progression control)
- a History Detail (no per-brew log, no localStorage read/write)
- a long encyclopedia page
- a source transcript viewer
- a legal attribution page
- a raw JSON / debug display
- a promotional method page
```

### 5.1 How Method Detail differs from the other surfaces

| Surface | Timing | Length | Purpose | Source notes | This PR? |
|---|---|---|---|---|---|
| Recipe Setup | before brew | shortest | glance-level method premise | no | done (R3A) |
| Preview | before timer | short | confirm the plan | no | done (R3A) |
| Timer | during brew | shortest | keep focus on current step | no | not started (R4 first) |
| Finish | after brew | short | what to adjust next time | no | done (R3B) |
| History Detail | reviewing a past brew | long | learn from one logged brew | summarized | not started |
| **Method Detail** | **outside any brew** | **longest** | **understand the method itself** | **summarized** | **planned here** |

Distinguishing rules:

- **vs Timer:** Method Detail never drives the brew. No countdown, no active
  "current step" highlighting, no Next/drawdown control. Pour schedules appear as
  *reference tables*, not as a running timer.
- **vs History Detail:** Method Detail is keyed by **method (`recipeCode`)**, not
  by a logged brew. It reads **no** History / localStorage data and writes none.
  It is reachable without any brew history existing.
- **vs Setup / Preview / Finish:** those are compact, single-context cards inside
  the active flow. Method Detail is a full multi-section page that may aggregate
  several contexts for one method (under §8 rules).

---

## 6. Required 10-section Method Detail structure

The future implementation must follow the PR-011R2 section order. Sections may be
empty or marked `needs_review` when the source provides no detail; they are never
filled with invented facts.

```text
1.  Method overview
2.  Recipe baseline (dose / water / ratio)
3.  Equipment / dripper premise
4.  Grind / temperature guide
5.  Pour schedule or progression model
6.  Taste adjustment model
7.  POINT / TIPS grouped by context
8.  Source / verification status
9.  Safety / legal-neutral note
10. What Pourō does not claim
```

For each section: **purpose**, **allowed content**, **prohibited content**,
**preferred source fields**, **display length guidance**, **implementation
cautions**.

### Section 1 — Method overview

- **Purpose:** one short neutral paragraph stating the method premise.
- **Allowed:** method name, one-line "what kind of brew this is," in-scope status.
- **Prohibited:** superlatives, official-claim wording, marketing copy.
- **Preferred fields:** method overview prose (authored, neutral); may reference a
  `category: overview`-style POINT if present, summarized.
- **Length:** 1 short paragraph (~2–3 sentences).
- **Cautions:** for NEO, the primary display name is **10投式ドリップ** with the
  subtitle **THE NEO BREW / HARIO V60 NEO** (see §9.4).

### Section 2 — Recipe baseline (dose / water / ratio)

- **Purpose:** the numeric baseline as a guide (目安), not a guaranteed answer.
- **Allowed:** dose, total water, ratio, total pour count — as 目安.
- **Prohibited:** "必ず / 完全 / 唯一の正解" framing; presenting numbers as fixed
  truth.
- **Preferred fields:** recipe baseline carried from §9 / Source of Truth;
  `contentShortJa` for compact rows.
- **Length:** a short labelled list or small table.
- **Cautions:** 4:6 baseline is **20g → 300g, total = dose × 15** (PR #16). Do not
  reintroduce pre-#16 numbers.

### Section 3 — Equipment / dripper premise

- **Purpose:** state the dripper / Switch / server assumptions.
- **Allowed:** dripper type, HARIO Switch open/close premise (HYB_NEW), server +
  ice premise (ICE).
- **Prohibited:** brand-endorsement / partnership implication.
- **Preferred fields:** `contentJa` of equipment-related items; authored premise.
- **Length:** 1–3 short lines.
- **Cautions:** HYB_NEW = HARIO Switch hybrid; ICE = ice in server.

### Section 4 — Grind / temperature guide

- **Purpose:** grind and water-temperature ranges as guides.
- **Allowed:** grind coarseness, temperature range — explicitly bean-dependent.
- **Prohibited:** fixed single value framed as required.
- **Preferred fields:** `contentJa` + `whyJa` of grind/temp items;
  `contentShortJa` for compact lists.
- **Length:** short; 1–2 lines per dimension.
- **Cautions:** NEO = very coarse + 95–96℃; HYB_NEW target liquid temp ~70–80℃.

### Section 5 — Pour schedule or progression model

- **Purpose:** present the fixed timeline *or* drawdown / manual-Next progression
  per method — as a **reference table**, never as an active timer.
- **Allowed:** the exact step schedule / pour amounts / timing guide.
- **Prohibited:** turning the table into a running countdown; omitting or
  simplifying required steps; auto-advancing UI.
- **Preferred fields:** schedules carried verbatim from §9 / Source of Truth.
- **Length:** a static table (longest section is acceptable here).
- **Cautions:** preserve exact timelines — esp. NEO **1:45 / 210g** (never
  omitted) and 4:6 timing **0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30**.

### Section 6 — Taste adjustment model

- **Purpose:** how to shift flavor / strength next time.
- **Allowed:** flavor-vs-strength model, "taste → next change" guidance.
- **Prohibited:** "絶対に失敗しない / どんな豆も必ず美味しくなる" framing.
- **Preferred fields:** `contentJa` + `whyJa` of `finish` / adjustment items.
- **Length:** short explanatory block.
- **Cautions:** 4:6 = first 40% adjusts flavor impression, latter 60% adjusts
  strength.

### Section 7 — POINT / TIPS grouped by context

- **Purpose:** show selected POINT/TIPS for the method, grouped by context (not
  mixed randomly).
- **Allowed:** non-quarantine, adoptable items where `recipeCode` matches the
  method or `ALL`, grouped by `displayContext` (see §8).
- **Prohibited:** quarantine items; random selection; raw source metadata as
  copy.
- **Preferred fields:** `contentJa` (body) + `whyJa` (why-this-matters);
  `contentShortJa` for compact sub-lists.
- **Length:** medium; grouped lists with headings.
- **Cautions:** deterministic ordering (reuse the R3A/R3B selector contract);
  group by context, label each group plainly.

### Section 8 — Source / verification status

- **Purpose:** a summarized, neutral provenance note.
- **Allowed:** neutral provenance summary; a plain `verificationLevel` status
  ("映像で確認" / "要確認").
- **Prohibited:** raw `source.videoTitle`; debug labels; any approval /
  supervision / partnership / complete-reproduction implication.
- **Preferred fields:** `source` (summarized only), `verificationLevel`
  (summarized only), `confidence` (summarized only).
- **Length:** 1–2 neutral lines.
- **Cautions:** see §10. Never expose promotional source words (神 / 悪魔 / 究極).

### Section 9 — Safety / legal-neutral note

- **Purpose:** the standing non-official safety note.
- **Allowed:** `textRules.legalNote` wording; "all values are adjustable guides."
- **Prohibited:** any official-relationship implication.
- **Preferred fields:** authored from `textRules.legalNote`.
- **Length:** 1 short line.
- **Cautions:** identical tone across all methods.

### Section 10 — What Pourō does not claim

- **Purpose:** explicit non-official disclaimer ending every Method Detail page.
- **Allowed:** a statement that Pourō does not claim official supervision,
  approval, partnership, or complete reproduction, and that all values are 目安.
- **Prohibited:** softening this into a marketing line.
- **Preferred fields:** authored, fixed copy.
- **Length:** 1 short paragraph.
- **Cautions:** must always be present, even when other sections are
  `needs_review`.

---

## 7. POINT/TIPS Master v2.1 field mapping

Policy only; no code consumes it in this PR. Fields available per item:

```text
id  type  scope  recipeCode  category  displayContext
contentJa  contentShortJa  whyJa
source  verificationLevel  confidence  appAdoption  notes
```

Recommended usage in Method Detail:

| Field | Method Detail usage |
|---|---|
| `id` | selection key; **stable ascending `id`** is the deterministic tiebreak (no `priority` field exists). |
| `type` | group/label POINT vs TIPS. |
| `recipeCode` | filter: method code or `ALL` only. `HYB_BASE` / `HYB_DEVIL` / `OTHER` never surfaced. |
| `category` | optional sub-grouping within a context group. |
| `displayContext` | grouping key for §6 section 7; also the §8 aggregation filter. |
| `contentShortJa` | compact cards / summary rows / sub-lists. |
| `contentJa` | normal Method Detail body text. |
| `whyJa` | the "why this matters" block (allowed here; **never** in Timer compact UI). |
| `source` | **summarized only**; raw `videoTitle` must not be app-facing. |
| `verificationLevel` | summarized as neutral confidence language; not a debug label unless explicitly designed. |
| `confidence` | summarized as neutral language only; not a raw technical label. |
| `appAdoption` | gate: only `adoptable`; `quarantine` excluded everywhere. |
| `notes` | **internal planning only** unless carefully summarized. |

Hard rules:

- Do **not** show raw `source` metadata directly anywhere.
- Do **not** show items where `appAdoption: quarantine` or `displayContext`
  includes `quarantine`.
- Do **not** use random selection — selection is deterministic by `recipeCode` +
  `displayContext` + ascending `id`.
- Do **not** add a `priority` field in this PR; if a future data revision adds
  one, it must be additive and preserve the `id`-based fallback.

A fuller field→section matrix lives in the optional companion doc
`PR-011R3C_METHOD_DETAIL_FIELD_MAPPING.md`.

---

## 8. displayContext policy

Method Detail usage by `displayContext`:

```text
- setup:         may be referenced as "before brewing" tips,
                 but NOT copied verbatim as Setup UI.
- preview:       may be grouped under "planning".
- finish:        may be grouped under "next adjustment".
- historyDetail: reserved primarily for a later History Detail implementation;
                 its longer explanatory items are the best fit for Method Detail
                 body text and may be aggregated here.
- timer:         must NOT be used in Method Detail as active step guidance.
                 timer-context items are written as active-step copy; they may
                 only be reused if rewritten in a non-active explanatory context
                 in a FUTURE data revision (not this PR).
- quarantine:    NEVER shown.
- methodDetail / recipeDetail: if such a value is ever added to the data, it is a
                 direct fit. It does NOT exist in v2.1 today (see §2.1).
```

### 8.1 Fallback aggregation (because no `methodDetail` context exists)

Since v2.1 has no dedicated `methodDetail` `displayContext`, Method Detail may
aggregate selected non-quarantine items from **`setup` / `preview` / `finish` /
`historyDetail`** only, and **only if all** of the following hold:

```text
- recipeCode matches the selected method OR is ALL
- appAdoption is "adoptable"
- the text is relevant to understanding the method
- raw source metadata is NOT displayed
- items are GROUPED by context, not mixed randomly
- timer-context items are excluded (active-step copy, see above)
- quarantine items are excluded
```

This PR does **not** add a new `displayContext` field to the JSON. The future
implementation should keep the aggregation deterministic by reusing the
established `recipeCode` + `displayContext` + ascending-`id` ordering from the
R3A/R3B selector.

---

## 9. Method-specific requirements

All numbers below are **guides (目安)** carried verbatim from the Source of Truth
(§2). They are not new facts and must not be re-derived or "improved."

### 9.1 4:6 Method / `406`

Must include:

```text
- 20g / 300g / 1:15 baseline
- total water = dose × 15
- 40% first phase / 60% second phase model
- first two pours adjust taste impression (acidity / sweetness)
- latter pours adjust strength / body
- 60g × 5 baseline for the 20g full version
- medium-strength example may be 60 / 60 / 90 / 90
- timing guide: 0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30
```

Must **not** reintroduce old incorrect values:

```text
- 48/72 or 72/48 front-phase values for the 20g baseline
- old incorrect strength mapping
- final standard pour at 3:00 instead of 2:45
```

### 9.2 Ice 4:6 / `ICE`

Must include:

```text
- ice in server
- hot water 150g + ice about 80g
- 30g × 5 pours
- target around 3:00
- flash-chilling of the brewed liquid
- fixed timeline / auto-progression compatible (as reference, not active timer)
```

### 9.3 HYB_NEW

Must include:

```text
- primary Hybrid candidate
- room-temperature water added INTO the dripper
- room-temperature water included in the total 300g
- exact room-temperature water amount NOT specified
- target liquid temperature around 70–80℃
- Switch closes around 2:10
- Switch opens around 2:45
```

Must **not**:

```text
- fix an exact room-temperature water amount
- display HYB_DEVIL wording (悪魔 / 神 / 究極)
- imply one official complete recipe
```

`HYB_BASE` and `HYB_DEVIL` are never surfaced; the app maps `hybrid → HYB_NEW`
only. `HYB_BASE` is internal Switch-operation support; `HYB_DEVIL` is an older
reference only.

### 9.4 NEO / 10投式ドリップ

Must include:

```text
- primary display name: 10投式ドリップ
- subtitle: THE NEO BREW / HARIO V60 NEO
- 10 pours of 30g
- very coarse grind
- 95–96℃ guide
- the 1:45 / 210g step must NOT be omitted
- step-by-step schedule preserved (not a vague uniform-interval model)
```

Schedule to preserve exactly:

```text
0:00  30g
0:30  60g
0:45  90g
1:00  120g
1:15  150g
1:30  180g
1:45  210g      <- must not be omitted
2:00  240g
2:15  270g
2:30  300g
about 3:30 complete
```

NEO schedule items and the HYB_NEW Switch-timing points are
`primary_visual_confirmed`.

---

## 10. Quarantine / source / legal policy

The future implementation must obey all of:

```text
- quarantine items are internal-only and never shown on any surface
- P-OTHER-001 must never appear in UI
- HYB_DEVIL wording must not be app-facing
- raw source.videoTitle must not be displayed as compact UI copy
- source metadata may be summarized only on Method Detail / History Detail-style
  surfaces
- no official approval / supervision / partnership / complete-reproduction
  implication
```

App-facing text must **avoid**:

```text
完全  100%  必ず  誰でも世界チャンピオンの味  公式完全再現
絶対に失敗しない  究極  神  悪魔  どんな豆も必ず美味しくなる  唯一の正解
```

Allowed style:

```text
目安  調整しやすい  〜を狙う  〜を意識する
豆に合わせて調整  Pourō向けに中立表現で整理
```

Legal / brand rule: Pouro-Fable5 is a **non-official personal PWA**. App-facing
copy must not imply official approval, supervision, partnership, or complete
reproduction by/with Tetsu Kasuya, PHILOCOFFEA, HARIO, or any other person /
company / organization. Source provenance is summarized neutrally only (e.g.
"動画内で紹介された方法を参考に中立表現で整理").

---

## 11. UI implementation guidance for future PR

Recommendations (not implemented here):

- **Reuse the existing R3A/R3B mechanism.** Extend the embedded `TIPS_DATA`
  adapter and the `selectContextualTips` contract rather than introducing a new
  data path or runtime fetch. A Method Detail-specific deterministic selector
  (e.g. `selectMethodDetailTips(methodId)` that aggregates per §8.1) is
  acceptable as long as it is deterministic and never throws.
- **Read-only.** Method Detail reads `recipeCode`-keyed data only. It must not
  read or write History / localStorage / export data.
- **Static schedule tables, not timers.** Render §9 schedules as reference tables.
  No countdown, no auto-advance, no Next/drawdown control on this surface.
- **Graceful hide.** When a method has no items for a context group, hide that
  group; never render an empty heading or a placeholder error.
- **Offline-safe.** Keep everything inside the existing service-worker
  `APP_SHELL`; no new network dependency.
- **Verbatim content.** POINT/TIPS copy is used verbatim from the master; the
  authored prose (overview, premise, disclaimers) follows §10 wording rules.
- **Determinism.** Selection/order must be stable: `recipeCode` + `displayContext`
  + ascending `id`. No randomization.

---

## 12. Regression constraints

The future implementation PR must preserve:

- The PR #16 4:6 correction: `total = dose × 15`, 40/60 model, 60g × 5,
  timing `0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30`. (Spot-check:
  `RecipeEngine.build('yon-roku',20,15,'balanced','standard')` → total 300g,
  pours 60/60/90/90.)
- The NEO exact step schedule including **1:45 / 210g**.
- The HYB_NEW cautions: room-temperature water into the dripper, included in
  300g, amount not fixed, 70–80℃, 2:10 close / 2:45 open.
- The ICE cautions: ice in server, 150g hot + ~80g ice, 30g × 5, ~3:00.
- Quarantine exclusion across every surface (`P-OTHER-001` never shown).
- The R3A Setup `POINT` / Preview `TIPS` and R3B Finish `次回のヒント` behavior.
- No change to Timer logic/semantics, RecipeEngine, History/localStorage/export
  schema, or PWA/service-worker files.

The v2.1 data validator must continue to report **PASS: 40 / FAIL: 0 /
ALL CHECKS PASS** (this PR changes no data, so it remains unchanged).

---

## 13. Future PR boundaries

The R-series split is preserved. This PR stays in its planning lane.

```text
PR-011R3C  | Method Detail / Recipe Detail planning   (THIS PR, docs-only)
- Define the plan only. No UI, no runtime import, no data change.

PR-011R3D  | Method Detail UI implementation   (recommended next; or, if the
             current R3 naming is preferred: PR-011R3C-impl)
- Add the Method Detail / Recipe Detail surface.
- Use the existing POINT/TIPS selector or a Method Detail-specific deterministic
  selector aggregating per §8.1.
- Render selected method information (the 10 sections of §6).
- No Timer semantics changes. No RecipeEngine changes.
- No History / localStorage / export schema changes unless separately approved.

(Separately, still not started:)
- History Detail POINT/TIPS integration.
- PR-011R4 Timer semantics audit / recipe timeline alignment.
```

These must not be mixed. PR-011R3C does not begin R3D UI work, History Detail
work, or R4 timer work.

---

## 14. Acceptance criteria

PR-011R3C is acceptable only if it:

- [x] Adds Method Detail / Recipe Detail planning documentation.
- [x] Adds a PR-011R3C memory handoff.
- [x] Defines the Method Detail purpose and what it must not become.
- [x] Preserves the required 10-section structure with per-section guidance.
- [x] Documents the v2.1 field mapping for Method Detail.
- [x] Documents the `displayContext` policy and the safe fallback (no
      `methodDetail` context exists in v2.1).
- [x] Preserves method-specific cautions for `406` / `ICE` / `HYB_NEW` / `NEO`
      (incl. 4:6 PR #16 values, NEO 1:45 / 210g, HYB_NEW room-water cautions).
- [x] States quarantine / `P-OTHER-001` / `HYB_DEVIL` / raw-source-metadata
      exclusions and legal-safe wording.
- [x] Defines the future implementation PR boundary.
- [x] Does not modify app runtime, data, schema, or UI files.
- [x] Does not implement any Method Detail / History Detail / Timer runtime work.
- [x] Keeps the v2.1 validator at PASS: 40 / FAIL: 0 (data unchanged).
