# PR-011R5 — Finish-to-Rebrew Flow Planning

> **Docs-only planning PR.** No runtime, data, schema, or UI behavior is changed.
> This document defines the smallest safe implementation scope for the next
> lightweight Priority A improvement after the Timer UI phase (PR-011R4A/B/C).

## 1. Purpose

After the Timer UI was refined (PR-011R4A/B/C, all merged), the next UX gap is
the moment **after a brew finishes**: the user should know what to do next —
save the result, brew again with the same setup, prepare the next brew, or
return to method selection.

This PR defines that flow on paper only. It recommends one concrete, minimal
next implementation PR (provisionally **PR-011R5A**) and draws a hard boundary
between **Rebrew** (rerun an app-defined session) and **My Recipes** (custom
recipe management, PR-012 or later).

Strategic frame (carried from PR-011S0): Pourō-Fable5 is an **extraction
execution tool**. Its competitors are video + paper notes + a phone timer. The
Finish flow must make "do it again, a little better" easier than those — without
expanding into a recipe platform.

## 2. Baseline

Timer UI phase is fully closed and `main` is at the R4C merge.

| Item | Value |
| --- | --- |
| PR #37 — PR-011R4A Timer UI Target Total Priority | MERGED `6251578` |
| PR #38 — PR-011R4B Common Micro Icon Integration | MERGED `c82a92a` |
| PR #39 — PR-011R4C Timer UI Public/Local Smoke QA | MERGED `cc44060` |
| PR-012 / My Recipes | Not started |

This planning PR branches from clean, up-to-date `main`.

## 3. Current Finish screen behavior

The Finish screen is the **Brew Log / 抽出記録** screen (`#screen-log` in
[index.html:499](index.html:499)), reached from the Timer when the user advances
past the final step.

- **Entry**: `#btn-brew-next` ([app.js:2379](app.js:2379)). On the last step it
  calls `stopTimer()`, sets `t.isFinished = true`, builds `state.brewResultDraft`
  (method, dose, ratio, totalWater, hot/ice, steps, elapsedSec, start/finish
  timestamps), then `renderLog()` → `showScreen('log')`.
- **Content** ([index.html:499–615](index.html:499)): method recap card,
  contextual finish TIPS (PR-011R3B, hidden when none), rating dots, taste tags,
  equipment detail inputs (豆 / 挽き目 / 湯温 / ドリッパー / 落ちきり), free memo,
  and a "次回の調整 / next adjustment" note.
- **CTAs available today**:
  - **Primary** — `#btn-save-log` "記録を保存" ([app.js:2440](app.js:2440)):
    builds a `schemaVersion: 1` history entry, `unshift` into `state.history`,
    `safeWriteHistory()` to localStorage, toast, then navigates to **History**.
  - **Header close (×)** — `#btn-log-close` ([app.js:2422](app.js:2422)): discard
    without saving → **Home** (with a confirm dialog if any field has input).
- **Gap**: there is **no "brew again" / "next brew" CTA** on the Finish screen.
  The only forward paths are Save→History and Close→Home.

## 4. Current brew/session state

At Finish time the app already holds a complete, unambiguous description of the
just-finished brew:

- `state.selectedMethodId`, `state.draft { dose, ratio, flavor, strength,
  customRatio }` ([app.js:843](app.js:843)).
- `state.activeRecipe` — the fully built recipe object (steps, waters, timings),
  produced by `RecipeEngine.build()` before the brew.
- `state.brewResultDraft` — method, dose, ratio, waters, steps, elapsedSec,
  start/finish timestamps ([app.js:2397](app.js:2397)).
- `state.rebrewFrom` — a rebrew-origin marker `{ id, date, nextNote }`, cleared
  when a fresh brew is started from Home ([app.js:1632](app.js:1632)).

**Key implication:** the data needed to repeat the same brew is already in memory
at Finish. A "same setup again" action does **not** require reading from saved
History and does **not** require any new storage — `state.draft` /
`state.selectedMethodId` already describe it.

## 5. Current History/save behavior

- **Save** ([app.js:2440](app.js:2440)) writes a `schemaVersion: 1` entry:
  `{ id, createdAt, completedAt, methodId, methodName, dose, ratio, recipe,
  brew{elapsedSec,startedAt,finishedAt}, log{rating,tags,note,nextNote,
  actualDrawdown,bean,grind,temperature,equipment} }`, then `safeWriteHistory()`.
