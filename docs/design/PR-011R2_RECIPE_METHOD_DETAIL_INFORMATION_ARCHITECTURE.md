# PR-011R2｜Recipe / Method Detail Information Architecture｜Pouro-Fable5

> Status: **IA / specification doc only (docs-only PR)**
> This document defines *where* recipe explanations, source notes, and
> POINT/TIPS Master v2.1 items should appear across the app's display
> surfaces. It does **not** implement any UI, does **not** import the
> POINT/TIPS JSON into runtime code, and does **not** change any app
> behavior. It builds on the merged PR-011R1 data foundation and must not
> modify PR-011R1 data.

---

## 1. Purpose

PR-011R2 answers the open information-architecture questions left by PR-011R0
and PR-011R1:

- Where should **longer** recipe explanations appear?
- Where should **source / verification notes** appear?
- How should POINT/TIPS Master v2.1 items map to **Method Detail**, **Recipe
  Detail**, **History Detail**, **Preview**, **Timer**, and **Finish**?
- Which content is **safe** for user-facing display?
- Which content must remain **internal** or **quarantined**?
- What should **PR-011R3** implement later, and what must wait until
  **PR-011R4**?

This PR is an **IA / specification PR**, not a UI implementation PR. It produces
display-surface rules and a v2.1 field-mapping policy that PR-011R3 can
implement deterministically without re-deriving recipe facts.

---

## 2. Source of truth

This document does not invent recipe facts. Every recipe value and caution is
carried from the following already-merged documents and data files (read-only):

```text
docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md
docs/design/PR-011R0_MEMORY_HANDOFF.md
docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md
docs/design/PR-011R1_MEMORY_HANDOFF.md
docs/data/coffee_app_tips_master_v2.1.json
docs/data/coffee_app_tips_master_v2.1_audit.csv
docs/data/validate_tips_master.mjs
docs/design/FIX_406_OFFICIAL_RECIPE_ALIGNMENT_HANDOFF.md
```

Current 4:6 Method runtime behavior baseline is **PR #16**
(`fix-406-official-recipe-alignment`, merge commit `28dd708`). PR-011R2 must not
reintroduce the pre-#16 incorrect values.

If a detail is not present in the source documents or v2.1 data, it is marked
`needs_review` here and left for a future research / verification PR. It is not
fabricated.

The v2.1 data file already carries machine-readable display hints that this IA
aligns with:

- `displayPolicy` — per-surface guidance (`setup` / `preview` / `timer` /
  `finish` / `historyDetail` / `selection`).
- `textRules` — `avoidInAppText`, `preferInAppText`, `legalNote`.
- `recipeScope` — `inScope` (`406`, `ICE`, `HYB_NEW`, `NEO`),
  `supportingReferences` (`HYB_BASE`, `HYB_DEVIL`), `quarantine` (`OTHER`).

---

## 3. Non-goals

PR-011R2 does **not**:

- Implement Method Detail UI or Recipe Detail UI.
- Implement contextual POINT/TIPS rendering on any surface.
- Import or consume `coffee_app_tips_master_v2.1.json` in runtime app code.
- Show POINT/TIPS in the UI.
- Add random tips.
- Change recipe schedules.
- Change the PR #16 4:6 Method behavior.
- Change ICE / HYB_BASE / HYB_DEVIL / HYB_NEW / NEO behavior.
- Add a `priority` field to the data (ordering policy is documented, not added).
- Start PR-011R3 UI integration.
- Start PR-011R4 timer semantics audit.

It does **not** modify any of:

```text
app.js  src/  public/  index.html  CSS  RecipeEngine  _buildYonRoku
Timer logic / Timer semantics  Recipe Setup / Preview / Timer / Finish UI
History / History Detail / Settings UI  localStorage schema  History schema
CSV export  JSON export  PWA files / manifest / service worker
package dependencies  build configuration
docs/data/coffee_app_tips_master_v2.1.json
docs/data/coffee_app_tips_master_v2.1_audit.csv
docs/data/validate_tips_master.mjs
```

---

## 4. Display surface definitions

