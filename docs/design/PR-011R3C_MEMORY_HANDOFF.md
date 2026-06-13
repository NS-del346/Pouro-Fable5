# PR-011R3C｜Method Detail / Recipe Detail Planning｜Memory / Handoff

## 1. Status

- PR status: **MERGED**
- Independent Verification: **PASS WITH MINOR NOTES**
- Nature: **docs-only planning PR**. Defines the implementation plan for a future
  Method Detail / Recipe Detail surface. No UI, no runtime import, no data change.
- Builds on (all merged): PR-011R1 (data foundation), PR-011R2 (IA policy),
  PR-011R3A (Setup/Preview integration), PR-011R3B (Finish integration).

## 2. Branch / PR info

- Branch: `pr-011r3c-method-detail-planning-only`
- Base: `main` (branched from `origin/main` @ PR #24 merge `78ae1f7`)
- PR title: `PR-011R3C Method Detail / Recipe Detail planning only`
- Commit message: `docs: plan method detail tips integration`
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/25 (merged)
- Merge method: Squash and merge
- Merge commit: `e442dbd3583d69a53e0f807ea1dbb00f50a3bf6a`

## 3. What changed

Docs only:

- **`docs/design/PR-011R3C_METHOD_DETAIL_PLANNING.md`** (new) — the normative
  plan: purpose, non-goals, baseline, Method Detail definition, the required
  10-section structure with per-section guidance, v2.1 field mapping,
  `displayContext` policy + fallback, method-specific cautions
  (406 / ICE / HYB_NEW / NEO), quarantine/source/legal policy, future
  implementation guidance, regression constraints, future PR boundaries,
  acceptance criteria.
- **`docs/design/PR-011R3C_METHOD_DETAIL_FIELD_MAPPING.md`** (new, optional) —
  companion lookup tables: section→field/filter/length, field→exposure rules,
  excluded-from-surface checklist, determinism note. Created because a single
  at-a-glance mapping table helps the future implementer; the planning doc
  remains normative if they conflict.
- **`docs/design/PR-011R3C_MEMORY_HANDOFF.md`** (new) — this file.

## 4. What did NOT change

- `app.js`, `index.html`, `styles.css`, `src/`, `public/`.
- `RecipeEngine` / `_buildYonRoku` / all recipe logic (406 / ICE / HYB_* / NEO).
- Timer logic and timer semantics.
- History schema, localStorage schema, CSV/JSON export schema.
- Recipe Setup / Preview / Finish / Timer / History / History Detail / Method
  Detail / Settings UI.
- `docs/data/coffee_app_tips_master_v2.1.json`, its audit CSV, and
  `validate_tips_master.mjs`.
- PWA files / manifest / service worker.
- package dependencies / build configuration.
- PR-011R1 data, PR-011R2 IA docs, and PR-011R3A/R3B integration — none
  contradicted.
- Untracked files `.claude/launch.json` and `docs/PR-006A-VISUAL-PARITY-AUDIT.md`
  left untouched.

## 5. Key planning decisions

- Method Detail / Recipe Detail is defined as a **non-active-brew explanatory
  surface** keyed by method (`recipeCode`), separate from the active brewing flow.
- It is the **only** PR-011R2 surface still "not started" that this PR addresses;
  Timer and History Detail remain out of scope.
- The required PR-011R2 **10-section structure** is preserved and each section is
  given purpose / allowed / prohibited / preferred fields / length / cautions.
- The future implementation should **reuse** the R3A/R3B embedded `TIPS_DATA`
  adapter + deterministic selector contract, not invent a new data path.
- Pour schedules render as **static reference tables**, never as an active timer.
- Method Detail is **read-only** — no History / localStorage / export access.

## 6. Method-specific cautions (carried, not re-derived)

- **406:** 20g→300g, total = dose × 15, 40/60 model, first two pours adjust
  flavor, latter adjust strength, 60g × 5, medium example 60/60/90/90, timing
  0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30. Must NOT reintroduce 48/72 or 72/48 or
  a 3:00 final standard pour.
- **ICE:** ice in server, 150g hot + ~80g ice, 30g × 5, ~3:00, flash-chill,
  fixed-timeline compatible.
- **HYB_NEW:** primary Hybrid; room-temp water into the dripper, included in 300g,
  amount NOT fixed, ~70–80℃, Switch closes ~2:10 / opens ~2:45. No HYB_DEVIL
  wording; no single-official-recipe implication.
- **NEO / 10投式ドリップ:** subtitle THE NEO BREW / HARIO V60 NEO, 10×30g, very
  coarse, 95–96℃, exact step schedule preserved incl. **1:45 / 210g**.

## 7. POINT/TIPS mapping decisions

- Usable fields: `contentShortJa` (compact), `contentJa` (body), `whyJa` (why
  block — allowed here, not in Timer), `source`/`verificationLevel`/`confidence`
  (summarized only), `id`/`type`/`recipeCode`/`displayContext`/`category` as
  selection/grouping keys, `appAdoption` as gate, `notes` internal-only.
- Selection is deterministic: `recipeCode` (method or `ALL`) + `displayContext` +
  ascending `id`. No `priority` field exists and none is added.

## 8. Quarantine / source / legal decisions

- Quarantine items are internal-only and never shown; `P-OTHER-001` never in UI.
- `HYB_DEVIL` wording (悪魔 / 神 / 究極) is never app-facing; `HYB_BASE` /
  `HYB_DEVIL` are never surfaced (app maps `hybrid → HYB_NEW`).
- Raw `source.videoTitle` is never displayed; provenance summarized neutrally
  only.
- No official approval / supervision / partnership / complete-reproduction
  implication. Forbidden-wording list and allowed style carried from PR-011R2 /
  `textRules`.

## 9. displayContext decision (important data fact)

- v2.1 has **no** dedicated `methodDetail` / `recipeDetail` `displayContext`.
  Present values: `setup`, `preview`, `timer`, `finish`, `historyDetail`,
  `quarantine`.
- Fallback: Method Detail aggregates non-quarantine `setup` / `preview` /
  `finish` / `historyDetail` items for the method (or `ALL`), grouped by context,
  with raw metadata hidden. **`timer`-context items are excluded** (active-step
  copy). No new `displayContext` value is added in this PR.

## 10. Future implementation boundary

- Recommended next PR: **PR-011R3D Method Detail UI implementation** (or
  `PR-011R3C-impl` if the current R3 naming is preferred).
- Limited to: adding the Method Detail / Recipe Detail surface; using the existing
  selector or a Method Detail-specific deterministic selector; rendering the
  10 sections; no Timer semantics change; no RecipeEngine change; no
  History/localStorage/export schema change unless separately approved.
- Not started here.

## 11. Validation results

- `node docs/data/validate_tips_master.mjs` → **PASS: 40, FAIL: 0,
  ALL CHECKS PASS** (data unchanged by this PR).
- `git diff --stat` / `--name-only` scope: **docs-only** (three new files under
  `docs/design/`).

## 12. Known limitations

- The plan depends on aggregating non-dedicated contexts (§8.1) because v2.1 has
  no `methodDetail` context; a future data revision could add one and simplify
  selection.
- Some method facts may be `needs_review` in the source; the plan forbids
  fabricating them — affected sections stay empty / `needs_review` until a
  research/verification PR fills them.
- The companion field-mapping doc is a convenience view; the planning doc is
  normative.

## 13. Follow-up PRs (not started)

- **PR-011R3D** (or `PR-011R3C-impl`): Method Detail UI implementation.
- History Detail POINT/TIPS integration.
- **PR-011R4**: Timer semantics audit / recipe timeline alignment.

## 14. Merge metadata

```text
- PR: https://github.com/NS-del346/Pouro-Fable5/pull/25 (MERGED)
- Merge method: Squash and merge
- Merge commit: e442dbd3583d69a53e0f807ea1dbb00f50a3bf6a
- Independent Verification: PASS WITH MINOR NOTES
```
