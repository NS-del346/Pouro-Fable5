# PR-011R4 Timer UI / Target Total Priority Audit Planning｜Pouro-Fable5

> Status: **Planning / audit doc only (docs-only PR)**
> This document records and formalizes the design decision that the Brew Timer
> must prioritize the **cumulative Target Total / 累計目標湯量 / スケール目標**
> over the **This Pour / 今回注ぐ量**, and prepares the implementation direction
> for a later PR (**PR-011R4A: Timer UI refinement**).
>
> This PR does **not** implement the Timer UI. No app / runtime / data / schema /
> UI files are changed.

---

## 1. Purpose

This PR records and formalizes the Timer UI / Target Total priority audit for
Pouro-Fable5.

- This is **not** implementation.
- This does **not** change any app behavior (no `index.html`, `app.js`,
  `styles.css`, `sw.js`, `manifest`, `assets/`, RecipeEngine, `_buildYonRoku`,
  Timer runtime logic, History, Method Detail, Settings, schema, export, import,
  or PWA change).
- This does **not** add or modify runtime data (`docs/data/*`).
- It records the **final design direction** synthesized from three independent
  design-preparation inputs (Claude Design / Figma Make / Stitch).
- It establishes the audit points that must be checked **before** the Timer UI
  is implemented.
- It prepares **PR-011R4A** (Timer UI refinement) as the implementation PR.

The core design decision to formalize:

```text
The Brew Timer should prioritize:
  Target Total / 累計目標湯量 / スケール目標
over:
  This Pour / 今回注ぐ量
because the user is watching the scale during brewing.
```

---

## 2. Strategic premise (from PR-011S0)

PR-011S0 established the strategic guardrail this PR must follow:

```text
Pouro-Fable5 is an extraction execution tool, not a coffee platform.
```

Implications carried into this PR:

- The main job is to **reduce cognitive load during brewing**.
- In the Timer UI, the **cumulative target water** should be more prominent than
  the this-pour amount.
- The Timer must stay **fast, simple, large-font, high-contrast**.
- Pouro-Fable5 must **not** drift into:

```text
- coffee SNS
- analytics platform
- bean inventory tool
- Beanconqueror / Filtru / Brewfather direction
- Bluetooth scale / hardware-first tool
- TDS / water-quality analysis app
- account / cloud / community platform
```

The Timer UI is judged against its **real competitors**, not against other coffee
apps:

```text
- YouTube videos
- Instagram posts
- screenshots
- paper notes
- mental calculation
- phone timer
```

The key question for every Timer decision:

```text
Is this Timer UI easier during brewing than video, paper notes,
screenshots, mental calculation, or the phone timer?
```

---

## 3. Current Timer UI problem statement

During brewing the user is **looking at the scale**. The single number that
matters at any moment is: *what total weight should the scale read when I stop
the current pour?* The Timer must answer that without arithmetic.

Problems to audit and resolve before implementation:

```text
- This Pour and Target Total may be shown at near-equal visual weight,
  forcing the user to add in their head (e.g. "120 + 60 = 180").
- Elapsed time or a circular ring may dominate the screen, even though the
  scale reading — not the stopwatch — is what the user acts on.
- "Next" may be vague text rather than a concrete next target total.
- Long method theory may compete for space with the live numbers.
- On a 375px iPhone width, the hero number may be too small or crowded.
```

Resolution direction (recorded in §7–§9): make the cumulative Target Total the
hero, make This Pour clearly secondary and incremental (`+` notation), and frame
Next as the *next target total*.

---

## 4. Why Target Total should be dominant

```text
- The user reads the scale, not their memory. The scale shows a cumulative
  weight, so the cumulative Target Total is the value that can be matched
  directly with zero arithmetic.
- This Pour ("pour 60g now") still requires mental addition to know when to
  stop on the scale. Target Total ("stop at 180g") does not.
- Reducing in-brew arithmetic is the core cognitive-load win over video /
  paper notes / phone timer.
- Target Total dominance is already the direction recorded in the PR-011S0
  strategy; this PR formalizes it for the Timer specifically.
```