Six surfaces are defined. For each, this section states the **purpose**, the
**allowed content**, what **must not** appear, the preferred v2.1 text field,
and the `displayContext` value(s) that feed it.

The active brewing flow (Setup → Preview → Timer → Finish) must stay quiet and
short. Longer theory and source explanation belong to **History Detail** and the
dedicated **Method / Recipe Detail** reference surface.

### 4.1 Recipe Setup

- **Purpose:** before brewing, help the user understand the selected method at a
  glance.
- **`displayContext`:** `setup`.
- **Allowed content:**
  - 1–2 short POINT items only.
  - `setup` displayContext items only.
  - A very short method premise (one line).
- **Preferred field:** `contentShortJa` (fall back to `contentJa` only if the
  surface has room and the text stays short).
- **Must not show:**
  - long theory
  - long source notes
  - verification metadata
  - quarantine items

### 4.2 Preview

- **Purpose:** before starting the timer, confirm the brewing plan and explain
  the reason behind the schedule.
- **`displayContext`:** `preview`.
- **Allowed content:**
  - short planning TIPS
  - `preview` displayContext items
  - a method-specific caution **only if** it affects preparation (e.g. HYB_NEW
    room-temperature water needs to be ready)
- **Preferred field:** `contentJa` for the short planning explanation;
  `contentShortJa` where space is tight. `whyJa` is allowed only as a brief
  one-line rationale, not a full Q&A.
- **Must not show:**
  - long Q&A
  - internal source metadata
  - quarantine items

### 4.3 Timer

- **Purpose:** during brewing, reduce confusion and keep the user focused on the
  current step.
- **`displayContext`:** `timer`.
- **Allowed content:**
  - operation-relevant short POINT only
  - `timer` displayContext items only
  - current-step or next-step related guidance
- **Preferred field:** `contentShortJa` only.
- **Must not show:**
  - long theory
  - source notes
  - legal disclaimers
  - random tips
  - quarantine items

> **Important:** Timer UI integration waits until **PR-011R3**. The Timer
> *semantics* audit waits until **PR-011R4**. PR-011R2 only defines IA rules and
> does not touch timer code or timing data.

### 4.4 Finish

- **Purpose:** after brewing, help the user decide what to adjust next time.
- **`displayContext`:** `finish`.
- **Allowed content:**
  - `finish` displayContext items
  - next-adjustment TIPS
  - short sensory-to-action guidance (taste → next change)
- **Preferred field:** `contentJa`; `whyJa` allowed as a short rationale.
- **Must not show:**
  - unrelated method theory
  - random tips
  - quarantine items

### 4.5 History Detail

- **Purpose:** review a past brew and learn from it.
- **`displayContext`:** `historyDetail`.
- **Allowed content:**
  - `historyDetail` displayContext items
  - longer TIPS
  - Q&A-style explanations
  - source / verification notes **if summarized safely** (see §9)
  - recipe adjustment suggestions
- **Preferred field:** `contentJa` and `whyJa`; source/verification shown only as
  a summarized, neutral note.
- **Must not show:**
  - quarantine items
  - promotional source titles as app-facing copy
  - any official approval / supervision implication

### 4.6 Method Detail / Recipe Detail

- **Purpose:** a dedicated reference surface for each method, separate from the
  active brewing flow.
- **`displayContext`:** primarily `historyDetail`-tier content plus method
  overview prose; this surface may aggregate items from multiple contexts for
  the selected `recipeCode`, but still **never** shows quarantine items.
- **Allowed content:** the longest explanations in the app — overview, baseline,
  equipment, grind/temperature, pour schedule, taste adjustment, grouped
  POINT/TIPS, and a summarized source / verification status.
- **Preferred field:** `contentJa` + `whyJa`; `contentShortJa` only for compact
  sub-lists.
- **Constraint:** longer than Timer or Setup, but still beginner-readable and
  neutral. See §5 for the required section structure.

#### Display-surface quick reference

