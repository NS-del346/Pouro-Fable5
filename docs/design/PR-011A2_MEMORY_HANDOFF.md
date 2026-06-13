# PR-011A2 Memory / Handoff｜Pouro-Fable5

## 1. PR Summary

- PR: PR-011A2 — Recipe Setup dose direct input
- Branch: `pr-011a2-recipe-setup-dose-direct-input`
- Commits: feat: Recipe Setup dose direct input
- PR URL: https://github.com/NS-del346/Pouro-Fable5/pull/13
- Merge status: MERGED
- Implementation commit: 110e2323d7b5b3bc63f01a7a41e980922c3ffccc
- Merge commit: 4ef6e8591fdf5f7d0df442eae53eba799c84d60e

## 2. What Changed

Recipe Setup 画面のコーヒー量 (dose) 表示を、タップ / クリック / キーボードで
直接 g 数を入力できるようにした。既存の +/- ステッパーはそのまま維持し、
表示値そのものを編集トリガーに変えた最小限の入力 UI 拡張。

- `index.html` — dose 表示を `<button id="btn-dose-edit">` 化し、編集用の
  一時 `<input id="dose-input">`（非表示）と「タップして編集」補助文を追加。
- `app.js` — `normalizeDoseInput()` / `openDoseEditor()` / `closeDoseEditor()`
  と、編集ボタン・input の keydown(Enter/Esc)・blur ハンドラを追加。
- `styles.css` — `.dose-display-btn` / `.dose-input` / `.dose-input-wrap` /
  `.dose-edit-hint` を追加。既存デザイントークンのみ使用。

## 3. What Did Not Change

- RecipeEngine: 変更なし（diff なし）
- Timer logic: 変更なし
- localStorage schema: 変更なし
- History record schema: 変更なし
- CSV schema: 変更なし
- JSON schema: 変更なし
- Rebrew: 変更なし
- Service Worker (sw.js / cache version): 変更なし
- manifest: 変更なし
- assets / icons: 変更なし

## 4. Dose Input Behavior

- Tap: dose 値ボタンをタップ／クリックで input に切り替わる
- Focus: input に現在値が入りフォーカス＋全選択される
- Enter: 確定（blur 経由で commit）
- Blur: 確定。valid なら反映、invalid なら前回 valid 値へ戻す
- Esc: キャンセル。前回 valid 値へ戻す
- Valid range: 整数 1〜100
- Invalid handling: 空 / 0 / 101+ / 負数 / 小数 / 文字列 / NaN は反映せず前回値維持
- Full-width digits: 全角数字を半角へ normalize（例 `３０`→30）
- g suffix: 末尾 `g`／`G`／全角を許容し除去（例 `25g`→25）。`20gabc` は invalid
- NaN prevention: normalize 失敗時は `null` を返し state 非更新、UI に NaN を出さない

## 5. Verification Result

Implementer QA:

- Verdict: PASS
- Validation: 12 ケース全通過（valid/min/max/0/101/empty/decimal/abc/g-suffix/全角/trim）
- Visual / accessibility: 375px・390px で横スクロールなし、開閉時のレイアウト跳ね 0px、
  tap target 79×60px、aria-label あり、inputmode=numeric、type=text
- Data / schema: RecipeEngine / Timer / localStorage / History / CSV / JSON / SW / manifest / assets に diff なし
- Regression: +/- ステッパー従来通り、Summary 反映 (30g→450ml) 確認

Independent Verification:

- Verdict: PASS WITH MINOR NOTES
- Merge recommendation: Merge now
- Required fixes before merge: none
- Confirmed: scope compliance, validation behavior, accessibility, schema safety, no out-of-scope changes

## 6. Known Minor Notes

- iOS 安定性優先で `type="text" + inputmode="numeric"` を採用（`type="number"` 不使用）。
- Esc キャンセルは物理キーボード前提。ソフトキーボードのみの環境では blur=確定が主動線。
- 直接入力は 1〜100g を許容する一方、既存ステッパーは 10〜40g の範囲に留まる。PR-011A2 の違反ではないが、後続の軽微 UX 調整 PR で range 整合を検討する。(Direct input allows 1–100g, while steppers remain 10–40g. This is not a PR-011A2 violation, but range consistency should be considered in a later UX cleanup PR.)

## 7. Decisions to Carry Forward

- dose 表示自体を編集トリガーにする affordance（薄い破線下線＋補助文）が確立。
  他の数値表示（ratio 等）へ展開する場合は同パターンを流用可能。

## 8. Watch Items for Next PRs

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

## 9. References

- PR: PR-011A2
- QA note: this file (Sections 4–5)
- Independent Verification Report: PASS WITH MINOR NOTES
- Merge commit: 4ef6e8591fdf5f7d0df442eae53eba799c84d60e
- GitHub Pages: https://ns-del346.github.io/Pouro-Fable5/
- Previous handoff: docs/design/PR-011A_MEMORY_HANDOFF.md
