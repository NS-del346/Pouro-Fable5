# PR-013A — Timer Ver.2.0 Design Spec / Implementation Plan — Memory Handoff

## Status
Draft / pending Independent Verification.

## Branch / PR info
- Branch: `pr-013a-timer-v2-design-spec-plan`
- Base: `main` (at PR-012F merge `f32e71fe37042a70a39d5980e2ea65a2da648925`)
- PR: PR-013A: Timer Ver.2.0 Design Spec and Implementation Plan (Draft)

## Commit
- `PR-013A: document Timer Ver.2.0 design spec`

## Changed files
- `docs/design/PR-013A_TIMER_V2_SPEC.md` — the Timer Ver.2.0 design spec /
  implementation plan (19 sections).
- `docs/design/PR-013A_MEMORY_HANDOFF.md` — this handoff.
- **No runtime files changed.** `app.js`, `index.html`, `styles.css`, `sw.js`,
  `manifest.webmanifest`, `assets/*`, `docs/data/*`, package files **not touched**.
  Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) **not touched**.

## Source of truth used
- `PR-013 Timer Ver.2.0 Refine.dc(1).html` (uploaded design artifact; local copy
  `PR-013 Timer Ver.2.0 Refine.dc.html`) — the PR-013 Timer Ver.2.0 reference.
  It adopts **Option A (Countdown Central)** over Option B (Sequence Integrated).
- The current Timer baseline in `index.html` / `app.js` at `main` HEAD
  `f32e71f` (the merged PR-012F build), inspected to describe the delta.
- Token source cited by the reference: `design-artifact/Pouro-Fable5.dc.html`.

## What changed
- Added a docs-only spec translating the PR-013 design reference into an
  implementation-ready plan: information hierarchy (Target Total = king),
  Countdown/Target-Total semantics, step Sequence + progress-line model,
  Current-row 1-line Tips, controls model, copy/labels, 375 × 667 no-scroll
  requirements, accessibility (reduced-motion + animation discipline), a defined
  PR-013B scope and out-of-scope boundary, regression + recipe-truth constraints,
  a PR-013B QA checklist, and open questions.

## What did not change
- No app code, RecipeEngine, recipe schedules, pour math, History schema,
  storage/migration, Settings, audio, notifications, service worker, PWA/manifest,
  or assets.
- No My Recipes changes. No PR-013B runtime implementation started.

## Timer Ver.2.0 design summary
- **King = Target Total** (84 px Lora numeral + gauge); everything else is
  subordinate and must not rival it.
- **Adopted layout (Option A):** Header → Target Total → independent **Countdown
  row** → **Sequence Bar** (Previous / Current / Next / Later, ≤ 4 rows, fixed
  row height, bottom fade) → bottom-fixed Controls (Back / Pause / Next).
- **Countdown:** thin ring (`r=15`, 2.5 px, no glow), ~29 px seconds (≈ ⅓ Target),
  generic by step kind (pour / step / Switch); at 0 it **signals only**, never
  auto-advances, never matches Target's size/color.
- **Sequence:** Current is max-emphasis (ring + highlight + 1-line Tip); Next .72;
  Previous .40; Later .28 + blur. A thin amber **progress line** grows from
  Current toward Next, synced to the Countdown ring.
- **Hybrid/Switch:** generic Countdown copy ("Switch CLOSE まで 08s"); promote to
  a charcoal banner when a Switch is imminent.
- **Animation:** transform/opacity only, 550 ms `cubic-bezier(.2,.8,.2,1)`;
  `prefers-reduced-motion` → immediate cross-fade. No bounce/shake/glow/rotation.
- **Mobile:** 375 × 667 no-scroll, all elements visible; controls safe-area-fixed.

## PR-013B recommended scope
- Implement: Countdown row, Sequence Bar (upgrade of `#brew-dots-row`),
  progress line synced to ring, Current-row 1-line Tip, Countdown↔Next amber
  link, Hybrid charcoal Switch banner, animation + reduced-motion, 375 px
  no-scroll polish — all sourcing numbers from the real RecipeEngine while
  keeping Target Total the king.
- Likely files: `app.js`, `index.html`, `styles.css`,
  `docs/design/PR-013B_MEMORY_HANDOFF.md`.
- QA focus: Target-Total dominance, Countdown subordination + no auto-advance,
  Sequence states + progress sync, 375 px no-scroll/no-overflow, reduced-motion,
  recipe truth for all four methods, unchanged Preview/Finish/Rebrew/My Recipes.

## PR-013B out of scope
- Recipe schedules / pour math, RecipeEngine, History schema, storage/migration,
  My Recipes, audio redesign, notification redesign, service worker, PWA manifest.

## Regression constraints
- Preview-before-Timer; user manually starts Timer; Timer does not auto-save
  History; Finish / Brew Log unchanged; My Recipes / History-Rebrew /
  Finish-Same-Setup → Preview → Start Brew unchanged; Countdown at 0 signals
  only; Back/Next move the step pointer only (never edit the recipe).

## Recipe truth constraints
- 4:6: no `48/72` or `72/48` regression for balanced/basic; `20g/300g` valid;
  `60/60/90/90` baseline valid where applicable.
- Hybrid: Switch OPEN/CLOSED text-visible; no fixed room-temp water; no `20℃`.
- Ice: HOT/ICE visible; My-Recipes ratio omission unrelated/unchanged.
- NEO: 10-pour rhythm; `1:45` / `210g` preserved.
- The prototype's `cum [60,120,180,240,300]`, 12 s steps, 5-step demo, and 300 g
  gauge max are illustration only — PR-013B drives from real recipe data.

## Known ambiguities
- Node reuse vs replace for `#brew-dots-row` / `#brew-draw-card` (PR-013B decides;
  recommend upgrading dots → Sequence Bar, fold drawdown into "last phase").
- Charcoal Switch banner threshold (seconds) not fixed by the reference.
- Countdown duration source per step (use RecipeEngine; handle open-ended steps).
- px → CSS-token mapping (preserve ratios + 375 px no-scroll).
- Gauge `0–300g` framing is demo; scale to each recipe's real final target.
- The artifact's internal "PR-002" scope tag is a template artifact, not PR-013
  scope — ignore.

## Next recommended step
Independent Verification for PR-013A. If PASS, merge PR-013A. Then proceed to
PR-013B Timer Ver.2.0 runtime implementation.
