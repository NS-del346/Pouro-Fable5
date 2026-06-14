# PR-011R4A — Timer UI Target Total Priority Implementation (Memory / Handoff)

## 1. Status

Implementation PR for the Brew Timer / Active Brew UI. **Draft** (open).
Independent Verification: **pending**.

This PR implements the Timer UI direction fixed by PR-011R4: the Brew Timer now
prioritizes the **cumulative Target Total / 累計目標湯量 / スケール目標** over the
**This Pour / 今回注ぐ量**, because during brewing the user is reading the scale.

- Scope is **Timer / Active Brew UI only**.
- No recipe schedule / RecipeEngine / runtime semantics changed.
- No `docs/data/*`, History, Settings, Method Detail, storage, export, import,
  or PWA changes.
- PR-012 / My Recipes / Dark Mode / Rebrew refinement **not started**.

## 2. Branch / PR info

- Base branch: `main`
- Feature branch: `pr-011r4a-timer-ui-target-total-priority`
- Commit message: `PR-011R4A: implement target-total-first timer UI`
- PR title: `PR-011R4A: Timer UI Target Total Priority Implementation`
- PR state: **Draft**
- Independent Verification: **pending**

(PR number / URL and commit hash recorded in the self-report and updated in the
post-merge handoff.)

## 3. What changed

### `index.html` (Brew screen markup, `#screen-brew`)
- Removed the large circular timer (`.timer-area` / `.timer-svg` / big
  `.timer-time`) as the hero. The ring/elapsed time is no longer the centerpiece.
- The pour card (`#brew-pour-card`) is rebuilt as a **Target Total hero**:
  - hero label (`#brew-cum-label`, "スケール目標"),
  - a compact elapsed cluster (small progress ring `#brew-arc` +
    `#brew-time-display`),
  - the cumulative Target Total as the single hero number
    (`#brew-cum-amt`, 72px) + unit,
  - an instruction line (`#brew-target-instruction`, e.g. "210g まで注ぐ"),
  - a two-cell foot: **今回の注湯** (`#brew-pour-amt`, `+` notation, 22px) and
    **次** (`#brew-next-target`, the next cumulative target),
  - the per-step note (`#brew-pour-note`).
- Removed the separate `#brew-next-hint` block (next target now lives in the
  hero foot).
- Step dots (`#brew-dots-row`) moved below the hero / drawdown card.

### `styles.css`
- Replaced `.timer-area` / `.timer-svg` / `.timer-time` rules with the
  `.brew-hero*` style set (hero label, mini ring, elapsed, hero total/unit,
  instruction, foot cells/divider, hero note). Tabular numerals on all numeric
  fields; hero note hides when empty.

### `app.js`
- `cacheDOM`: dropped `brewNextHint` / `brewNextTime` / `brewNextAmt` /
  `brewNextTip` / `brewNextCountdown`; added `brewTargetInstruction`,
  `brewNextTarget`, `brewCumLabel`.
- `_updateTimerDisplay`: removed the next-pour countdown block; keeps elapsed
  time + the (now compact) progress ring math (unchanged `r=112` viewBox).
- `updateBrewStep`:
  - hero = `step.totalAmount` (Target Total) + "…g まで注ぐ" instruction,
  - This Pour rendered with `+` notation (`+${step.pourAmount}`),
  - Next = next step's cumulative target (`…g まで`, or "落とし切り" before
    drawdown),
  - Hybrid Switch layer enhanced: state shown as 閉/開 + CLOSED/OPEN text (never
    colour alone) plus the **next Switch action** (e.g. "1:45で開く"), computed
    from the next step whose `switchState` differs.
- `initBrew`: hero label set to "スケール目標" ("スケール目標（湯のみ）" for Ice).

## 4. What did NOT change

- `sw.js`, `manifest.webmanifest`, `assets/` — untouched.
- `docs/data/*` (master JSON / audit CSV / validator) — untouched.
- RecipeEngine, `_buildYonRoku` / `_buildHybrid` / `_buildNeo` / `_buildIce`,
  recipe schedules, pour amounts, timings, `switchState` data — untouched.
- Timer engine semantics (start/pause/resume/stop, step progression, RAF/interval
  scheduling) — untouched.
- History UI, History Detail UI, Method Detail UI, Settings behavior.
- localStorage schema, History schema, CSV export, JSON export, import logic.
- PWA / service worker / manifest behavior; safe-area insets preserved.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not staged, not modified.

## 5. Method-specific cautions honored

- **4:6 (`yon-roku`)**: Standard Timer; Target Total dominant; This Pour `+`.
  Old 48/72 or 72/48 baseline **not** reintroduced; schedule unchanged
  (verified: 60/120/210/300 cumulative for 20g @ 1:15 standard).
- **Ice (`ice`)**: Standard Timer; hero label "スケール目標（湯のみ）"; the HOT/ICE
  reminder stays in the context row (not the hero) and is **not** a Switch UI; no
  long theory; schedule unchanged.
- **Hybrid (`hybrid`)**: Standard Timer + Switch layer. CLOSED/OPEN clear via
  text; next Switch action shown ("1:15で閉じる" / "1:45で開く"). No fixed
  room-temperature-water amount; no fixed 20°C value; schedule unchanged.
- **NEO (`neo`)**: Standard Timer; 10-pour rhythm preserved; the **1:45 / 210g**
  step retained (verified: step 7 = 1:45, cumulative 210g for 20g @ 1:15);
  no Switch UI; schedule unchanged.

## 6. Validation results

- `git status --short` → only `app.js`, `index.html`, `styles.css` modified
  (the two untracked files remain untracked, unstaged).
- `git diff --name-only` → `app.js`, `index.html`, `styles.css`.
- `node --check app.js` → OK.
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`.
- Local preview (`serve`, port 4005) visual QA at **375px**:
  - 4:6 — Target Total 210g dominant (72px), This Pour +90g (22px), Next
    "300g まで", Step 3/4, no horizontal overflow.
  - Hybrid — Switch layer "スイッチ 閉 / CLOSED ・ 浸漬（湯を溜める）・1:45で開く";
    OPEN step shows "1:15で閉じる"; Target Total 300g, +172g, Next "落とし切り".
  - Ice — label "スケール目標（湯のみ）", HOT/ICE context row, +30g, no Switch state,
    no overflow.
  - NEO — Step 7/10 = 1:45 / 210g, no Switch UI, no overflow.
  - Drawdown — pour card hidden, drawdown card shown ("ドローダウン").
  - No console errors throughout.

## 7. Known limitations

- The compact progress ring keeps the original `r=112` viewBox math and is scaled
  down by CSS; it is a quiet supporting cue, not a hero element.
- Below the hero/dots there is intentional empty space so the hero sits near the
  top and the Back / Pause / Next controls stay anchored at the bottom (thumb
  reach). This is a layout choice, not a defect.
- 案B (ring-dominant) and any "Simple Mode" remain unbuilt (out of scope per
  PR-011R4).

## 8. Follow-up PR recommendations

- **PR-012** — My Recipes / Custom Recipe. **Not started**, deprioritized; must
  never become a recipe-sharing community feature.
- Deprioritized / hold: Dark Mode; Rebrew refinement; Minimal Brew Log; Taste
  Tags; History Detail contextual TIPS integration.

## 9. Next

Independent Verification for PR-011R4A, then post-merge handoff update once merged.
