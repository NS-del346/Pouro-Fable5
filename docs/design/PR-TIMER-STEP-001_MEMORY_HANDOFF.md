# PR-TIMER-STEP-001｜Timer Step Timing Behavior Handoff

## 1. Status

- **State:** Draft / Pending Independent Verification.
- **Type:** docs-only; no runtime implementation.
- **Preparation:** Complete audit plan for Timer step timing behavior.
- **Next action:** Independent Verification → Merge → Proceed to PR-TIMER-STEP-002 runtime implementation.

---

## 2. Branch / PR

- **Branch:** `pr-timer-step-001-timing-behavior-audit-plan`
- **Base:** `main`
- **PR:** To be opened as Draft.
- **Title:** PR-TIMER-STEP-001: Timer Step Timing Behavior Audit and Plan

---

## 3. Commit

- **Hash:** (Will be populated after commit)
- **Message:** `PR-TIMER-STEP-001: document Timer step timing behavior plan`

---

## 4. Changed files

- `docs/design/PR-TIMER-STEP-001_TIMER_STEP_TIMING_AUDIT_PLAN.md` (new) — Comprehensive audit of current Timer behavior, findings, and recommended implementation plan.
- `docs/design/PR-TIMER-STEP-001_MEMORY_HANDOFF.md` (new) — Handoff document for next implementer.

**All changes are in `docs/design/` directory (docs-only).**

---

## 5. Source of Truth references used

- **app.js main branch** — Confirmed Timer state machine, event handlers, and UI update cycle.
- **index.html main branch** — Confirmed Timer screen structure and control elements.
- **PR-013A_TIMER_V2_SPEC.md** — Timer Ver.2.0 design specification (design intent, layout, hierarchy).
- **PR-013B_MEMORY_HANDOFF.md** — Timer Ver.2.0 runtime implementation notes.
- **PR-013C_TIMER_V2_SMOKE_QA.md** — Timer Ver.2.0 QA results and findings.
- **PR-014A_FINISH_HISTORY_POLISH_PLAN.md** — Finish / Brew Log / History flow design.
- **PR-014B_MEMORY_HANDOFF.md** — History integration notes.

**Drive reference:** Pouro-Fable5 Source of Truth document (referenced; direct access unavailable in GitHub AI environment).

---

## 6. What changed

### Added: PR-TIMER-STEP-001_TIMER_STEP_TIMING_AUDIT_PLAN.md

**Contents:**
1. **Status, scope, sources** — Context and audit scope.
2. **Current Timer architecture** — State variables, display update cycle, step traversal mechanisms.
3. **Current Next behavior** — Handler code, findings (does not record time, does not rebase elapsed/start).
4. **Current Back behavior** — Handler code, findings (rebases elapsed/start, asymmetric to Next).
5. **Current Countdown behavior** — Calculation model (schedule-based, not actual-timing-based), edge cases (early/late Next press, multiple rapid presses).
6. **Current Finish / Brew Log / History behavior** — What brewResultDraft contains, what is NOT stored (per-step timing, deviation).
7. **User-observed risks** — Countdown appears stuck, late Next press shows 0 immediately, no timing accountability.
8. **Confirmed code-level findings** — 7 findings with code locations and impact analysis.
9. **Behavior options** — 4 options compared (A: stepEvents only; B: stepEvents + rebase; C: auto-advance; D: staged approach).
10. **Decision matrix** — Comparison across 7 criteria.
11. **Recommended direction** — Option D (staged): Phase 1 (PR-TIMER-STEP-002) + Phase 2 (future, with user testing).
12. **Proposed PR-TIMER-STEP-002 scope** — In-scope and out-of-scope items.
13. **Proposed stepEvents data shape** — TypeScript interface and example data.
14. **Proposed UI/UX treatment** — In-timer display (no change), History Detail display (new optional timing section), History list (no change).
15. **Schema / compatibility impact** — Backward-compatible History schema (v1 entries lack stepEvents, which is fine).
16. **Regression risks** — 5 identified risks with mitigations.
17. **QA checklist** — 14 items for future implementation PR.
18. **Issues found** — 5 issues (severity, root cause, proposed fix).
19. **Required fixes** — Phase 1 (7 items) and Phase 2 (optional, 2 items).
20. **Final recommendation** — Adopt Option D; immediate action (PR-TIMER-STEP-002), future action (Phase 2).

**Length:** ~31 KB, comprehensive audit with code-level analysis and implementation roadmap.

### Added: PR-TIMER-STEP-001_MEMORY_HANDOFF.md

