# PR-011R3C3 Public / Local Smoke QA Report

## 1. Status

PASS

## 2. Environment

- Repository: NS-del346/Pouro-Fable5
- Base commit: 1317aaaa83d449b0135f00637a70dbe34372f807 (origin/main, "docs: update PR-011R3C2 post-merge handoff (#28)")
- Branch: pr-011r3c3-public-local-smoke-qa
- Public URL: https://ns-del346.github.io/Pouro-Fable5/
- Local preview command: `npx serve . --no-clipboard -p 4006` (via `.claude/launch.json` config `pouro-fable5`; served on port 4005 by the preview harness)
- Browser: Chromium (preview harness)
- Viewport: 375 x 812 (mobile preset)
- Date: 2026-06-14

## 3. Scope

QA / report-only pass after PR-011R3A〜R3C2 (Setup/Preview POINT-TIPS, Finish next-adjustment TIPS, Settings future-update note). No app/runtime/data/schema/UI behavior files were modified. The QA report is the only tracked change.

## 4. What was checked

- Required repository checks (`git status`, tips master validation, `node --check app.js`).
- Live local smoke test of the app shell, navigation, and the Setup → Preview → Brew → Finish flow.
- Settings future-update note content, placement, and non-interactivity.
- Contextual POINT (Setup) and TIPS (Preview / Finish) surfaces, including leakage of source/quarantine metadata.
- Forbidden marketing copy in app-facing text.
- Public GitHub Pages availability and parity with `main`.
- Mobile (375px) layout regression spot-check.

## 5. Results

### 5.1 App load / navigation

- App loads at `/` with title `Pourō`; no blank screen, body renders fully. **PASS**
- No console errors (`preview_console_logs level=error` → none). **PASS**
- Bottom navigation present and functional: 抽出 (Brew) / 履歴 (History) / 設定 (Settings). **PASS**
- Screen router (`showScreen`) cycles home → setup → preview → brew → log → settings correctly; tab bar shows/hides per screen as designed. **PASS**

### 5.2 Settings future-update note

Rendered live in the Settings screen, positioned low — immediately above the About / Version card (Version 0.9.1 (PR-011A)) and after the Data ("データについて") card. **PASS**

- Header: 「今後のアップデート候補」 with a 「検討中」 pill. **PASS**
- Closing line: 「この項目は今後の検討メモです。現在の抽出レシピや履歴データには影響しません。」 — uses 検討中 / 検討メモ wording. **PASS**
- Body describes マイレシピ機能 as 「検討中です」 (under consideration) — does not imply it is available now. **PASS**
- Static / non-interactive: no button, link, route, modal, or tab for My Recipes inside the note (`button/a/input/[role=button]/[onclick]` filtered for マイレシピ/今後/検討/作成 → none). **PASS**
- Forbidden copy check (近日公開 / 必ず実装 / 公式対応 / 完全な共有機能 / リリース予定 / Coming soon! / 使えるようになりました / 今すぐ作成) → none present. **PASS**

### 5.3 Setup POINT

All four methods are present on the Brew screen: 4:6 Method (406), Ice Brew (ICE), Hybrid / HARIO Switch (HYB_NEW), 10 Pour (NEO). Setup opens and dose/ratio controls render for each.

- Ice Brew Setup (verified live): POINT card shows 「氷80gを先に入れる」 (P-ICE-001) and 「器具を温める」 (P-ALL-001). HOT/ICE split controls render and behave normally. **PASS**
- Setup POINT data coverage confirmed for all methods via the embedded item set: shared ALL points (P-ALL-001/002/003) apply to every method; ICE adds P-ICE-001; NEO adds T-NEO-001/004 to the setup surface. **PASS**
- No quarantine item, no P-OTHER-001, no HYB_DEVIL app-facing wording in any rendered Setup surface. **PASS**

### 5.4 Preview TIPS

