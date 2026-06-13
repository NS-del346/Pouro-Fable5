# PR-011R0 Memory / Handoff｜Pouro-Fable5

## 1. PR Summary

- PR: PR-011R0 — Recipe source and POINT/TIPS planning doc
- Branch: `pr-011r0-recipe-point-tips-planning-doc`
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/14
- Merge status: **MERGED** (docs-only planning PR)
- Planning docs commit: a381537
- Handoff fill-in commit: e159871
- Merge commit: 5970cfb287f8b1e186062da9235f4ee5b3b44973

## 2. What Changed

Added planning documentation only:

- `docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md`
  — recipe source verification summary (4:6 / ICE / HYB_BASE / HYB_DEVIL /
  HYB_NEW / NEO), POINT/TIPS Master v2.1 planning direction, proposed data
  structure, display policy, expression / legal safety rules, and the
  follow-up PR split.
- `docs/design/PR-011R0_MEMORY_HANDOFF.md` — this file.

This PR establishes the **Source of Truth** before any runtime JSON data file
or UI integration is added.

## 3. What Did Not Change

- app code (`index.html`, `app.js`, `styles.css`): no change
- runtime JSON (`coffee_app_tips_master_v2.1.json`): **not added**
- audit CSV (`coffee_app_tips_master_v2.1_audit.csv`): **not added**
- timer: no change (semantics only described, not implemented)
- schema / localStorage / History / export (CSV / JSON): no change
- PWA (`sw.js`, `manifest.webmanifest`, `assets/`, `icons/`): no change
- RecipeEngine / Rebrew / Settings / Export UI: no change

## 4. Key Decisions

- HYB_NEW is the **main Hybrid candidate**; HYB_DEVIL is **older/reference**;
  HYB_BASE is **Switch operation support material**.
- HYB_NEW room-temperature water: added **into the dripper**, amount **not
  fixed**, **included in total 300g**, targets dripper liquid temperature
  ~70–80℃; Switch closes ~2:10, opens ~2:45.
- NEO primary display name is **10投式ドリップ** with subtitle
  **THE NEO BREW / HARIO V60 NEO**; the **1:45 / 210g** step must not be
  omitted; schedule is **primary_visual_confirmed**; use a step-by-step
  timeline, not a vague interval-only model.
- Timer policies: 4:6 = manual Next / drawdown trigger; ICE = fixed timeline;
  HYB_NEW = guided timeline (no fixed room-water amount); NEO = fixed
  step-by-step timeline.
- Quarantine items (MUGEN, Aeropress, Cold Brew, French Press, ネルドリップ,
  2スピン, 冷凍庫急冷, 氷水ダイレクト, etc.) are kept out of MVP and UI.
- App-facing copy avoids overclaiming / official-approval expressions; promotional
  words from source titles (神 / 悪魔 / 究極) may live only in internal source
  metadata, never in app copy.
- Pouro-Fable5 must not blindly copy old Pourō-Claude / Pouro-GPT values.

## 5. Verification Result

- Implementer QA: docs-only confirmed via `git diff --name-only`; no app or
  runtime data file present in the diff.
- Independent Verification: **PASS WITH MINOR NOTES**

## 6. Watch Items for PR-011R1

- Add `coffee_app_tips_master_v2.1.json` following §7.6 of the planning doc.
- Do **not** introduce UI integration in R1.
- Honor planned counts (39 total / 38 adoptable / 1 quarantine) and per-code
  counts; treat them as planning targets and re-verify on actual generation.
- Encode `verificationLevel` honestly; NEO schedule = `primary_visual_confirmed`.
- Keep `quarantine` items flagged `appAdoption: quarantine`, never `adoptable`.

## 7. Watch Items for PR-011R2 / R3 / R4

- PR-011R2: define Recipe / Method Detail information architecture only; no
  runtime behavior change unless explicitly scoped.
- PR-011R3: first UI integration; context-based selection (recipeCode +
  displayContext + relevance), not random; quarantine items never shown; timer
  receives only short operation-relevant POINT text.
- PR-011R4: timer semantics audit — verify 4:6 manual Next, ICE fixed, HYB_NEW
  guided (no fixed room-water amount), NEO step-by-step with 1:45 / 210g intact.
- Keep the R-series separate from PR-011B / C / D-1 / D-2 / E work.

## 8. References

- Planning doc: `docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md`
- Previous handoff: `docs/design/PR-011A2_MEMORY_HANDOFF.md`
- Base material: `coffee_app_tips_master_v2` → planned `coffee_app_tips_master_v2.1`
- GitHub Pages: https://ns-del346.github.io/Pouro-Fable5/
