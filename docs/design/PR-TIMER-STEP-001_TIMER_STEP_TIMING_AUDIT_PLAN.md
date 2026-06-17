# PR-TIMER-STEP-001｜Timer Step Timing Behavior Audit / Plan

## 1. Status

- **Type:** docs-only audit and design plan (no runtime implementation).
- **State:** Draft / pending Independent Verification.
- **Purpose:** Document current Timer step timing behavior, identify user-observed issues, and propose a staged implementation plan for per-step event recording and countdown responsiveness.
- **Repository:** NS-del346/Pouro-Fable5, branch `pr-timer-step-001-timing-behavior-audit-plan`.

---

## 2. Source of Truth references used

- **Current codebase (main branch):**
  - `app.js` — Timer state machine, event handlers, UI update functions.
  - `index.html` — Timer screen structure, control elements.
  - `styles.css` — Timer styling.
  - `sw.js` — Service worker (unchanged).
  
- **Prior design docs:**
  - `docs/design/PR-013A_TIMER_V2_SPEC.md` — Timer Ver.2.0 design spec (Countdown Central, Sequence Bar).
  - `docs/design/PR-013B_MEMORY_HANDOFF.md` — Timer Ver.2.0 runtime implementation notes.
  - `docs/design/PR-013C_TIMER_V2_SMOKE_QA.md` — Timer Ver.2.0 smoke QA results.
  - `docs/design/PR-013D_MEMORY_HANDOFF.md` — Timer Ver.2.0 final handoff.
  - `docs/design/PR-014A_FINISH_HISTORY_POLISH_PLAN.md` — Finish / Brew Log flow planning.
  - `docs/design/PR-014B_MEMORY_HANDOFF.md` — Finish / History integration notes.

- **Google Drive:** Pouro-Fable5 Source of Truth document (referenced; direct access unavailable in this session).

---

## 3. Scope

**In scope for this audit:**
1. Current Timer state variables: `currentStepIndex`, `elapsedSec`, `startedAt`, `paused`, `pauseStartedAt`, `totalPausedMs`, `currentRecipe`, `brewResultDraft`.
2. How Countdown is currently calculated (scheduled-based vs. actual-timing-based).
3. Next button behavior: step advancement, time tracking, elapsed/start compensation.
4. Back button behavior: step regression, time compensation differences from Next.
5. Countdown behavior at 0 seconds: signals only vs. auto-advance.
6. Finish / Brew Log / History result composition: what timing data is preserved.
7. Per-step event recording: current state (absent) vs. proposed (optional).
8. Auto-advance at countdown 0: current prohibition, future option.

**Key audit questions:**
- Does Next record the actual user press time?
- Does Next rebase elapsed/start time to next step's scheduled time?
- Does Back rebase elapsed/start time (and how does it differ from Next)?
- Is Countdown schedule-based or actual-user-timing-based?
- Can early Next presses make the next-step Countdown appear stuck?
- Can late Next presses cause Countdown to jump?
- What timing metadata is currently saved in brewResultDraft and History?

---

## 4. Out of scope

- Recipe engine changes or schedule adjustments.
- History schema v1 migration (backward compatibility required).
- My Recipes changes.
- Grinder Equivalency Engine.
- Audio, vibration, or notification redesign.
- Service worker or PWA manifest changes.
- Preview-before-Timer, Finish, Rebrew, or History Detail flows (beyond Timer event recording).
- Full timer runtime implementation (deferred to PR-TIMER-STEP-002).

---

## 5. Current Timer architecture

### Timer state variables

The Timer maintains state in global app scope:

```javascript
currentStepIndex       // Current position in steps[] array (0-based)
elapsedSec            // Total seconds elapsed since timer start
startedAt             // performance.now() timestamp when timer began
paused                // Boolean; true if timer is paused
pauseStartedAt        // performance.now() timestamp when pause began
totalPausedMs         // Cumulative milliseconds spent paused
currentRecipe         // Recipe object { id, name, steps[], ... }
brewResultDraft       // Partial result { id, recipeId, startedAt, startedAtWall, 
                      //                  steps, elapsedSec, finishedAt, completedAt, ... }
```