| Surface | `displayContext` | Length | Preferred field | Source notes? | Quarantine? |
|---|---|---|---|---|---|
| Recipe Setup | `setup` | shortest | `contentShortJa` | no | never |
| Preview | `preview` | short | `contentJa` (short) | no | never |
| Timer | `timer` | shortest | `contentShortJa` | no | never |
| Finish | `finish` | short | `contentJa` | no | never |
| History Detail | `historyDetail` | long | `contentJa` + `whyJa` | summarized only | never |
| Method / Recipe Detail | aggregate (excl. quarantine) | longest | `contentJa` + `whyJa` | summarized only | never |

---

## 5. Method Detail / Recipe Detail structure

Each Method Detail / Recipe Detail page should follow this recommended section
order. Sections may be empty or marked `needs_review` when the source does not
provide the detail; they are never filled with invented facts.

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

Section notes:

- **1 Method overview** — one short neutral paragraph; the method premise.
- **2 Recipe baseline** — numeric baseline as 目安 (guide), not a guaranteed
  answer.
- **3 Equipment / dripper premise** — dripper / Switch / server assumptions.
- **4 Grind / temperature guide** — ranges as guides; bean-dependent.
- **5 Pour schedule or progression model** — fixed timeline *or* drawdown /
  manual-Next model, per method (see §6). Preserve exact step timelines.
- **6 Taste adjustment model** — how to shift flavor / strength next time.
- **7 POINT / TIPS grouped by context** — items filtered by `recipeCode`
  (+ `ALL` where globally relevant), grouped by `displayContext`; quarantine
  excluded.
- **8 Source / verification status** — summarized neutral note only (see §9).
- **9 Safety / legal-neutral note** — uses `textRules.legalNote` wording.
- **10 What Pourō does not claim** — explicit non-official disclaimer (§10).

---

## 6. Method-specific detail requirements

All numbers below are **guides (目安)** carried verbatim from the Source of Truth
(§2). They are not new facts and must not be re-derived or "improved."

### 6.1 4:6 Method / `406`

Reflects the **PR #16** correction. Do **not** reintroduce the pre-#16 values.

```text
- total water = dose × 15   (default ratio 1:15)
- 20g coffee -> 300g water
- first 40% (120g) adjusts flavor impression (acidity / sweetness)
- remaining 60% (180g) adjusts strength
- basic 20g full schedule: 60g × 5
- official-guide timing (5-pour): 0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30 complete
```

**Method Detail emphasis:**

- the 40 / 60 model
- the first two pours control flavor impression
- later pours control strength
- drawdown / manual-Next compatibility (not a fixed automatic timeline)

**Timer policy (for PR-011R4 audit, not changed here):** drawdown-triggered /
manual Next; the 3:30 finish is a guide, not a guarantee.

### 6.2 Ice 4:6 / `ICE`

```text
- ice in server
- hot water 150g + ice about 80g
- 30g × 5 pours
- target around 3:00
- flash-chilling of the brewed liquid
```

**Method Detail emphasis:** server-side ice, flash-chill concept, finer grind to
finish near 3:00.

**Timer policy:** fixed timeline / compatible with auto progression.

### 6.3 HYB_BASE

```text
- HARIO Switch basic-operation support material
- NOT the main Hybrid recipe for Pouro-Fable5
- Switch closed at start
- pour 240g, wait 1:30
- add remaining 60g
- open Switch around 3:00–3:30
```

**Method Detail emphasis:** position explicitly as Switch operation support, not
a showcase recipe. Direct users toward HYB_NEW as the primary Hybrid.

### 6.4 HYB_DEVIL

```text
- older / reference recipe
- HARIO Switch hybrid
- open / open / closed / open structure
- a high-temperature phase and a lower-temperature immersion phase
```

**Expression rule:** do **not** use 「悪魔」 / 「神」 / 「究極」 in app-facing
display. The source video title may contain these words inside internal source
metadata **only**. Use neutral wording such as **"older HARIO Switch hybrid
reference."**

**Method Detail emphasis:** clearly mark as older / reference; HYB_NEW is the
prioritized Hybrid candidate.

### 6.5 HYB_NEW

```text
- primary Hybrid candidate
- room-temperature water is added INTO the dripper
- room-temperature water is included in the total 300g
- the exact room-temperature water amount is NOT specified
- target liquid temperature around 70–80℃
- Switch closes around 2:10
- Switch opens around 2:45
```

