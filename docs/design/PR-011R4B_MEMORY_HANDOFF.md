# PR-011R4B — Common Micro Icon Integration (Memory / Handoff)

## 1. Status

Implementation PR for the Brew Timer / Active Brew UI. **Draft** (open).
Independent Verification: **pending**.

Builds directly on PR-011R4A (Target-Total-first Timer hierarchy, merged to `main`
as `6251578`). This PR adds a small, consistent **common micro icon** layer to the
Timer context and cleans up the Switch-only context row so it reads as a generic
context row.

- Scope is **Timer / Active Brew UI only**.
- No recipe schedule / RecipeEngine / runtime semantics changed.
- No `docs/data/*`, History, Settings, Method Detail, storage, export, import,
  or PWA changes.
- PR-012 / My Recipes / Dark Mode / Rebrew refinement **not started**.

## 2. Branch / PR info

- Base branch: `main` (`6251578`)
- Feature branch: `pr-011r4b-common-micro-icon-integration`
- Commit message: `PR-011R4B: integrate common micro icons`
- PR title: `PR-011R4B: Common Micro Icon Integration`
- PR state: **Draft**
- Independent Verification: **pending**

(PR number / URL and commit hash recorded in the self-report and updated in the
post-merge handoff.)

## 3. What changed

### `app.js`
- Added a minimal, **local, Timer-only micro icon registry + helper**:
  - `MICRO_ICON_PATHS` — path data for nine abstract, line-based icons:
    `scale-target`, `pour-plus`, `next-target`, `elapsed`, `switch-open`,
    `switch-closed`, `hot-water`, `ice`, `drawdown`.
  - `microIcon(name, size = 13)` — wraps the path in a consistent, `aria-hidden`
    `<svg class="micro-icon" ...>` using `currentColor`. Returns `''` for unknown
    names. No external package; no app-wide icon framework.
- `cacheDOM`: renamed `brewSwitchRow/Chip/Desc` → `brewContextRow/Chip/Desc`;
  added `brewCumIcon`, `brewPourLabel`, `brewNextLabelTxt` for the label icon slots.
- `initBrew`: injects the constant-label micro icons once per brew —
  `scale-target` on the hero label, `pour-plus` on 今回の注湯, `next-target` on 次.
  Text labels are kept intact (icons sit in their own spans / slots).
- `updateBrewStep`:
  - Drawdown title now renders `drawdown` icon + label (`innerHTML`).
  - Context row generalized (see §5). Hybrid chip gets `switch-open` /
    `switch-closed`; Ice chip gets `hot-water` + `ice`. Chip **text** is unchanged
    in meaning (閉/開 + OPEN/CLOSED, or HOT/ICE) — icons are additive only.

### `index.html`
- Renamed the context row markup: `#brew-switch-row` → `#brew-context-row`,
  `#brew-switch-chip` → `#brew-context-chip` (+ class `brew-context-chip`),
  `#brew-switch-desc` → `#brew-context-desc`. Comment updated to describe it as a
  generic context row (Hybrid Switch state **or** Ice HOT/ICE reminder), hidden for
  4:6 / NEO.
- Hero label wraps an icon slot: `<span class="brew-cum-icon" id="brew-cum-icon">`
  before the existing `#brew-cum-label` text span.
- Foot labels got ids for icon injection: `#brew-pour-label`, `#brew-next-label-txt`.
- Drawdown title is now a centered flex row (icon + title).

### `styles.css`
- `.micro-icon` — `flex-shrink:0; opacity:0.78` (quiet, inherits text colour).
- `.brew-hero-label` / `.brew-foot-label` → inline-flex with small gap for the icon.
- `.brew-cum-icon` inline-flex slot.
- `.brew-context-chip` inline-flex + gap; `.brew-context-chip .micro-icon`
  slightly higher opacity (0.9) for legibility on the coloured chip;
  `.brew-context-sep` for the Ice HOT/ICE separator.

## 4. What did NOT change

- `sw.js`, `manifest.webmanifest`, `assets/` — untouched.
- `docs/data/*` (master JSON / audit CSV / validator) — untouched.
- RecipeEngine, `_buildYonRoku` / `_buildHybrid` / `_buildNeo` / `_buildIce`,
  recipe schedules, pour amounts, timings, `switchState` data — untouched.
- Timer engine semantics (start/pause/resume/stop, step progression) — untouched.
- History UI, History Detail UI, Method Detail UI, Settings behavior.
- localStorage schema, History schema, CSV export, JSON export, import logic.
- PWA / service worker / manifest behavior; safe-area insets preserved.
- The PR-011R4A Target-Total-first hierarchy (hero 72px Total, 22px This Pour with
  `+`, compact Step/Time/Next) — preserved; icons are additive only.
- The per-step list chips `.step-switch-chip` (Preview / Method Detail step lists)
  — intentionally **not** renamed; out of scope (this PR only touches the Active
  Brew Timer context row).
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not staged, not modified.

## 5. Context row cleanup

