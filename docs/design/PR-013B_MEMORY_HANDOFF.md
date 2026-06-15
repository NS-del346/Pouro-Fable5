# PR-013B — Timer Ver.2.0 Runtime Implementation — Memory Handoff

## Status
Draft / pending Independent Verification.

## Branch / PR info
- Branch: `pr-013b-timer-v2-runtime-implementation`
- Base: `main` (at PR-013A merge `67e1db21e530e98e22abbc43457dbfd32cde3e14`)
- PR: PR-013B: Timer Ver.2.0 Runtime Implementation (Draft)

## Commit
- `PR-013B: implement Timer Ver.2.0 runtime UI`

## Changed files
- `index.html` — Active Brew (`#screen-brew`) restructured: gauge added to the
  Target Total hero; new Countdown row (`#brew-countdown-row`); the step-dots row
  (`#brew-dots-row`) replaced by the Sequence Bar container (`#brew-seq`); the
  hero foot (This Pour | Next) removed (This Pour relocated into the Countdown
  row, Next now read from the Sequence Bar).
- `app.js` — DOM cache updated; `updateBrewStep` now drives the gauge + Countdown
  + Sequence; new `_updateBrewSequence`, `_updateBrewCountdown`,
  `_countdownLabel`, `_setSeqProgress`; `_updateBrewDots` removed; live countdown
  + progress-line tick wired into `_updateTimerDisplay`.
- `styles.css` — Target Total gauge, Countdown row, Sequence Bar (rows/states/
  progress line/fade mask), quiet numeral cross-fade, and reduced-motion rules.
- `docs/design/PR-013B_MEMORY_HANDOFF.md` — this handoff.

No other files touched. `sw.js`, `manifest.webmanifest`, `assets/*`,
`docs/data/*`, recipe data, and package files are unchanged. Pre-existing
untracked files (`.claude/launch.json`, `docs/PR-006A-VISUAL-PARITY-AUDIT.md`)
were not touched.

## Source of truth used
- `docs/design/PR-013A_TIMER_V2_SPEC.md` (the implementation contract — Option A
  "Countdown Central", §5 hierarchy, §7 Countdown semantics, §8 Sequence model,
  §11 mobile, §12 a11y/motion, §15 regression, §16 recipe truth).
- `docs/design/PR-013A_MEMORY_HANDOFF.md`.

## What changed
Implemented the Timer Ver.2.0 runtime UI as a **presentation layer** over the
existing RecipeEngine output, adopting Option A from PR-013A:

1. **Target Total (king)** — kept the `.brew-hero` 72 px Lora numeral + `g` as the
   single dominant element, with a new 0 → final-target **gauge** below it. A
   quiet numeral cross-fade (opacity/transform, ~0.42 s) plays on step change.
2. **Countdown row (rank 2, subordinate)** — new card directly under the hero:
   thin ring (`r=15`, 2.5 px, amber, no glow) + a drop micro-icon, a generic
   label (`#brew-cd-label`), the seconds at 29 px (≈ ⅓ of Target), and **This
   Pour** (`+Ng`) on the right. The seconds, ring, and label are derived from the
   real step schedule (`steps[idx].timeSec → steps[idx+1].timeSec`).
3. **Sequence Bar** — replaces the step-dots row. Windowed Previous / Current /
   Next / Later rows (`cur−1 … cur+2`, ≤ 4 rows, `flex:1` to absorb leftover
   height, bottom fade mask). Current row is max-emphasis (ringed dot, bold label,
   reached cumulative, 1-line Tip). A vertical **progress line** in the rail grows
   from Current toward Next, **synced to the Countdown ring** (same `into/dur`),
   animated with `transform: scaleY` only.
4. **Hybrid / Switch** — the existing context banner (text-visible OPEN/CLOSED +
   next-switch time) is preserved; the Countdown label promotes to
   "Switch を閉じるまで / を開けるまで" when a Switch action is the next boundary.

## What did not change
- RecipeEngine, recipe schedules, pour math, step timings/`timeSec`,
  `switchState` data, cumulative targets, step count/order.
- History schema and storage key (`pouroFable5.history.v1`).
- My Recipes schema and storage key (`pouroFable5.myRecipes.v1`) and every My
  Recipes flow (save/list/select/rename/delete).
