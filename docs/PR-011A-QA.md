# PR-011A: Visual clarity / IA / navigation polish — QA記録

実施日: 2026-06-12
ブランチ: `pr-011a-visual-ia-navigation-polish`

## 1. 変更概要

| 対象 | 内容 |
|---|---|
| 4.1 ロゴ表記 | Homeヘッダーのロゴを `wordmark-ink.png` からテキスト実装に置換。`ō` のマクロンのみ `--color-accent` で表示（同一グリフを重ねて `clip-path` でマクロン領域のみ着色） |
| 4.2 icon system | 採用なし（評価のみ、下記 §4） |
| 4.3 Home method row | ラベル列を 52px 固定幅化しタイトル開始位置を統一。subcopy をタイトル下の独立行にし、`word-break: keep-all` + `<wbr>`（、・の後）+ NBSP（` + ` 前後）で文節単位の自然改行に |
| 4.4 History右上icon | `method-46.png`（227×320）を 44×44 固定表示していたのが横伸びの原因。`object-fit: contain` を付与（empty state の 52×52 も同様） |
| 4.5 About文言 | 「個人の手淹れコーヒー体験…」「Fable5 design artifact より構築」を削除し「Pourō は、ハンドドリップの抽出条件と結果を記録する個人用ツールです。」に。Version表記を 0.9.1 (PR-011A) に更新。manifest description を「ハンドドリップの抽出ガイドと記録」に（文言のみ・機能項目変更なし） |
| 4.6 Export UI | データ管理セクションに再構成。CSV を主導線（「CSVを書き出す」+ 用途subcopy）、JSON は「詳細データ（JSON）」として2番目に。バックアップ/復元系の文言は不使用。「データについて」の静的説明（2行）を追加 |
| 4.7 Brew Log導線 | 左上を戻る→close アイコンに変更（aria-label「記録せず閉じる」）。押下で Home へ。入力中データ（評価/テイスト/メモ/次回の調整/抽出の詳細5項目）がある場合のみ確認ダイアログ（既存 Clear History の bottom sheet を `showConfirm()` として汎用化し再利用）。Timer 画面には戻らない |
| SW | `CACHE_VERSION` v1 → v2（precache対象の index.html / styles.css / app.js / manifest 変更のため）。ロジック・キャッシュ戦略・precache list は不変 |

## 2. QA結果

### Viewport（375×667 / 390×844）
- [x] 全 method row のタイトル開始位置が x=138 で一致（375/390 とも、計測値）
- [x] subcopy の改行が文節単位（「前半で味、/ 後半で濃度を調節」「HARIO Switch / 浸漬 + 透過」等）、overflow なし
- [x] ロゴ崩れなし。マクロンがアンバー表示、`õ` 混入なし（grep済）
- [x] フォントフォールバック（Georgia 強制）でもオーバーレイのズレなし（計測値で確認）
- [x] 横スクロール発生なし（`#app` scrollWidth == clientWidth）

### Flow regression
- [x] Home method選択 → Recipe Setup → Preview → Active Brew → Timer完了 → Brew Log保存 → History 表示
- [x] History Detail 表示 / Rebrew（履歴から再現バナー表示・Preview遷移）
- [x] CSV / JSON export 動作
- [x] Clear History confirmation（文言・ボタン・キャンセルとも従来通り）

### Brew Log close
- [x] 未入力で閉じる → 確認なしで Home
- [x] 入力ありで閉じる → 確認ダイアログ（「記録せずに閉じますか？」/「入力中の内容は保存されません。」/ 閉じる・キャンセル）
- [x] キャンセル → Brew Log に留まり入力値保持
- [x] 閉じる → Home。履歴件数は増えない（保存されない＝意図された仕様）
- [x] 保存 → 従来通り History に保存（レコードのキー構成は変更前と同一）

### Data regression
- [x] localStorage record shape 不変（保存エントリのキー集合が変更前と同一）
- [x] CSV: 変更前後の出力をバイト単位 diff → **完全一致**（同一テストデータ2件で確認）
- [x] JSON: `exportedAt`（出力時刻）以外 **完全一致**
- [x] Rebrew 従来通り動作

### PWA / cache
- [x] cache version v2 に更新。旧キャッシュ `pouro-app-v1` がactivateで破棄され v2 が配信されることを確認
- [x] precache list 変更なし（asset の追加・削除なし）
- [x] SWロジック・キャッシュ戦略は不変（version文字列のみの差分）

## 3. ō macron accent 適用箇所
- Home ヘッダーのロゴ（`.logo-wordmark`）**のみ**
- Settings About カードのロゴは `wordmark-ink.png`（画像）のまま・アクセントなし
- 本文中の「Pourō」表記には装飾なし

## 4. 将来用 icon 候補の評価所見（4.2）

Drive最終アセット（02_Common_UI_Icons）の16点は、リポジトリ内 `assets/icons/` と **md5完全一致**（PR-006Bで導入済・precache済）。新規追加は不要。

- 品質: 512×512、モノクロ（ダークグレー）線画。線幅は均質で 24–28px 相当でも判読可能
- 不採用の理由:
  - タブ/セクションiconは active/inactive で `currentColor` による色切替を行っており、PNG では色制御不可（filter hack は採用しない）
  - ダークグレーの色味が本アプリの ink (#2C241B) / amber 系トークンと不一致で、既存インラインSVGからの置換は視覚的に劣化
  - よって既存インラインSVG群を維持
- 指示書で言及の将来用候補のうち **grinder / preset / edit / skip・close / origin / csv / json はアセット未提供**（最終アセットフォルダに存在しない）。PR-011B以降で必要になる際は新規作成が必要
- Brew Log の閉じるボタンは close icon アセットが存在しないため、既存の戻るアイコンと同系統のインラインSVG（×）で実装

## 5. Known limitations
- SPA は history API を使っておらず、ブラウザ戻る / iOS Safari スワイプバックはアプリ内ナビゲーションに連動しない（既存仕様のまま。Brew Log close もこの枠内で、history 管理の大規模変更は本PRでは行わない）
- `assets/icons/` の16点は現状UI未使用のまま precache に含まれる（PR-006B からの既存状態。precache list の削除はSW変更を最小にするため本PRでは行わず、採用または整理は後続PRで判断）
- ロゴをテキスト選択でコピーすると重ねたマクロン用グリフが含まれ「pourōō」になる場合がある（`user-select: none` 指定済みのため主要ブラウザでは発生しない。スクリーンリーダーには `role="img"` + `aria-label="pourō"` で正しく読まれる）