**Before:** `#brew-switch-row` was semantically a Switch-only row but was reused by
Ice for the HOT/ICE reminder — functionally fine, semantically misleading.

**After:** renamed to `#brew-context-row` / `#brew-context-chip` /
`#brew-context-desc` and documented in code as a **generic Timer context row**:

- **Hybrid / HYB_NEW** → HARIO Switch state (`スイッチ 開 / OPEN` /
  `スイッチ 閉 / CLOSED`) + next Switch action, with `switch-open` / `switch-closed`
  micro icon. State stays text-visible; never icon- or colour-only.
- **Ice 4:6** → HOT/ICE reminder (`HOT 150g ・ ICE 80g`, `氷はサーバーに先入れ`) with
  `hot-water` + `ice` micro icons. **Never** shown as a Switch OPEN/CLOSED state.
- **4:6 / NEO** → Standard Timer; context row stays hidden.

All references were renamed consistently (verified: no `brewSwitch*` /
`brew-switch-row|chip|desc` remain in `app.js` / `index.html` / `styles.css`).
Historical design docs (`docs/design/PR-003_RECIPE_TIMER_ENGINE.md`,
`docs/PR-006A-VISUAL-PARITY-AUDIT.md`) still mention the old `brew-switch-*` ids as
a record of that era; they were intentionally left as historical references.

## 6. Micro icon decisions

- **Approach chosen:** local `microIcon()` helper + small inline-SVG registry
  (the brief's preferred Option A+B). No external icon package; no app-wide icon
  framework; Timer context only.
- **Style:** quiet, small (13px; 20px for the drawdown title), line-based,
  `currentColor`, `opacity 0.78`, `aria-hidden`. Icons never compete with the
  numbers; every icon accompanies an existing text label.
- **Placed:** `scale-target` (hero label), `pour-plus` (This Pour label),
  `next-target` (Next label), `switch-open` / `switch-closed` (Hybrid chip),
  `hot-water` + `ice` (Ice chip), `drawdown` (drawdown title).
- **Defined but intentionally not placed:** `elapsed`. The hero already shows a
  small progress ring for elapsed time; adding a clock icon next to 経過 would be
  redundant. Kept in the registry for future use.
- Icons are abstract (target, droplet+plus, arrow-to-line, toggle, droplet+steam,
  crystal, double chevron) — no brand-, device-, or maker-specific shapes.

## 7. Method-specific cautions honored

- **4:6 (`yon-roku`)**: Standard Timer; no context row; Target Total dominant;
  This Pour `+`. Old 48/72 or 72/48 baseline **not** reintroduced; schedule
  unchanged.
- **Ice (`ice`)**: hero label `スケール目標（湯のみ）`; context row is a HOT/ICE
  reminder with hot-water/ice icons, **not** a Switch UI; no long theory; schedule
  unchanged.
- **Hybrid (`hybrid`)**: Switch context only for Hybrid; CLOSED/OPEN clear via
  text + toggle icon; next Switch action shown. No fixed room-temperature-water
  amount; no fixed 20°C value; schedule unchanged.
- **NEO (`neo`)**: Standard Timer; no context row; 10-pour rhythm preserved; the
  **1:45 / 210g** step retained (verified: a step with `totalAmount === 210` at
  `timeSec === 105`); schedule unchanged.

## 8. Validation results

- `git status --short` → only `app.js`, `index.html`, `styles.css`, and the new
  `docs/design/PR-011R4B_MEMORY_HANDOFF.md` (the two pre-existing untracked files
  remain untracked, unstaged).
- `git diff --name-only` → `app.js`, `index.html`, `styles.css`.
- `node --check app.js` → OK.
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`.
- Local preview (`serve`, port 4005) visual QA at **375px**
  (SW unregistered + caches cleared to load fresh assets — see Known limitations):
  - **Hybrid** — context chip `[toggle] スイッチ 開 / OPEN`,
    desc `透過（湯が落ちる）・1:15で閉じる`; hero target dominant, +notation,
    Next `…g まで`; no overflow.
  - **Ice** — label `スケール目標（湯のみ）`, chip `[droplet] HOT 150g ・ [crystal] ICE 80g`,
    desc `氷はサーバーに先入れ`; no Switch wording; no overflow.
  - **4:6** — context row hidden; Standard Timer.
  - **NEO** — context row hidden; 10 dots; 1:45/210g present; `完了` on last step.
  - **Drawdown** — drawdown card with `[double-chevron] ドローダウン`; context row hidden.
  - No console errors throughout.

## 9. Known limitations

- The `elapsed` micro icon is defined but not placed (redundant with the existing
  progress ring). Available for future use.
- The PR-011R4A compact progress ring keeps its original `r=112` viewBox math,
  scaled down by CSS (unchanged here).
- Local QA required unregistering the service worker and clearing caches once, due
  to the SW cache-first strategy serving the previous `index.html`. This is a QA
  workflow note, not an app defect (the SW itself is untouched).

## 10. Next

Independent Verification for PR-011R4B, then post-merge handoff update once merged.
PR-012 (My Recipes) remains not started and deprioritized.
