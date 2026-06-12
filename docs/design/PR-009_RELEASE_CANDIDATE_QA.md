# PR-009: Release Candidate / Final Deploy QA

## Release candidate scope

PR-009 is the final QA gate before GitHub Pages public release. It performs a static code audit of all four brewing methods, PWA/offline readiness, storage/export schema, 375px viewport layout, and debug/stale-copy hygiene. No engine or schema changes are made. The only code change is a corrected version string in the About card.

## Repository / commit baseline

| Item | Value |
|------|-------|
| Branch | `feat/pr-009-release-candidate-qa` |
| Base commit | `6ba97fb` — PR-008: Post-engine QA and release hardening |
| Model | Claude Sonnet 4.6 |

## Issues fixed in PR-009

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `index.html:879` | About card version string was stale: `Version 0.6.0 (PR-006A)` | Updated to `Version 0.9.0 (PR-009)` |

## Full-flow QA result

Static audit of screen transition logic, Bottom Tab visibility, CTA placement, Active Brew info display, Brew Log save, History rendering, History Detail, and Rebrew flow — all four methods:

| Flow step | Result |
|-----------|--------|
| Home → method selection renders | ✓ |
| Setup screen loads method-specific cards | ✓ |
| Preview screen shows recipe summary + steps | ✓ |
| Active Brew: timer, step dots, pour info card | ✓ |
| Active Brew: pause/resume icons toggle correctly | ✓ |
| Active Brew: next-step hint with countdown | ✓ |
| Brew Log: rating dots, taste tags, memo, next-note, actualDrawdown field | ✓ |
| History: featured card + scrollable list | ✓ |
| History Detail: recipe snapshot, steps, equipment | ✓ |
| Rebrew: restores conditions, shows rebrew banner | ✓ |
| Bottom Tab hidden during Active Brew | ✓ (no tab-bar on screen-brew) |
| CTA bar uses safe-area padding | ✓ (`calc(12px + var(--safe-bottom))`) |

## Method-specific QA result

### 4:6 Method

| Check | Result |
|-------|--------|
| light = 4 total pours (2 front + 2 back) | ✓ |
| standard = 5 total pours (2 front + 3 back) | ✓ |
| strong = 6 total pours (2 front + 4 back) | ✓ |
| sweet: p1 = frontWater × 0.4 (smaller) | ✓ |
| balanced: p1 = frontWater / 2 (equal) | ✓ |
| bright: p1 = frontWater × 0.6 (larger) | ✓ |
| Pour sum equals totalWater | ✓ (backAmts last element uses remainder) |
| Old labels 「中庸」「ライト」「リッチ」「後半3投」absent from code | ✓ |
| Strength card hint: 「後半投数の濃度設計に反映」(no hardcoded 3) | ✓ |
| Target drawdown: 3:30 (210s) | ✓ |

### Hybrid

| Check | Result |
|-------|--------|
| Setup card times: 0:00 / 0:30 / 1:15 / 1:45 / target 3:00 | ✓ |
| RecipeEngine: 3 pours + drawdown | ✓ |
| Step switch states: OPEN → OPEN(close) → CLOSED → OPEN drawdown | ✓ |
| `timeSec`: 0 / 30 / 75 / 105 — matches setup card | ✓ |
| targetDrawdownSec: 180 (3:00) | ✓ |

### 10 Pour

| Check | Result |
|-------|--------|
| 10 pours total | ✓ |
| Times: 0, 30, 45, 60, 75, 90, 105, 120, 135, 150s | ✓ |
| First pour 30s wait, subsequent 15s intervals | ✓ |
| Target drawdown: 3:30 (210s) | ✓ |

### Ice Brew

| Check | Result |
|-------|--------|
| Ratio card hidden for Ice Brew | ✓ (`ratio-card` display:none when id==='ice') |
| HOT/ICE display card shown | ✓ (`ice-card` visible) |
| formula: hotWater = dose×7.5, ice = dose×4 | ✓ |
| Cumulative pour = HOT water only (ice excluded) | ✓ (comment in code) |
| 5 HOT pours at 0:30 intervals | ✓ |
| Target: 急冷完成 3:00 (180s) | ✓ |

## PWA / offline / install QA result

