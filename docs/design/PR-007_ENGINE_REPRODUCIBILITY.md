# PR-007: Engine Refinements and Reproducibility Enhancement

## Overview

PR-007 implements the extraction logic reproducibility improvements deferred from PR-006A/B.

---

## Task 1 — 4:6 Variable Strength Logic

### Principle

The 4:6 Method splits total water into front 40% (taste control, 2 pours) and back 60% (strength control, variable pours).

### Front pour split (flavor)

| Flavor    | p1 (1st pour) | p2 (2nd pour) | Effect |
|-----------|--------------|--------------|--------|
| sweet     | 40% of front | 60% of front | smaller first → sweeter profile |
| balanced  | 50% of front | 50% of front | equal split |
| bright    | 60% of front | 40% of front | larger first → brighter, more acidic |

**Note:** Previous production had sweet/bright reversed. PR-007 corrects to match design intent.

### Back pour count (strength)

| Strength | Back pours | Interval | Total pours |
|----------|-----------|---------|-------------|
| light    | 2         | 45s     | 4           |
| standard | 3         | 45s     | 5           |
| strong   | 4         | 30s     | 6           |

Example with dose=20g, ratio=15 (total 300g):

```
light   (4 pours): front 60+60 | back 90+90
standard (5 pours): front 60+60 | back 60+60+60
strong  (6 pours): front 60+60 | back 45+45+45+45
```

### Step timings

| Strength | Step times (s)              | Drawdown |
|----------|-----------------------------|----------|
| light    | 0, 45, 90, 135              | 210      |
| standard | 0, 45, 90, 135, 180         | 210      |
| strong   | 0, 45, 90, 120, 150, 180    | 210      |

### Rounding / total water guarantee

Last back pour = `backWater - perBack × (backPourCount - 1)` so the sum always equals `totalWater`.

---

## Task 2 — Hybrid Recipe Engine (Artifact-aligned 3-pour structure)

### Artifact design intent

Based on `design-artifact/Pouro-Fable5.dc.html`:

| Step | Time  | Amount     | Switch | Description |
|------|-------|-----------|--------|-------------|
| 第1投 | 0:00  | ~21% total | OPEN   | 透過の注湯 |
| 第2投 | 0:30  | ~21% total | OPEN   | 透過の注湯 → 注ぎ終えたら Switch を閉じる |
| 第3投 | 1:15  | ~57% total | CLOSED | 浸漬の注湯 |
| 落とし切り | 1:45 | 0         | OPEN   | Switch を開けて落とし切る |

Amount formula: `h1 = h2 = round(totalWater × 3/14)`, `h3 = totalWater - h1 - h2`

### Changes from previous production

- Step count: 5 steps (2 pours + 2 switch ops + drawdown) → 4 steps (3 pours + drawdown)
- OPEN percolation now 2 pours instead of 1
- Drawdown target: 3:30 → 3:00
- `pourCount`: 2 → 3
- Switch chip shown on drawdown step (OPEN) to cue the user to open the switch

### Backward compatibility

Old Hybrid history entries with saved `recipe.steps` are displayed as-is. Only new brews use the updated engine.

---

## Task 3 — Active Brew Next-Pour Countdown

### Implementation

A `brew-next-countdown` span inside `#brew-next-hint` is updated every frame by `_updateTimerDisplay`.

```
countdown = Math.max(0, nextStep.timeSec - elapsedSec)
```

| State                        | Display         |
|------------------------------|----------------|
| countdown > 0                | `XX秒後`        |
| countdown === 0              | `注湯タイム`    |
| next step is drawdown, > 0   | `XX秒後`        |
| next step is drawdown, === 0 | `落ち切り待ち`  |
| no next step / paused frozen | `''` (empty)    |

Pause/resume: countdown freezes when paused (timer loop stops), resumes correctly on resume. No negative values shown (`Math.max(0, ...)`).

---

## Task 4 — Brew Log Reproducibility Fields

### New field: `actualDrawdown`

- **UI label:** 落ちきり
- **Placeholder:** 例：3:42
- **Storage key:** `log.actualDrawdown` (string, optional)
- **Location:** Equipment section of Brew Log screen

`nextNote` (次回の調整) was already present from PR-005.

### localStorage backward compatibility

`normalizeHistoryEntry` reads `entry.log?.actualDrawdown || ''` — missing field defaults to empty string. Old entries render without error.

### Export compatibility

#### JSON

`actualDrawdown` is included in `log` object naturally. Old exports without this field remain importable.

#### CSV

New column `actualDrawdown` added after `nextNote`. Old records have empty value for this column. Column order:

```
id, completedAt, methodId, methodName, dose, ratio, totalWater, hotWater, ice,
elapsedSec, rating, tags, note, nextNote, actualDrawdown,
bean, grind, temperature, equipment
```

---

## Task 5 — History Detail / Rebrew Reproducibility Display

### History Detail

`actualDrawdown` shown in the equipment/details card as `落ちきり` row.
`nextNote` shown in the existing `detail-next-note-card`.

### Rebrew

`nextNote` is surfaced in `rebrew-next-note-card` on the Preview screen (implemented in PR-006A). It is displayed as reference only — RecipeEngine inputs (dose/ratio/method/flavor/strength) are not auto-modified.

---

## QA Results

| Check | Result |
|-------|--------|
| git diff --check | clean |
| 4:6 sweet/balanced/bright front split correct | ✓ |
| 4:6 light/standard/strong pour count = 4/5/6 | ✓ |
| 4:6 pour totals equal totalWater for all combinations | ✓ |
| Preview pourCount matches Active Brew step count | ✓ |
| Hybrid OPEN/CLOSED consistent Preview ↔ Active Brew | ✓ |
| Hybrid drawdown chip shows OPEN (Switch action cue) | ✓ |
| Ice Brew unchanged from PR-006A | ✓ |
| PWA files from PR-006B unchanged | ✓ |
| Old history entries with saved steps render correctly | ✓ |
| JSON export works | ✓ |
| CSV export includes actualDrawdown column | ✓ |
| Clear History removes history key only | ✓ |
| Rebrew works for old and new history entries | ✓ |
| 375×568 / 375×667 / 390×844 no horizontal overflow | ✓ |
