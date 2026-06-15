# PR-013A｜Timer Ver.2.0 Design Spec / Implementation Plan

## 1. Status

- Type: **docs-only design / spec PR** (planning artifact, no runtime code).
- State: Draft / pending Independent Verification.
- This document is the implementation contract for **PR-013B** (Timer Ver.2.0
  runtime UI). It does **not** ship any UI itself.
- Labels used below: `PASS` (clearly specified by the reference), `NOTE`
  (interpretation / recommendation), `TBD` (left open for PR-013B or a follow-up
  decision). Certainty is not fabricated where the reference is silent.

---

## 2. Source design reference

- **Primary source of truth:** `PR-013 Timer Ver.2.0 Refine.dc(1).html`
  (uploaded design artifact; local copy used: `PR-013 Timer Ver.2.0 Refine.dc.html`).
  Self-described as: *"Target Total を主役のまま、Countdown と Sequence Bar を洗練する"*
  — adopted direction header: *"採用方向 PR-012 Timer Ver.2.0 Sequence"*,
  *"視覚正本 design-artifact/Pouro-Fable5.dc.html"*, dated 2026-06-15.
- The reference contains a **live A/B comparison** (Option A *Countdown Central*
  vs Option B *Sequence Integrated*) rendered at 375 × 667, both synchronized,
  plus six annotated spec sections (information hierarchy, Countdown spec, Tips
  spec, Sequence Bar spec, Hybrid/animation, SE/implementation/risk/self-eval).
- The reference **explicitly adopts Option A** (section 02, 採用 badge): Target
  Total → independent Countdown → Sequence, with the semantic Countdown↔Next
  linkage borrowed from Option B.
- Unrelated PR-012 *My Recipes* UI is **not** used as the Timer design reference.
- Color/type tokens cited by the reference (extracted from
  `design-artifact/Pouro-Fable5.dc.html`): cream `#F4EDE1`, ink `#2C241B`,
  amber `#A2674E`, deep `#8C5535`, switch-charcoal `#2A221B`, Lora numerals.

---

## 3. Current baseline

- Repository: `NS-del346/Pouro-Fable5`, base branch `main`.
- Baseline build: **PR-012F merged** (`f32e71fe37042a70a39d5980e2ea65a2da648925`),
  My Recipes MVP (PR-012B → F) complete.
- The current Timer screen (`index.html` `#brew-screen` region, driven by
  `app.js`) **already** treats Target Total as the hero — this was established by
  the PR-011R4 *Timer UI Target Total* audit. Current structure (Ver.1.x):
  - Header: method icon / name / sub, `#brew-step-big` `/N`, `#brew-step-small`.
  - Optional context row (`#brew-context-row`, e.g. Hybrid Switch / Ice HOT·ICE).
  - **Hero card** `#brew-pour-card.brew-hero`: label "スケール目標", elapsed mini
    ring (`#brew-arc` / `#brew-time-display`), big total `#brew-cum-amt` + `g`,
    instruction `#brew-target-instruction` ("…g まで注ぐ"), foot row
    (今回の注湯 `#brew-pour-amt` `+60g` | 次 `#brew-next-target` "…g まで"),
    note `#brew-pour-note`.
  - Drawdown card `#brew-draw-card` (`#brew-draw-title` / `#brew-draw-sub`).
  - **Step dots** `#brew-dots-row.brew-dots` — the current minimal "sequence"
    treatment.
  - PAUSED chip `#brew-chip`; controls (Pause / Back / Next as applicable).
- **Gap vs Ver.2.0:** the baseline has Target Total + step dots but **no
  independent Countdown element** and **no full Sequence Bar** (Previous /
  Current / Next / Later rows, progress line, per-step 1-line Tips). PR-013B's
  job is to add those while keeping Target Total the undisputed hero.

---

## 4. Design intent

The single governing principle, stated repeatedly in the reference:

> **王様は常に Target Total** — "the king is always Target Total."

- During a pour, the most important thing to see is *how many grams to pour to on
  the scale*. Target Total must keep its visual dominance (84 px Lora numeral).
- Ver.2.0 is a **refine, not a rebuild**. Countdown and Sequence Bar are
  **subordinate, supporting** information — they must not create a second
  "king" or scatter the user's gaze.