**Do not** define a fixed room-temperature water amount. Use a note such as
"aim for liquid temperature around 70–80℃." The amount is intentionally
unfixed and must be presented as bean/temperature-dependent adjustment.

**Method Detail emphasis:** room-temperature water into the dripper, included in
300g total, unfixed amount, 70–80℃ target, 2:10 close / 2:45 open.

### 6.6 NEO / 10投式ドリップ

```text
- primary display name: 10投式ドリップ
- subtitle: THE NEO BREW / HARIO V60 NEO
- 10 pours of 30g
- very coarse grind (coarser than normal V60)
- 95–96℃ guide
- preserve the 1:45 / 210g step
- schedule is step-by-step, NOT merely a "15-second interval"
```

**Schedule to preserve exactly:**

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

**Method Detail emphasis:** primary name 10投式ドリップ with the subtitle; the
exact step-by-step timeline; the **1:45 / 210g** step is never omitted or
oversimplified. NEO schedule verification is `primary_visual_confirmed`.

**Timer policy:** fixed timeline / compatible with auto progression; use the
step-by-step timeline data, not a vague uniform-interval model.

---

## 7. POINT/TIPS Master v2.1 mapping policy

This section documents how the v2.1 fields map to the future UI. It is policy
only; no code consumes it in PR-011R2.

### 7.1 Fields referenced

```text
id  type  recipeCode  category  displayContext
contentJa  contentShortJa  whyJa
source  verificationLevel  confidence  appAdoption  notes
```

### 7.2 Selection and display rules

- Filter by `recipeCode` to match the selected method.
- Include `recipeCode: ALL` items **only** when globally relevant to the surface.
- Use `displayContext` to choose the display surface (`setup` / `preview` /
  `timer` / `finish` / `historyDetail`).
- Use `contentShortJa` for compact surfaces (Setup, Timer).
- Use `contentJa` for normal explanatory surfaces (Preview, Finish, History
  Detail, Method Detail).
- Use `whyJa` mainly in **Method Detail** and **History Detail**.
- Do **not** show raw `source` metadata directly in compact UI.
- Do **not** show items where `appAdoption: quarantine` or `displayContext`
  contains `quarantine`.
- Do **not** use random selection.
- Selection must be **deterministic** by `recipeCode` + `displayContext` +
  priority / relevance.

### 7.3 Ordering / determinism

The current v2.1 JSON does **not** include a `priority` field. To keep selection
deterministic, PR-011R3 must use one of:

- **stable ordering by item `id`** (recommended interim approach, since `id`
  values are stable and unique), or
- a later **`priority` field** introduced in a future data revision.

PR-011R2 does **not** add a `priority` field and does **not** modify the data.
If a future revision adds `priority`, it should be additive and must not break
the existing `id`-based ordering fallback.

### 7.4 Field → surface matrix

| Field | Setup | Preview | Timer | Finish | History Detail | Method Detail |
|---|---|---|---|---|---|---|
| `contentShortJa` | primary | fallback | primary | fallback | sub-lists | sub-lists |
| `contentJa` | — | primary | — | primary | primary | primary |
| `whyJa` | — | brief | — | brief | yes | yes |
| `source` (summarized) | — | — | — | — | yes | yes |
| `verificationLevel` | — | — | — | — | summarized | summarized |

---

## 8. Quarantine policy

- Quarantine items are retained for **internal planning only**.
- Quarantine items must **not** be shown in **any** UI surface (including Method
  Detail / Recipe Detail).
- Quarantine items must **not** be included in runtime recipe selection.
- Quarantine items must **not** be exported as user-facing method guidance.
- The current single quarantine item is `P-OTHER-001` (`recipeCode: OTHER`,
  `appAdoption: quarantine`, `displayContext: quarantine`).

Quarantine exclusion is a hard rule across every surface defined in §4.

---

## 9. Source / verification display policy

Source and verification information may appear **only** on the longer reference
surfaces — **History Detail** and **Method Detail / Recipe Detail** — and only as
a **summarized, neutral note**.

Rules:

