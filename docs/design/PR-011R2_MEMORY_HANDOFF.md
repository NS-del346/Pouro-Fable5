# PR-011R2｜Recipe / Method Detail Information Architecture｜Memory / Handoff

## 1. Status

- PR status: **MERGED** — IA / specification doc only
- Nature: docs-only. No app runtime, UI, data, timer, or schema changes.
- Builds on: PR-011R1 (POINT/TIPS Master v2.1 data foundation, merged).
- Does not modify PR-011R1 data.

## 2. Branch / PR info

- Branch: `pr-011r2-recipe-method-detail-ia`
- Base: `main`
- PR title: `PR-011R2 Recipe / Method Detail information architecture`
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/19
- Commits before merge: `1cd899c`, `32e3b70`
- Merge method: Squash and merge
- Merge commit: `1b03c194c5a0f719b5f864ba6f50146d660b723a`
- Final status: MERGED
- Independent Verification: PASS

## 3. What changed

- Added `docs/design/PR-011R2_RECIPE_METHOD_DETAIL_INFORMATION_ARCHITECTURE.md`
  — defines the six display surfaces (Setup / Preview / Timer / Finish / History
  Detail / Method Detail), the Method Detail section structure, method-specific
  detail requirements, the v2.1 field-mapping policy, quarantine policy,
  source / verification display policy, expression / legal safety policy, and
  the PR-011R3 / PR-011R4 boundaries.
- Added `docs/design/PR-011R2_MEMORY_HANDOFF.md` — this file.

## 4. What did not change

- No UI integration (Method Detail / Recipe Detail / contextual POINT/TIPS).
- No runtime import or consumption of `coffee_app_tips_master_v2.1.json`.
- No `app.js` / `src/` / `public/` / `index.html` / CSS change.
- No RecipeEngine / `_buildYonRoku` change.
- No Timer logic or Timer semantics change.
- No Recipe Setup / Preview / Timer / Finish / History / Settings UI change.
- No History schema / localStorage schema change.
- No CSV / JSON export change.
- No PWA / manifest / service worker change.
- No package dependency or build configuration change.
- No change to `docs/data/coffee_app_tips_master_v2.1.json`,
  `coffee_app_tips_master_v2.1_audit.csv`, or `validate_tips_master.mjs`.
- No `priority` field added to the data.

## 5. Key IA decisions

- The active brewing flow (Setup → Preview → Timer → Finish) stays **short and
  quiet**. Longer theory and source notes live on **History Detail** and the
  dedicated **Method / Recipe Detail** reference surface.
- Field preference: `contentShortJa` for compact surfaces (Setup, Timer),
  `contentJa` for explanatory surfaces (Preview, Finish, History Detail, Method
  Detail), `whyJa` mainly for Method Detail / History Detail.
- Source / verification notes appear **only** on History Detail and Method
  Detail, and only as a summarized, neutral note. Raw `source.videoTitle` is
  never app-facing.
- Method Detail uses a fixed 10-section structure (overview → baseline →
  equipment → grind/temp → pour schedule → taste adjustment → grouped POINT/TIPS
  → source/verification → safety note → "What Pourō does not claim").
- Selection is **deterministic** by `recipeCode` + `displayContext` +
  priority/relevance; never random.
- No `priority` field exists yet, so ordering falls back to stable item `id`
  ordering. A `priority` field is deferred to a future data revision (not this
  PR).

## 6. Method-specific cautions (preserved)

- **4:6 / 406 (PR #16 baseline):** total water = dose × 15; 20g → 300g; first
  40% (120g) = flavor, last 60% (180g) = strength; basic 60g × 5; timing
  0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30. Pre-#16 values must not return.
- **ICE:** ice in server; hot water 150g + ice ~80g; 30g × 5; target ~3:00;
  flash-chill; fixed timeline.
- **HYB_BASE:** Switch operation support material, not the main Hybrid recipe;
  closed start; 240g, wait 1:30; +60g; open ~3:00–3:30.
- **HYB_DEVIL:** older / reference HARIO Switch hybrid; neutral wording only —
  no 悪魔 / 神 / 究極 in app-facing copy.
- **HYB_NEW (primary Hybrid):** room-temperature water added into the dripper;
  included in total 300g; exact amount **not fixed**; target liquid temp
  ~70–80℃; Switch closes ~2:10, opens ~2:45.
- **NEO / 10投式ドリップ:** subtitle THE NEO BREW / HARIO V60 NEO; 10 pours of
  30g; very coarse grind; 95–96℃; **1:45 / 210g must not be omitted**;
  step-by-step schedule preserved (`primary_visual_confirmed`).

## 7. POINT/TIPS mapping decisions

- Filter by `recipeCode`; include `ALL` only when globally relevant.
- Map `displayContext` → surface; quarantine excluded everywhere.
- `contentShortJa` → compact; `contentJa` → explanatory; `whyJa` → Method /
  History Detail.
- No raw source metadata on compact surfaces.
- Deterministic selection only; `id`-stable ordering until a `priority` field
  exists.
- Quarantine (`P-OTHER-001`, `recipeCode: OTHER`) never shown, never selected,
  never exported as guidance.

## 8. Follow-up PRs

```text
PR-011R3 | Contextual POINT/TIPS UI integration
- Implement actual contextual display using this IA.
- Deterministic selection by recipeCode + displayContext + priority/relevance.
- Quarantine never shown.

PR-011R4 | Timer semantics audit / recipe timeline alignment
- Audit 4:6 manual Next / drawdown trigger.
- Audit ICE fixed timeline.
- Audit HYB_NEW guided timeline and no fixed room-water amount.
- Audit NEO step-by-step fixed timeline and 1:45 / 210g.
```

Keep R3 and R4 separate. Do not start either in PR-011R2.

## 9. Merge metadata placeholders

```text
PR URL:          https://github.com/NS-del346/Pouro-Fable5/pull/19
Branch:          pr-011r2-recipe-method-detail-ia
Commits (pre-merge): 1cd899c, 32e3b70
Merge method:    Squash and merge
Merge commit:    1b03c194c5a0f719b5f864ba6f50146d660b723a
Final status:    MERGED
Independent Verification: PASS
```

## References

- IA doc: `docs/design/PR-011R2_RECIPE_METHOD_DETAIL_INFORMATION_ARCHITECTURE.md`
- Data foundation: `docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md`
- Previous handoff: `docs/design/PR-011R1_MEMORY_HANDOFF.md`
- Planning Source of Truth: `docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md`
- 4:6 baseline: `docs/design/FIX_406_OFFICIAL_RECIPE_ALIGNMENT_HANDOFF.md`
  (PR #16, must stay intact)
- POINT/TIPS data: `docs/data/coffee_app_tips_master_v2.1.json` (read-only)
