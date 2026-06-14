# PR-011I — Common Micro Icon Replacement Pass — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-011i-common-micro-icon-replacement-pass`
- Base: `main` (`0aa9784`, PR-011R6A History Detail Rebrew CTA Polish, merged)
- PR title: `PR-011I: Common Micro Icon Replacement Pass` (Draft)

## Commit
- `PR-011I: consolidate summary icons into common micro icon helper`

## Changed files
- `app.js` — single change site (micro icon registry + helper + summary icon set)
- `index.html` — **not changed**
- `styles.css` — **not changed**
- `docs/design/PR-011I_MEMORY_HANDOFF.md` — this handoff

## Goal
A common micro icon **consistency pass**, not an asset import. The app had two
parallel inline-SVG registries for the same 13px line-icon family:

1. `MICRO_ICON_PATHS` + `microIcon()` (PR-011R4B) — Brew Timer context.
2. A separate `_icons` object — recipe summary columns (`buildSummaryCols`).

This PR makes `MICRO_ICON_PATHS` / `microIcon()` the **single source of truth**
for that family and routes the summary icons through it, eliminating the duplicate
registry and preventing future drift.

## What changed (`app.js`)
- `MICRO_ICON_PATHS`: added four path entries shared with the summary columns —
  `bean`, `droplet`, `ratio`, `snowflake`. (Summary `timer` reuses the existing
  `elapsed` path, which was byte-identical to the old `_icons.timer`.)
- `microIcon(name, size, opts)`: extended **additively** with an options arg:
  - `opts.strokeWidth` — overrides the default `1.7` (summary icons keep their
    original per-icon weights: bean 1.7, droplet 1.8, ratio 1.6, snowflake 1.6,
    timer 1.7).
  - `opts.muted` — when `false`, the `.micro-icon` class (opacity 0.78) is dropped
    so summary icons keep their original full-opacity accent look.
  - Defaults are unchanged, so all existing Timer call sites are byte-for-byte
    identical (`class="micro-icon"`, `stroke-width="1.7"`).
- `_icons`: rebuilt from `microIcon(... , { muted:false, strokeWidth:<orig> })`
  instead of duplicated literal SVG strings. Relocated **after**
  `MICRO_ICON_PATHS` / `microIcon()` to avoid a `const` temporal-dead-zone error
  (it previously sat before the registry).
- Registry comment updated to describe it as the shared (Timer + summary) family.

## Visual / behavior safety
- **Zero visual change** to the summary columns. The rendered SVGs differ from the
  old literals only by additions that do not affect pixels:
  - `class=""` (no `.micro-icon` opacity applied — full opacity preserved),
  - `stroke-linejoin="round"` added (only `bean` lacked it; its paths are a circle
    + a single smooth curve, so there are no joins to affect),
  - `aria-hidden="true" focusable="false"` — a correct a11y improvement; every
    summary icon already has an adjacent text label, so the icon is decorative.
  - Per-icon `stroke-width` and `width=13` preserved; color still inherits the
    `.summary-col-icon` accent via `currentColor`.
- **Timer micro icons unchanged.** `initBrew` / `updateBrewStep` call sites and the
  `microIcon()` default output are untouched.

## What did NOT change
- `index.html`, `styles.css` — untouched (no markup or CSS edits needed).
- Timer / Finish / History / History Detail / Rebrew behavior and copy.
- RecipeEngine, recipe schedules, pour amounts, timings, switchState data.
- History item schema, localStorage schema, CSV / JSON export, import.
- PWA / service worker / manifest / build config.
- No external icon package; no asset pipeline; no PNG/asset import.
- PR-012 / My Recipes — not started.

## Out of scope (audited, intentionally left)
- **Method `icon` / `iconSm` inline SVGs + `iconSvgFor()`** (`app.js` METHODS) —
  these are **dead code** (the app renders method visuals via the PNG
  `methodImgHTML` since the icon-asset integration). Not micro-icon family; removal
  flagged as a separate cleanup to keep this PR focused.
- **Affordance icons** (list-row chevrons, button arrow, selected-card check) —
  different family: `stroke-width="2"`, explicit non-`currentColor` colors,
  standalone (no text label). Folding them into `microIcon()` would change their
  weight/color — not a safe swap.
- **`.ctx-tip-head` info icon** — a head accent icon using an explicit accent
  stroke (not `currentColor`); not folded in to avoid a color regression.

## QA results
- `git diff --name-only`: `app.js` (+ new handoff doc)
- `git diff --stat`: `app.js` | 32 insertions(+), 19 deletions(-)
- `node --check app.js`: OK
- `node docs/data/validate_tips_master.mjs`: PASS: 40  FAIL: 0  ALL CHECKS PASS
- Local preview (port 4005, 375px mobile, SW unregistered + caches cleared):
  - No console errors.
  - Registry: `bean` / `droplet` / `ratio` / `snowflake` present; `elapsed`
    byte-identical to the old summary `timer`.
  - Setup summary grid (4:6): 5 icons, all `class=""`, `aria-hidden="true"`,
    stroke-widths 1.7 / 1.8 / 1.6 / 1.8 / 1.7 (bean / お湯 / 比率 / 投数 / 目安).
  - Ice summary: 5 icons incl. `snowflake` (4 paths, sw 1.6) for ICE; full-opacity
    accent, no overflow.
  - Timer `microIcon()` default output still emits `class="micro-icon"` /
    `stroke-width="1.7"`.

## Known limitations
- Visual consolidation only; no new runtime behavior.
- Dead method `icon`/`iconSm` SVGs remain (flagged for a separate cleanup PR).

## Next recommended step
Independent Verification for PR-011I. After PASS, mark Ready for review and
Squash and merge. Then consider PR-012 (My Recipes) planning.