### Timer display update cycle

The `_updateTimerDisplay()` function is called repeatedly (via `requestAnimationFrame` or interval):

```javascript
function _updateTimerDisplay() {
  // Calculate current elapsed time from performance.now()
  const currentMs = performance.now() - startedAt - totalPausedMs;
  elapsedSec = Math.floor(currentMs / 1000);
  
  // Get current step from recipe
  const currentStep = currentRecipe.steps[currentStepIndex];
  
  // Calculate countdown: time remaining until this step's target time
  const countdownSec = Math.max(0, currentStep.timeSec - elapsedSec);
  
  // Update UI: display elapsedSec, countdownSec, Target Total, Countdown, etc.
  updateUI(elapsedSec, countdownSec, currentStep);
}
```

Key insight: **Countdown is derived from `step.timeSec - elapsedSec`**, meaning it's **schedule-based**, not user-timing-based.

### Step traversal

- **startTimer()**: Initializes `startedAt = performance.now()`, `elapsedSec = 0`, `paused = false`, `totalPausedMs = 0`.
- **pauseTimer()**: Captures `pauseStartedAt = performance.now()`, sets `paused = true`.
- **resumeTimer()**: Accumulates pause duration into `totalPausedMs`, sets `paused = false`.
- **stopTimer()**: Finalizes the brew session, saves `brewResultDraft`.

---

## 6. Current Next behavior

### Handler implementation

When the user presses **Next**:

```javascript
document.getElementById('btn-brew-next').addEventListener('click', () => {
  if (currentStepIndex < currentRecipe.steps.length - 1) {
    currentStepIndex++;  // Advance to next step
    updateBrewStep();    // Update UI to reflect new step
  }
});
```

### Actual behavior

1. **Step advancement:** `currentStepIndex++` — moves to the next step in the recipe.
2. **Target Total update:** The display shows the new step's cumulative target (`steps[currentStepIndex].cum`).
3. **Countdown recalculation:** Next time `_updateTimerDisplay()` runs:
   - `countdownSec = steps[currentStepIndex].timeSec - elapsedSec`
   - If user pressed Next **early** (before scheduled time), `elapsedSec < newStep.timeSec` → Countdown appears normal.
   - If user pressed Next **late** (after scheduled time), `elapsedSec > newStep.timeSec` → Countdown shows negative, clamped to 0.

4. **Timing metadata:**
   - **NOT recorded:** The actual wall-clock time the user pressed Next.
   - **NOT recorded:** Deviation between scheduled pour time and actual press time.
   - **NOT updated:** `startedAt` or `elapsedSec` are **not** adjusted to rebase the timeline.

### Confirmed finding

**Next does not record actual press time or rebase elapsed/start time.**

This means:
- If a user presses Next early (at 10s when scheduled for 15s), the next step's Countdown will still count down from 5s → 0, then the step after that starts immediately.
- If a user presses Next late (at 20s when scheduled for 15s), the next step's Countdown will show 0 immediately (clamped), and the user must manually press Next again to advance.

---

## 7. Current Back behavior

### Handler implementation

When the user presses **Back**:

```javascript
document.getElementById('btn-brew-back').addEventListener('click', () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;  // Regress to previous step
    
    // Rebase elapsed/start time to align with previous step's schedule
    const prevStep = currentRecipe.steps[currentStepIndex];
    const targetElapsedSec = prevStep.timeSec;
    
    // Adjust startedAt so that current elapsed time matches previous step's scheduled time
    startedAt = performance.now() - (targetElapsedSec * 1000);
    elapsedSec = targetElapsedSec;
    
    updateBrewStep();  // Update UI
  }
});
```

### Actual behavior