- **Rebrew already exists from History** — this is the most important finding.
  `_applyRebrewEntry(entry)` ([app.js:2208](app.js:2208)) sets
  `selectedMethodId`, `draft.dose/ratio/flavor/strength`, `customRatio = false`,
  records `state.rebrewFrom = { id, date, nextNote }`, then `renderPreview()` →
  `showScreen('preview')`. It is wired to:
  - the History featured card — `#btn-hist-rebrew` ([app.js:2497](app.js:2497));
  - History Detail — `#btn-detail-rebrew` "この記録でもう一度淹れる"
    ([app.js:2508](app.js:2508), [index.html:815](index.html:815)).
- **Preview rebrew affordances** already exist: a "履歴から再現 ・ {date} の記録"
  pill and a previous-adjustment note card, shown only when `state.rebrewFrom` is
  set ([app.js:1770](app.js:1770), [index.html:276](index.html:276)).

So **Rebrew → Preview is already built and proven** for the History path. It
rebuilds the recipe through the normal Preview render (no schedule mutation, no
stored custom recipe). The only missing piece is a rebrew/next-action affordance
**on the Finish screen itself**.

## 6. Rebrew vs My Recipes boundary

This boundary is the central guardrail of PR-011R5 and must not blur.

| | **Rebrew** (in scope, lightweight) | **My Recipes** (PR-012 or later) |
| --- | --- | --- |
| What | Rerun an existing app-defined recipe/session | User-created/saved recipe definitions |
| Source | Current session state, or an existing History entry | A custom recipe store the user manages |
| Persistence | None new — reuses `state.draft` / History | New persistent, editable recipe records |
| Mutability | Preserves method/dose/ratio/variant; does not edit the recipe schedule | Editable doses, ratios, steps, names |
| When | Immediately after Finish, or from History | Anytime, as a managed library |
| Schema | No new localStorage schema | New recipe schema + migration |

**PR-011R5A must remain a Rebrew/next-action affordance only.** It must not
introduce custom recipe creation, editing, naming, or a recipe library. The
existing `_applyRebrewEntry` pattern is the model: set draft → Preview, never
write a new recipe definition.

## 7. Candidate flows

| Flow | Path | Status today | Assessment |
| --- | --- | --- | --- |
| **A** | Finish → 同じ条件でもう一度 → **Preview** | Not built | **Recommended first.** State is complete & unambiguous at Finish; reuses the proven rebrew→Preview pattern; no storage, no schema. |
| **B** | Finish → 次の一杯を準備する → **Setup** | Not built | Useful when the user wants to *change* the next brew. Lower priority; can be a thin "go to Setup with current method preselected" later. |
| **C** | History Detail → Rebrew → **Preview** | **Already built** ([app.js:2508](app.js:2508)) | No work required. Serves the "rebrew later" case. |
| **D** | Finish → Save → **History** | **Already built** ([app.js:2440](app.js:2440)) | The existing primary path; keep as primary. |

**Implement first: Flow A.** Flows C and D already ship; Flow B is a follow-up.

## 8. Recommended minimal next PR

**PR-011R5A: Brew Finish Next Action Polish** — smallest safe scope:

1. Clarify the Finish-screen CTA hierarchy (Save remains primary).
2. Add a **secondary** "同じ条件でもう一度 / Brew again with same setup" action that
   reuses the existing in-memory session state (`state.selectedMethodId` +
   `state.draft`) and routes to **Preview**, mirroring `_applyRebrewEntry`'s
   end state (Preview render) **without** requiring a saved History entry.
3. Add a **tertiary** path back to Home / method selection (the close button
   already covers Home; make the choice explicit if low-cost).
4. Decide per §10 whether "brew again" appears before or after Save. Safe default:
   keep **Save** primary; offer "もう一度" as a clearly secondary action so the
   record is not silently lost.

If, on implementation inspection, repeating directly from Finish proves to carry
any ambiguity (e.g. stale `rebrewFrom`, or flavor/strength not applicable to the
method), **fall back to documenting "Rebrew from History" (Flow C, already built)
as the supported path** and ship only the CTA-hierarchy polish.

This PR should be small, isolated to the Finish (log) screen wiring + Preview
entry, and fully testable by hand.

