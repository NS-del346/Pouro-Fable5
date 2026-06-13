# PR-011R0 Recipe Source / POINT・TIPS Planning｜Pouro-Fable5

> Status: **Planning doc only (docs-only PR)**
> This document is the Source of Truth for recipe verification and
> POINT/TIPS Master v2.1 planning. It precedes any runtime data file or
> UI integration.

---

## 7.1 Purpose

This PR records the recipe source verification and the POINT/TIPS planning
basis for Pouro-Fable5.

- This is **not** implementation.
- This does **not** add runtime JSON (no `coffee_app_tips_master_v2.1.json`).
- This does **not** add the audit CSV (no `coffee_app_tips_master_v2.1_audit.csv`).
- This does **not** change any app behavior (no `app.js`, `index.html`,
  `styles.css`, `sw.js`, `manifest`, `assets/`, RecipeEngine, Timer, schema,
  export, or PWA change).
- This prepares **PR-011R1** (data foundation) and later recipe / tips work.
- Pouro-Fable5 should **not** blindly copy old Pourō-Claude / Pouro-GPT data.
  Old values are not authoritative unless explicitly carried in the supplied
  handoff and re-verified here.

---

## 7.2 In-scope recipes (MVP / near-term)

| # | Recipe | Code group | Role |
|---|--------|-----------|------|
| 1 | 4:6 Method | `406` | Core method |
| 2 | Ice 4:6 / 急冷式アイス | `ICE` | Core iced method |
| 3 | Hybrid / HARIO Switch | `HYB_*` | Switch-based method group |
| 4 | NEO / 10投式ドリップ / THE NEO BREW | `NEO` | Step-timeline method |

Hybrid sub-codes:

- `HYB_BASE` — Switch basic operation **support material**.
- `HYB_DEVIL` — **older / reference** recipe.
- `HYB_NEW` — **primary Hybrid candidate** for Pouro-Fable5.

Clarifications:

- **HYB_NEW is the main Hybrid candidate.**
- **HYB_BASE is support material** for understanding HARIO Switch operation
  (open/close behavior), not a standalone showcase recipe.
- **HYB_DEVIL is older / reference** and must **not** be treated as the main
  Hybrid recipe.

---

## 7.3 Quarantine / future candidates

The following are **quarantine / future candidates only**:

```text
MUGEN
Aeropress
Cold Brew
French Press
ネルドリップ
2スピン
冷凍庫急冷
氷水ダイレクト
Other candidates not directly tied to the four main method groups
```

Rules:

- Do **not** show quarantine items in UI.
- Do **not** mix these into MVP.
- Do **not** include them in runtime recipe selection.
- They may be retained **only** as future expansion notes.

---

## 7.4 Recipe source verification summary

> All values below are **guides (目安)**, not fixed correct answers.
> User-facing copy must follow the expression rules in §7.8.

### 4:6 Method (`406`)

```text
Dose: 20g
Water: 300g
Ratio: 1:15
Grind: coarse
Temperature guide: light 93–94℃ / medium 87–88℃ / dark 83℃ as guide
Pours: 60g × 5
Progression: wait for drawdown before next pour
Finish guide: around 3:30, up to around 4:00
Theory: first 40% adjusts acidity/sweetness, last 60% adjusts strength
Concept: not a fixed correct answer, but a compass for finding preference
```

**Timer policy:**

```text
Drawdown-triggered / manual Next
Not a fixed automatic timeline
```

### Ice 4:6 / 急冷式アイス (`ICE`)

```text
Dose: 20g
Hot water: 150g
Ice: about 80g
Final liquid: about 180–200g
Ratio basis: 20g : hot water 150g + ice 80g
Grind: finer, adjusted to finish around 3 minutes
Temperature: about 90℃ guide; about 80℃ if reducing bitterness
Pours: 30g × 5
Timeline: 0:00 / 0:40 / 1:10 / 1:40 / 2:10
Finish guide: about 3:00
Feature: ice in server, flash-chilling brewed liquid
```

**Timer policy:**

```text
Fixed timeline / compatible with auto progression
```

### HYB_BASE

```text
Dose: 20g
Water: 300g
Ratio: 1:15
Grind: fine-ish / medium-ish
Temperature: not explicitly stated in source
Switch: closed at start
Pour: 240g, wait 1:30
1:30: pour remaining 60g
3:00–3:30: open Switch and draw down
```

**Positioning:**

