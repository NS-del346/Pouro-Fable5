# PR-011R1｜POINT/TIPS Master v2.1 data foundation｜Memory / Handoff

## Status

- PR status: MERGED — data/docs foundation only
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/17
- Branch: `pr-011r1-point-tips-master-v21-data-foundation`
- Commit before merge: `698b1abd6ba1959dadc8a202d92b7b75550b72fa`
- Merge method: Squash and merge
- Merge commit: `4c4de1d201820f1d9457fdf413863bc93ce4ff72`
- Independent Verification: PASS

## What changed

- Added `docs/data/coffee_app_tips_master_v2.1.json` (verbatim from source)
- Added `docs/data/coffee_app_tips_master_v2.1_audit.csv` (verbatim from source)
- Added `docs/data/validate_tips_master.mjs` (docs-only Node validator)
- Added `docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md`
- Added `docs/design/PR-011R1_MEMORY_HANDOFF.md`

## Data summary

- Version: `coffee_app_tips_master_v2.1`
- Total items: 39
- Adoptable: 38
- Quarantine: 1 (`P-OTHER-001`)
- RecipeCode counts:
  - ALL: 4
  - 406: 5
  - ICE: 7
  - HYB_BASE: 3
  - HYB_DEVIL: 6
  - HYB_NEW: 6
  - NEO: 7
  - OTHER: 1

## Validation result

- JSON parse: PASS
- CSV readability: PASS (40 rows incl. header)
- Required top-level keys: PASS
- Required item fields: PASS
- Enum validation (type / displayContext / appAdoption): PASS
- Count summary: PASS (matches planned targets exactly)
- Quarantine policy: PASS
- Required content checks: PASS
- App-facing legal/expression check: PASS
- Validator total: **40/40 PASS** (`node docs/data/validate_tips_master.mjs`)

Note: Python was unavailable in the build environment (Windows Store stub), so
JSON/CSV validation was performed with Node instead of `python -m json.tool`.

## Key decisions

- PR-011R1 is data/docs foundation only.
- POINT/TIPS are not shown in UI yet.
- Runtime app code does not import or consume the new JSON yet.
- Quarantine items must not be shown in UI.
- Timer display must wait until PR-011R3.
- Timer semantics audit must wait until PR-011R4.
- PR #16 4:6 Method correction remains intact (not reverted/modified).
- Source data was copied verbatim — not invented, rewritten, or fabricated.
- Reviewable static data placed under new `docs/data/`; narrative docs stay in
  `docs/design/`.

## Confirmed source-sensitive items

- HYB_NEW room-temperature water is added into the dripper. (`P-HYB-NEW-003`)
- HYB_NEW room-temperature water is included in total 300g and adjusted by target
  liquid temperature ~70–80℃. (`T-HYB-NEW-002`)
- HYB_NEW Switch closes ~2:10 and opens ~2:45. (`P-HYB-NEW-004`)
- NEO preserves 1:45 / 210g. (`P-NEO-003`)
- NEO very coarse grind guidance is included. (`T-NEO-004`)
- NEO schedule-related verification uses `primary_visual_confirmed`.
  (`P-NEO-001`, `P-NEO-003`)

## What did not change

- No UI integration
- No app runtime import
- No RecipeEngine change
- No Timer logic change
- No Timer semantics change
- No History schema change
- No localStorage schema change
- No CSV/JSON export schema change
- No PWA behavior change

## Follow-up

Next PR:

```text
PR-011R2｜Recipe / Method Detail information architecture
```

Later PRs:

```text
PR-011R3｜Contextual POINT/TIPS UI integration
PR-011R4｜Timer semantics audit / recipe timeline alignment
```

Cautions for next PR:

- Do not expose quarantine items in UI.
- Do not use random tips.
- Select by recipeCode + displayContext + priority/relevance.
- Keep timer text short and operation-relevant.
- Keep longer theory/source notes for Method Detail / History Detail.
- Preserve neutral legal-safe phrasing.

## References

- Data foundation doc: `docs/design/PR-011R1_POINT_TIPS_MASTER_V21_DATA_FOUNDATION.md`
- Planning Source of Truth: `docs/design/PR-011R0_RECIPE_POINT_TIPS_PLANNING.md`
- Previous handoff: `docs/design/PR-011R0_MEMORY_HANDOFF.md`
- PR #16 (4:6 alignment, must stay intact): https://github.com/NS-del346/Pouro-Fable5/pull/16