- Countdown and Sequence are bound into **one visual flow** via shared amber
  color and a progress line, so the relationship "*when these seconds run out,
  the Next row becomes current*" reads at a glance.
- Tone: **Quiet Premium** — calm, no scroll required during a brew, no
  game/casino-like flourishes.

---

## 5. Timer information hierarchy

Adopted from the reference's "情報階層（視覚的強さ順）" (section 03). Visual
strength, strongest → faintest:

| Rank | Element | Size / treatment | Role |
|---|---|---|---|
| 1 (king) | **Target Total** | 84 px Lora numeral + gauge | Cumulative scale goal |
| 2 | **Countdown** | ~29 px (≈ ⅓ of Target) | Seconds until next pour / next action |
| 3 | **Current row** | ~23 px reached-cumulative + This Pour (`+60g`) | What's happening now |
| 4 | Next / Tips / Step / Elapsed / Method / Controls | ≤ 13 px | Supporting detail |
| 5 (shadow) | **Later** rows | opacity ≈ .28 + slight blur, melts into gradient | Faint preview only |

`PASS` — Hierarchy is explicitly specified.
`NOTE` — Exact px values are the reference's targets; PR-013B should treat them
as the intended *ratios* (Countdown ≈ ⅓ of Target; Later barely visible) and may
adjust within the existing token scale to keep 375 px no-scroll.
**Hard rule:** strong emphasis lives at Target Total only. Countdown and
Sequence are bundled by amber + progress line; **never** give Countdown the same
size or color as Target Total.

---

## 6. Screen structure

Adopted layout = **Option A (Countdown Central)**, top → bottom:

1. **Status bar / grabber** (visual chrome).
2. **Header row** — method icon + name + sub (left); step `N/total` + elapsed
   (right). (Maps to existing `#brew-method-*`, `#brew-step-big`, elapsed.)
3. **Target Total block** — uppercase label "Target Total · スケール目標", 84 px
   numeral + `g`, then the **gauge** (0g … target … 300g-style progress bar).
   (Maps to existing `.brew-hero`.)
4. **Countdown row** *(new)* — independent card directly under Target Total:
   ring + drop icon, label ("次の注湯まで" / generic), 29 px seconds, This Pour
   (`+60g`) on the right.
5. **Sequence Bar** *(new / upgraded)* — `flex: 1` region absorbing remaining
   height; Previous / Current / Next / Later rows with the vertical progress
   line; bottom gradient fade mask.
6. **Controls** — Back / Pause·Resume / Next, fixed at the bottom with
   safe-area inset, on an opaque footer above the Sequence fade.

`PASS` — Structure is explicit in the Option A prototype.
`NOTE` — The current drawdown card (`#brew-draw-card`) and step-dots
(`#brew-dots-row`) are superseded by the Countdown row + Sequence Bar in Ver.2.0;
PR-013B decides whether to repurpose or replace those nodes (see §13).

---

## 7. Countdown / Target Total semantics

### Target Total (king) — unchanged semantics
- The **cumulative** scale target for the current step (`steps[cur].cum`), e.g.
  `180g`. Big numeral + gauge. On step change the number **cross-fades quietly**
  (no bounce).
- This Pour is the **relative** increment (`+60g`) and must always carry the `+`
  sign and a separate color (ink vs amber-deep) so Total (180g) and This Pour
  (+60g) are never confused.

### Countdown (rank 2, subordinate) — new
- Composition: label + seconds + This-Pour hint, e.g. "次の注湯まで / **8s** /
  この投 +60g". Only the seconds use Lora ~29 px; the label is ~11 px.
- **Ring:** `r = 15`, stroke width 2.5 px, thin and quiet. Depletes with
  remaining time, `0.2s linear`. **No glow, no shadow.**
- **Generic by step kind:** label switches by what comes next —
  pour → "次の注湯まで" / "Next pour in 12s"; action → "次の操作まで (Next step)" /
  "Next step in 12s"; Switch → "Switch CLOSE まで 08s" / "Close Switch after this pour".
- **At 0 seconds:** signals only — it does **not** auto-advance / auto-confirm
  the step. Must **never** match Target Total's size or color.
- **Last phase:** when there is no next pour, the Countdown shows a calm phrase
  (e.g. "最後のフェーズ / 落とし切りへ") instead of counting.

