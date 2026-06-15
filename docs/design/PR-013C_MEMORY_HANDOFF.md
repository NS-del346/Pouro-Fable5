# PR-013C — Timer Ver.2.0 Public / Local Smoke QA — Memory Handoff

## Status
Draft / pending Independent Verification. Docs-only QA PR. No runtime files changed.
Result: **Local QA PASS · Public QA PASS WITH NOTE. No blocker found.**

## Branch / PR info
- Branch: `pr-013c-timer-v2-public-local-smoke-qa`
- Base: `main` (at PR-013B merge `db908f2210270cc691bd57b9de10624dcafa1924`)
- PR: PR-013C: Timer Ver.2.0 Public and Local Smoke QA (Draft)

## Commit
- `PR-013C: document Timer Ver.2.0 public and local smoke QA`

## Changed files
- `docs/design/PR-013C_TIMER_V2_SMOKE_QA.md` — the QA report.
- `docs/design/PR-013C_MEMORY_HANDOFF.md` — this handoff.

No runtime files touched. `app.js`, `index.html`, `styles.css`, `sw.js`,
`manifest.webmanifest`, `assets/*`, `docs/data/*`, and package files are unchanged.
Pre-existing untracked files (`.claude/launch.json`,
`docs/PR-006A-VISUAL-PARITY-AUDIT.md`) were not touched.

## Source of truth used
- `docs/design/PR-013A_TIMER_V2_SPEC.md` (Option A hierarchy, Countdown semantics,
  Sequence model, mobile, a11y/motion, regression, recipe truth).
- `docs/design/PR-013B_MEMORY_HANDOFF.md` (runtime implementation summary).
- Live behavior of the merged PR-013B build (local preview + public GitHub Pages).

## What changed
Added a docs-only QA report and this handoff proving Timer Ver.2.0 works on local
preview and on the public GitHub Pages URL. No app behavior was modified.

## What did not change
- RecipeEngine, recipe schedules, pour math, step timings, switch states.
- History schema / storage key (`pouroFable5.history.v1`).
- My Recipes schema / storage key (`pouroFable5.myRecipes.v1`) and all flows.
- Service worker, manifest, PWA, audio, notifications, auto-advance.
- Timer UI, controls, Preview / Finish / Rebrew flows.

## Local QA summary
PASS. Environment: `npx serve .` (launch config `pouro-fable5`, served on
`http://localhost:4005`), viewport **375 × 667 exact**, SW unregistered + caches
cleared for the session (`sw.js` not modified). All 24 checklist items PASS: Ver.2.0
layout, Target Total dominant (72 px), Countdown subordinate (29 px, ratio 0.403),
Countdown-0 non-auto-advance, This Pour `+60` color-separated, 4-row Sequence Bar,
Back/Pause/Resume/Next/Finish, explicit-only Save to History, Same Setup, History
Rebrew, My Recipes select/rename/delete, no overflow, no vertical scroll, no console
errors.

## Public QA summary
PASS WITH NOTE. URL `https://ns-del346.github.io/Pouro-Fable5/`, local Chrome
(Windows) via automation. **Deployment is fresh**: deployed `index.html` byte-identical
and `app.js` content-identical (MD5 match) to the merged PR-013B source; all Ver.2.0
markers present; `Last-Modified 2026-06-15 23:19 GMT`. **First load was served by the
stale cache-first SW** (Ver.2.0 nodes absent); after unregistering the SW + clearing
caches and reloading, the fresh Timer Ver.2.0 rendered. Functional smoke PASS
(hierarchy, Countdown-0 non-auto-advance, controls, Finish, explicit-only Save).
NOTE: the automation browser window could not be reduced below ~1024 px CSS width, so
**exact 375 px public layout was not live-measured** — verified locally on
byte-identical code; no horizontal overflow at the tested width.

## Timer hierarchy status
PASS (local + public). Target Total 72 px Lora ink is the single king; Countdown 29 px
amber (ratio ≈ ⅓); This Pour `+60` ink, color-separated. Current row carries the
1-line Tip; Later rows faint and windowed (≤ 4 rows).

## Countdown behavior status
PASS. Countdown reaches 0 (verified at elapsed 71 s local / 72 s public on a 45 s
step); at 0 the step does **not** auto-advance (index unchanged, no Next pressed),
History does **not** change, and the user must press Next to advance.

## Recipe truth status
PASS for all four methods (from `RecipeEngine.build`):
- 4:6: pours **60/60/90/90**, cum 60/120/210/300, final 300 g — no 48/72 regression.
- Hybrid: Switch open/open/closed/open text-visible; chip「スイッチ 開 / OPEN」+
  next-close「1:15で閉じる」; **no fixed 20℃ / room-temp water amount** on the Timer.
- Ice: HOT/ICE context「HOT 150g・ICE 80g」; scale label「スケール目標（湯のみ）」;
  HOT to 150 g.
- NEO: **10 pours preserved** + drawdown; **210 g at 1:45** preserved; context row
  hidden (Standard Timer).

## History / Rebrew regression status
PASS. No auto-write through a full brew + Finish (local 22→22, public 5→5); explicit
Save added exactly 1 on each origin (then removed). History Detail → Rebrew → Preview
and Finish → Same Setup → Preview both intact.

## My Recipes regression status
PASS (local). Select → Preview → Start Brew, rename, and delete all work; Timer does
not mutate My Recipes storage; store returned to `[]` after the QA recipe was deleted.

## Storage cleanup
Done. Local History restored to 22 (QA entry `h_1781566009508` removed); local My
Recipes restored to `[]`; public History restored to 5 (QA entry `h_1781566466090`
removed); public My Recipes key remained absent. Settings untouched. No storage
artifacts committed.

## Issues found
1. Informational: returning public users on the old cache-first SW keep the previous
   Timer until the SW cache refreshes (expected cache-first trade-off; deployed source
   is correct). Not a blocker.
2. Minor cosmetic, non-visible: for NEO, `#brew-context-chip` retains stale text from a
   prior method while the context row is `hidden` (so it is not user-visible). Out of
   scope for this docs-only PR.

## Required fixes
None for PR-013C. Optional separate follow-up: clear context chip/desc text when the
context row is hidden (cosmetic, non-visible).

## Known limitations
- `prefers-reduced-motion` Timer rules are present in `styles.css` (numeral fade /
  gauge / Countdown ring / Sequence fill+row transitions disabled) but the preview
  harness cannot toggle that media feature — **code-verified, not live-emulated**.
- Exact 375 px **public** layout not live-measured (browser window minimum width);
  verified locally on byte-identical code.
- Public interactive flow was driven via the app's real functions/handlers in the live
  page (deterministic), equivalent to a manual run of the same byte-identical code.

## Next recommended step
Independent Verification for PR-013C. If PASS, mark Ready for review and Squash and
merge. Then decide the next Timer polish or move to the next planned feature.
