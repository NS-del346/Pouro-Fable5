# PR-012A — My Recipes Planning

> **Docs-only planning PR.** No runtime, data, schema, storage, or UI behavior is
> changed. This document defines what **My Recipes** means in Pourō-Fable5 before
> any runtime implementation, draws hard boundaries against existing flows
> (History Rebrew, Finish Same-Setup), recommends a conservative MVP, and proposes
> how implementation should be split across future PRs.

Strategic frame (carried from PR-011S0 / PR-011R5): Pourō-Fable5 is an
**extraction execution tool**. Its competitors are video + paper notes + a phone
timer. My Recipes must make "save a setup I liked and run it again deliberately"
easier than paper notes — **without** expanding into a recipe-builder platform or
duplicating History.

---

## 1. Purpose

Define My Recipes on paper before any code is written, so that the first runtime
PR (provisionally PR-012B) starts from an agreed, conservative scope.

This document answers, explicitly:

- What **is** My Recipes?
- What is **not** My Recipes?
- How is it different from **History Rebrew**?
- How is it different from **Finish Same-Setup**?
- What data should be saved — and what should not?
- How should a saved recipe **enter Preview**?
- How should it avoid breaking **RecipeEngine**?
- How should implementation be **split** across future PRs?

The deliverable of PR-012A is **decisions and a split**, not features.

---

## 2. Current baseline

`main` is at the PR-011J merge. PR-012 (My Recipes) is not started. PR-013 (Timer
Countdown Sequence UI) is deferred until PR-012 completes and is **out of scope
here**.

| Item | Value |
| --- | --- |
| PR #46 — PR-011J Remove Dead Method Icon SVG Code | MERGED `3dee2ea` |
| Independent Verification (PR-011J) | PASS |
| PR-012 / My Recipes | Not started |
| PR-013 / Timer Countdown Sequence UI | Deferred (do not start) |

This planning PR branches from clean, up-to-date `main`.

### 2.1 Code facts this plan is grounded in

All references are to files on `main` at `3dee2ea`.

- **Storage keys** ([app.js:887](app.js:887)):
  ```js
  const STORAGE_KEYS = {
    history:  'pouroFable5.history.v1',
    settings: 'pouroFable5.settings.v1',
  };
  const MAX_HISTORY_ENTRIES = 500;
  ```
- **Setup draft** ([app.js:836](app.js:836)):
  `state.draft = { dose, ratio, flavor, strength, customRatio }`, plus
  `state.selectedMethodId`.
- **RecipeEngine** ([app.js:599](app.js:599)) is a pure builder:
  `RecipeEngine.build(methodId, dose, ratio, flavor, strength)` → recipe object
  with `steps`. Methods: `yon-roku`, `hybrid`, `neo`, `ice`. Only `yon-roku`
  consumes `flavor`+`strength`; `hybrid`/`neo` take `dose`+`ratio`; `ice` takes
  `dose` only. **The engine is deterministic — same inputs produce the same
  steps.**
- **History Rebrew** ([app.js:2211](app.js:2211), `_applyRebrewEntry`): reads a
  saved history entry → repopulates `state.draft` → sets
  `state.rebrewFrom = { id, date, nextNote }` → `renderPreview()` →
  `showScreen('preview')`.
- **Finish Same-Setup** ([app.js:2234](app.js:2234), `_applyCurrentBrewAgain`,
  PR-011R5A): reads only in-memory `state.activeRecipe` / `brewResultDraft` /
  `draft` → sets `state.rebrewFrom = { id: null, source: 'finish', date: '',
  nextNote }` → Preview. **No history read/write, no persistence.**
- **Preview banner mechanism**: `state.rebrewFrom` ([app.js:1769](app.js:1769))
  is the single, existing affordance both flows reuse to mark a Preview as
  "re-run with this setup."

These four facts shape every recommendation below.

---

## 3. Product definition

**My Recipes** means:

> **User-saved, reusable recipe presets** derived from app-defined methods and
> user-selected parameters. A user saves a setup as a **named** preset, then later
> selects it intentionally and enters **Preview** before brewing.

My Recipes is **not**:

- History replay (that is Rebrew)
- A brew log / result record (that is History)
- Analytics
- Cloud recipe sharing / public recipe platform
- A custom full RecipeEngine editor
- An arbitrary method/step builder
- Editable pour schedules or custom water-per-pour

The first version is deliberately conservative: **save a setup, name it, run it
again via Preview.** Nothing more.

---

## 4. My Recipes vs History Rebrew vs Finish Same-Setup

These three are easy to conflate. They are kept **separate** because their
**source**, **persistence**, and **intent** differ. All three converge on the
**same destination — Preview — never the Timer directly.**