- Ice Brew Preview (verified live): recipe summary (豆 20g / HOT 150g / ICE 80g / 投数 5回 / 目安 3:00), step table, and a TIPS block showing 「湯温で苦味を調整」 (T-ICE-001) and 「1・2投目で味調整」 (T-ICE-002). **PASS**
- No raw source/verification metadata surfaced (filtered DOM for `displayContext` / `appAdoption` / `verificationLevel` → none). **PASS**
- No quarantine / P-OTHER-001 in any rendered Preview surface. **PASS**
- Preview TIPS data coverage confirmed for the other methods: 406 (T-406-001/002, T-ALL-001), HYB_NEW (T-HYB-NEW-001/002, T-ALL-001), NEO (T-NEO-001/002/004). **PASS**

### 5.5 Finish TIPS

Drove the full Setup → Preview → Brew → Finish (抽出記録 / screen-log) path live for Ice Brew via the real Next/Finish handler.

- ICE: Finish screen shows 「次回のヒント」 with 「3分超なら少し粗く」 (T-ICE-003) and 「氷を溶かして完成」 (P-ICE-004) — next-adjustment guidance present. **PASS**
- 406: adoptable finish item exists (P-406-002, 「3分半を目安に」) → finish guidance shown as expected. **PASS** (data-confirmed)
- NEO: adoptable finish item exists (T-NEO-003, 「3分半までかける」) → finish guidance shown as expected. **PASS** (data-confirmed)
- HYB_NEW: by design no adoptable HYB_NEW/ALL finish item exists in v2.1 (see `app.js` POINT_TIPS comment), so the Hybrid Finish TIPS card is hidden. Hidden state is the documented, acceptable behavior and does not look broken. **PASS (expected hide)**

### 5.6 Regression checks

- Bottom navigation: present on tab-bar screens, hidden on flow screens (setup/preview/brew/log) per `TAB_BAR_SCREENS`. **PASS**
- 375px mobile width: cards, sensory bars (甘さ/酸味/濃度/ボディ), method list, and Settings note all lay out cleanly with no overflow or clipping. **PASS**
- Settings layout: cards stack in order — recipe presets / data export / 履歴を消去 / データについて / 今後のアップデート候補 / About. **PASS**
- History access: 履歴 tab reachable from navigation. **PASS**
- Existing recipe selection + Setup / Preview / Finish flow: works end-to-end (verified live for Ice). **PASS**

## 6. Cache / service worker notes

- The service worker (`sw.js`) uses `CACHE_VERSION = 'v2'` with cache-first behavior for the app shell.
- Local preview was served fresh by the preview harness; no stale-cache artifacts observed locally.
- Public GitHub Pages responded HTTP 200 and serves content in parity with `main`: same Version 0.9.1 (PR-011A) and the Settings note (「今後のアップデート候補」) is present in the public `index.html`. Public Pages is **not** lagging behind `main` at the time of this report.
- Standard caveat: a returning visitor whose browser already holds the `v2` cached shell will continue to see the previously cached assets until the service worker updates on a later visit. This is expected PWA behavior, not a defect of this scope. New/hard-reloaded visitors get the current build.

## 7. Findings

No functional defects found. App load, navigation, Settings future-update note, and all three contextual surfaces (Setup POINT, Preview TIPS, Finish TIPS) behave as expected on both local preview and public Pages. No quarantine / P-OTHER-001 / HYB_DEVIL app-facing text appears anywhere in the rendered UI.

## 8. Minor notes

- Testing-harness only (not an app issue): the preview tool's CSS-selector `click` did not trigger SPA navigation in some cases; navigation was driven by invoking the real in-page button handlers (`element.click()`), which exercise the same `showScreen` / Next-Finish code paths. App navigation itself works normally.
- HYB_NEW Finish intentionally shows no TIPS card (no adoptable finish item in v2.1). Documented here so it is not mistaken for a regression in future passes.

## 9. Blocking issues

None.

## 10. Recommendation

Accept as **PASS**. The PR-011R3A〜R3C2 baseline is healthy on both local and public surfaces. Safe to proceed to the next planned work (PR-011R3D Method Detail UI implementation) when scheduled. This QA PR should remain report-only and be merged after independent verification.

## 11. Not started / not changed

- PR-011R3D: not started (Method Detail UI implementation deferred).
- History Detail integration: not started.
- PR-011R4: not started (Timer semantics audit deferred).
- PR-012: not started (My Recipes / Custom Recipe deferred).
- My Recipes implementation: not started — Settings note remains a static 検討中 memo only; no behavior, route, or storage exists.
