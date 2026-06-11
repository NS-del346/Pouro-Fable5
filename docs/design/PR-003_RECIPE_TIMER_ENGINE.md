# PR-003: Recipe Engine + Real Timer

## Overview

PR-003 adds a `RecipeEngine` object and a real brew timer to the Pouro-Fable5 app shell built in PR-002. It covers all four brewing methods with method-specific step structures, a `requestAnimationFrame`-based timer with `setInterval` fallback, and an in-memory brew result draft passed to the Brew Log screen.

Persistence (`localStorage`) is intentionally deferred to PR-004.

---

## RecipeEngine

`RecipeEngine.build(methodId, dose, ratio, flavor, strength)` dispatches to one of four private builders and returns a **recipe object** that acts as the single source of truth for both the Preview screen and the Active Brew screen.

### Recipe object shape

```js
{
  id: string,           // 'yon-roku' | 'hybrid' | 'neo' | 'ice'
  name: string,
  dose: number,         // g
  ratio: number,        // e.g. 15 → 1:15
  totalWater: number,   // g  (hotWater + ice for Ice Brew)
  hotWater: number,     // g  (equals totalWater except for Ice Brew)
  ice: number,          // g  (0 for non-ice methods)
  targetDrawdownSec: number,
  steps: Step[],
}
```

### Step shape

```js
{
  id: string,           // 's1', 'sw1', 'draw', …
  timeSec: number,      // target clock time for this step
  label: string,        // display label
  instruction: string,
  pourAmount: number,   // g poured this step (0 for switch/drawdown)
  totalAmount: number,  // cumulative hot water after this step
  type: 'pour' | 'switch' | 'drawdown',
  switchState?: 'open' | 'closed',  // Hybrid only
}
```

---

## Method specifications

### 4:6 Method (`yon-roku`)

Five pours. Front 40% (p1+p2) controls flavor; back 60% (p3+p4+p5) controls strength.

| Option | p1 / p2 split |
|--------|---------------|
| `sweet` | 60 / 40 |
| `balanced` | 50 / 50 |
| `bright` | 40 / 60 |

Pour times: `[0, 45, 90, 135, 180]` s, drawdown at `210` s.

`strength` (`light` / `standard` / `strong`) is reflected in the instruction text only; it does not change pour amounts in PR-003.

### Hybrid (`hybrid`)

Switch-based immersion + percolation. Water split 60% OPEN / 40% CLOSED.

| Step | Time | Type | switchState |
|------|------|------|-------------|
| s1 | 0 s | pour | open |
| sw1 | 45 s | switch | closed |
| s2 | 90 s | pour | closed |
| sw2 | 135 s | switch | open |
| draw | 210 s | drawdown | — |

The `brew-switch-chip` badge in Active Brew reflects the current step's `switchState` and persists at OPEN during drawdown (last known state).

### 10 Pour / Neo (`neo`)

Ten equal pours. First interval 30 s; subsequent intervals 15 s.

Times: `[0, 30, 45, 60, 75, 90, 105, 120, 135, 150]` s, drawdown at `210` s.

Each pour = `totalWater / 10` g (last pour adjusted for rounding).

### Ice Brew (`ice`)

```
hotWater = Math.round(dose × 7.5)
ice      = Math.round(dose × 4)
```

Five equal hot pours at `[0, 30, 60, 90, 120]` s (30 s intervals), drawdown at `180` s.

The Preview summary shows **HOT** and **ICE** columns instead of ratio. The Active Brew cumulative counter tracks hot water only (not ice).

---

## Timer engine

### State fields

```js
state.timer = {
  startedAt: null,          // performance.now() snapshot at start/resume
  pausedAt: null,           // performance.now() snapshot when paused
  pausedDurationMs: 0,      // total accumulated pause time
  elapsedSec: 0,
  currentStepIndex: 0,
  isRunning: false,
  isFinished: false,
  rafId: null,
  intervalId: null,         // setInterval fallback for background tabs
  startedAtWall: null,      // Date.now() at brew start (for brew result)
  finishedAtWall: null,
}
```

### Elapsed time formula

```
elapsedMs = performance.now() - startedAt - pausedDurationMs
```

This formula compensates for all accumulated pause time and remains accurate across pause/resume cycles.

### Dual scheduler

`requestAnimationFrame` drives smooth timer display at up to 60 fps. In background tabs, browsers throttle RAF to ~1 fps or lower. A `setInterval(_updateTimerDisplay, 1000)` fallback ensures the timer display and arc update at least once per second when the tab is not in focus.

Both RAF and the interval are started together in `startTimer()` / `resumeTimer()` and cancelled together in `pauseTimer()` / `stopTimer()`.

### DOM updates in the RAF loop

Only two DOM writes occur per frame: the time display text node and the SVG arc `stroke-dasharray`. Step card updates happen only on Next / Back button clicks, not per frame.

---

## Active Brew controls

| Control | Behaviour |
|---------|-----------|
| Next | Advances `currentStepIndex`; updates step card and cumulative. Last pour step → Drawdown card. |
| Back | Retreats one step. At step 0 → abandons brew, returns to Preview. |
| Pause | Pauses timer; button label → 再開. |
| Resume | Resumes timer from pause point. |
| Finish | Shown on Drawdown card. Stops timer, builds `state.brewResultDraft`, navigates to Brew Log. |

**Back at step 0** snaps `elapsedSec` to the target time of step 0. A precise elapsed-rewind implementation is deferred to PR-004.

---

## Brew result draft

```js
// PR-003 creates an in-memory brew result draft.
// Persistence will be implemented in PR-004.
state.brewResultDraft = {
  methodId, method, dose, ratio,
  totalWater, hotWater, ice,
  steps,
  elapsedSec,
  startedAt,    // wall-clock ISO string
  finishedAt,   // wall-clock ISO string
  completedAt,  // same as finishedAt
};
```

The Brew Log screen reads from `state.brewResultDraft` to populate the method name, dose, and water totals displayed to the user.

---

## Files changed

| File | Change |
|------|--------|
| `app.js` | `RecipeEngine`, timer engine, `updateBrewStep()`, `buildSummaryCols()` rewrite, Brew Log handoff |
| `index.html` | Added `#brew-switch-row`, `#brew-switch-chip`, `#brew-switch-desc` for Hybrid switch state display |
| `styles.css` | No changes (PR-002 styles cover all new elements) |
| `README.md` | Updated current PR marker and added PR-003 note |
| `docs/design/PR-003_RECIPE_TIMER_ENGINE.md` | This document |