| Dimension | History Rebrew | Finish Same-Setup | **My Recipes** |
| --- | --- | --- | --- |
| Source | A completed brew record in History | The just-finished in-memory brew | A user-named saved preset |
| Persistence | Persistent (it *is* a history entry) | None unless separately saved | Persistent (own store) |
| Carries log/result | Yes (rating, tags, notes) | Partially (in-memory draft) | **No** — setup only |
| Tied to a completed brew | Yes | Yes (the current one) | **No** |
| Selected from | History list / detail | A button on the Finish screen | A My Recipes list |
| Intent | "Reproduce *that* brew" | "Do *this* again right now" | "Run a setup I keep coming back to" |
| Routes to | Preview | Preview | Preview |
| Recipe editing | None | None | **None (v1)** |
| Preview marker (`rebrewFrom`) | `{ id, date, nextNote }` | `{ id:null, source:'finish' }` | `{ id, source:'recipe' }` (proposed) |

Key consequence: **My Recipes is the only one of the three that is born without a
brew behind it.** A user can create a My Recipe purely from a setup they
configured, never having brewed it. That is the defining boundary.

---

## 5. User flows

### 5.1 Save flow (write)

```
Setup / Preview (a configured setup exists)
   → "この設定をマイレシピに保存" (Save current setup as My Recipe)
   → name prompt (default suggested from method + dose/ratio)
   → write to My Recipes store
   → toast confirmation, stay on current screen
```

The save action captures the **current setup parameters only**, not generated
steps and not any log/result context.

### 5.2 Select / run flow (read)

```
My Recipes entry point (list)
   → select a saved recipe
   → repopulate state.selectedMethodId + state.draft from the preset
   → set state.rebrewFrom = { id, source: 'recipe', name, ... }
   → renderPreview() → showScreen('preview')
   → user confirms → starts Timer manually
```

This mirrors `_applyRebrewEntry` exactly, differing only in **source** and the
fact that steps are **re-derived by RecipeEngine at select time**, never stored.

### 5.3 Manage flow (later PRs)

```
My Recipes list → rename / delete entry (PR-012E)
```

Rename/delete are **not** in the first runtime PR (see §10, §12).

---

## 6. Data model candidates

Three candidate shapes for a single saved recipe.

### Candidate A — Setup-parameters only (recommended)

```jsonc
{
  "schemaVersion": 1,
  "id": "r_1718000000000",
  "name": "朝の4:6 (明るめ)",
  "methodId": "yon-roku",
  "dose": 20,
  "ratio": 15,
  "flavor": "bright",      // only meaningful for methods that expose it
  "strength": "standard",  // only meaningful for methods that expose it
  "createdAt": "2026-06-15T00:00:00.000Z",
  "updatedAt": "2026-06-15T00:00:00.000Z"
}
```

- Steps are **re-derived** via `RecipeEngine.build(methodId, dose, ratio, flavor,
  strength)` at select time.
- Mirrors `state.draft` 1:1, so save = snapshot of `state.draft` +
  `selectedMethodId` + name + timestamps.
- Method-aware: `flavor`/`strength` are stored but only consumed by methods that
  use them; `ice` ignores ratio/flavor/strength on rebuild, matching engine
  behavior.

### Candidate B — Setup parameters + cached generated steps

Same as A, plus a frozen `recipe`/`steps` snapshot.

- **Risk**: a cached step list can **drift** from RecipeEngine if the engine is
  ever tuned, producing a recipe that no longer matches what the method generates.
  This re-introduces the "official/complete-reproduction" trap (FIX-406) the
  project deliberately avoided.

### Candidate C — Full custom recipe (editable steps / pours)

Arbitrary step timings, pour amounts, custom Switch steps.

- This is a **recipe-builder platform**, explicitly out of scope for the product
  (§3) and far beyond MVP. Deferred indefinitely.

**Recommendation: Candidate A.** It keeps RecipeEngine the single source of truth
for steps, eliminates drift, and makes save/select trivial snapshots of existing
state.

### 6.1 Fields to exclude from v1

- Editable custom step timings / pour schedule / per-pour water
- Custom Switch steps, custom method creation
- Cloud sync, sharing, import/export
- Tags, search, folders
- Analytics / usage counts
- `roast` / `grind` / `temp`: **not part of `state.draft` today** — they live only
  in the Finish-screen log (`equip` / `log.bean` / `log.grind` / `log.temperature`).
  Including them would couple My Recipes to the log schema. **Exclude from v1**;
  revisit only if Setup ever surfaces them as live draft fields.

---

## 7. localStorage strategy

