# PR-011A Memory / Handoff｜Pouro-Fable5

## 1. PR Summary

PR: PR-011A｜Visual clarity / IA / navigation polish
Branch: `pr-011a-visual-ia-navigation-polish`
Commits: `3aafcd4` (UI/IA/navigation) / `4b30f64` (SW cache v2) / `efa2759` (QA notes)
PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/12
Merge status: **MERGED** (2026-06-12, merge commit `99799f0`, base `main`)

## 2. What Changed

- Home header logo was changed from PNG (`wordmark-ink.png`) to text-based logo (`.logo-wordmark`).
- The `ō` macron accent (`--color-accent`, #A2674E) was applied only to the Home header logo — same glyph stacked with `clip-path: inset(0 0 72%)`. About logo stays as image; body-text Pourō has no accent.
- Home method row alignment was corrected: `.method-row-num` fixed at 52px → all unselected row titles start at x=138 (375px / 390px, measured).
- Home method subcopy wrapping was improved: `word-break: keep-all` + `<wbr>` after 、/・ + NBSP around ` + ` pairs, via display-only `homeSubHTML()` (METHODS data unchanged).
- History header icon stretching was fixed: `object-fit: contain` on the 44×44 header and 52×52 empty-state uses of `method-46.png` (227×320).
- Settings About copy was revised for general users: 「Pourō は、ハンドドリップの抽出条件と結果を記録する個人用ツールです。」 Version → 0.9.1 (PR-011A).
- “Fable5 design artifact” wording was removed from general UI.
- Settings Data Management IA was reorganized into 「データ管理」 with 「履歴を書き出す」 group + 「データについて」 static note (device-local only).
- CSV was kept as the primary export path (「CSVを書き出す」 first, with spreadsheet-use subcopy).
- JSON was renamed / positioned as 「詳細データ（JSON）」(subcopy: すべての記録項目を含む完全なデータです).
- Brew Log top-left action was changed to a close / discard flow: × icon, aria-label 「記録せず閉じる」, closes to Home (never back to Timer). Confirm sheet (「記録せずに閉じますか？」) only when input exists; the Clear History bottom sheet was generalized into `showConfirm()` and reused.
- manifest `description` wording only → 「ハンドドリップの抽出ガイドと記録」.
- `sw.js` `CACHE_VERSION` v1 → v2 (required: precached index.html / styles.css / app.js / manifest changed).
- QA note was added: `docs/PR-011A-QA.md`.

## 3. What Did Not Change

- RecipeEngine: untouched (no diff hunks in engine code).
- Timer logic: untouched (step progression / pause / finish identical).
- localStorage schema: unchanged — keys remain `pouroFable5.settings.v1` / `pouroFable5.history.v1`.
- History record schema: unchanged (record 11 keys / log 9 keys / recipe 11 keys).
- CSV export schema: unchanged — 19 columns, same order, BOM (EF BB BF), CRLF, MIME, filename pattern; byte-identical for same data.
- JSON export schema: unchanged — `app / schemaVersion / exportedAt / historyCount / history`, schemaVersion 1; only `exportedAt` differs per run.
- Rebrew logic: unchanged (banner + Preview transition verified).
- manifest functionality: name / icons / start_url etc. unchanged (description wording only).
- Service Worker strategy: unchanged — cache-first / SWR / network-only and precache list (26 entries) intact; version bump only. v1 cache evicted on activate (verified).
- PWA routing: unchanged — no history API usage; relative `./` paths keep GitHub Pages subpath safe.

## 4. Verification Result

Verdict:
PASS WITH MINOR NOTES
(Independent Verification, 2026-06-12 — recommendation: Merge now; merged as `99799f0`)

Key verification findings:

- Scope compliance: all reported items implemented as claimed; no PR-011A2/B/C/D/E/012-level changes leaked in. Changed files limited to app.js / index.html / styles.css / manifest.webmanifest / sw.js / docs/PR-011A-QA.md.
- Out-of-scope violations: none. app.js diff hunks limited to renderHome subcopy, `showConfirm()`/`_logHasInput()`, log-close handler, clear-history generalization.
- Visual / UX: title alignment x=138 at 375/390px; no horizontal overflow on home/history/settings; full 19-step regression flow (method → setup → preview → brew → timer finish → log close variants → save → history → detail → rebrew → exports → clear history) passed; close-with-input shows confirm, cancel preserves input, close never returns to Timer.
- Data / schema: localStorage key set unchanged before/after; CSV header/BOM/CRLF/MIME verified at runtime; export functions untouched by diff (byte-identity by code identity).
- Service Worker / PWA: version bump only; `pouro-app-v1` eviction on activate proven live; bump judged necessary and correct given precached files changed.
- Hidden Unicode / bidi: `docs/PR-011A-QA.md` fully clean. app.js contains 2 intentional NBSP (new, in `homeSubHTML`) and 1 pre-existing U+FEFF (CSV BOM literal, already on main). No bidirectional control characters anywhere → no Trojan Source risk. GitHub warning attributable to these intentional characters; not a blocker.

## 5. Known Minor Notes

- GitHub hidden Unicode warning is caused by intentional NBSP and existing CSV BOM.
- No bidi control characters were found.
- NBSP may be replaced with `\u00A0` in a future cleanup if desired.
- Unused icons remain in assets/icons (16 files, precached since PR-006B) and should be reviewed in a later asset cleanup PR.
- Browser back / iOS swipe-back behavior remains an existing known limitation (no history API).
- Logo textContent is “pourōō” due to the stacked macron glyph — mitigated by `user-select: none` + `aria-hidden` + `role="img"`/`aria-label="pourō"`; documented in QA notes.
- Future-icon evaluation (QA §4): Drive common icons = repo `assets/icons/` (md5-identical); not adopted (PNG can’t follow `currentColor`, color mismatch with ink/amber tokens). grinder / preset / edit / skip・close / origin / csv / json assets do not exist and would need creation.

## 6. Decisions to Carry Forward

- Do not call JSON export “backup” until JSON import / restore exists.
- Keep CSV as the primary user-facing export format.
- Use “詳細データ（JSON）” for JSON export.
- Keep PRs narrowly scoped.
- Continue using Independent Verifier before merge.
- Continue adding Memory / Handoff after each PR.
- Bump `CACHE_VERSION` whenever precached files (index.html / styles.css / app.js / manifest) change; keep SW logic untouched.
- Reuse `showConfirm()` for any new confirm dialogs instead of adding new dialog markup.
- ō macron accent stays Home-header-only; keep code identifiers ASCII (`Pouro`/`pouro`).

## 7. Watch Items for Next PRs

### PR-011A2｜Recipe Setup dose direct input

- Keep RecipeEngine unchanged.
- Validate 1–100g.
- Use integer input first.
- Confirm iOS numeric keyboard with `inputmode="numeric"`.
- Confirm Preview / Timer receive existing dose value normally.

### PR-011B｜Brew Log reproducibility schema

- Add grinderModel / grinderClicks carefully.
- Preserve legacy records.
- Keep old CSV columns in the same order.
- Add new CSV columns only at the end.
- Define schema fallback behavior before implementation.

### PR-011C｜Recent values

- Prefer deriving suggestions from existing History.
- Avoid full Settings preset management at first.

### PR-011D-1｜Timer next-pour clarity

- Keep schema unchanged.
- Rework only next-pour information hierarchy.

### PR-011D-2｜Step actual timing log

- Define stepActuals semantics before implementation.
- Decide deltaSec sign convention.
- Decide pause / auto / manual handling.

### PR-011E｜Timer visual refinement

- Require Claude Design / Fable 5 mock before implementation.
- Avoid BALMUDA imitation.
- Check iPhone Safari performance and reduced motion.

## 8. References

- PR: https://github.com/NS-del346/Pouro-Fable5/pull/12
- QA note: `docs/PR-011A-QA.md`
- Independent Verification Report: 2026-06-12 verification chat (verdict PASS WITH MINOR NOTES; summary in §4 above)
- GitHub Pages: https://ns-del346.github.io/Pouro-Fable5/
- Previous handoff: `docs/design/PR-010_PUBLIC_RELEASE_HANDOFF.md`
