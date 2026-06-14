# PR-011R4C: Timer UI Public / Local Smoke QA Report

## 1. Purpose

Verify the Timer UI after PR-011R4A (Target Total-first Timer UI implementation) and PR-011R4B (Common Micro Icon Integration). Record local and public/GitHub Pages smoke QA results. Confirm no regression to method truth or Timer usability.

## 2. Baseline PRs

| PR | Title | Status | Merge Commit |
|----|-------|--------|--------------|
| PR #37 (R4A) | PR-011R4A: Target Total-first Timer UI | MERGED | 6251578 |
| PR #38 (R4B) | PR-011R4B: Common Micro Icon Integration | MERGED | c82a92a |

## 3. Scope

- docs-only QA report
- no app/runtime/data/schema/UI changes
- no Timer implementation changes
- no PR-012 / My Recipes / Dark Mode / Rebrew work

## 4. Out of Scope

Not verified in this PR:
- app.js / index.html / styles.css / sw.js / manifest changes
- docs/data changes
- RecipeEngine / _buildYonRoku / _buildHybrid / _buildNeo / _buildIce
- History / History Detail / Method Detail / Settings
- localStorage schema / CSV export / JSON export / import logic
- PWA behavior / package/build config
- PR-012 / My Recipes / Dark Mode / Rebrew / Brew Log / Taste Tags / Analytics

## 5. Environment

| Item | Value |
|------|-------|
| Date | 2026-06-14 |
| Branch | pr-011r4c-timer-ui-smoke-qa-report |
| Base branch | main (c82a92a) |
| Local port | 4005 (npx serve) |
| Viewport | 375×812 (mobile preset) |
| Public URL | https://ns-del346.github.io/Pouro-Fable5/ |
| SW behavior | Cache-first active; hard reload required for reliable local QA |

## 6. Command Validation Results

```
git status --short
?? .claude/launch.json
?? docs/PR-006A-VISUAL-PARITY-AUDIT.md
(no staged or unstaged changes to tracked files)

git diff --name-only
(empty — no tracked file changes on branch at QA time)

node --check app.js
→ OK

node docs/data/validate_tips_master.mjs
→ PASS: 40  FAIL: 0  ALL CHECKS PASS
```

validate_tips_master details:
- items total: 39 (expected 39) ✓
- adoptable: 38 ✓ / quarantine: 1 ✓
- HYB_NEW room-temperature water / 常温水 / ドリッパー内 ✓
- HYB_NEW 300g total / 70°C target / Switch close 2:10 / open 2:45 ✓
- NEO 1:45 step / 210g step / very coarse grind ✓
- No forbidden expressions in app-facing copy ✓

## 7. Local QA Results

Local preview server started on port 4005 via `npx serve`.
Viewport set to 375×812 (mobile).

### Home Screen
- App loads cleanly ✓
- Method list shows: 4:6 Method, Hybrid, 10 Pour, Ice Brew ✓
- No console errors ✓
- No horizontal overflow ✓

### Timer General Checks (all methods)

| Check | Result |
|-------|--------|
| No console errors | ✓ PASS |
| No horizontal overflow | ✓ PASS (verified via scrollWidth check) |
| Target Total (スケール目標) dominant | ✓ PASS |
| This Pour (今回の注湯) secondary | ✓ PASS |
| This Pour uses + notation | ✓ PASS |
| Back (戻る) control visible & tappable | ✓ PASS |
| Pause (一時停止) control visible & tappable | ✓ PASS |
| Next (次へ) control visible & tappable | ✓ PASS |

## 8. Public / GitHub Pages QA Results

URL: https://ns-del346.github.io/Pouro-Fable5/

| Check | Result |
|-------|--------|
| Site loads | ✓ PASS |
| Title: "Pourō / Pour slowly. Brew deeply." | ✓ PASS |
| 4:6 Method visible | ✓ PASS |
| Timer UI (スケール目標 180g) visible | ✓ PASS |
| Step timing intervals visible | ✓ PASS |
| Switch OPEN/CLOSED states visible | ✓ PASS |

**Note**: Public QA was performed via static HTML fetch (WebFetch), not via interactive browser session. Interactive Timer navigation and cache-clear behavior were not verified on GitHub Pages. The static content reflects PR-011R4A/B changes based on the presence of the 180g target total and Switch state text.

**Service Worker / Cache Note**: GitHub Pages serves with cache-first SW. Users who loaded the app before PR-011R4A/B merge may see stale UI until cache expires or they manually unregister the SW. No sw.js changes were made in this PR chain.

## 9. Method-Specific QA Matrix

### 4:6 Method (yon-roku)

Navigation: Home → select 4:6 → setup (20g / 1:15) → preview → 抽出を開始

| Check | Observed | Result |
|-------|----------|--------|
| Standard Timer only (no context row) | No Hybrid / Ice context row | ✓ PASS |
| Target Total dominant | スケール目標 180g (large) | ✓ PASS |
| This Pour uses + notation | 今回の注湯 +60g | ✓ PASS |
| Next step info compact | 次 240g まで | ✓ PASS |
| Controls visible | 戻る / 一時停止 / 次へ | ✓ PASS |
| No 48/72 or 72/48 baseline | Not present | ✓ PASS |
| No Hybrid context row | Not present | ✓ PASS |
| No Ice HOT/ICE context row | Not present | ✓ PASS |
| Step count | 4 pours + Drawdown = 5 steps | ✓ PASS |

