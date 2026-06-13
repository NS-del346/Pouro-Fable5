# PR-011R1｜POINT/TIPS Master v2.1 Data Foundation｜Pouro-Fable5

## 1. Purpose

Add the POINT/TIPS Master **v2.1** data foundation to the repository as
structured, reviewable data for **later** contextual POINT/TIPS UI integration.

This PR is **data / docs foundation only**. It does **not** integrate POINT/TIPS
into the UI, does **not** import the JSON into runtime app code, and does **not**
change any app runtime behavior. It builds directly on the
`docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md` Source of Truth.

## 2. Added Files

- `docs/data/coffee_app_tips_master_v2.1.json` — structured POINT/TIPS master
  (copied verbatim from the supplied source file; not rewritten or fabricated).
- `docs/data/coffee_app_tips_master_v2.1_audit.csv` — audit / verification
  artifact (copied verbatim from the supplied source file).
- `docs/data/validate_tips_master.mjs` — **docs-only** Node validator. Not
  imported by any runtime app code; only verifies the data file.
- `docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md` — this file.
- `docs/design/PR-011R1_MEMORY_HANDOFF.md` — memory / handoff.

Path choice: existing planning docs live under `docs/design/`. This PR keeps the
narrative docs there and places the reviewable static data under a new
`docs/data/` folder, so planning prose and source data stay separated and neither
sits in a runtime-served path (`/`, `app.js`, `assets/`, etc.).

## 3. Data Structure

### Top-level keys

```
version
generatedAt
project
status
methodSources
recipeScope
textRules
displayPolicy
items
```

(The file also carries a non-required `notes` array of authoring notes.)

### Per-item fields

```
id
type
scope
recipeCode
category
displayContext
contentJa
contentShortJa
whyJa
source
verificationLevel
confidence
appAdoption
notes
```

## 4. Allowed Enum Values

- `type`: `POINT` | `TIPS`
- `displayContext`: `setup` | `preview` | `timer` | `finish` | `historyDetail` | `quarantine`
- `appAdoption`: `adoptable` | `quarantine`
- `verificationLevel` (recommended): `primary_transcript_confirmed` |
  `primary_visual_confirmed` | `researched_summary` | `needs_review`

`displayContext` is stored as an array per item; each entry must be one of the
allowed values.

## 5. Validation Policy

Validation is performed by `docs/data/validate_tips_master.mjs` (docs-only). It
verifies: JSON parses, required top-level keys exist, `items` is an array, each
item has all required fields, `type` / `displayContext` / `appAdoption` enums are
respected, quarantine items use `displayContext: quarantine` + `appAdoption:
quarantine`, the expected counts match, the required content checks are present,
NEO schedule items use `primary_visual_confirmed`, and no forbidden expression
appears in app-facing copy.

**Validation result: ALL CHECKS PASS (40/40).**

Run:

```bash
node docs/data/validate_tips_master.mjs
```

## 6. Recipe Scope

Main recipe groups in scope:

1. 4:6 Method — `406`
2. Ice 4:6 — `ICE`
3. Hybrid / HARIO Switch — `HYB_BASE` (Switch operation support),
   `HYB_DEVIL` (older / reference, neutralized copy), `HYB_NEW` (main candidate)
4. NEO / 10投式ドリップ / THE NEO BREW — `NEO`

Quarantine / future candidates (`OTHER`, not shown in UI, not in MVP, not in
runtime recipe selection): MUGEN, Aeropress, Cold Brew, French Press,
ネルドリップ, 2スピン, 冷凍庫急冷, 氷水ダイレクト, and other methods not tied to
the four main groups.

## 7. Count Summary

| recipeCode | Count |
|------------|-------|
| ALL        | 4     |
| 406        | 5     |
| ICE        | 7     |
| HYB_BASE   | 3     |
| HYB_DEVIL  | 6     |
| HYB_NEW    | 6     |
| NEO        | 7     |
| OTHER      | 1     |
| **Total**  | **39** |

- Adoptable: **38**
- Quarantine: **1** (`P-OTHER-001`)

All counts match the planned targets exactly; no discrepancy. Data was **not**
rewritten to reach these counts.