- **New, dedicated key** (do not reuse `history` or `settings`):
  ```
  pouroFable5.myRecipes.v1
  ```
- Versioned (`.v1`) to match existing convention and allow future migration.
- Stored as a JSON array of Candidate-A objects, newest first, with a sane cap
  (e.g. `MAX_MY_RECIPES = 200`) mirroring `MAX_HISTORY_ENTRIES` discipline.
- Read/write must be wrapped in safe try/catch helpers (mirror
  `safeReadHistory` / `safeWriteHistory`), tolerant of quota errors and malformed
  JSON, returning `[]` on failure.
- **History schema (`pouroFable5.history.v1`) is untouched.** My Recipes never
  reads or writes the history key.
- **Settings schema (`pouroFable5.settings.v1`) is untouched.**

> **Not implemented in this PR.** The key name above is a *plan*, defined so the
> implementing PR (PR-012B) does not have to re-decide it.

---

## 8. UI entry-point candidates

| Option | Where | Pros | Cons |
| --- | --- | --- | --- |
| **1. New tab/section** | A "マイレシピ" section reachable from Home | Clear mental model; room to grow list/manage | More nav surface; new screen to build |
| **2. On Home** | A "マイレシピ" card/row on Home | Discoverable; low nav cost | Home can get crowded |
| **3. On Setup/Preview only** | Save button on Setup/Preview; pick from a sheet | Save is co-located with the setup it captures | Saved recipes are hard to *find* later |

**Recommendation**: split the two concerns across PRs.

- **Save** (write) belongs **next to the setup it captures** — a button on
  **Preview** (and/or Setup), reusing the visual language of the existing
  Finish/History rebrew CTAs (PR-011R6A `.cta-bar-label`).
- **Select** (read) belongs in a **dedicated list** (Option 1 or 2). Start with
  the lightest viable surface (a Home entry that opens a simple list) and avoid a
  heavyweight new tab until the feature earns it.

Both must route to **Preview**, never the Timer.

---

## 9. MVP candidate comparison

| MVP option | Includes | Excludes | Verdict |
| --- | --- | --- | --- |
| **M0 — Save-only** | Save current setup as named preset; no list yet | Listing, selecting, managing | Too thin — saved data is unusable |
| **M1 — Save + Select (recommended)** | Save named preset; list; select → Preview | Rename, delete, edit, tags | **Conservative and complete** |
| **M2 — Save + Select + Manage** | M1 + rename + delete | Edit steps, tags | Good, but manage adds scope/QA |
| **M3 — Editable recipes** | M2 + step/pour editing | — | Out of scope (recipe builder) |

`M1` is the smallest scope that delivers a usable round-trip: a saved recipe a
user can actually run. `M2`'s manage features are valuable but separable and
should follow as their own PR.

---

## 10. Recommended MVP

**Adopt M1 with Candidate-A data and a new `pouroFable5.myRecipes.v1` key.**

A user can:

1. Save the current setup as a **named** My Recipe (from Preview/Setup).
2. Open a **My Recipes list**.
3. **Select** a recipe → land on **Preview** (steps re-derived by RecipeEngine).
4. Confirm on Preview → start the Timer manually.

Explicitly **excluded from v1**: editable step timings, editable pour schedule,
per-pour water, custom Switch steps, custom method creation, cloud sync, sharing,
import/export, tags, search, folders, analytics, and `roast`/`grind`/`temp`
capture (see §6.1).

Rename/delete/empty-state polish land in a **later** PR (PR-012E), so the first
runtime PR stays minimal and easy to verify.

---

## 11. Out of scope

This planning PR changes **no runtime**. The following are out of scope for
PR-012A entirely and must not be touched or implemented here:

- `app.js`, `index.html`, `styles.css`, `sw.js`, `manifest`, `assets`,
  `docs/data/*`, package files
- My Recipes UI, My Recipes localStorage, a "Save as My Recipe" button, recipe
  editing, deletion, rename, import/export
- Any Timer change; **PR-013 Timer Countdown Sequence UI**

For the **future implementation** (PR-012B onward), these remain out of scope
until explicitly re-planned:

- RecipeEngine changes / recipe-schedule changes
- History schema changes
- Finish Same-Setup behavior changes
- "Official" / "complete reproduction" framing of saved recipes (use neutral
  "保存した設定" wording — see §13)

---

## 12. Implementation split proposal

A conservative, independently-verifiable sequence. Each PR is small and leaves the
app shippable.