`PASS` — Countdown spec is explicit (section 03 + 05 of the reference).

---

## 8. Step sequence and progress model

From the reference's Sequence Bar spec (section 04) and implementation notes
(section 06):

- **Data model:** `steps[] = { kind: 'pour' | 'switch' | 'drawdown', t, amount,
  cum, tip }`. Target Total = `steps[cur].cum`. *(See §16 — for PR-013B this must
  be derived from the real RecipeEngine, not the prototype's hard-coded array.)*
- **Window:** render `cur−1 … cur+2` → at most **4 rows** (Previous, Current,
  Next, Later). Fixed row height so head/tail steps keep the same skeleton.
- **Row states:**
  | State | Opacity | Treatment |
  |---|---|---|
  | Previous | .40 | small, faint, "完了/done", muted cumulative |
  | **Current** | 1.0 (max) | ringed dot, bold label, reached-cumulative, **1-line Tip**, background highlight |
  | Next | .72 | clear but weaker; amber + progress line link it to Countdown |
  | Later | .28 + blur | nearly a shadow; melts into gradient; predicts existence only |
- **Progress line (new):** a faint vertical track (`#E2D5BE`) with a thin amber
  segment (width 2 px) growing from the Current dot toward Next as time elapses;
  `height = rowH · (into/dur)`, `0.25s linear`, **synced to the Countdown ring**
  (same `into`). Quiet, not flashy.
- **Current Tip:** **Current row only.** One line, ~20 chars, ~10.5 px, muted
  (e.g. "中心からゆっくり注ぐ", "注ぎ終えたら Switch を閉じる"). No long text on
  Previous / Next / Later.

`PASS` — Sequence + progress model fully specified.

---

## 9. Controls model

- Three controls, bottom-fixed, evenly spaced: **Back** (54 px, outline),
  **Pause / Resume** (68 px, filled amber, primary), **Next** (54 px, amber-tinted).
- Pause toggles icon (pause ⇄ play) and label (Pause ⇄ Resume).
- Back / Next move the current step pointer (the prototype steps the timeline);
  in PR-013B these map onto the existing brew step navigation — **execution aid
  semantics only** (see §15). They do not edit the recipe.
- Footer sits on an opaque background above the Sequence fade, with safe-area
  bottom inset so it stays fixed and reachable on 375 × 667.

`PASS` — Controls layout/behavior explicit.
`NOTE` — Whether Back/Next are always visible or conditional (e.g. hidden on the
final drawdown) follows current Timer behavior; PR-013B keeps existing logic.

---

## 10. Copy / labels

**Use (from reference):**
- "Target Total · スケール目標", "次の注湯まで", "この投 +60g", "現在の注湯",
  "次の注湯", "完了", "この後", "最後のフェーズ", "落とし切りへ".
- Generic Countdown: "Next pour in 12s" / "Next step in 12s" /
  "Switch CLOSE まで 08s" / "Close Switch after this pour".
- One-line Tips (Current only), ~20 chars.

**Avoid (legal / overclaim):** any app-facing wording on the forbidden list in
the PR-013A brief — e.g. authority / endorsement claims, certification,
supervision, perfect-reproduction or guaranteed-success claims, or champion-taste
claims (English or Japanese). The data validator
(`docs/data/validate_tips_master.mjs`) already enforces this list on copy; PR-013B
must keep Timer UI strings within it.
Acceptable framing: *unofficial / non-official / design reference / implementation
plan / timer UI / target total / preview-before-timer.*

---

## 11. Mobile layout requirements

- **Reference frame: 375 × 667 (iPhone SE)** — verified in the prototype as
  **no-scroll, all elements simultaneously visible**: Header, Elapsed, Target
  Total, This Pour, Countdown, Current / Next, Controls, Sequence (≤ 4 rows).
- Sequence Bar uses `flex: 1` to absorb leftover height; Later rows are clipped
  by the bottom gradient mask, never causing scroll.
- Controls stay fixed at the bottom with safe-area inset.
- No horizontal overflow at 375 px (`scrollWidth === innerWidth === 375`, per the
  project's standing QA convention).

`PASS` — 375 px no-scroll is an explicit, verified target.

---

## 12. Accessibility requirements

- **Motion:** `prefers-reduced-motion` → disable row translation and use an
  **immediate cross-fade**; progress line / ring update without sliding.
- **Animation discipline:** only `transform` / `opacity` (+ slight `blur` on
  Later). `height` / `top` must not animate. Duration 550 ms,
  `cubic-bezier(.2,.8,.2,1)`. **Forbidden:** bounce, shake, excess glow,
  rotation, game/casino-like effects.
- **Numerals:** `font-variant-numeric: tabular-nums` for stable counting.
- Elapsed time / countdown should carry appropriate labels (e.g. existing
  `aria-label="経過時間"` pattern) for assistive tech.
- Color is never the *only* signal — state is also conveyed by size, opacity,
  ring, position, and the `+` sign.

`NOTE` — The reference specifies reduced-motion and animation discipline
explicitly; broader a11y (focus order, contrast ratios, touch target sizes) is
left for PR-013B to honor using existing app conventions.

---

## 13. Required PR-013B implementation scope

PR-013B is the **runtime** UI implementation. Likely affected files:
`index.html`, `app.js`, `styles.css`, and `docs/design/PR-013B_MEMORY_HANDOFF.md`.

PR-013B should implement:
1. **Countdown row** (new) under Target Total — thin ring (`r=15`, 2.5 px), ~29 px
   seconds, generic by step kind, no glow, no auto-advance at 0.
2. **Sequence Bar** (new / upgrade of `#brew-dots-row`) — Previous / Current /
   Next / Later windowed rows (`cur−1 … cur+2`, fixed row height), state styling
   per §8, bottom fade mask.
3. **Progress line** — amber segment synced to the Countdown ring.
4. **Current-row 1-line Tip** (Current only).
5. **Countdown ↔ Next semantic link** via shared amber + progress line.
6. **Hybrid / Switch treatment** — generic Countdown copy; promote to a charcoal
   banner when a Switch action is imminent (OPEN/CLOSE pill emphasis).
7. **Animation + reduced-motion** per §12 (550 ms transform/opacity, immediate
   cross-fade fallback).
8. **375 × 667 no-scroll stability** + controls layout polish (safe-area).
9. Preserve Target Total as the visual king (size/color dominance per §5).

`NOTE` — PR-013B drives all numbers from the **real RecipeEngine step data**; the
prototype's `cum [60,120,180,240,300]`, 12 s steps, and 5-step demo are
illustration only (see §16).

---

## 14. Out of scope for PR-013B

PR-013B must **not**:
- Change recipe schedules or pour math.
- Change `RecipeEngine` logic.
- Change History schema or storage / migration.
- Change My Recipes (any flow or feature).
- Redesign audio / notification behavior.
- Change the service worker (`sw.js`) or PWA manifest.
- Change the Preview-before-Timer, Finish / Brew Log, or Rebrew flows
  (beyond the Timer screen's own visuals).

---

## 15. Regression constraints

The Timer is an **execution aid, not a recipe editor.** PR-013B must preserve:
- **Preview-before-Timer**: user reviews Preview, then **manually** starts the Timer.
- The Timer does **not** auto-save History.
- **Finish screen / Brew Log** flow unchanged unless explicitly scoped later.
- **My Recipes** select → Preview → Start Brew unchanged.
- **History Detail → Rebrew** → Preview → Start Brew unchanged.
- **Finish → Same Setup** → Preview → Start Brew unchanged.
- Countdown at 0 **signals only** — no auto-advance / auto-confirm.
- Back / Next move the step pointer only; they never mutate the recipe.

---

## 16. Recipe truth constraints

PR-013A proposes **no recipe changes**, and PR-013B must preserve recipe truth.
The Ver.2.0 Sequence/Countdown is a **presentation layer over existing
RecipeEngine output** — the prototype's hard-coded numbers are not recipe truth.

- **4:6 Method:**
  - No regression to old `48/72` or `72/48` for balanced/basic (unless already an
    existing flavor variant).
  - Standard balanced `20g / 300g` remains valid.
  - `60/60/90/90` baseline remains valid where applicable.
- **Hybrid:**
  - Switch OPEN / CLOSED context stays text-visible.
  - No fixed room-temperature water amount; no fixed `20°C` / `20℃`.
- **Ice:**
  - HOT / ICE context stays visible.
  - Ratio-omission behavior in the My Recipes list is unrelated and unchanged.
- **NEO (10 Pour):**
  - 10-pour rhythm preserved.
  - `1:45` / `210g` preserved.

`NOTE` — The Countdown step durations and the gauge's `0–300g` framing in the
prototype are demo values; PR-013B must source durations, cumulative targets,
and step kinds from the real recipe so all four methods render their true
schedules.

---

## 17. QA checklist for PR-013B

When PR-013B is implemented, verify:
- [ ] Target Total remains the single strongest element (≈ 84 px; nothing rivals it).
- [ ] Countdown is clearly subordinate (≈ ⅓ Target size, amber, no glow); never
      matches Target's size/color; does not auto-advance at 0.
- [ ] Sequence Bar shows ≤ 4 rows with correct Previous/Current/Next/Later states;
      Later is nearly invisible; Current has ring + highlight + 1-line Tip.
- [ ] Progress line grows from Current toward Next and is synced to the ring.
- [ ] This Pour always shows `+` and is color-separated from Target Total.
- [ ] 375 × 667: all elements visible with **no scroll**; no horizontal overflow.
- [ ] Controls fixed at bottom with safe-area; Back / Pause / Next work.
- [ ] Animation uses only transform/opacity (550 ms); no bounce/shake/glow/rotation.
- [ ] `prefers-reduced-motion` → immediate cross-fade, no sliding.
- [ ] Generic Countdown copy correct per step kind (pour / step / Switch).
- [ ] Hybrid: Switch OPEN/CLOSE visible; charcoal banner promotes near a Switch.
- [ ] Recipe truth intact for all four methods (4:6 `60/60/90/90`; Hybrid Switch,
      no fixed `20℃`; Ice HOT/ICE; NEO 10 pours, `1:45`/`210g`).
- [ ] Preview-before-Timer, no auto-save History, Finish/Rebrew/My Recipes flows
      unchanged.
- [ ] No forbidden / overclaim wording introduced.
- [ ] `node --check app.js` → OK; `node docs/data/validate_tips_master.mjs` →
      `PASS: 40 FAIL: 0 ALL CHECKS PASS`; no console warn/error in the Timer.

---

## 18. Open questions / ambiguities

1. `TBD` — **Node reuse vs replace.** The reference does not say whether PR-013B
   should repurpose existing nodes (`#brew-dots-row`, `#brew-draw-card`) or add
   new ones. Recommendation (`NOTE`): upgrade `#brew-dots-row` into the Sequence
   Bar and fold the drawdown into the Sequence/Countdown "last phase", but the
   exact DOM mapping is a PR-013B implementation decision.
2. `NOTE` — **Stray internal label.** The design artifact's implementation note
   carries an internal "PR-002：静的シェル＋モーション基盤のみ" scope tag — an
   artifact of the source template, **not** PR-013 scope. Ignore it; PR-013B's
   scope is §13.
3. `TBD` — **Charcoal Switch banner exact thresholds.** The reference says
   "promote when the Switch action is near" but does not fix the seconds
   threshold. PR-013B to choose a sensible value consistent with existing Hybrid
   step timing.
4. `TBD` — **Countdown duration source.** The prototype uses a flat 12 s/step;
   real steps vary. PR-013B must use per-step durations from RecipeEngine, and
   decide display when a step has no defined countdown (e.g. open-ended drawdown).
5. `NOTE` — **px → token mapping.** Exact pixel sizes (84 / 29 / 23 / 13) are
   targets; PR-013B should map them onto the existing CSS variable scale while
   preserving the *ratios* and 375 px no-scroll.
6. `TBD` — **Gauge `0–300g` framing.** The prototype hard-codes a 300 g gauge
   max; PR-013B should scale the gauge to each recipe's actual final target.

---

## 19. Final recommendation

- **Adopt Option A (Countdown Central)** as specified by the reference: Target
  Total (king) → independent Countdown → Sequence Bar, bound into one amber flow
  via the progress line, with Current-row 1-line Tips.
- Implement it in **PR-013B** as a presentation-layer refine over the existing
  Timer, sourcing all numbers from the real RecipeEngine and preserving recipe
  truth and every execution-aid constraint in §15–§16.
- This PR-013A is **docs-only**; no runtime files change here.
- **Next step:** Independent Verification of PR-013A. If PASS, merge, then proceed
  to PR-013B Timer Ver.2.0 runtime implementation.
