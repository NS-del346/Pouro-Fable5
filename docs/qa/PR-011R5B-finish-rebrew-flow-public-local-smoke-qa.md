# PR-011R5B: Finish Rebrew Flow Public / Local Smoke QA Report

## 1. Purpose

Verify the post-brew Finish → 同じ条件でもう一度 → Preview flow introduced in PR-011R5A.
Confirm Save to History and History Detail Rebrew remain intact.
Record public/GitHub Pages QA status honestly.

---

## 2. Baseline PRs

| PR | Title | Status |
|----|-------|--------|
| PR-011R5 (#40) | Finish-to-Rebrew Flow Planning | MERGED (b410058) |
| PR-011R5A (#41) | Brew Finish Next Action Polish | MERGED (572ad13) |

---

## 3. Scope

- `docs/qa/PR-011R5B-finish-rebrew-flow-public-local-smoke-qa.md` (this file)
- `docs/design/PR-011R5B_MEMORY_HANDOFF.md`
- Docs-only. No runtime files modified.

---

## 4. Out of Scope

No changes to: `app.js`, `index.html`, `styles.css`, `sw.js`, manifest, `docs/data/*`,
RecipeEngine, `_buildYonRoku`, `_buildHybrid`, `_buildNeo`, `_buildIce`, recipe schedules,
pour amounts, timings, switchState data, History implementation, History Detail implementation,
Method Detail, Settings, localStorage schema, CSV/JSON export/import, PWA behavior,
package/build config.

Not implemented: PR-012 / My Recipes, custom recipe creation/editing, recipe library,
persistent custom recipe definitions, Dark Mode, Brew Log expansion, Taste Tags expansion,
analytics, account/cloud/community, Bluetooth scale, TDS/water quality, new recipe methods,
additional Rebrew behavior, additional Finish UI changes.

---

## 5. Environment

| Item | Value |
|------|-------|
| Date | 2026-06-14 |
| Branch | `pr-011r5b-finish-rebrew-smoke-qa-report` |
| Base commit | 572ad13 (PR-011R5A merged) |
| Local preview port | 4005 |
| Viewport | 375×812 px (mobile preset) |
| Service worker | Unregistered before QA (1 SW unregistered) |
| Browser engine | Chromium (Claude Preview) |

---

## 6. Command Validation Results

```
$ node --check app.js
→ OK

$ node docs/data/validate_tips_master.mjs
→ PASS: 40  FAIL: 0
→ ALL CHECKS PASS
```

All 40 checks passed including:
- HYB_NEW room-temperature water into dripper
- HYB_NEW Switch close ~2:10 / open ~2:45
- NEO 1:45 step preserved
- NEO pour to 210g preserved
- No forbidden expressions in app-facing copy

---

## 7. Local QA Results

### Finish Screen (screen-log) — all methods

**Primary CTA:** 記録を保存 ✅
**Secondary CTA:** 同じ条件でもう一度 ✅
**Sub-label:** 保存せずに、同じ条件の確認画面へ戻ります ✅
**CTAs rendered:** Confirmed via DOM inspection (button IDs: `btn-save-log`, `btn-brew-again`)

### 同じ条件でもう一度 behavior

- Routes to `screen-preview` (not Timer) ✅
- `state.rebrewFrom = { id: null, source: 'finish', date: '', nextNote: '' }` set ✅
- No History entry auto-created ✅
- 抽出を開始 button present on Preview ✅
- No console errors ✅
- No horizontal overflow at 375px ✅

---

## 8. Method-Specific Same-Setup QA Matrix

| Check | 4:6 | Ice 4:6 | Hybrid | NEO |
|-------|-----|---------|--------|-----|
| Finish screen: 記録を保存 is primary | ✅ | ✅ | ✅ | ✅ |
| Finish screen: 同じ条件でもう一度 is secondary | ✅ | ✅ | ✅ | ✅ |
| 同じ条件でもう一度 → Preview (not Timer) | ✅ | ✅ | ✅ | ✅ |
| method preserved | ✅ yon-roku | ✅ ice | ✅ hybrid | ✅ neo |
| dose preserved | ✅ 20g | ✅ 20g | ✅ 20g | ✅ 20g |
| ratio/custom ratio preserved | ✅ 1:15 | ✅ n/a (Ice fixed) | ✅ 1:15 | ✅ 1:15 |
| recipe/variant preserved | ✅ balanced/standard | ✅ Ice fixed recipe | ✅ Hybrid recipe | ✅ NEO recipe |
| No History entry auto-created | ✅ hist=6 | ✅ hist=6 | ✅ hist=6 | ✅ hist=6 |
| 同じ条件でもう一度 banner on Preview | ✅ | ✅ | ✅ | ✅ |
| 抽出を開始 button on Preview | ✅ | ✅ | ✅ | ✅ |
| No console errors | ✅ | ✅ | ✅ | ✅ |
| No horizontal overflow at 375px | ✅ | — | — | — |

Note: Horizontal overflow checked on 4:6 Preview (0 elements). No overflow detected.

---

## 9. Save / History Regression QA

| Check | Result |
|-------|--------|
| 記録を保存 saves History entry | ✅ hist 6 → 7 after save |
| Saved entry uses schemaVersion: 1 | ✅ |
| Saved entry methodId correct | ✅ yon-roku |
| History list renders (screen-history) | ✅ |
| History Detail opens (screen-detail) | ✅ |
| History Detail shows correct method name | ✅ 4:6 Method |
| History Detail: もう一度 button present | ✅ btn-hist-rebrew |
| History Detail → Rebrew → Preview | ✅ screen=screen-preview |
| History Detail Rebrew: no auto-save | ✅ hist=7 unchanged |
| History Detail Rebrew: rebrewFrom has id | ✅ id=h_... (history-origin) |
| History-origin Preview banner text | ✅ "履歴から再現 ・ 6月14日 21:56 の記録" |
| Finish-origin Preview banner text | ✅ "同じ条件でもう一度" |
| Banner distinction: history-origin ≠ finish-origin | ✅ distinct text confirmed |
| Header close from Finish (記録せず閉じる) | ✅ button present on screen-log |

---

## 10. Method-Truth Spot Checks

### 4:6 Method
| Check | Result |
|-------|--------|
| No old 48/72 or 72/48 pour amounts reintroduced | ✅ Steps: 60/60/90/90g |
| Schedule consistent | ✅ 0:00/0:45/1:30/2:15, drawdown 3:30 |

### Ice 4:6
| Check | Result |
|-------|--------|
| HOT/ICE Timer context intact | ✅ HOT and ICE labels present in preview |
| No Switch OPEN/CLOSED wording on Ice | ✅ confirmed (hasSwitchWording=false) |
| hotWater=150g, ice=80g, totalWater=230g | ✅ |

### Hybrid
| Check | Result |
|-------|--------|
| Switch OPEN/CLOSED / 開閉 context intact | ✅ Steps reference Switch OPEN/CLOSED correctly |
| No fixed room-temperature-water amount | ✅ |
| No fixed 20°C / 20℃ | ✅ hasFixedTemp=false |
| Step instructions verified | ✅ 透過(OPEN)→浸漬(CLOSED)→OPEN落とし切り |

### NEO / 10投式ドリップ
| Check | Result |
|-------|--------|
| 10-pour rhythm preserved | ✅ pourCount=10, pourSteps=10 |
| 1:45 / 210g step preserved | ✅ s7 at timeSec=105 (1:45), totalAmount=210g |
| 15-second rhythm from pour 2 onward | ✅ |

---

## 11. Public / GitHub Pages QA Results

**Result: NOT VERIFIED**

Public URL: `https://ns-del346.github.io/Pouro-Fable5/`

Full interactive public QA was not performed in this session. The GitHub Pages deployment
reflects the merged `main` branch (572ad13 = PR-011R5A merge commit). Service worker
cache-first behavior on GitHub Pages makes reliable interactive flow verification impractical
without a full browser session with manual cache clear / hard reload.

Local QA at 375px comprehensively covers all four methods and all required flow checks.
Public static load was not verified independently in this session.

---

## 12. Service Worker / Cache Observations

- Local preview: 1 service worker found and unregistered before QA
- After SW unregister + reload: app loaded correctly from dev server
- `sw.js` was not modified (out of scope)
- GitHub Pages: SW cache-first behavior expected; public verification not performed

---

## 13. Issues Found

None. All checks passed.

---

## 14. Required Fixes

None.

---

## 15. Final Result

**PASS WITH MINOR NOTES**

All local 375px QA checks pass across all four methods.
Public/GitHub Pages interactive flow was not independently verified (noted honestly).

---

## 16. Next Recommendation

Independent Verification for PR-011R5B.
After IV PASS: mark Ready for review → Squash and merge.
After merge: begin PR-012 or other next initiative.