## 8. Required Content Checks

Confirmed present in the data (verbatim from source, paraphrased neutral copy):

- **HYB_NEW**
  - `P-HYB-NEW-003`: room-temperature water is added **into the dripper**
    (液温を 70〜80℃ 程度へ下げる目安). `primary_visual_confirmed`.
  - `T-HYB-NEW-002`: room-temperature water is **included in total 300g** and
    adjusted by target liquid temperature **~70–80℃** (amount intentionally not
    fixed). `researched_summary`.
  - `P-HYB-NEW-004`: Switch **closes ~2:10, opens ~2:45**.
    `primary_visual_confirmed`.
- **NEO**
  - `P-NEO-003`: **1:45 step is not omitted; pour to 210g.**
    `primary_visual_confirmed`.
  - `T-NEO-004`: because the method assumes very coarse grinding, **start
    coarser than normal V60.**
  - NEO schedule-related items (`P-NEO-001`, `P-NEO-003`) use
    `primary_visual_confirmed`.

**Critical NEO rule:** the **1:45 / 210g** step must not be omitted.

## 9. Quarantine Policy

- Quarantine items **must not** be shown in the UI.
- Quarantine items **must** use `displayContext: quarantine`.
- Quarantine items **must** use `appAdoption: quarantine`.
- Quarantine items are **not** included in MVP and **not** included in runtime
  recipe selection.
- The single quarantine item is `P-OTHER-001` (`recipeCode: OTHER`).

## 10. Display Policy (document only — NOT implemented in PR-011R1)

For later PRs:

- **Recipe Setup:** show 1–2 short POINT items only.
- **Preview:** show short theory / planning TIPS; longer explanation goes to
  Method Detail.
- **Timer:** show only POINT items directly related to the current step; short,
  operation-relevant text only.
- **Finish:** show next-adjustment TIPS.
- **History Detail:** longer TIPS, Q&A-style explanation, and source /
  verification notes are allowed.
- **No random tips:** select by `recipeCode` + `displayContext` +
  priority / relevance, never random.

Tone: quiet, short, tool-like, beginner-readable, not promotional, not
overclaiming.

## 11. Expression / Legal Safety Policy

Pouro-Fable5 is a **non-official personal PWA**. App-facing copy must not imply
official approval, supervision, partnership, or complete reproduction by/with
Tetsu Kasuya, PHILOCOFFEA, HARIO, or any other person/company/organization.

Forbidden / avoided in app-facing text: 完全, 100%, 必ず, 誰でも世界チャンピオンの味,
公式完全再現, 絶対に失敗しない, 究極, 神, 悪魔, どんな豆も必ず美味しくなる, 唯一の正解.

Preferred: 目安, 調整しやすい, 〜しやすくなる, 〜を狙う, 〜を意識する, 豆に合わせて調整,
動画内で紹介された方法, Pourōでは中立表現に変更.

Source video titles may contain promotional words (神, 悪魔, 究極). These appear
**only** inside internal source metadata (`methodSources` / `source.videoTitle`),
never in app-facing copy. The validator confirms no forbidden expression appears
in `contentJa` / `contentShortJa` / `whyJa`.

## 12. What PR-011R1 Does NOT Implement

- No POINT/TIPS UI integration.
- No runtime app import or consumption of the JSON.
- No RecipeEngine / `_buildYonRoku` / 4:6 method change (PR #16 correction stays
  intact).
- No Timer logic or Timer semantics change.
- No Recipe Setup / Preview / Timer / Finish / History / Settings UI change.
- No localStorage / History / CSV export / JSON export schema change.
- No PWA / manifest / service worker change.
- No CSS / navigation change.
- No package dependency or build configuration change.

## 13. Follow-up PR Boundaries

- **PR-011R2** — Recipe / Method Detail information architecture (docs/IA only
  unless explicitly scoped).
- **PR-011R3** — Contextual POINT/TIPS UI integration (first UI consumption;
  context-based selection, quarantine never shown, timer gets short text only).
- **PR-011R4** — Timer semantics audit / recipe timeline alignment (preserve 4:6
  manual next, ICE fixed, HYB_NEW guided, NEO 1:45 / 210g intact).
