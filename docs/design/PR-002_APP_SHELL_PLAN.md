# PR-002: App Shell + Design Token System

## 目的

`design-artifact/Pouro-Fable5.dc.html` (Fable5生成物) を視覚正本として、
Pourō の production-ready app shell と CSS design token system を構築する。
Pourō-Claude の UI レイアウト・CSS・HTML は一切参照しない。

---

## PR-001 design artifact から抽出した tokens

### カラー

| Token | 値 | 用途 |
|---|---|---|
| `--color-bg` | `#E7DECC` | 最外背景（ウォームベージュ） |
| `--color-surface` | `#F4EDE1` | メイン画面背景（ライトクリーム） |
| `--color-surface-raised` | `#FCFAF5` | カード・シート背景 |
| `--color-surface-muted` | `#F8F3E8` | 薄い背景 |
| `--color-text` | `#2C241B` | 主テキスト（ダークブラウン） |
| `--color-text-muted` | `#8D7C69` | 副テキスト |
| `--color-text-faint` | `#B3A38C` | 薄いテキスト |
| `--color-text-mid` | `#6E5F4F` | 中間テキスト |
| `--color-accent` | `#A2674E` | アクセント（テラコッタブラウン） |
| `--color-accent-dark` | `#8C5535` | 濃いアクセント |
| `--color-accent-soft` | `#C9A77F` | 薄いアクセント |
| `--color-border` | `#E0D5C0` | 汎用ボーダー |
| `--color-border-card` | `#E6DCC8` | カードボーダー |
| `--color-border-input` | `#DDD1BA` | 入力ボーダー |

### タイポグラフィ

| Token | 値 |
|---|---|
| `--font-sans` | `'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', sans-serif` |
| `--font-serif` | `'Lora', Georgia, serif` |
| `--font-mincho` | `'Shippori Mincho', 'Hiragino Mincho ProN', serif` |

### スペーシング

| Token | 値 |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |

### ボーダー半径

| Token | 値 |
|---|---|
| `--radius-sm` | `8px` |
| `--radius-md` | `14px` |
| `--radius-lg` | `18px` |
| `--radius-xl` | `22px` |
| `--radius-pill` | `999px` |

### シャドウ

| Token | 値 |
|---|---|
| `--shadow-card` | `0 12px 28px rgba(70,52,34,0.10)` |
| `--shadow-hero` | `0 0 48px rgba(70,52,34,0.18)` |
| `--shadow-cta` | `0 8px 20px rgba(162,103,78,0.28)` |

---

## 作成した production ファイル構成

```
/
  index.html           — 全画面 HTML マークアップ
  styles.css           — CSS design tokens + 全コンポーネントスタイル
  app.js               — 画面遷移 + 静的サンプルデータ + イベントハンドラ
  assets/
    app-icon.png
    wordmark-ink.png
    method-46.png
    method-hybrid.png
    method-10-pour.png
    method-ice-brew.png
  docs/design/
    FABLE5_ARTIFACT_REPORT.md   (PR-001 より)
    PR-002_APP_SHELL_PLAN.md    (本ドキュメント)
  design-artifact/              (PR-001 より。削除禁止)
  reference/                    (PR-001 より。削除禁止)
```

---

## 画面インベントリ

| # | ID | 説明 | Tab表示 |
|---|---|---|---|
| 01 | `screen-home` | Brew Home — メソッド選択 | ✓ (抽出タブ) |
| 02 | `screen-setup` | Recipe Setup — dose / ratio / メソッド固有設定 | ✓ |
| 03 | `screen-preview` | Preview — ステップ確認 + Rebrew state | ✓ |
| 04 | `screen-brew` | Active Brew — タイマー・ステップ制御 | ✗ (非表示) |
| 05 | `screen-log` | Brew Log — 評価・テイスト・メモ入力 | ✓ |
| 06 | `screen-history` | History — 履歴一覧 | ✓ (履歴タブ) |
| — | `screen-detail` | History Detail — 詳細 + Rebrew CTA | ✓ |
| 07 | `screen-settings` | Settings — 4カード構成 | ✓ (設定タブ) |

---

## Rebrew フロー

```
History / History Detail
  → 「もう一度淹れる」
  → state.rebrewFrom セット + draft にエントリのrecipeを反映
  → Preview（Rebrew state: バナー表示）
  → Active Brew（直接遷移禁止）
```

---

## PR-002 で意図的に未実装にしたもの

- recipe engine（dose / ratio の本格計算・pour timing 生成）
- real timer engine（経過時間のインクリメント、pause / resume の実時間制御）
- localStorage 保存・history persistence
- export JSON / CSV の実処理
- clear history の実削除
- service worker / manifest / offline cache / PWA 化
- app icon の manifest wiring
- sound / haptics 実処理
- 豆・挽き目・温度の編集 UI

これらはすべて **PR-003 以降** で実装する。

---

## PR-003 以降への引き継ぎ

### PR-003: Recipe engine + Timer
- `METHODS[id].buildSteps(dose, ratio)` の出力を本番計算に置換
- `state.brew` に実時間タイマーを接続（setInterval / requestAnimationFrame）
- pause / resume の実実装
- SVG arc の tick-by-tick アニメーション

### PR-004: History + Persistence
- `state.history` を localStorage に接続
- ログ保存時のエントリ構造確定
- equip 編集 UI の実装
- rebrew flow の end-to-end テスト

### PR-005: Settings + Export
- JSON / CSV エクスポートの実処理
- clear history の実削除
- デフォルト設定の localStorage 保存

### PR-006: PWA + Offline
- `manifest.json` 作成
- service worker 実装
- Google Fonts のセルフホスト化 or フォールバック整理
- TODO(PR-006) コメントの解消

---

## Pourō-Claude UI 参照禁止の再確認

PR-002 では `NS-del346/Pouro-Claude` の HTML / CSS / 画面レイアウト / カード構成 / CTA 配置 / Bottom Tab 表現 / spacing を **一切流用していない**。
visual 正本は `design-artifact/Pouro-Fable5.dc.html` のみ。
Pourō-Claude は将来 PR での機能仕様確認時にのみ参照する。