This Pour is **not** removed — it remains useful as secondary, incremental
context (shown with `+` notation), but it must not compete with Target Total for
the hero position.

---

## 5. Design input summary

Three independent design-preparation results are used as planning inputs. Only
the **information hierarchy and direction** are adopted; no generated code or
generated copy is taken verbatim.

### 5.1 Claude Design 案

Artifact: `PR-011R4 Timer UI Exploration.dc.html`

```text
- Preserves the existing Pouro-Fable5 visual vocabulary.
- Warm cream / charcoal / amber / brown palette.
- Fable5-like typography, spacing, quiet research-note tone.
- Four concepts: 案A / 案B / 案C / 案D.
- Recommendation:
    Standard Timer = 案A hierarchy × 案C low-density readability
    Hybrid only    = add 案D Switch instruction layer
    案B ring        = optional / legacy-like candidate
```

### 5.2 Figma Make 案

Artifact: `Timer UI Design Exploration`

```text
URLs:
https://www.figma.com/make/Jsusmgq6MCrPoKKAAcdMnM/Timer-UI-Design-Exploration?t=jxJPozW24mcIMEuy-6
https://www.figma.com/make/Jsusmgq6MCrPoKKAAcdMnM/Timer-UI-Design-Exploration?t=jxJPozW24mcIMEuy-20&fullscreen=1

- Strong Target Total visibility.
- 案A is highly aligned with the market strategy.
- 案D is useful for Hybrid / Switch instructions.
- Some app-facing text must be corrected before implementation.
```

Caution (must be applied during implementation, not adopted as-is):

```text
- Do not adopt app-facing personal-name emphasis such as "Tetsu Kasuya 4:6".
- Do not adopt fixed Hybrid values such as "Water Temp: 20°C".
- Do not adopt a fixed room-temperature-water amount.
```

### 5.3 Stitch 案

Artifact: `stitch_pouro_timer_ui_design_guide.zip`

```text
- Useful for alternative structure comparison.
- Extract information hierarchy only.
- Do not use generated code directly.
- Do not let modern / generic UI override Pouro-Fable5's quiet, tool-like tone.
```

---

## 6. Cross-concept comparison

| Concept | Name | Hero element | Strength | Role in Pouro-Fable5 |
|---|---|---|---|---|
| 案A | Target Total Dominant | Cumulative Target Total | Zero in-brew arithmetic; matches the scale directly | **Adopted** as the Standard hierarchy |
| 案B | Timer Ring + Target Total | Circular ring / elapsed time | Visually familiar, "timer-like" | **Optional / future / legacy-like** only |
| 案C | Scale-First Minimal | Large numerals, low density | Highly readable at 375px; quiet tone | **Adopted** for readability / layout density |
| 案D | Hybrid Instruction Focus | Switch CLOSED / OPEN + next action | Makes Switch state legible | **Adopted conditionally** for Hybrid only |

Reading of the comparison:

```text
- 案A answers the real question ("what should the scale read?") most directly.
- 案C makes 案A legible on a small phone during brewing.
- 案A + 案C therefore form the Standard Timer.
- 案D is essential only for Switch-based methods (Hybrid / HYB_NEW); it is
  layered on top of the Standard Timer, not a separate Timer.
- 案B (ring-dominant) makes elapsed time the hero, which contradicts §4.
  It is kept as an optional / future mode candidate, not the standard.
```

---

## 7. Final adopted direction

### Standard Timer UI

```text
Use:
  案A Target Total Dominant
  +
  案C Scale-First Minimal

Meaning:
- Target Total is the hero.
- This Pour is clearly secondary.
- Step / Time / Next are compact supporting information.
- Low-density layout, large numerals.
- Readable on 375px iPhone width.
```

### Hybrid Timer UI

```text
Use:
  Standard Timer UI
  +
  案D Hybrid Instruction Focus (conditionally)

Meaning:
- For Hybrid / HYB_NEW only, add a Switch instruction layer.
- Show Switch CLOSED / OPEN state.
- Show the next Switch action in short text.
- Do not fix room-temperature-water amount.
- Do not fix room-temperature-water temperature at 20°C.
```