**Contents:**
1. Status, branch, commit, changed files (this document).
2. Source of Truth references used.
3. What changed (audit plan creation).
4. What did NOT change (runtime, schemas, recipes).
5. Current Timer findings (7 findings summary).
6. Recommended behavior direction (Option D rationale).
7. Deferred implementation (Phase 2, auto-advance).
8. Schema / storage impact (backward-compatible, no migration).
9. Regression cautions (5 risks summarized).
10. QA requirements for next PR (audit-specific, implementation-specific).
11. Issues found (5 issues with links to audit plan).
12. Required fixes (Phase 1 and Phase 2 breakdown).
13. Next recommended step (Independent Verification, then PR-TIMER-STEP-002).

**Length:** Handoff summary for next implementer.

---

## 7. What did not change

**Runtime unaffected:**
- `app.js` — Timer state machine, event handlers, UI logic — no changes.
- `index.html` — Timer screen DOM structure — no changes.
- `styles.css` — Timer styling — no changes.
- `sw.js` — Service worker — no changes.
- `manifest.webmanifest` — PWA manifest — no changes.

**Data structures unaffected:**
- `brewResultDraft` — Current schema maintained (optional `stepEvents` not yet added; planned for PR-TIMER-STEP-002).
- `History` schema — v1 entries remain valid; no migration needed.
- Recipe schedules — No changes to pour times, step durations, or method definitions.
- RecipeEngine — No changes to recipe generation or step calculation.

**Features unaffected:**
- My Recipes — Add, edit, delete flows unchanged.
- Preview-before-Timer — Preview display and step preview unchanged.
- Finish / Brew Log — Result screen flow unchanged (History Detail will gain optional timing section in Phase 2).
- Rebrew from History — Unchanged.
- Grinder Equivalency Engine — Unchanged.
- PWA offline behavior — Unchanged.

---

## 8. Current Timer findings

### Finding 1: Next does not record actual press time
- **Impact:** User's manual Next press timestamp is lost; only step pointer advances.
- **User effect:** No accountability for step timing; no per-step deviation data.

### Finding 2: Next does not rebase elapsed/start time
- **Impact:** Early Next press leaves `elapsedSec` ahead of next step's scheduled time; Countdown appears stuck or unresponsive.
- **User effect:** "Countdown seems to freeze for a moment after I press Next early."

### Finding 3: Back rebases elapsed/start time (asymmetric to Next)
- **Impact:** Back "fixes" the timeline, but Next does not; inconsistent behavior.
- **User effect:** Back press feels responsive; Next press feels laggy.

### Finding 4: Countdown is schedule-based, not actual-timing-based
- **Impact:** Countdown relies on recipe's scheduled step times; user's actual pour timing is not reflected.
- **User effect:** Countdown does not adapt to early/late pours; user's deviations are invisible.

### Finding 5: Countdown at 0 does not auto-advance
- **Impact:** Timer signals "next step ready" but does not proceed; user must manually press Next.
- **Design intent:** Per PR-013A §7, countdown is "signals only" — no auto-advance.
- **User effect:** User must stay engaged to press Next; no hands-off brewing.

### Finding 6: brewResultDraft does not include per-step timing
- **Impact:** History entries lack per-step event recording, deviation data, or action types.
- **User effect:** Cannot see step-by-step performance; cannot improve brewing technique via timing feedback.

### Finding 7: Timer Ver.2.0 intentionally disables auto-advance at countdown 0
- **Design intent:** PR-013A §7 states "signals only — no auto-advance / auto-confirm".
- **Rationale:** Timer is an execution aid, not full automation; user retains control.
- **User implication:** Auto-advance is deferred to Phase 2 (future PR) after user testing.

---

## 9. Recommended behavior direction

### Option D: Staged Approach (Recommended)

**Phase 1 (PR-TIMER-STEP-002 — current cycle):**
- Add in-memory `stepEvents` array to record per-step events.
- Rebase `startedAt` when Next is pressed (fixes Countdown responsiveness issue).
- Record `start` / `next` / `back` / `finish` events with timestamps and scheduled times.
- Calculate per-event deviation (`actualTime - scheduledTime`).
- Save optional `stepEvents` to `brewResultDraft` (backward-compatible).
- Add optional reference timing display to History Detail (collapsed by default).
- **Do NOT implement auto-advance at Countdown 0.**

**Phase 2 (Future PR — after user testing):**
- Evaluate user feedback on per-step timing data.
- Design and test optional auto-advance feature with audio/haptic cues.
- Implement auto-advance only if user testing supports value.

**Rationale for Phase 1:**
1. Directly addresses user-observed Countdown responsiveness issue (Finding 2).
2. Provides per-step timing accountability (Finding 6).
3. Maintains manual-control semantics (execution aid, not automation).
4. Backward-compatible; no History schema migration forced.
5. Focused PR scope; reviewable and testable.