```text
Support material for understanding HARIO Switch operation.
Not the main Hybrid recipe for Pouro-Fable5.
```

### HYB_DEVIL

```text
Dose: 20g
Water: 280g
Ratio: 1:14
Grind: fine-ish
First temperature: about 93℃ / above 90℃
Second temperature: about 75℃ / about 20℃ lower
Device: HARIO Switch
0:00: Switch open, pour 60g
0:30: Switch open, pour 60g, total 120g
1:15: Switch closed, pour from 120g to 280g
1:45: Switch open
3:00: drawdown guide
```

**Positioning:**

```text
Older/reference recipe.
HYB_NEW should be prioritized as the main Hybrid candidate for Pouro-Fable5.
```

**Expression rule:**

```text
Do not use “悪魔”, “神”, “究極” in app-facing text.
Use neutral phrasing such as “HARIO Switch hybrid” or “low-temperature hybrid”.
```

### HYB_NEW (primary Hybrid candidate)

```text
Dose: 20g
Water: 300g
Ratio: 1:15
Grind: coarse-ish / Comandante C40 28 clicks as guide
First temperature: about 93℃
Second phase: add room-temperature water to lower liquid temperature to about 70–80℃
Device: HARIO Switch
0:00: Switch closed, bloom with about twice the coffee mass, about 40g
After bloom: Switch open, pour to 120g
1:30: pour to 200g
After 1:30: add room-temperature water into the dripper to lower temperature
2:10: Switch closed, pour to 300g
2:45: Switch open
3:30: drawdown / finish guide
```

**Additional confirmed points:**

```text
Room-temperature water is added into the dripper.
Exact room-temperature water amount is not specified.
Room-temperature water is included in the total 300g.
70–80℃ refers to liquid temperature in the dripper.
Switch closes around 2:10.
Switch opens around 2:45.
```

**Timer policy:**

```text
Guided timeline.
Do not fix exact room-temperature water amount.
Use a note such as “aim for liquid temperature around 70–80℃”.
```

### NEO / 10投式ドリップ / THE NEO BREW (`NEO`)

```text
Primary display name: 10投式ドリップ
Subtitle: THE NEO BREW / HARIO V60 NEO
Dose: 20g
Water: 300g
Ratio: 1:15
Temperature: 95–96℃
Grind: Comandante C40 40–45 clicks / very coarse
Dripper: HARIO V60 NEO
Pours: 10
Each pour: 30g
Finish guide: about 3:30
```

**Schedule:**

```text
0:00  30g
0:30  60g
0:45  90g
1:00  120g
1:15  150g
1:30  180g
1:45  210g
2:00  240g
2:15  270g
2:30  300g
about 3:30 drawdown / complete
```

**Important:**

```text
The 1:45 / 210g step must not be omitted.
The schedule is primary_visual_confirmed from the recipe card screenshot supplied by the user.
Do not oversimplify as a uniform interval without preserving the exact step timeline.
```

**Display policy:**

```text
Main display: 10投式ドリップ
Subtitle: THE NEO BREW / HARIO V60 NEO
```

**Timer policy:**

```text
Fixed timeline / compatible with auto progression.
Use step-by-step timeline data rather than a vague “15-second interval only” model.
```

---

## 7.5 POINT/TIPS Master v2.1 planning

> If the v2.1 files are not present in the repository, do not invent their
> exact contents. The intended structure is summarized below; the actual JSON
> addition belongs to **PR-011R1**.

Intended v2.1 status:

```text
Base: coffee_app_tips_master_v2
Planned version: coffee_app_tips_master_v2.1
v2 base count: 37 total
v2.1 planned count: 39 total
adoptable: 38
quarantine: 1
```

Expected `recipeCode` counts:

```text
ALL: 4
406: 5
ICE: 7
HYB_BASE: 3
HYB_DEVIL: 6
HYB_NEW: 6
NEO: 7
OTHER: 1
```

### v2.1 updates

**HYB_NEW:**

```text
P-HYB-NEW-003:
Room-temperature water is added into the dripper.

T-HYB-NEW-002:
Room-temperature water is included in total 300g and adjusted by target liquid temperature around 70–80℃.

P-HYB-NEW-004:
Close Switch around 2:10 and open around 2:45.
```

**NEO:**

```text
P-NEO-003:
Do not omit 1:45; pour to 210g.

T-NEO-004:
Because the method assumes very coarse grinding, start coarser than normal V60.
```

**NEO verification:**

