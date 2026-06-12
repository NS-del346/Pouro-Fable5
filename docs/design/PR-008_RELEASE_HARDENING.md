# PR-008 — Post-engine QA / Release Hardening

## QA Scope

Full regression pass across all four brewing methods after PR-007 engine changes.
Covers Preview → Active Brew → Brew Log → History → Detail → Rebrew flow for each method.

---

## Verified Methods

| Method | Home select | Setup | Preview | Active Brew | Log save | History | Detail | Rebrew |
|--------|-------------|-------|---------|-------------|----------|---------|--------|--------|
| 4:6 Method | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hybrid | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 10 Pour | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ice Brew | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 4:6 Method Checks

### Strength → pour count

| strength | expected total pours | verified |
|----------|---------------------|---------|
| light | 4 (front 2 + back 2) | ✓ |
| standard | 5 (front 2 + back 3) | ✓ |
| strong | 6 (front 2 + back 4) | ✓ |

### Flavor → front split

| flavor | direction | verified |
|--------|-----------|---------|
| sweet | 1st pour smaller (40% of front) | ✓ |
| balanced | equal split (50/50) | ✓ |
| bright | 1st pour larger (60% of front) | ✓ |

### Other checks

- Pour totals sum to `totalWater` for all combinations: ✓
- Preview Pours count matches Active Brew step count: ✓
- No legacy labels (「中庸」「ライト」「リッチ」「後半3投」): ✓
- Back interval: standard/light = 0:45, strong = 0:30 — correctly reflected in `intervalStr`: ✓

---

## Hybrid Checks

### RecipeEngine step times

| step | timeSec | switchState | verified |
|------|---------|-------------|---------|
| 第1投 | 0:00 | OPEN | ✓ |
| 第2投 (→CLOSED) | 0:30 | OPEN | ✓ |
| 第3投 | 1:15 | CLOSED | ✓ |
| Switch OPEN drawdown | 1:45 | OPEN | ✓ |
| targetDrawdown | 3:00 | — | ✓ |

### Fixed in PR-008

The Hybrid setup card in `index.html` showed stale times (0:00 / 0:45 / 1:30 / 2:15 / 3:30)
from a pre-PR-007 4-step design. Updated to match RecipeEngine:
- 0:00 OPEN / 0:30 OPEN→CLOSED / 1:15 CLOSED / 1:45 OPEN+drawdown

### Other checks

- 3 pours + drawdown: ✓
- Preview step list matches Active Brew: ✓
- History Detail reflects Hybrid recipe correctly: ✓
- Switch OPEN cue on drawdown step is visible: ✓

---

## Active Brew Countdown Checks

| state | displayed text | verified |
|-------|---------------|---------|
| Seconds until next pour | `XX秒後` | ✓ |
| At pour time | `注湯タイム` | ✓ |
| Seconds until drawdown | `XX秒後` | ✓ |
| At drawdown | `落ち切り待ち` | ✓ |
| After final step | empty string | ✓ |
| Pause | countdown freezes, no display corruption | ✓ |
| Resume | countdown resumes correctly | ✓ |
| Sub-zero seconds | `Math.max(0, …)` prevents negative display | ✓ |
| luminous ring / glow / sweep | none present in code | ✓ |

---

## History / Export / Clear History Checks

| item | verified |
|------|---------|
| Legacy history entries normalize without errors | ✓ |
| New entry includes `actualDrawdown` in `log` object | ✓ |
| History Detail displays `actualDrawdown` (`detail-equip-drawdown`) | ✓ |
| JSON export includes `actualDrawdown` field per entry | ✓ |
| CSV export includes `actualDrawdown` column | ✓ |
| Clear History removes `pouroFable5.history.v1` only | ✓ |
| Settings key (`pouroFable5.settings.v1`) survives Clear History | ✓ |
| localStorage key names unchanged from PR-005 | ✓ |

---

## PWA / Offline Regression Checks

| item | verified |
|------|---------|
| `manifest.webmanifest` referenced in `<head>` | ✓ |
| `sw.js` registered on DOMContentLoaded | ✓ |
| Service Worker install succeeds (no syntax errors in sw.js) | ✓ |
| `manifest.webmanifest` not modified in PR-008 | ✓ |
| `sw.js` not modified in PR-008 | ✓ |

---

## 375px Viewport Checks

| viewport | checked | result |
|----------|---------|--------|
| 375 × 568 | horizontal overflow | none |
| 375 × 667 | horizontal overflow | none |
| 390 × 844 | horizontal overflow | none |

### Areas verified

- Home method cards: no overflow
- Setup chips (ratio / flavor / strength): chip-grid-3 wraps correctly
- Preview summary grid: summary-grid scroll-x is clipped
- Active Brew: pour amount / cumulative / countdown do not overlap
- Brew Log inputs: full-width within padding
- History list: method name truncates with ellipsis
- History Detail: steps list stays within card
- Settings: dose/ratio spinners fit in one line
- Bottom Tab: hidden on all flow screens (setup / preview / brew / log / detail)
- CTA bar: `padding-bottom: var(--safe-bottom)` keeps button above safe area

---

## Fixed Issues

| # | file | description |
|---|------|-------------|
| 1 | `index.html` | Hybrid setup card showed stale times (0:00/0:45/1:30/2:15/3:30) from pre-PR-007 4-step design. Updated to match RecipeEngine 3-pour structure (0:00/0:30/1:15/1:45). |

---

## Deferred Issues

None.

---

## git diff --check

Passes with no whitespace errors.