**Rationale for deferring auto-advance (Phase 2):**
1. Respects Timer design intent (execution aid, user control).
2. Requires user testing to validate value and identify UX risks.
3. Allows time for user feedback on optional timing display in Phase 1.
4. Separates concerns: Phase 1 (data collection), Phase 2 (automation option).

---

## 10. Deferred implementation

### Auto-advance at Countdown 0

**Status:** Out of scope for PR-TIMER-STEP-002; proposed for Phase 2 (future PR).

**Reason for deferral:**
- Contradicts Timer design intent in PR-013A §15: "Timer is an execution aid, not a recipe editor."
- Requires careful UX design (pre-advance cues, user override capability).
- Requires user testing to validate that auto-advance adds value without creating confusion.
- Risk: unexpected auto-advance may lose user context or feel jarring.

**Proposed Phase 2 design:**
- Add optional user setting: "Auto-advance at countdown 0 (experimental)".
- Implement 3-second pre-advance countdown cue ("Next step in 3… 2… 1…").
- Add haptic feedback (vibration) at 1 second before auto-advance.
- Allow manual Next press to override and advance immediately.
- Log auto-advance events in `stepEvents` with `type: 'auto_advance'` for distinction from manual `type: 'next'`.
- Collect user feedback after Phase 1; iterate before Phase 2 implementation.

---

## 11. Schema / storage impact

### Current History schema (v1)

```javascript
{
  id: UUID,
  recipeId: string,
  startedAtWall: ISO string,
  startedAt: number,
  steps: array,
  elapsedSec: number,
  finishedAt: number,
  completedAt: ISO string,
  brewMethodId: string,
  // ... other fields
}
```

### New History schema (v1 + optional stepEvents) — PR-TIMER-STEP-002

```javascript
{
  id: UUID,
  recipeId: string,
  startedAtWall: ISO string,
  startedAt: number,
  steps: array,
  elapsedSec: number,
  finishedAt: number,
  completedAt: ISO string,
  brewMethodId: string,
  stepEvents: [                      // NEW: optional field
    {
      type: 'start' | 'next' | 'back' | 'finish',
      stepIndex: number,
      actualElapsedSec: number,
      scheduledElapsedSec: number,
      deviationSec: number,
      timestamp: number
    }
  ],
  // ... other fields
}
```

### Backward compatibility

- **No migration script required.**
- **Existing v1 History entries** (created before PR-TIMER-STEP-002) will lack `stepEvents` field.
- **Code must safely handle missing `stepEvents`:**
  ```javascript
  const stepEvents = brewResultDraft.stepEvents || [];
  if (stepEvents.length > 0) {
    // Display timing section in History Detail
  } else {
    // Omit timing section for v1 entries
  }
  ```
- **v1 entries remain fully functional** and display in History list without modification.

---

## 12. Regression cautions

### Caution 1: startedAt rebasing breaks Total Elapsed display
**Mitigation:** Preserve `startedAtWall` (ISO timestamp) as the source of truth for display. Use rebased `startedAt` only for internal Countdown calculations.

### Caution 2: Early Next press causes Total Elapsed to appear incorrect
**Mitigation:** `elapsedSec` is updated correctly on each Next press; no visible discrepancy. Test display accuracy after each step advance.

### Caution 3: Back handler logic now differs significantly from Next
**Mitigation:** Document asymmetry in code comments. Align both handlers' rebase logic for consistency.

### Caution 4: stepEvents array could grow unbounded
**Mitigation:** stepEvents size is bounded by number of recipe steps (typically 5–10 per recipe; max ~20). Negligible memory impact. No pruning needed.

### Caution 5: History display shows confusing timing to casual users
**Mitigation:** Keep timing section collapsed by default in History Detail. Include clear label: "Timing shown for reference only. Deviation is normal and expected."

---

## 13. QA requirements for next PR (PR-TIMER-STEP-002)

### Audit-specific verification
- [ ] Confirm Next handler rebase logic follows same pattern as Back handler.
- [ ] Verify `elapsedSec` is updated correctly after each Next/Back press.
- [ ] Confirm Countdown recalculates immediately after Next press (no lag).
- [ ] Verify startedAt rebasing does not affect startedAtWall or displayed Total Elapsed time.

### Implementation-specific verification
- [ ] stepEvents array populates correctly during a 5+ step brew session.
- [ ] Each event records correct `actualElapsedSec`, `scheduledElapsedSec`, `deviationSec`.
- [ ] History entries with stepEvents save and load from localStorage without corruption.
- [ ] History entries without stepEvents (v1) load gracefully without errors or missing section.
- [ ] History Detail displays per-step timing section (collapsed by default).
- [ ] Timing badges show correct color (green for ±1s, amber for ±1–5s, gray for larger deviation).
- [ ] "Step Timing" section is expandable/collapsible; does not affect layout when collapsed.