```text
NEO schedule-related data: primary_visual_confirmed
```

---

## 7.6 Proposed data structure (for PR-011R1)

Planned top-level keys:

```text
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

Required item-level fields:

```text
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

Allowed `type`:

```text
POINT
TIPS
```

Allowed `displayContext`:

```text
setup
preview
timer
finish
historyDetail
quarantine
```

Allowed `appAdoption`:

```text
adoptable
quarantine
```

Recommended `verificationLevel`:

```text
primary_transcript_confirmed
primary_visual_confirmed
researched_summary
needs_review
```

Rules:

- `quarantine` items must **not** be shown in UI.
- Timer should receive **only** operation-relevant short text.
- Method / Recipe Detail can contain longer theory and source explanation.
- All user-facing text must avoid official-approval implication (see §7.8).

---

## 7.7 Display policy

```text
Recipe Setup:
Show 1–2 short POINT items only.

Preview:
Show short theory / planning TIPS.

Timer:
Show only POINT items directly related to current step.

Finish:
Show next-adjustment TIPS.

History Detail:
Show longer TIPS, Q&A-style explanation, and source / verification notes.

No random tips:
Select by recipeCode + displayContext + priority / relevance.
```

Tone:

```text
quiet
short
tool-like
beginner-readable
not promotional
not overclaiming
```

---

## 7.8 Expression and legal safety rules

Forbidden / avoided **app-facing** expressions:

```text
完全
100%
必ず
誰でも世界チャンピオンの味
公式完全再現
絶対に失敗しない
究極
神
悪魔
どんな豆も必ず美味しくなる
唯一の正解
```

Recommended expressions:

```text
目安
調整しやすい
〜しやすくなる
〜を狙う
〜を意識する
豆に合わせて調整
動画内で紹介された方法
Pourōでは中立表現に変更
```

Legal / brand rule:

```text
Pouro-Fable5 is a non-official personal PWA.
Do not imply official approval, supervision, partnership, or complete reproduction by/with
Tetsu Kasuya, PHILOCOFFEA, HARIO, or any other person/company/organization.
```

Source metadata note:

```text
Source video titles may contain promotional words such as “神”, “悪魔”, “究極”.
These may appear only in internal source metadata if necessary, not in app-facing copy.
```

---

## 7.9 Recommended PR split after PR-011R0

```text
PR-011R1｜POINT/TIPS Master v2.1 data foundation
- Add coffee_app_tips_master_v2.1.json
- Add schema / validation notes if needed
- No UI integration

PR-011R2｜Recipe / Method Detail information architecture
- Define where recipe source and longer TIPS appear
- No runtime behavior change unless explicitly scoped

PR-011R3｜Contextual POINT/TIPS UI integration
- Show short POINT/TIPS in setup / preview / timer / finish / historyDetail
- Use context-based selection, not random display

PR-011R4｜Timer semantics audit / recipe timeline alignment
- Check 4:6 manual Next / drawdown trigger
- Check ICE fixed timeline
- Check HYB_NEW guided timeline and no fixed room-water amount
- Check NEO step-by-step fixed timeline and 1:45 / 210g
```

These must remain **separate** from:

```text
PR-011B Brew Log reproducibility schema
PR-011C Recent values
PR-011D-1 Timer next-pour clarity
PR-011D-2 Step actual timing log
PR-011E Timer visual refinement
```

---

## Independent verifier checklist (quick reference)

- [ ] docs-only; no app code, no runtime JSON, no CSV
- [ ] in-scope recipes listed; quarantine separated
- [ ] HYB_NEW = main; HYB_DEVIL = reference; HYB_BASE = Switch support
- [ ] HYB_NEW room-water into dripper / not fixed / included in 300g
- [ ] HYB_NEW 2:10 close / 2:45 open recorded
- [ ] NEO display name + subtitle policy; 1:45 / 210g not omitted; primary_visual_confirmed
- [ ] Timer policies: 4:6 manual Next / ICE fixed / HYB_NEW guided / NEO step-by-step
- [ ] forbidden expressions listed; non-official PWA note present
- [ ] PR-011R1 / R2 / R3 / R4 sequence recorded; data vs UI vs timer separated

---

## Handoff for PR-011R1

See `docs/design/PR-011R0_MEMORY_HANDOFF.md`. PR-011R1 should add the actual
`coffee_app_tips_master_v2.1.json` (and optional audit CSV) following §7.6, with
no UI integration. The first UI integration is **PR-011R3**.