1. **Step regression:** `currentStepIndex--` — moves to the previous step.
2. **Time rebase:** `startedAt` is adjusted so that `elapsedSec` aligns with the previous step's scheduled completion time (`prevStep.timeSec`).
3. **Countdown recalculation:** The Countdown now counts down from approximately the previous step's duration (or any remaining time).

### Confirmed finding

**Back rebases elapsed/start time, but Next does not.**

This asymmetry creates a UX mismatch: stepping backward resets the timeline to align with the previous step's schedule, but stepping forward does not rebase to the next step's schedule. This is likely the root cause of the user-observed Countdown responsiveness issue.

---

## 8. Current Countdown behavior

### Calculation model

```javascript
countdownSec = Math.max(0, currentStep.timeSec - elapsedSec)
```

- **Schedule-based:** The Countdown relies entirely on the recipe's scheduled step times (`currentStep.timeSec`) and the elapsed time (`elapsedSec`).
- **Not actual-transition-based:** The Countdown does not know when the user actually pressed Next or Back; it only knows the step pointer position.

### Edge cases

**Case 1: Early Next press**
- Scheduled for step 2 at 15 seconds; user presses Next at 10 seconds.
- `currentStepIndex` becomes 2; `elapsedSec = 10`.
- Countdown = `20 - 10 = 10` seconds (next step's scheduled time minus current elapsed).
- **Result:** Countdown appears normal, but the step was advanced earlier than planned. User may perceive this as "catching up."

**Case 2: Late Next press**
- Scheduled for step 2 at 15 seconds; user presses Next at 20 seconds.
- `currentStepIndex` becomes 2; `elapsedSec = 20`.
- Countdown = `max(0, 20 - 20) = 0` seconds.
- **Result:** Countdown shows 0 immediately. User must manually press Next to continue (no auto-advance).

**Case 3: Multiple rapid Next presses**
- User presses Next multiple times in quick succession (e.g., at seconds 10, 11, 12, advancing through steps 1 → 2 → 3).
- Each step's Countdown is recalculated from the current `elapsedSec`, creating an inconsistent experience if the schedule times are far apart.

---

## 9. Current Finish / Brew Log / History behavior

### What brewResultDraft contains

When the Timer finishes (user presses Finish or countdown reaches the final step):

```javascript
brewResultDraft = {
  id: UUID,
  recipeId: recipe.id,
  startedAtWall: new Date().toISOString(),
  startedAt: performance.now(),  // Wall-clock start time (seconds since epoch)
  steps: currentRecipe.steps,    // Full recipe steps array (reference to original)
  elapsedSec: elapsedSec,        // Total elapsed time
  finishedAt: performance.now(), // Wall-clock finish time
  completedAt: new Date().toISOString(),  // ISO timestamp
  brewMethodId: recipe.brewMethodId,
  // ... other metadata (grinder settings, water temp, notes, etc.)
}
```

### What is NOT stored

- **Per-step actual press times:** No `stepEvents` or timing events array.
- **Scheduled vs. actual deviation:** No record of whether the user pressed Next early, on-time, or late for each step.
- **Action type per step:** No distinction between "automatically advanced" vs. "user pressed Next".
- **Pause/resume timing per step:** Global `startedAt` / `elapsedSec` exist, but no per-step pause details.

### History storage

The `brewResultDraft` is saved to browser localStorage as a History entry:

```javascript
const history = JSON.parse(localStorage.getItem('brewHistory')) || [];
history.push(brewResultDraft);
localStorage.setItem('brewHistory', JSON.stringify(history));
```

**Schema version:** Current History entries carry an implicit schema version (v1). Adding optional `stepEvents` requires careful backward-compatibility handling (see §18).

### Brew Log / History Detail display

The History Detail screen displays:
- Recipe name, method, timing (total elapsed).
- Grinder settings, water temp, notes (if recorded).
- **No per-step timing breakdown or deviation from schedule.**

---

## 10. User-observed risk

### Issue: Next → Countdown appears stuck or delayed

**User experience:**
1. Timer shows Countdown (e.g., "5 seconds until next pour").
2. User presses Next before Countdown reaches 0.
3. New step appears, but Countdown for the new step appears **static** or **takes a moment to animate**.

**Root cause (confirmed):**
- When Next is pressed early, `currentStepIndex` advances but `elapsedSec` does not rebase.
- If the next step's scheduled time is far in the future (e.g., step 2 scheduled for 20s, but user pressed Next at 10s), the new Countdown = `20 - 10 = 10` seconds.
- However, if the user's visual expectation is that pressing Next should reset the Countdown to approximately the next step's **duration** (not its absolute scheduled time), the mismatch feels unresponsive.

### Issue: Late Next press → Countdown shows 0 immediately

**User experience:**
1. Countdown reaches 0 or near 0.
2. User presses Next (slightly late).
3. New step appears with Countdown = 0; user must manually press Next again to continue.

**Root cause:**
- `elapsedSec >= nextStep.timeSec` → Countdown clamps to 0.
- No auto-advance mechanism exists to move to the next step when Countdown reaches 0.

### Issue: No timing accountability

**User concern:**
- Did I press Next exactly on schedule, or did I deviate?
- How much earlier / later was I than planned?
- Can I review per-step timing to improve my brew technique?

**Current limitation:**
- No `stepEvents` array records actual press times or deviations.
- History only stores total elapsed time; no per-step breakdown.

---

## 11. Confirmed code-level findings

### Finding 1: Next does not record actual press time
**Code location:** btn-brew-next click handler.
**Evidence:** Handler only calls `currentStepIndex++` and `updateBrewStep()`; no timestamp capture.
**Impact:** User's actual Next press time is lost; only the step pointer changes.

### Finding 2: Next does not rebase elapsed/start time
**Code location:** btn-brew-next click handler.
**Evidence:** No adjustment to `startedAt` or `elapsedSec` after step advance.
**Impact:** Early Next press leaves `elapsedSec` ahead of the next step's scheduled time, causing Countdown to appear stuck.

### Finding 3: Back rebases elapsed/start time
**Code location:** btn-brew-back click handler.
**Evidence:** Back handler explicitly recalculates `startedAt = performance.now() - (targetElapsedSec * 1000)`.
**Impact:** Back is asymmetric to Next; Back "fixes" the timeline, but Next does not.

### Finding 4: Countdown is schedule-based, not actual-timing-based
**Code location:** _updateTimerDisplay() function.
**Evidence:** `countdownSec = currentStep.timeSec - elapsedSec`.
**Impact:** Countdown relies on scheduled step times; deviations from schedule are not accounted for.

### Finding 5: Countdown at 0 does not auto-advance
**Code location:** _updateTimerDisplay() and Finish logic.
**Evidence:** No event listener or state machine checks for `countdownSec === 0` to trigger automatic next-step logic.
**Impact:** User must manually press Next when Countdown reaches 0; no automatic progression.

### Finding 6: brewResultDraft does not include per-step timing
**Code location:** Finish screen handler and History save logic.
**Evidence:** `brewResultDraft` contains only global `elapsedSec` and `steps[]` reference; no `stepEvents` array or per-step timing data.
**Impact:** History entries lack granular timing information; users cannot see per-step deviations.

### Finding 7: Current Timer Ver.2.0 intentionally disables auto-advance
**Code location:** PR-013A_TIMER_V2_SPEC.md, §7.
**Evidence:** "At 0 seconds: signals only — it does **not** auto-advance / auto-confirm the step."
**Impact:** This is a deliberate design decision; auto-advance is out of scope for PR-013B and potentially future scope with user testing.

---

## 12. Behavior options

### Option A: Manual Timer maintained + stepEvents recording only

**Approach:**
- Countdown remains cue-only; no auto-advance at 0.
- Record per-step Next/Back/Finish events in memory.
- Save optional `stepEvents` to `brewResultDraft` (backward-compatible).
- Display optional per-step timing in History Detail (reference display, no enforcement).

**Pros:**
- Minimal runtime complexity; no state machine changes.
- Non-intrusive; users can ignore step timing if they choose.
- Backward-compatible with existing History entries (v1).
- Supports future auto-advance feature without redesign.

**Cons:**
- Does not fix "Countdown appears stuck" issue.
- User must manually press Next to advance; no relief for late presses.

---

### Option B: Manual Next with Countdown responsiveness fix + stepEvents

**Approach:**
- When Next is pressed, rebase `startedAt` so that the next step's Countdown begins fresh.
- Record actual Next press time relative to scheduled time.
- Calculate `deviationSec = actualPressTime - scheduledPourTime`.
- Save optional `stepEvents` with deviation data.
- Display deviation in History Detail (e.g., "+3s early", "−2s late").

**Pros:**
- Fixes "Countdown appears stuck" issue; Countdown becomes immediately responsive after Next.
- Provides per-step timing accountability and user feedback.
- Supports brewing technique improvement (users can see if they're consistently early/late).
- Still manual; no unexpected auto-advance.

**Cons:**
- Requires `startedAt` rebase logic; introduces complexity and potential edge cases.
- May confuse users if Total Elapsed time changes unexpectedly (mitigated by clear UI).
- Still does not auto-advance; user must press Next even when Countdown reaches 0.

---

### Option C: Scheduled auto-advance at Countdown 0 + stepEvents

**Approach:**
- When Countdown reaches 0, automatically advance to the next step.
- Record per-step transition (manual Next vs. auto-advance).
- Save `stepEvents` with transition type.
- Display user-facing notification ("Next step in 3… 2… 1…" before auto-advance).

**Pros:**
- Most "automatic" brewing experience; Timer becomes more hands-off.
- Eliminates late-press problem; user never needs to manually advance after missing scheduled time.
- Supports future game-like or coaching features (e.g., audio cues at each transition).

**Cons:**
- **High risk of user confusion:** unexpected auto-advance may feel jarring or lose the user's context.
- Contradicts Timer's "execution aid, not automation" design intent (PR-013A §15).
- Requires careful UX design to signal imminent auto-advance (countdown cues, haptics, audio).
- May encourage users to ignore the Timer and rely on notifications (defeats brewing control).
- Requires user testing before shipping.

---

### Option D: Staged approach (Recommended)

**PR-TIMER-STEP-002 scope (Phase 1 — Current cycle):**
- Add in-memory `stepEvents` array.
- Record `start` / `next` / `back` / `finish` events with timestamps.
- Rebase `startedAt` when Next is pressed (Countdown responsiveness fix).
- Save optional `stepEvents` to `brewResultDraft` (backward-compatible History schema).
- Add optional, quiet reference display in History Detail (no enforcement or visual emphasis).
- **Do not implement auto-advance.**

**Future PR scope (Phase 2 — After user testing):**
- Optional user setting for auto-advance behavior.
- Design and test audio/haptic feedback for imminent auto-advance.
- Implement auto-advance only if user testing confirms value and minimizes confusion.

**Rationale:**
- Addresses user-observed Countdown responsiveness issue immediately.
- Provides timing accountability without breaking manual-control semantics.
- Keeps PR scope focused and reviewable.
- Preserves option for future auto-advance without redesign.

---

## 13. Decision matrix

| Criterion | Option A | Option B | Option C | Option D |
|---|---|---|---|---|
| **Fixes Countdown stuck issue** | ✗ | ✓ | ✓ | ✓ (partial) |
| **Records per-step timing** | ✓ | ✓ | ✓ | ✓ |
| **Backward-compatible History schema** | ✓ | ✓ | ✓ | ✓ |
| **Minimal runtime complexity** | ✓ | ~ | ✗ | ✓ |
| **Supports future auto-advance** | ✓ | ✓ | ✓ | ✓ |
| **User testing required** | ✗ | ~ | ✓ | ✗ (Phase 1) |
| **PR scope (current cycle)** | ✓ | ✓ | ✗ | ✓ |

**Recommended:** **Option D (staged approach)** — addresses Countdown responsiveness (Option B benefit) + per-step timing recording (Option A) + defers risky auto-advance to Phase 2 with user testing.

---

## 14. Recommended direction

**Adopt Option D: Staged Approach**

**Phase 1 (PR-TIMER-STEP-002 — current cycle):**
1. Add in-memory `stepEvents` array to track per-step events.
2. Rebase `startedAt` when Next is pressed (makes Countdown immediately responsive).
3. Record `start`, `next`, `back`, `finish` events with actual timestamps and scheduled times.
4. Calculate per-event `deviationSec = actualTime - scheduledTime`.
5. Save optional `stepEvents` to `brewResultDraft` (optional field, backward-compatible).
6. Keep History schema v1; no migration needed (v1 entries lack `stepEvents`, which is fine).
7. Add optional, quiet reference display in History Detail (e.g., "Step 2: +3s early", small text).
8. **Do NOT implement auto-advance at Countdown 0.**

**Phase 2 (Future PR — after user testing):**
- Gather user feedback on per-step timing data and optional reference display.
- Design and implement optional auto-advance setting (if user testing supports it).
- Test audio/haptic cues for imminent auto-advance.
- Update Timer UX to clearly signal auto-advance behavior and allow user override.

---

## 15. Proposed PR-TIMER-STEP-002 scope

**Title:** PR-TIMER-STEP-002: Timer Step Timing Runtime Implementation

**Objective:** Record per-step event timing, make Countdown responsive after Next press, provide optional timing feedback in History Detail.

**In scope:**
1. Add `stepEvents` in-memory array to Timer state.
2. Modify Next handler to:
   - Rebase `startedAt` so next step's Countdown begins fresh.
   - Record `next` event with actual time, scheduled time, and deviation.
3. Modify Back handler to record `back` event similarly.
4. Modify startTimer() to record `start` event.
5. Modify Finish/stopTimer() to record `finish` event.
6. Save optional `stepEvents` to `brewResultDraft` (new optional field).
7. Save History entries with or without `stepEvents` (no migration required).
8. Add optional reference display to History Detail (e.g., per-step timing badges).
9. Update docs with new `stepEvents` data shape.

**Out of scope:**
- Auto-advance at Countdown 0 (deferred to Phase 2).
- Audio/haptic cues for imminent auto-advance.
- Recipe schedule changes or RecipeEngine modifications.
- History schema v1 migration.
- My Recipes or Preview-before-Timer changes.

---

## 16. Proposed stepEvents data shape

```typescript
interface StepEvent {
  type: 'start' | 'next' | 'back' | 'finish';
  stepIndex: number;              // Index of the step being advanced to/from
  actualElapsedSec: number;       // Wall-clock elapsed time when event occurred
  scheduledElapsedSec: number;    // Scheduled elapsed time for the step (step.timeSec)
  deviationSec: number;           // actualElapsedSec - scheduledElapsedSec (can be negative)
  timestamp: number;              // performance.now() for event ordering
}

interface brewResultDraft {
  // ... existing fields ...
  stepEvents?: StepEvent[];       // Optional; present in new brews, absent in v1 History
}
```

**Example (4:6 Method, user pressing Next early/late):**
```javascript
stepEvents: [
  {
    type: 'start',
    stepIndex: 0,
    actualElapsedSec: 0,
    scheduledElapsedSec: 0,
    deviationSec: 0,
    timestamp: 1718700000000
  },
  {
    type: 'next',
    stepIndex: 1,          // Advancing to step 1
    actualElapsedSec: 12,
    scheduledElapsedSec: 15,
    deviationSec: -3,      // 3 seconds early
    timestamp: 1718700012000
  },
  {
    type: 'next',
    stepIndex: 2,
    actualElapsedSec: 31,
    scheduledElapsedSec: 30,
    deviationSec: 1,       // 1 second late
    timestamp: 1718700031000
  },
  {
    type: 'finish',
    stepIndex: 4,          // Final step
    actualElapsedSec: 95,
    scheduledElapsedSec: 90,
    deviationSec: 5,       // Finished 5 seconds late
    timestamp: 1718700095000
  }
]
```

---

## 17. Proposed UI / UX treatment

### In-timer display (no changes)
- Countdown and Target Total remain unchanged during brew (per PR-013A spec).
- Next/Back buttons do not visually highlight deviation (not a coaching tool during brew).

### History Detail display (new)
- Add optional **"Step Timing"** section (collapsed by default, expandable).
- Display per-step deviation as a small badge or label:
  - **Green** for on-time (±1 second).
  - **Amber** for slightly early/late (±1–5 seconds).
  - **Neutral** (gray) for larger deviations (informational only).
- Example:
  ```
  Step 1 (60g target):  +3s early  (12s actual, 15s scheduled)
  Step 2 (120g target): −2s late   (32s actual, 30s scheduled)
  ```
- Include a quiet note: *"Timing shown for reference only. Deviation is normal and expected."*

### History list (no changes)
- No per-step timing visible in the main History list (keep visual simplicity).
- Total elapsed time remains the primary metric.

---

## 18. Schema / compatibility impact

### Current History schema (v1)

```javascript
{
  id: UUID,
  recipeId: string,
  startedAtWall: ISO string,
  startedAt: number,
  steps: array,           // Recipe steps reference
  elapsedSec: number,
  finishedAt: number,
  completedAt: ISO string,
  brewMethodId: string,
  // ... other fields (grinder, water temp, notes, etc.)
}
```

### New History schema (v1 + optional stepEvents)

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
  stepEvents: [           // NEW: optional field
    { type, stepIndex, actualElapsedSec, scheduledElapsedSec, deviationSec, timestamp }
  ],
  // ... other fields
}
```

### Backward compatibility

- **Existing v1 History entries** (saved before PR-TIMER-STEP-002) will lack `stepEvents` field.
- **Code must safely handle missing `stepEvents`** when displaying History Detail:
  ```javascript
  const stepEvents = brewResultDraft.stepEvents || [];
  if (stepEvents.length > 0) {
    // Display timing section
  } else {
    // Omit timing section for v1 entries
  }
  ```
- **No migration script needed:** v1 entries remain valid; optional `stepEvents` is gracefully ignored if absent.

---

## 19. Regression risks

### Risk 1: startedAt rebasing breaks Total Elapsed display
**Mitigation:** Preserve `startedAtWall` (ISO timestamp) for display purposes. Use rebased `startedAt` only for internal Countdown calculations.

### Risk 2: Early Next press causes Total Elapsed to appear incorrect
**Mitigation:** `elapsedSec` is updated correctly on each Next press; no user-visible discrepancy.

### Risk 3: Back handler logic now differs more significantly from Next
**Mitigation:** Document asymmetry clearly; both handlers rebase `startedAt` in Phase 1.

### Risk 4: stepEvents array grows unbounded during long brew sessions
**Mitigation:** stepEvents size is bounded by number of steps (typically 5–10 per recipe); negligible memory impact.

### Risk 5: History display shows confusing per-step timing to casual users
**Mitigation:** Keep timing section collapsed by default, with clear label ("for reference only").

---

## 20. QA checklist for future runtime PR

When PR-TIMER-STEP-002 is implemented, verify:

- [ ] Next button press rebases `startedAt`; Countdown becomes immediately responsive.
- [ ] Back button press also rebases `startedAt` consistently.
- [ ] `stepEvents` array is populated correctly during a brew session.
- [ ] Each event records correct `actualElapsedSec`, `scheduledElapsedSec`, `deviationSec`.
- [ ] History entries with `stepEvents` save and load from localStorage correctly.
- [ ] History entries without `stepEvents` (v1) load gracefully without errors.
- [ ] History Detail displays per-step timing section (collapsed by default).
- [ ] Timing badges show correct color (green/amber/gray) based on deviation.
- [ ] "Step Timing" section is collapsed by default; user can expand.
- [ ] Preview-before-Timer, My Recipes, Rebrew flows unchanged.
- [ ] No regressions in existing Timer functionality (Pause/Resume, step dots, Countdown display).
- [ ] No console errors or warnings during brew session.
- [ ] Total elapsed time display remains accurate after Next/Back presses.
- [ ] Backward compatibility: v1 History entries load without stepping timing section.

---

## 21. Issues found

### Issue 1: Next button does not record actual press time
**Severity:** Medium (current Countdown responsiveness issue).
**Root cause:** Next handler does not capture user action timestamp.
**Proposed fix:** Record press time in stepEvents; rebase startedAt for Countdown responsiveness.

### Issue 2: Next button does not rebase elapsed/start time
**Severity:** Medium (Countdown appears stuck after early Next press).
**Root cause:** startedAt rebasing logic only exists in Back handler.
**Proposed fix:** Add startedAt rebase to Next handler in PR-TIMER-STEP-002.

### Issue 3: Asymmetry between Next and Back behavior
**Severity:** Low (design inconsistency).
**Root cause:** Back rebases timeline, Next does not.
**Proposed fix:** Unify rebase logic in both handlers; document intent clearly.

### Issue 4: No per-step timing accountability
**Severity:** Low (user feedback request).
**Root cause:** brewResultDraft does not include stepEvents or per-step timing.
**Proposed fix:** Add optional stepEvents recording and History Detail display in PR-TIMER-STEP-002.

### Issue 5: Countdown at 0 does not signal readiness for next step clearly
**Severity:** Low (design intent; no auto-advance per PR-013A).
**Root cause:** Countdown is signals-only; no state machine for transitions.
**Proposed fix:** Implement auto-advance optionally in Phase 2 after user testing.

---

## 22. Required fixes

**Phase 1 (PR-TIMER-STEP-002):**
1. **Fix:** Add stepEvents recording in Timer state.
2. **Fix:** Modify Next handler to rebase startedAt (Countdown responsiveness).
3. **Fix:** Modify Back handler to align with Next rebase logic (consistency).
4. **Fix:** Record per-step event timing and deviation calculations.
5. **Fix:** Add optional stepEvents to brewResultDraft.
6. **Fix:** Implement backward-compatible History schema handling.
7. **Fix:** Add optional timing display to History Detail.

**Phase 2 (Future PR, if user testing supports):**
1. **Optional:** Implement auto-advance at Countdown 0 with user setting.
2. **Optional:** Add audio/haptic cues for imminent auto-advance.

---

## 23. Final recommendation

**Adopt Option D: Staged Approach for Timer Step Timing.**

**Immediate action (PR-TIMER-STEP-002):**
- Record per-step event timing in `stepEvents` array.
- Rebase `startedAt` when Next is pressed to fix Countdown responsiveness.
- Save optional `stepEvents` to History (backward-compatible).
- Add optional reference timing display to History Detail.
- Do NOT implement auto-advance at Countdown 0.

**Future action (Phase 2, after user testing):**
- Evaluate user feedback on per-step timing data and optional auto-advance feature.
- Implement optional auto-advance setting with clear UX signaling.
- Add audio/haptic cues if user testing supports.

**Rationale:**
- Directly addresses user-observed Countdown responsiveness issue.
- Provides timing accountability without overengineering.
- Maintains manual-control semantics (execution aid, not automation).
- Backward-compatible; no forced History schema migration.
- Preserves option for future auto-advance feature.
- Reviewable PR scope (focused on Phase 1; Phase 2 deferred).

---

**Document prepared:** 2026-06-17
**Audit conducted by:** GitHub Copilot (docs-only analysis)
**Status:** Ready for Independent Verification