| Check | Result |
|-------|--------|
| `<link rel="manifest" href="manifest.webmanifest">` in HTML | ✓ |
| `<link rel="apple-touch-icon" href="assets/app-icon.png">` | ✓ |
| `theme-color: #8C5535` in HTML meta and manifest | ✓ |
| `display: standalone` in manifest | ✓ |
| `start_url: ./` in manifest | ✓ |
| All APP_SHELL files exist on disk | ✓ (all 27 paths verified) |
| SW install error logs via `console.warn` (not `console.log`) | ✓ |
| SW cache strategy: cache-first for app shell, SWR for fonts | ✓ |
| Stale SW cache scenario confirmed in QA session | ✓ (see note below) |

**Stale cache note:** After deploying a new build, browsers with an existing SW installation will serve the cached `index.html` and may not show updated content. Hard reload procedure:

1. Open DevTools → Application → Service Workers
2. Click **Unregister** for the Pourō SW
3. Reload the page (Cmd+R / Ctrl+R)

The new SW will install and activate on next load. This is expected behavior for a cache-first PWA.

## Data / export / clear history QA result

| Check | Result |
|-------|--------|
| localStorage key: `pouroFable5.history.v1` | ✓ |
| localStorage key: `pouroFable5.settings.v1` | ✓ |
| `normalizeHistoryEntry` handles entries without `recipe.steps` | ✓ (rebuilds via RecipeEngine) |
| `actualDrawdown` field present in normalized entry | ✓ |
| JSON export: full history with `schemaVersion`, `recipe`, `log` | ✓ |
| CSV export: includes `actualDrawdown` column | ✓ (line 1549) |
| Clear History: `localStorage.removeItem(STORAGE_KEYS.history)` | ✓ |
| Settings key survives Clear History (only history key removed) | ✓ |
| Rebrew from old entries: rebuilds recipe via RecipeEngine fallback | ✓ |

## 375px viewport QA result

Static audit of CSS layout for 375×568, 375×667, 390×844:

| Check | Result |
|-------|--------|
| `max-width` on `#app-outer` constrains layout | ✓ |
| `viewport-fit=cover` enables safe area insets | ✓ |
| CTA bar uses `padding-bottom: calc(...)` with `--safe-bottom` | ✓ |
| Active Brew scroll area uses `calc(12px + var(--safe-bottom))` | ✓ |
| No `brew-ring` / `luminous-ring` / glow elements present | ✓ |
| Timer uses plain SVG arc (no large circular indicator) | ✓ |
| `data-scroll` containers use `overflow-y: auto` | ✓ |
| Bottom Tab hidden on Active Brew screen | ✓ |

## Debug / TODO / stale-copy sweep result

```
grep -R "TODO\|FIXME\|console\.log\|debugger\|後半3投\|中庸\|リッチ\|ライト\|brew-ring\|luminous" \
  --exclude-dir=.git --exclude-dir=node_modules
```

| Finding | Location | Disposition |
|---------|----------|-------------|
| `TODO(PR-006)` | `docs/design/PR-002_APP_SHELL_PLAN.md:180` | Docs only — historical plan note, not live code |
| `後半3投` | `docs/design/PR-006A_VISUAL_PARITY_UX_CLARITY.md:62` | Docs only — describes the change made |
| `luminous` | `docs/design/PR-007_ENGINE_REPRODUCIBILITY.md:172` | Docs only — "not adopted" audit entry |
| `luminous` | `docs/design/PR-008_RELEASE_HARDENING.md:87` | Docs only — QA verification entry |
| `ライトクリーム` | `docs/design/PR-002_APP_SHELL_PLAN.md:18` | Docs only — color name, not stale UI label |
| `console.warn` ×5 | `app.js` | Legitimate error handlers (localStorage read/write/clear, SW install) |

No `console.log`, `debugger`, or stale UI copy in live code files. ✓

## `git diff --check` result

Passes with no trailing whitespace or conflict markers. ✓

## Deferred issues

None. No blocking or post-RC issues identified.

## Final release readiness decision

**RELEASE CANDIDATE APPROVED.**

- All four brewing methods (4:6 / Hybrid / 10 Pour / Ice Brew) pass engine and flow audit.
- PWA manifest, SW install, and offline cache strategy are correct.
- Storage schema, JSON/CSV export, and Clear History behavior are verified.
- 375px viewport layout has no horizontal overflow, safe-area issues, or removed visual elements reappearing.
- No debug output, TODO markers, or stale copy in live code.
- One blocking issue fixed: stale About card version string updated to `Version 0.9.0 (PR-009)`.

The app is ready for GitHub Pages deployment (PR-010).
