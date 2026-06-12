# PR-006A — Visual Parity + UX Clarity Polish

Display-layer alignment of the production app with the Fable5 visual source of
truth (`design-artifact/Pouro-Fable5.dc.html`), based on the audit in
`docs/PR-006A-VISUAL-PARITY-AUDIT.md`.

## Scope guarantees

Unchanged in this PR:

- RecipeEngine pour amounts, step structure, and timings
- TimerEngine (requestAnimationFrame / elapsedSec logic)
- localStorage schema (`pouroFable5.history.v1` / `pouroFable5.settings.v1`)
- JSON / CSV export logic
- `safeClearHistory()` data logic
- No service worker / manifest / offline / PWA wiring

## Implemented

### Task 1 — Method PNG icons restored
- New `methodImgHTML(methodId, size)` helper in `app.js`.
- PNG sizes per artifact: Home row 34px / Home selected card 46px /
  Setup・Preview・Log headers 40px / Brew header 32px / History featured 40px /
  History row 30px / Detail 38px / History header decoration 44px /
  Empty state 52px.
- Inline SVGs remain for small auxiliary/operation icons only.
- Home keeps the vertical list + selected card structure (no 2×2 grid).

### Task 2 — Tab bar visibility rule
- `showScreen()` now shows the tab bar only on `home` / `history` / `settings`.
- `setup` / `preview` / `brew` / `log` / `detail` hide it, so CTA bars sit
  directly on the safe area (no double bottom at 375×568).
- Tab active state is handled only for the three root screens.

### Task 3 — Selected chip tone
- `.chip-btn.active`: `#F4E4D2` bg / `#BD8A60` border / `#8C5535` text / 700.
- `.chip-btn.inactive`: `#FCFAF5` bg / `#DDD1BA` border / `#5C4F3E` text / 500.
- Applies to ratio / flavor / strength chips and taste tags. CTA colors untouched.

### Task 4 — Hybrid OPEN / CLOSED vocabulary
- Unified: OPEN = percolation (water drains), CLOSED = immersion (water held).
- `METHODS.hybrid.desc`, Setup card (now a timeline matching the production
  engine steps: 0:00 OPEN pour → 0:45 close → 1:30 pour CLOSED → 2:15 open →
  3:30 drawdown), and Active Brew switch descriptions corrected.
- CLOSED chips are now the emphasized solid `#8C5535` style (the critical user
  action); OPEN chips use the soft outline style.
- Hybrid drawdown step hides the switch row instead of showing a stale state.
- Engine steps/timings unchanged — wording only.

### Task 5 — Ice Brew ratio card hidden
- `renderSetup()` hides `#ratio-card` when `methodId === 'ice'`.
- Ice card reworked to artifact form: 「湯と氷」, HOT（注湯）/ ICE（サーバー）,
  note that cumulative totals exclude ice. `state.draft.ratio` kept for compat.
- Summary already shows HOT/ICE columns for ice (no `1:null` / `1:15`).

### Task 6 — Ice Brew cumulative clarity
- Active Brew cumulative header reads 「累計（湯のみ）」 for Ice Brew.
- Context chip 「HOT {n}g ・ ICE {n}g」 shown during Ice Brew.
- Ice checklist gains 「累計表示は注いだ湯量のみです — 氷は含めません」.

### Task 7 — Honest 4:6 strength copy
- Strength card hint now 「後半3投の濃度設計に反映」 (back pours are fixed at 3
  in the current engine; variable back-pour count deferred to PR-007).

### Task 8 — Rebrew pill
- Banner replaced by a centered pill (`#F4E6D3` bg / `#C9A77F` border /
  `#8C5535` text) inside the scroll area: 「履歴から再現 ・ {date} の記録」.
- When the source entry has a `nextNote`, a small 「前回の調整」 card appears
  below the pill (read-only; schema unchanged).

### Task 9 — Brew Log rating
- Unrated label: 「未評価（タップで設定）」; rated: 「n / 5 ・ {label}」.
- Tapping the current rating again clears it back to unrated
  (`normalizeRating` still stores `null`).

### Task 10 — History display
- Display-only Japanese dates: `M月D日 H:MM` (date-only legacy entries show
  `M月D日`). Stored data stays ISO.
- Row meta: 「20g ｜ 300ml」; Ice: 「20g ｜ HOT 150g / ICE 80g」.
- Unrated rows show a dashed pill. Method PNG icons in featured/row/detail.

### Task 11 — Settings copy + history count
- 「抽出アシスト」 card rows now have sub-text (wake / sound / haptic).
  Toggle logic unchanged; real assist hardening is PR-007+.
- Data card header shows 「n件の記録」, updated on every `renderSettings()`.

### Task 12 — Clear History confirmation
- Artifact-style bottom sheet: `#F8F3E8` surface, grabber bar, centered
  title/body, entry count in the body, solid `#A3543A` 「消去する」 button,
  backdrop tap cancels. Vocabulary unified to 「消去」 (row label + toast).
- `safeClearHistory()` untouched; settings key survives clearing.

### Task 13 — Reduced-motion fix
- `prefers-reduced-motion` block referenced a non-existent `.pf-toast`;
  corrected to `.toast` and extended to the overlay backdrop fade.

### Icon system (artifact parity)
- Tab bar: 抽出 = dripper icon, 履歴 = rewind-clock icon (artifact SVGs).
- Settings clear row: trash icon.

## Deferred to PR-007+

- Hybrid RecipeEngine parity with the artifact's 3-pour structure
- Variable 4:6 back-pour count
- Active Brew "next pour in n seconds" countdown
- Sound / haptic / wake-lock real implementations
- Actual drawdown time recording; extra structured log fields
- Service worker / manifest / offline (PR-006)

## QA

- Viewports: 375×568 / 375×667 / 390×844 — no horizontal overflow.
- Tab bar hidden on Setup / Preview / Brew / Log / Detail; visible on
  Home / History / Settings.
- Ice Brew: no ratio card; HOT/ICE and 「累計（湯のみ）」 visible.
- Hybrid wording consistent across Setup / Preview / Active Brew.
- Rebrew returns to Preview with the pill (+ 前回の調整 when present).
- Rating clears on re-tap; History keeps unrated pill display.
- localStorage v1 history/settings load unchanged; JSON/CSV export intact;
  Clear removes only the history key.
