# PR-011R5A — Brew Finish Next Action Polish · Memory Handoff

## Status
Draft — pending Independent Verification.

## Branch / PR info
- Branch: `pr-011r5a-brew-finish-next-action-polish`
- Base: `main`
- PR title: `PR-011R5A: Brew Finish Next Action Polish`
- PR type: Draft

## Commit
- `PR-011R5A: add finish same-setup action`

## Changed files
- `index.html` — Brew Log (Finish) screen: added secondary CTA `同じ条件でもう一度` and updated CTA hint.
- `styles.css` — added `.btn-secondary-cta` ghost button style.
- `app.js` — added `_applyCurrentBrewAgain()` helper, wired `#btn-brew-again`, and branched the Preview rebrew banner wording for Finish-origin repeats.
- `docs/design/PR-011R5A_MEMORY_HANDOFF.md` — this document.

## What changed
- The Finish / Brew Log screen now offers a clear next action after `記録を保存`:
  - **Primary:** `記録を保存` (unchanged, still the strongest action).
  - **Secondary (ghost):** `同じ条件でもう一度`.
- Tapping the secondary CTA re-uses the just-completed brew setup (method / dose / ratio,
  plus flavor & strength for methods that expose them) and routes to **Preview**, never the Timer.
- On Preview, the existing rebrew pill is reused. For a Finish-origin repeat it shows the
  neutral label `同じ条件でもう一度` (no history date), distinct from the history-origin
  `履歴から再現 ・ <date> の記録`.
- Any next-adjustment note typed on the Finish screen (`#log-next-note`) is carried over to
  the Preview note card when present.

## What did NOT change
- No History entry is written when using `同じ条件でもう一度` (no auto-save).
- History entry schema stays `schemaVersion: 1`. Save flow unchanged.
- No `localStorage` schema change / migration.
- No RecipeEngine, recipe-schedule, pour-amount, timing, or `switchState` change.
- No custom recipe creation/editing/storage. No PR-012 / My Recipes work.
- Existing History → Detail → Rebrew → Preview flow unchanged (still history-origin banner).
- Header close (`btn-log-close`) behavior unchanged.
- `sw.js`, manifest, and PWA wiring untouched.

## Finish same-setup flow details
1. Brew reaches Finish → `screen-log` renders with Save (primary) + Same-setup (secondary).
2. User taps `同じ条件でもう一度` → `_applyCurrentBrewAgain()`:
   - Reads in-memory `state.activeRecipe` (fallback `state.brewResultDraft`).
   - Sets `state.selectedMethodId`, `state.draft.dose`, `state.draft.ratio`,
     and `flavor`/`strength` when carried on the recipe; clears `customRatio`.
   - Sets `state.rebrewFrom = { id: null, source: 'finish', date: '', nextNote }`.
   - Calls `renderPreview()` + `showScreen('preview')`.
3. User confirms dose / ratio / recipe on Preview and starts the Timer manually.

## State / data safety notes
- Only in-memory session state is read; no history read/write for the Finish-origin path.
- `state.rebrewFrom.source === 'finish'` is a display-only discriminator; it adds no
  persisted field (rebrewFrom is in-memory and never serialized to history).
- Fallback: if neither `state.activeRecipe` nor `state.brewResultDraft` is present,
  `_applyCurrentBrewAgain()` safely returns to Home rather than guessing recipe data.
- The `rebrewFrom` lifecycle matches the existing history rebrew: cleared on the next
  Home → Setup entry (`btn-go-setup`).

## QA results
- `node --check app.js` → OK
- `node docs/data/validate_tips_master.mjs` → PASS: 40  FAIL: 0  ALL CHECKS PASS
- `git diff --name-only` → app.js, index.html, styles.css (+ this doc)
- Local preview @ 375px, all 4 methods (4:6, Ice, Hybrid, NEO):
  - Finish shows Save primary + `同じ条件でもう一度` secondary.
  - Tap routes to Preview (not Timer); method/dose/ratio preserved; Start button present.
  - No history entry added; no console errors; no horizontal overflow (docW == 375).
- Save to History still works (schemaVersion 1, history grows by 1).
- History Detail → Rebrew still shows history-origin banner (`履歴から再現 ・ …`).

## Known limitations
- The carried next-note is read from the Finish screen DOM at tap time; if the user did
  not type one, the Preview note card stays hidden (intended).
- The Finish-origin rebrew indicator shares the same visual pill as the history-origin one;
  only the label text differs. This is intentional to avoid a new affordance/schema.

## Next recommended step
- Independent Verification for PR-011R5A, then mark Ready for review and Squash & merge.