### Optional / future

```text
案B Timer Ring + Target Total

- Keep as optional / legacy-like / future mode candidate.
- Do not make a ring-centered Timer the standard direction.
- 案C Scale-First Minimal may also be offered later as a "Simple Mode".
```

---

## 8. Standard Timer UI requirements

For PR-011R4A implementation. Recorded here as requirements, **not** built here.

```text
- Target Total (累計目標湯量 / スケール目標) is the single hero number.
- This Pour is shown as secondary, incremental context, using + notation
  (e.g. "+60g"), never at equal weight with Target Total.
- Next is expressed as the next target total (e.g. "次: 180g"),
  not vague text such as "次の注湯".
- Step / Time / Next are compact supporting information around the hero.
- Large numerals; low-density layout; high contrast.
- Must remain readable and legible at 375px iPhone width.
- Back / Pause / Next controls remain clearly tappable.
- Preserve current Bottom Nav behavior during Timer (if hidden today, keep
  it hidden).
- Preserve PWA safe-area insets (notch / home indicator).
- Quiet, tool-like tone; no promotional or overclaiming copy.
```

---

## 9. Hybrid Timer UI requirements

```text
- Inherits all Standard Timer UI requirements (§8).
- Adds a Switch instruction layer (案D) for Hybrid / HYB_NEW only.
- Switch CLOSED / OPEN state must be clearly visible.
- The next Switch action is shown in short text
  (e.g. "まもなく Switch を閉じる").
- Room-temperature-water phase may be described, but its amount must not be
  fixed; it is part of the total target water.
- Do not display a fixed 20°C room-temperature-water value.
- Target liquid temperature may be expressed as a guide
  (e.g. "液温 70–80℃ を目安").
- Do not implement or alter recipe / Switch runtime logic in this PR.
```

---

## 10. Method-specific cautions

### 4:6 Method (`406`)

```text
- Standard Timer UI.
- Target Total should be dominant.
- This Pour should use + notation.
- Do not reintroduce the old 48/72 or 72/48 baseline.
- Do not change recipe schedule in this PR.
```

### Ice 4:6 (`ICE`)

```text
- Standard Timer UI.
- Keep flash-chill / server-ice assumptions out of the hero area.
- Do not add long theory to the Timer.
- Do not alter recipe logic in this PR.
```

### HYB_NEW / Hybrid

```text
- Standard Timer UI + Hybrid Switch layer (案D).
- Switch CLOSED / OPEN must be clear.
- Next Switch action should be short.
- Room-temperature-water phase may be described, but not fixed by amount.
- Do not show a fixed 20°C room-temperature-water value.
- Do not implement or alter recipe logic in this PR.
```

### NEO / 10投式ドリップ (`NEO`)

```text
- Standard Timer UI.
- Preserve the 10-pour rhythm.
- Future implementation must retain the 1:45 / 210g step.
- Do not change recipe logic in this PR.
```

---

## 11. Do-not-adopt list

Design directions explicitly rejected or deprioritized for the Standard Timer:

```text
- Ring-dominant standard Timer.
- This Pour and Target Total shown at equal visual weight.
- Hybrid fixed quantity / fixed 20°C displays.
- Fixed room-temperature-water amount.
- App-facing personal-name emphasis (e.g. "Tetsu Kasuya 4:6").
- source / confidence / verificationLevel shown inside the Timer.
- Long method theory inside the Timer.
- Bluetooth scale / TDS / water-quality / analytics UI.
```

App-facing wording that must be avoided (implies official approval / complete
reproduction / supervision / endorsement):

```text
- official
- complete reproduction
- supervised
- certified
- "Tetsu Kasuya 4:6" as a prominent UI label
- 世界チャンピオンの味を完全再現
- 公式完全再現
- 絶対に失敗しない
```

Preferred, legal-neutral wording:

```text
- 4:6 Method
- Hybrid / HARIO Switch
- 10投式ドリップ
- Ice 4:6
- 目安
- 調整しやすい
- スケール目標
- 累計目標湯量
```