- Never render raw `source.videoTitle` as app-facing copy. Source video titles
  may contain promotional words (e.g. 神 / 悪魔 / 究極) and must stay inside
  internal metadata only.
- Summarize provenance neutrally, e.g. "動画内で紹介された方法を参考に中立表現で
  整理" / "based on a publicly available video, summarized in neutral wording."
- `verificationLevel` may be surfaced as a short, plain status (e.g. "映像で確認
  / visually confirmed", "要確認 / needs review") — not as a claim of accuracy or
  endorsement.
- Do not present source provenance in a way that implies official approval,
  supervision, partnership, or complete reproduction.
- Compact surfaces (Setup, Preview, Timer, Finish) show **no** source metadata.

`verificationLevel` values in v2.1: `primary_transcript_confirmed`,
`primary_visual_confirmed`, `researched_summary`, `needs_review`. NEO schedule
items and the HYB_NEW Switch-timing points are `primary_visual_confirmed`.

---

## 10. Expression and legal safety policy

App-facing copy follows `textRules` in the v2.1 data.

**Forbidden / avoided in app-facing text:**

```text
完全  100%  必ず  誰でも世界チャンピオンの味  公式完全再現
絶対に失敗しない  究極  神  悪魔  どんな豆も必ず美味しくなる  唯一の正解
```

**Recommended expressions:**

```text
目安  調整しやすい  〜しやすくなる  〜を狙う  〜を意識する
豆に合わせて調整  動画内で紹介された方法  Pourōでは中立表現に変更
```

**Legal / brand rule:** Pouro-Fable5 is a **non-official personal PWA**. App-facing
copy must not imply official approval, supervision, partnership, or complete
reproduction by/with Tetsu Kasuya, PHILOCOFFEA, HARIO, or any other
person / company / organization.

**Method Detail "What Pourō does not claim" (section 10 of §5):** every Method
Detail page ends with an explicit non-official note stating that Pourō does not
claim official supervision, approval, partnership, or complete reproduction, and
that all values are adjustable guides.

---

## 11. Future PR boundaries

The R-series split is preserved. PR-011R2 stays inside its lane.

```text
PR-011R2 | Recipe / Method Detail information architecture  (THIS PR)
- Define IA and display policy.
- No UI integration. No runtime import. No data change.

PR-011R3 | Contextual POINT/TIPS UI integration
- Implement actual contextual display on Setup / Preview / Timer / Finish /
  History Detail / Method Detail.
- Deterministic selection by recipeCode + displayContext + priority/relevance
  (id-based ordering until a priority field exists).
- Quarantine items never shown.

PR-011R4 | Timer semantics audit / recipe timeline alignment
- Audit 4:6 manual Next / drawdown trigger.
- Audit ICE fixed timeline.
- Audit HYB_NEW guided timeline and no fixed room-water amount.
- Audit NEO step-by-step fixed timeline and 1:45 / 210g.
```

These must not be mixed. PR-011R2 does not begin R3 UI work or R4 timer work.

---

## 12. Acceptance criteria

PR-011R2 is acceptable only if it:

- [x] Adds IA documentation for Recipe / Method Detail.
- [x] Adds a PR-011R2 memory handoff.
- [x] Does not modify app runtime files.
- [x] Does not modify PR-011R1 data files.
- [x] Does not implement UI integration.
- [x] Does not import or consume POINT/TIPS JSON in app runtime.
- [x] Preserves quarantine exclusion across all surfaces.
- [x] Preserves the PR #16 4:6 correction (dose × 15, 40/60, 60g × 5,
      0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30).
- [x] Preserves the NEO 1:45 / 210g caution and exact step schedule.
- [x] Preserves the HYB_NEW room-temperature-water caution (into dripper,
      included in 300g, amount not fixed, 70–80℃, 2:10 close / 2:45 open).
- [x] Documents where long theory / source notes appear (History Detail,
      Method / Recipe Detail).
- [x] Documents where short POINT/TIPS appear (Setup, Preview, Timer, Finish).
- [x] Keeps PR-011R3 and PR-011R4 separate.
- [x] Recommends no forbidden app-facing expressions.
