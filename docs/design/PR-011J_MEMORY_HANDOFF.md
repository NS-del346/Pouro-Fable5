# PR-011J Memory Handoff — Remove Dead Method Icon SVG Code

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-011j-remove-dead-method-icon-svg-code`
- Base: `main` (at `a3ed0e1`, PR-011I merged)
- PR title: PR-011J: Remove Dead Method Icon SVG Code
- PR: see report (Draft)

## Commit
`PR-011J: remove dead method icon SVG code` — see report for hash.

## Changed files
- `app.js` (14 deletions, 0 additions)
- `docs/design/PR-011J_MEMORY_HANDOFF.md` (new)

No changes to `index.html` or `styles.css`.

## What changed
Removed confirmed-unused, inline-SVG method icon dead code that the
PNG-based method visual path (`methodImgHTML`, added in PR-006A) had
superseded:

1. `icon` field removed from all four `METHODS` entries (`yon-roku`,
   `hybrid`, `neo`, `ice`).
2. `iconSm` field removed from the same four entries.
3. `iconSvgFor(methodId, size)` helper function removed (it was the only
   consumer of `METHODS[*].icon`, and nothing called `iconSvgFor`).
4. The now-orphaned `/* ── SVG helpers ── */` section header above
   `iconSvgFor` was removed (directly related to the deleted code).

## What did not change
- `methodImgHTML()` and the PNG `img:` references (`assets/method-*.png`)
  — the live method visual path, untouched.
- `MICRO_ICON_PATHS`, `microIcon()` — common micro icon helper (PR-011I).
- Summary column `_icons` map / `summaryColHTML`.
- Method IDs, `num`, `name`, `sub`, `desc`, `meters`, `hasFlavorStrength`,
  `checklist`, `img`, and `METHOD_ORDER`.
- RecipeEngine, `_buildYonRoku` / `_buildHybrid` / `_buildNeo` / `_buildIce`,
  recipe schedules, pour amounts, timings, switchState.
- History schema, localStorage schema, CSV/JSON export, import logic.
- PWA / manifest / `sw.js`, build config, `docs/data/*`.

## Dead-code reference audit (pre-deletion, on `main` @ a3ed0e1)
- `iconSvgFor` — defined once at `app.js:1104`; **zero call sites** in
  `app.js` / `index.html` / `styles.css`. Other hits are docs only
  (`PR-011I_MEMORY_HANDOFF.md`, which flagged it for this cleanup).
- `.iconSm` — present only in the four `METHODS` definitions; **no readers**.
- `METHODS[*].icon` — read only inside `iconSvgFor`; no other readers.
- `methodImgHTML` — live render path, used across Home / Setup / Preview /
  Timer / Finish / History / History Detail (`app.js` lines 522, 1548,
  1609, 1630, 1662, 1779, 1848, 1917, 1972, 2018). Reads `m.img`, never
  `m.icon`/`m.iconSm`. Confirmed independent of removed code.

## Deletion decisions
All three candidates proven unused → removed. No live rendering path
references the removed fields/function, so removal is behavior-neutral.

## Visual QA results (local preview, 375px mobile)
- Home method cards: render, all 4 cards visible.
- Method images (PNG): render on Home / Setup / Preview / Timer / Finish /
  History / History Detail.
- Setup: renders (40px method PNG, ratio + 10-pour rhythm + summary).
- Preview: renders (schedule incl. NEO 1:45 → 210g preserved).
- Timer: renders (method PNG, 10-pour progress dots).
- Finish (記録): renders (40px method PNG, tips/rating/taste).
- History + History Detail: render (featured card + list + detail schedule).
- No horizontal overflow.
- No console errors.

Method spot checks: 4:6 / Hybrid / NEO / Ice cards + PNG images all visible;
no old 48/72 SVG sizes reintroduced; NEO 10-pour rhythm and 1:45 / 210g
preserved.

## Validation results
- `node --check app.js` → OK
- `node docs/data/validate_tips_master.mjs` → PASS: 40  FAIL: 0  ALL CHECKS PASS
- Post-delete grep (`iconSvgFor` / `iconSm` / `icon:` in app.js) → no matches

## Known limitations
- None. Pure dead-code removal; no behavior or data change.

## Next recommended step
Independent Verification for PR-011J, then mark Ready for review and
Squash and merge.