- Finish / Brew Log, Save to History, Rebrew, Finish-Same-Setup, Preview, Setup,
  Home flows (logic untouched; only the Timer screen's own visuals changed).
- Service worker, manifest, PWA install, audio, notifications, auto-advance.

## Timer Ver.2.0 implementation summary
- **Target Total behavior:** cumulative `steps[idx].totalAmount` ("…g まで注ぐ"),
  72 px hero numeral, gauge filled to `totalAmount / finalTarget`
  (`finalTarget = max(totalAmount)`), so each method scales to its real final
  target (no hard-coded 300 g). Drawdown keeps the existing draw card.
- **Countdown behavior:** `remain = max(0, dur − into)`, `dur = next.timeSec −
  step.timeSec`, `into = clamp(elapsed − step.timeSec, 0, dur)`. Ring depletes
  with `remain/dur`. **At 0 it signals only** — no auto-advance, no auto-confirm,
  no History write. Last step (no next) shows a calm "最後のフェーズ・落とし切りへ".
- **Sequence/progress behavior:** windowed over real steps; states opacity-led
  (Current 1.0 > Next .72 > Previous .4 > Later .28 + slight blur). Progress line
  `scaleY(into/dur)` synced to the ring; previous connectors full, later empty.
- **Controls behavior:** unchanged Back / Pause·Resume / Next. Back snaps elapsed
  to the step `timeSec` (pre-existing PR-003 behavior); Next advances the pointer;
  the final step shows "完了" and routes to the Brew Log. Controls stay bottom-fixed
  via the scroll container's `calc(12px + var(--safe-bottom))` inset.
- **Mobile layout behavior:** at 375 × 667 the screen is **no-scroll and has no
  horizontal overflow** (`scrollWidth === innerWidth === 375`,
  `scrollHeight === innerHeight === 667`); the Sequence Bar absorbs leftover
  height and clips Later rows with a gradient mask.
- **Accessibility / motion behavior:** `tabular-nums` on Target Total, Countdown,
  This Pour, and Sequence cumulatives; text labels (not colour-only) for OPEN/
  CLOSED, HOT/ICE, and step states; animation is `transform`/`opacity`/`scaleY`
  only (no bounce/shake/glow/rotation); `prefers-reduced-motion` disables the
  numeral cross-fade and the gauge/ring/fill/row transitions (immediate update).

## Recipe truth status
- **4:6** balanced/standard renders 60 / 60 / 90 / 90 (cum 60/120/210/300) — the
  60/60/90/90 baseline; no 48/72 or 72/48 regression. 20 g / 300 g valid.
- **Hybrid** Switch OPEN/CLOSED context stays text-visible; the next-switch time
  comes from the schedule (e.g. "1:15で閉じる"); no fixed room-temp water, no `20℃`.
- **Ice** HOT/ICE banner visible ("HOT 150g · ICE 80g"); scale label
  "スケール目標（湯のみ）"; tips show "（HOT）".
- **NEO (10 Pour)** 10 pours preserved (`1/10 … 10/10`), final 210 g preserved;
  the Sequence Bar windows the 10 pours into ≤ 4 rows.
All numbers are sourced from `RecipeEngine.build(...)` — no prototype hard-coded
values introduced.

## History / Rebrew / My Recipes regression status
- Timer does **not** auto-write History: a full QA brew left the History count
  unchanged; only the explicit "記録を保存" added exactly one entry (verified
  before/after; the test entry was then removed to leave local data as found).
- History list → Rebrew → Preview → Start Brew → Timer renders correctly.
- Finish → Brew Log → "同じ条件でもう一度" (Same Setup) path intact.
- My Recipes schema/flows untouched; no app.js reference to the removed DOM ids
  (`brew-next-target`, `brew-pour-note`, `brew-dots-row`) remains.

## QA results
- `node --check app.js` → OK.
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`.
- Reference checks: `pouroFable5.history.v1` / `pouroFable5.myRecipes.v1` present
  and unchanged; **no forbidden/overclaim wording** in app-facing
  `app.js` / `index.html` / `styles.css`.
- Manual QA at 375 × 667 (local preview, SW unregistered + caches cleared for the
  local session only — `sw.js` not modified):
  - 4:6 / Hybrid / Ice / NEO Timer all render the Ver.2.0 layout with Target Total
    dominant (72 px) and Countdown subordinate (29 px, ratio ≈ 0.40).
  - Countdown reaches 0 without auto-advancing (step counter unchanged at 0).
  - Back / Pause·Resume / Next work; Finish → Brew Log; Save to History adds 1.
  - History Rebrew → Preview → Start Brew works.
  - No horizontal overflow; no vertical scroll; no console errors.

## Known limitations
- `prefers-reduced-motion` is implemented in CSS but could not be toggled in the
  preview harness (no motion-emulation control); verified by code inspection.
  Independent Verification should confirm with browser emulation.
- The Countdown is a schedule-derived cue: if the user lingers past a step's
  scheduled duration (without pressing Next), it sits at 0 by design — it never
  advances on its own.

## Next recommended step
Independent Verification for PR-013B. If PASS, merge PR-013B. Then run PR-013C
Public / Local Smoke QA for Timer Ver.2.0.