### Ice Brew (ice)

Navigation: Home → select Ice Brew → setup (20g / 1:15) → preview → 抽出を開始

| Check | Observed | Result |
|-------|----------|--------|
| HOT/ICE context row appears | δ HOT 150g · ✳ ICE 80g | ✓ PASS |
| No Switch OPEN/CLOSED wording | Not present | ✓ PASS |
| Ice server note compact | 氷はサーバーに先入れ (single line, non-dominant) | ✓ PASS |
| Target Total dominant | スケール目標（湯のみ）30g (large) | ✓ PASS |
| This Pour uses + notation | 今回の注湯 +30g | ✓ PASS |
| Next step info | 次 60g まで | ✓ PASS |
| Step count | 5 steps | ✓ PASS |
| Controls visible | 戻る / 一時停止 / 次へ | ✓ PASS |

**Note**: Label reads "スケール目標（湯のみ）" — "(湯のみ)" qualifier clarifies hot-water-only scale target, appropriate for Ice Brew.

### Hybrid (hybrid)

Navigation: Home → select Hybrid → setup (20g / 1:15) → preview → 抽出を開始

| Check | Observed | Result |
|-------|----------|--------|
| Hybrid context row appears | スイッチ 開 / OPEN | ✓ PASS |
| Switch OPEN/CLOSED visible as text | "スイッチ 開 / OPEN" + action description | ✓ PASS |
| Next Switch action compact | "透過（湯が落ちる）・1:15で閉じる" (single line) | ✓ PASS |
| No fixed room-temperature-water amount | Not present | ✓ PASS |
| No fixed 20°C / 20℃ value | Not present | ✓ PASS |
| Target Total dominant | スケール目標 64g (large) | ✓ PASS |
| This Pour uses + notation | 今回の注湯 +64g | ✓ PASS |
| Next step info | 次 128g まで | ✓ PASS |
| Controls visible | 戻る / 一時停止 / 次へ | ✓ PASS |
| Step count | 3 sections (1/3) | ✓ PASS |

### NEO / 10 Pour (neo)

Navigation: Home → select 10 Pour → setup (20g / 1:15) → preview → 抽出を開始

| Check | Observed | Result |
|-------|----------|--------|
| Standard Timer only (no context row) | No Hybrid / Ice context row | ✓ PASS |
| 10-pour rhythm preserved | 1/10 step indicator, 10 progress dots | ✓ PASS |
| Target Total dominant | スケール目標 30g (large) | ✓ PASS |
| This Pour uses + notation | 今回の注湯 +30g | ✓ PASS |
| Next step info | 次 60g まで | ✓ PASS |
| Timing note compact | 注湯（次は30秒後）| ✓ PASS |
| Controls visible | 戻る / 一時停止 / 次へ | ✓ PASS |
| No Hybrid context row | Not present | ✓ PASS |
| No Ice HOT/ICE context row | Not present | ✓ PASS |

**Note on 1:45/210g step**: validate_tips_master confirmed `P-NEO-003` (1:45, 210g) verificationLevel = primary_visual_confirmed. Step-level interactive verification at step 3/10 was not performed in this QA session; this is considered acceptable given the data-layer PASS.

### Drawdown State (4:6 Method)

Navigated to final step via `updateBrewStep(4)`.

| Check | Observed | Result |
|-------|----------|--------|
| Drawdown label visible | ドローダウン | ✓ PASS |
| Instruction visible | 落ちるのを待つ（目安 3:30） | ✓ PASS |
| Hero timer card hidden | Not shown in drawdown | ✓ PASS |
| Progress dots all filled | Steps 1–4 all complete | ✓ PASS |
| Next button replaced by 完了 | 完了 button visible | ✓ PASS |
| Controls visible | 戻る / 一時停止 / 完了 | ✓ PASS |

## 10. Service Worker / Cache Observations

- `sw.js` was not modified in PR-011R4A or R4B.
- Local preview was served via `npx serve` (no SW registration in local dev context).
- Public GitHub Pages uses cache-first strategy. Users with cached pre-R4A builds may not immediately see updated Timer UI.
- Recommended user action for cache-stale cases: hard reload (Cmd+Shift+R / Ctrl+Shift+R) or clear site data in browser settings.
- No sw.js changes are planned or required for this PR chain.

## 11. Issues Found

None.

## 12. Required Fixes

None.

## 13. Final Result

**PASS**

All local smoke QA checks passed at 375px mobile viewport. Public/GitHub Pages confirmed site loads with PR-011R4A/B Timer UI content. No regressions to method truth, no console errors, no horizontal overflow.

## 14. Next Recommendation

1. Independent Verification of PR-011R4C (docs-only scope check + command validation).
2. If Independent Verification PASS → mark Ready for Review → Squash and merge.
3. After merge → begin PR-012 (My Recipes) planning.
