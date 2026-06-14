# PR-011R4 — Timer UI / Target Total Priority Audit Planning (Memory / Handoff)

## 1. Status

Docs-only audit / planning PR for the Timer UI. **Draft** (open). Independent
Verification: **pending**.

This PR records and formalizes the design decision that the Brew Timer must
prioritize the **cumulative Target Total / 累計目標湯量 / スケール目標** over the
**This Pour / 今回注ぐ量**, and prepares the implementation direction for
**PR-011R4A: Timer UI refinement**. **No app behavior changed.** It is a planning
/ audit artifact only.

- This is **docs-only**.
- No app behavior changed.
- Timer UI implementation **not started** (deferred to PR-011R4A).
- PR-011R4A **not started**.
- PR-012 **not started**.
- My Recipes **not implemented**.

## 2. Branch / PR info

- Base branch: `main`
- Feature branch: `pr-011r4-timer-ui-target-total-audit-planning`
- Commit message: `docs: add PR-011R4 timer UI audit planning`
- PR title: `PR-011R4: Timer UI Target Total Priority Audit Planning`
- PR state: **Draft**
- Independent Verification: **pending**

(PR number / URL and commit hash recorded in the self-report and updated in the
post-merge handoff.)

## 3. What changed

- `docs/design/PR-011R4_TIMER_UI_TARGET_TOTAL_AUDIT_PLANNING.md` — the audit /
  planning document (Purpose → Out of scope, 15 sections + verifier checklist).
  The cross-concept comparison (案A–案D) is folded into §6, so no separate
  comparison file was created.
- `docs/design/PR-011R4_MEMORY_HANDOFF.md` (this file).

Docs-only. No source, runtime, data, schema, or UI files touched.

## 4. What did NOT change

- `index.html`, `app.js`, `styles.css`, `sw.js`, manifest — untouched.
- `docs/data/*` (master JSON / audit CSV / validator) — untouched.
- RecipeEngine, `_buildYonRoku`, Timer runtime logic, Timer semantics.
- History UI, History Detail UI, Method Detail UI, Settings behavior.
- localStorage schema, History schema.
- CSV export, JSON export, import logic.
- PWA / manifest / service worker.
- package / build configuration.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not staged, not modified.

## 5. Final design decision recorded

- **Standard Timer UI** = 案A Target Total Dominant + 案C Scale-First Minimal.
  - Target Total is the hero; This Pour is secondary with `+` notation.
  - Next is expressed as the next target total, not vague text.
  - Large numerals, low-density, readable at 375px iPhone width.
- **Hybrid Timer UI** = Standard Timer + 案D Hybrid Instruction (Switch) layer,
  conditionally, for Hybrid / HYB_NEW only.
  - Switch CLOSED / OPEN visible; next Switch action in short text.
  - No fixed room-temperature-water amount; no fixed 20°C value.
- **Optional / future** = 案B Timer Ring + Target Total (legacy-like / future
  mode candidate only); 案C may later be offered as a "Simple Mode".
- **Do not adopt** = ring-dominant standard Timer, equal-weight This Pour /
  Target Total, fixed Hybrid quantity / 20°C, app-facing personal-name emphasis,
  source / confidence / verificationLevel in Timer, long theory in Timer,
  Bluetooth scale / TDS / analytics UI.

## 6. Strategy preserved (from PR-011S0)

- Pouro-Fable5 is an **extraction execution tool**, not a coffee platform.
- Not a coffee SNS, analytics platform, bean inventory tool, or
  Beanconqueror / Filtru / Brewfather direction.
- Not Bluetooth scale / hardware-first; not TDS / water-quality.
- Competitors are **video, paper notes, screenshots, mental calculation, phone
  timer**; the Timer must be easier than those during brewing.
- The Timer's cumulative Target Total stays dominant on screen.

## 7. Method-truth cautions carried forward

- **4:6**: do not reintroduce the old 48/72 or 72/48 baseline; do not change the
  recipe schedule.
- **Ice 4:6**: keep flash-chill / server-ice assumptions out of the hero; no long
  theory in Timer.
- **HYB_NEW**: Switch CLOSED / OPEN clear; room-temperature water not fixed by
  amount; no fixed 20°C; liquid temperature 70–80℃ only as a guide.
- **NEO / 10投式ドリップ**: preserve the 10-pour rhythm; future implementation must
  retain the **1:45 / 210g** step.

## 8. Validation results

- `git status --short` / `git diff --name-only` → only the two
  `docs/design/PR-011R4_*` files (docs-only; no app/runtime/data/schema/UI).
- `node --check app.js` → OK.
- `node docs/data/validate_tips_master.mjs` → `PASS: 40  FAIL: 0  ALL CHECKS PASS`.

(Validators are run to prove the docs-only change did not disturb the data master
or the app source; neither file was modified.)

## 9. Known limitations

- This is an **audit / planning** document, not an implementation. The Timer UI
  hierarchy, the Switch instruction layer, and any "Simple Mode" described here
  are **not** built by this PR.
- The audit points in §14 of the planning doc must still be checked against the
  current Timer before PR-011R4A builds the refinement.

## 10. Follow-up PR recommendations

- **PR-011R4A** — Timer UI refinement (implementation). **Not started.** Build
  Standard Timer = 案A + 案C; add 案D Switch layer for Hybrid only; verify at
  375px; preserve PWA safe-area and tappable controls.
- **PR-012** — My Recipes / Custom Recipe. **Not started**, deprioritized; must
  never become a recipe-sharing community feature.
- Deprioritized / hold: History Detail contextual TIPS integration; Dark Mode;
  Minimal Brew Log; Taste Tags (valuable but after core execution).

## 11. Next

Independent Verification for PR-011R4, then post-merge handoff update once merged.