---

## 12. Future PR handoff (PR-011R4A)

```text
PR-011R4A: Timer UI refinement (implementation)

- Implement the Standard Timer = 案A + 案C hierarchy.
- Make Target Total the hero; This Pour secondary with + notation.
- Express Next as the next target total.
- Add the 案D Switch instruction layer for Hybrid / HYB_NEW only.
- Verify on 375px iPhone width; preserve PWA safe-area; keep controls tappable.
- Do not change RecipeEngine, recipe schedules, or Timer runtime semantics
  unless separately and explicitly scoped.
- Apply all §10 method cautions and §11 do-not-adopt constraints.
```

See `docs/design/PR-011R4_MEMORY_HANDOFF.md` for the handoff record.

---

## 13. Acceptance criteria

```text
- This PR is docs-only; git diff --name-only shows only
  docs/design/PR-011R4_* files.
- node --check app.js → OK.
- node docs/data/validate_tips_master.mjs → PASS: 40 FAIL: 0 ALL CHECKS PASS.
- The final Timer decision is recorded:
    Standard Timer = 案A Target Total Dominant + 案C Scale-First Minimal
    Hybrid Timer   = Standard + 案D Switch instruction layer
    案B ring        = optional / future only
- Audit points (§14) are recorded for use before implementation.
- PR-011S0 strategy (extraction execution tool; not SNS / analytics /
  inventory / hardware-first) is preserved.
- Legal-neutral wording is preserved; no fixed Hybrid water / temp values.
- Method-truth cautions are present (no 4:6 48/72 or 72/48 reintroduction;
  NEO 1:45 / 210g must not be omitted in future implementation).
```

---

## 14. Audit points (check before implementation)

These must be verified against the current Timer **before** PR-011R4A builds the
refinement:

```text
- Does the current Timer make Target Total visually dominant?
- Does it show This Pour as secondary and clearly incremental?
- Does This Pour use + notation?
- Does it show Next as "next target total" rather than vague text?
- Does elapsed time or a circular ring dominate the screen?
- Does the layout work on 375px iPhone width?
- Are Back / Pause / Next controls still tappable?
- Is Bottom Nav hidden during Timer if that is the current behavior?
- Is PWA safe-area preserved?
- Is the Hybrid Switch state visible enough?
- Are method-specific instructions too long for the Timer?
```

---

## 15. Out of scope

Do **not** modify:

```text
index.html
app.js
styles.css
sw.js
manifest
docs/data/*
RecipeEngine
_buildYonRoku
Timer runtime logic
History
History Detail
Method Detail
Settings
localStorage schema
CSV export
JSON export
import logic
PWA behavior
package / build config
```

Do **not** implement:

```text
- Timer UI redesign
- new Timer screen markup
- new Timer CSS
- Hybrid Switch runtime logic
- Dark Mode
- My Recipes
- Rebrew refinement
- Brew Log
- Taste Tags
- analytics
- account / cloud / community
- Bluetooth scale integration
```

Do **not** touch pre-existing unrelated untracked files:

```text
.claude/launch.json
docs/PR-006A-VISUAL-PARITY-AUDIT.md
```

---

## Independent verifier checklist (quick reference)

- [ ] docs-only; only `docs/design/PR-011R4_*` files changed
- [ ] no `index.html` / `app.js` / `styles.css` / `sw.js` / manifest change
- [ ] no `docs/data/*` change; no Timer / runtime / History / Settings change
- [ ] no PR-012 / My Recipes / Dark Mode / Rebrew work
- [ ] PR-011S0 strategy preserved (execution tool; not SNS / analytics /
      inventory / hardware-first)
- [ ] Standard Timer = 案A + 案C; Hybrid = Standard + 案D; 案B ring = optional/future
- [ ] legal-neutral wording preserved; no fixed Hybrid amount; no fixed 20°C
- [ ] 4:6 old 48/72 or 72/48 not reintroduced; NEO 1:45 / 210g preserved for future
- [ ] `node --check app.js` OK; `validate_tips_master.mjs` PASS 40 / FAIL 0
