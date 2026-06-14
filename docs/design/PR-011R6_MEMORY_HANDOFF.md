# PR-011R6 — Memory Handoff

## Status
**Draft / pending Independent Verification.**
Docs-only planning PR. No runtime changes.

## Branch / PR info
- Branch: `pr-011r6-history-rebrew-entry-planning`
- Base: `main` (`311a7fc` — PR-011R5B merged, PR #42)
- Draft PR title: `PR-011R6: History / Rebrew Entry Point Polish Planning`
- Commit: `docs: plan PR-011R6 history rebrew entry polish`

## Changed files
- `docs/design/PR-011R6_HISTORY_REBREW_ENTRY_POLISH_PLANNING.md` (new)
- `docs/design/PR-011R6_MEMORY_HANDOFF.md` (new)

No QA checklist file was added — two docs were sufficient.

## What changed
- Added a docs-only planning document for polishing the **existing** History /
  Rebrew entry points before PR-012 / My Recipes.
- Documented, from code inspection, the current History list, History Detail,
  History-origin Rebrew, and Finish-origin Same Setup behaviors.
- Compared four candidate polish directions (A: list quick rebrew, B: Detail CTA
  polish, C: list visual clarity, D: defer & start PR-012).
- Recommended the smallest safe next PR: **`PR-011R6A: History Detail Rebrew CTA
  Polish`** (Flow B).

## What did NOT change
- No runtime files: `app.js`, `index.html`, `styles.css`, `sw.js`, manifest.
- No `docs/data/*`, no build/package config.
- No RecipeEngine / builders / schedules / timings / `switchState`.
- No History / History Detail / Settings / Method Detail logic.
- No `localStorage` or History schema.
- No CSV / JSON export, import, or PWA behavior.
- No additional Rebrew implementation; no PR-012 / My Recipes work.
- Pre-existing untracked files left untouched: `.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`.

## Key findings
- **History list (`renderHistory`, app.js:1884):** empty state + featured card
  (`history[0]`) + read-only list rows (`history.slice(1)`). Featured card has a
  two-button footer: 「詳細を見る」 (→ Detail) and 「もう一度淹れる」 (→ quick rebrew
  of latest → Preview). **List rows are read-only / browse-only; no per-row
  rebrew** — tapping a row opens Detail.
- **History Detail (`renderDetail`, app.js:1985):** full reflection surface
  (recipe summary + steps, rating, tags, memo, next-note, flavor/strength chips,
  TIPS, equipment). Single primary CTA 「この記録でもう一度淹れる」
  (`btn-detail-rebrew`), hint 「プレビューで確認してから開始します」.
- **Rebrew (`_applyRebrewEntry`, app.js:2212):** restores app-defined method /
  dose / ratio / flavor / strength into draft, resets `customRatio`, sets
  `rebrewFrom`, routes to **Preview (never Timer)**. No persistence, no schedule
  mutation, no custom recipe definition.
- **Finish Same Setup (`_applyCurrentBrewAgain`, app.js:2234, PR-011R5A):** reads
  only in-memory session state, no history read/write, fails safely to Home if no
  brew context, routes to Preview, no auto-save. `rebrewFrom.source = 'finish'`.
- **Preview banner (app.js:1770):** history-origin → 「履歴から再現 ・ {date} の記録」;
  finish-origin → 「同じ条件でもう一度」. This is the only place the two repeat flows
  are visually disambiguated.
- **Weak point:** wording drift across three repeat CTAs (「もう一度淹れる」 /
  「この記録でもう一度淹れる」 / 「同じ条件でもう一度」); featured-card quick rebrew
  bypasses Detail review. Both are addressable by a small Detail-CTA polish.

## Recommended next PR
**`PR-011R6A: History Detail Rebrew CTA Polish` (Flow B).**
- Keep History Detail as the main Rebrew entry; clarify wording + hierarchy.
- Route to Preview, never Timer.
- No per-row list quick rebrew.
- No schema change. No My Recipes.

## Out-of-scope guardrails (for PR-011R6A and beyond)
- No direct Timer start; Preview-first always.
- No auto-save on rebrew; no schedule mutation.
- No History / `localStorage` schema migration.
- No custom recipe storage; no PR-012 / My Recipes dependency.
- No stale method/dose/recipe mismatch; incomplete entries must fail safely
  without guessing missing data.

## Validation results
- `git status --short` → only the two new docs files (plus pre-existing untracked
  `.claude/launch.json`, `docs/PR-006A-VISUAL-PARITY-AUDIT.md`).
- `git diff --name-only` → two new docs files.
- `node --check app.js` → **OK**.
- `node docs/data/validate_tips_master.mjs` → **PASS: 40  FAIL: 0  ALL CHECKS PASS**.

## Known limitations
- Findings are from static code inspection (docs-only; no preview server run).
- Exact final CTA wording is left to `PR-011R6A` design; this doc fixes only the
  direction and constraints.