## 9. Finish screen UX principles (target hierarchy — not implemented here)

```text
Primary:    記録を保存する / Save brew
Secondary:  同じ条件でもう一度 / Brew again with same setup   (Flow A)
            (or) 次の一杯を準備する / Prepare next brew        (Flow B, later)
Tertiary:   Home / Method selection · History
```

Rationale: saving the record is the highest-value action (it is what makes the
next brew better). "Brew again" is the second-most-likely intent. Returning Home
is the fallback. This is a documented target only — PR-011R5 changes nothing.

## 10. Risks and regression cautions

A future Rebrew-from-Finish implementation must obey these rules:

- **No recipe schedule mutation** — reuse `RecipeEngine.build()` via the normal
  Preview render; never edit `_buildYonRoku/_buildHybrid/_buildNeo/_buildIce`
  output, pour amounts, or timings.
- **No generated custom recipe** and **no My Recipes dependency**.
- **No hidden dose/ratio change** — repeat exactly the current `state.draft`.
- **No stale state from the previous method** — if "brew again" reuses the
  finished session, ensure `state.rebrewFrom`, timer state, and
  `brewResultDraft` are in a clean, expected state before re-entering Preview.
- **No lost History data** — keep Save primary; do not let "もう一度" navigate away
  in a way that silently discards an unsaved record without acknowledgement.
- **No localStorage schema change/migration** unless explicitly scoped in a
  separate PR.
- **Preview before Timer when there is any ambiguity** — see §11.

## 11. Entry point decision: Setup vs Preview vs Timer

Rebrew may enter (A) Setup, (B) Preview, or (C) Timer directly.

**Decision:**
- **Preview** when the session state is complete and unambiguous (the normal
  Finish case — all of method/dose/ratio/flavor/strength are known). This matches
  the existing History rebrew, which already routes to Preview.
- **Setup** when any value may need confirmation (e.g. the user explicitly wants
  to *adjust* the next brew — Flow B).
- **Never Timer directly** — the user should always see Preview (or Setup) first,
  so the brew they are about to start is confirmed.

## 12. QA criteria for the next implementation PR (PR-011R5A)

When PR-011R5A is built, it must pass:

- Finish → "同じ条件でもう一度" lands on **Preview** with the **same** method,
  dose, ratio, flavor, and strength as the brew that just finished.
- The repeated Preview rebuilds via `RecipeEngine`; no recipe schedule, pour
  amount, or timing differs from a fresh build of the same parameters.
- Save still works and remains the primary CTA; choosing "もう一度" does not
  silently discard an unsaved record without a confirm.
- No console errors; `node --check app.js` OK.
- `node docs/data/validate_tips_master.mjs` → `PASS: 40 FAIL: 0`.
- No localStorage schema change; existing History entries still load and render.
- No regression to History, History Detail, Method Detail, Settings, or Timer.
- 375px iPhone width: CTAs tappable, safe-area respected.

## 13. Out of scope

- Runtime files: `app.js`, `index.html`, `styles.css`, `sw.js`, manifest.
- Data/config: `docs/data/*`, package/build config.
- Features: RecipeEngine, `_buildYonRoku/_buildHybrid/_buildNeo/_buildIce`,
  recipe schedules, pour amounts, timings, switchState, History, History Detail,
  Method Detail, Settings, localStorage schema, CSV/JSON export, import, PWA.
- PR-012 / My Recipes, custom recipe creation/editing, cloud/account/community,
  Dark Mode, Brew Log expansion, Taste Tags expansion, analytics, Bluetooth
  scale, TDS / water quality, new recipe methods.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) — not touched.

## 14. Final recommendation

Ship **PR-011R5A: Brew Finish Next Action Polish** as the next implementation PR,
implementing **Flow A** (Finish → "同じ条件でもう一度" → Preview) by reusing the
already-proven `_applyRebrewEntry`-style Preview entry on the in-memory session
state, with **Save** kept as the primary CTA. Flows C and D already ship; Flow B
(Finish → Setup) is a later, optional follow-up. Hold the Rebrew/My Recipes
boundary firmly: PR-011R5A introduces **no** persistence, schema, or custom
recipe management. If repeating from Finish reveals any state ambiguity during
implementation, fall back to CTA-hierarchy polish only and rely on the existing
History rebrew (Flow C).