| PR | Scope | Key deliverables |
| --- | --- | --- |
| **PR-012B** | Data model + storage helpers + docs | `pouroFable5.myRecipes.v1` schema (Candidate A), `safeReadMyRecipes`/`safeWriteMyRecipes`, `MAX_MY_RECIPES`, no UI. Pure, unit-checkable helpers. |
| **PR-012C** | Save current setup | "この設定をマイレシピに保存" on Preview/Setup; name prompt; write via helpers. No list yet. |
| **PR-012D** | List / select / route to Preview | My Recipes list entry point; select → repopulate `draft` → `rebrewFrom={source:'recipe'}` → Preview. Completes the M1 round-trip. |
| **PR-012E** | Rename / Delete / empty states / QA polish | Manage actions, empty-state copy, edge cases, accessibility. |
| **PR-012F** | Public / Local Smoke QA | GitHub Pages + local smoke test of the full flow; verification report. |

Ordering rationale: storage before save (C depends on B), save before select
(D needs data to exist), manage and QA last (lowest risk to defer). This mirrors
the proven PR-011R* cadence (plan → data → behavior → polish → QA).

---

## 13. Risk / regression analysis

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Cached steps drift from RecipeEngine | Medium | Candidate A stores **no** steps; re-derive at select time. |
| My Recipes confused with History | Medium | Separate store, separate list, separate Preview `source` (`'recipe'`). §4 boundary table. |
| "Official recipe" overclaim (FIX-406 regression) | Medium | Neutral copy: "保存した設定 / マイレシピ", never "公式" or "完全再現". |
| localStorage quota / malformed JSON | Low | Safe read/write helpers mirroring history; return `[]` on failure; cap entries. |
| RecipeEngine accidentally modified | Low | Plan forbids engine changes; select path **calls** `build()` with stored params, never edits it. |
| History/settings schema accidentally coupled | Low | Dedicated key; no read/write of `history`/`settings`. |
| Preview banner regression | Low | Reuse existing `rebrewFrom` affordance; add a `source` value, don't restructure it. |
| Scope creep into recipe builder | Medium | MVP excludes step/pour editing; custom editing deferred (Candidate C, §6). |
| PWA / relative-path breakage | Low | No build/manifest/sw changes in MVP; pure JS + storage. |

**Preserved invariants** (must hold through PR-012B–F unless explicitly
re-planned): RecipeEngine, recipe schedules, History schema, existing Rebrew
behavior, Finish Same-Setup behavior, Timer behavior, PWA / GitHub Pages relative
paths.

---

## 14. QA criteria for future implementation

Checkable acceptance criteria for the M1 round-trip (PR-012B–D), to be exercised
in PR-012F:

1. Saving a setup creates exactly one entry in `pouroFable5.myRecipes.v1` with the
   Candidate-A fields; `history` and `settings` keys are byte-unchanged.
2. A saved recipe with no prior brew can be created and listed (born without a
   brew behind it).
3. Selecting a recipe lands on **Preview** (`screen-preview` shown, `screen-brew`
   Timer hidden), with `state.rebrewFrom.source === 'recipe'`.
4. Steps shown on Preview equal `RecipeEngine.build(...)` for the stored params —
   no stored/cached steps.
5. For each method (`yon-roku`, `hybrid`, `neo`, `ice`), save→select reproduces
   the same Preview steps as configuring that setup manually.
6. Reload (cold boot) preserves saved recipes; corrupting the key yields an empty
   list, not a crash.
7. No "公式 / 完全再現" wording anywhere in My Recipes UI.
8. `node --check app.js` → OK; `node docs/data/validate_tips_master.mjs` → ALL
   CHECKS PASS.
9. PWA install + GitHub Pages load unaffected; relative paths intact.
10. Rename/delete (PR-012E) update/remove the correct entry and persist across
    reload.

---

## 15. Final recommendation

Ship My Recipes as a **conservative, setup-only preset feature**:

- **Definition**: user-named, persistent, reusable **setup** presets that route to
  **Preview** and are **not** tied to a completed brew.
- **Data**: **Candidate A** (setup parameters only); steps always re-derived by
  RecipeEngine.
- **Storage**: new key `pouroFable5.myRecipes.v1` with safe helpers; History and
  settings untouched.
- **MVP**: **M1** (Save + Select → Preview). Manage (rename/delete) deferred to
  PR-012E.
- **Split**: PR-012B (data) → PR-012C (save) → PR-012D (select) → PR-012E
  (manage/polish) → PR-012F (QA).
- **Guardrails**: RecipeEngine, recipe schedules, History schema, Rebrew, Finish
  Same-Setup, Timer, and PWA paths all unchanged; neutral non-"official" wording;
  custom step/pour editing deferred indefinitely.

This keeps My Recipes firmly an **execution convenience** — "run a setup I keep
coming back to" — and not a recipe-builder platform, consistent with the
project's extraction-tool strategy.