### Regression verification
- [ ] Pause/Resume functionality unaffected; Countdown behavior consistent.
- [ ] Preview-before-Timer, My Recipes, Rebrew flows unchanged.
- [ ] Existing History entries load and display without stepping timing section.
- [ ] No console errors or warnings during brew session.
- [ ] Existing tests pass (if automated test suite exists).

---

## 14. Issues found

### Issue 1: Next button does not record actual press time
- **Severity:** Medium
- **Location:** Audit plan §6, Finding 1
- **Root cause:** btn-brew-next click handler captures step advance only; no timestamp.
- **Impact:** No per-step accountability; Countdown responsiveness problem.
- **Proposed fix:** Record Next press in stepEvents; implement in PR-TIMER-STEP-002.

### Issue 2: Next button does not rebase elapsed/start time
- **Severity:** Medium
- **Location:** Audit plan §6, Finding 2
- **Root cause:** Unlike Back handler, Next handler does not adjust startedAt.
- **Impact:** Early Next press makes Countdown appear stuck or unresponsive.
- **Proposed fix:** Add startedAt rebase to Next handler; implement in PR-TIMER-STEP-002.

### Issue 3: Asymmetry between Next and Back behavior
- **Severity:** Low
- **Location:** Audit plan §7 and §6
- **Root cause:** Back rebases timeline; Next does not.
- **Impact:** Inconsistent UX; Back feels responsive, Next feels laggy.
- **Proposed fix:** Unify rebase logic in both handlers; document intent.

### Issue 4: No per-step timing accountability
- **Severity:** Low
- **Location:** Audit plan §9, Finding 6
- **Root cause:** brewResultDraft does not include stepEvents or per-step timing.
- **Impact:** Users cannot see per-step deviations or improve brewing technique.
- **Proposed fix:** Add optional stepEvents recording and History Detail display; implement in PR-TIMER-STEP-002.

### Issue 5: Countdown at 0 does not signal readiness clearly
- **Severity:** Low
- **Location:** Audit plan §8, Finding 5
- **Root cause:** Countdown is signals-only; no state machine for transitions or auto-advance.
- **Impact:** User must stay engaged to press Next; no hands-off option.
- **Proposed fix:** Implement optional auto-advance with user setting in Phase 2 (future PR, after user testing).

---

## 15. Required fixes

### Phase 1 (PR-TIMER-STEP-002 — Scope)

1. Add `stepEvents` in-memory array to Timer state.
2. Modify Next handler to:
   - Rebase `startedAt` for Countdown responsiveness.
   - Record `next` event with timing and deviation.
3. Modify Back handler to align rebase logic with Next.
4. Modify startTimer() to record `start` event.
5. Modify stopTimer() to record `finish` event.
6. Save optional `stepEvents` to `brewResultDraft`.
7. Implement backward-compatible History schema handling (v1 entries without stepEvents).
8. Add optional timing display to History Detail (collapsed by default).
9. Update docs with new stepEvents data shape and backward-compatibility notes.

### Phase 2 (Future PR — After user testing, Optional)

1. Implement optional user setting for auto-advance behavior.
2. Design and test audio/haptic cues for imminent auto-advance.
3. Implement auto-advance with 3-second pre-advance countdown.
4. Allow manual Next press to override auto-advance.
5. Log auto-advance events in stepEvents.

---

## 16. Next recommended step

**Independent Verification for PR-TIMER-STEP-001**

Before merge:
1. Verify all audit findings are accurate and well-documented.
2. Confirm no prohibited files were modified (app.js, index.html, styles.css, sw.js, etc.).
3. Confirm proposed stepEvents data shape is appropriate for implementation.
4. Confirm recommended direction (Option D) aligns with project goals and user feedback.
5. Confirm QA checklist is comprehensive for PR-TIMER-STEP-002.

After approval:
1. **Merge PR-TIMER-STEP-001 to main.**
2. **Proceed to PR-TIMER-STEP-002:** Timer Step Timing Runtime Implementation.
   - Focus on Phase 1 scope (stepEvents recording + Next rebase + optional History display).
   - Do NOT implement auto-advance.
   - Follow QA checklist in §13 + audit plan QA checklist.
3. **Gather user feedback** on optional per-step timing display in Phase 1.
4. **Propose Phase 2 PR** (auto-advance feature) after user testing results are available.

---

**Handoff prepared:** 2026-06-17
**For:** PR-TIMER-STEP-002 implementer
**Status:** Ready for Independent Verification → Merge → Implementation
