# FIX — 4:6 Method 公式レシピ整合 (Philocoffea reference alignment)

- Branch: `fix-406-official-recipe-alignment`
- Base: `main`
- Scope: **4:6 Method (`yon-roku`) only** — ICE / Hybrid / 10 Pour は一切変更しない。
- Source of truth: Philocoffea 掲載の 4:6 Method 解説（https://philocoffea.com/?mode=f3）+ ユーザー提供の公式サイト・スクリーンショット
- 性質: Pourō は非公式の個人 PWA。Tetsu Kasuya / PHILOCOFFEA / HARIO 等による監修・承認・提携・完全再現を主張しない。

## 何が間違っていたか → どう直したか

修正前の `_buildYonRoku`（[app.js](../../app.js)）は公式と以下が食い違っていた。

| 項目 | 修正前（誤） | 修正後（公式準拠） |
|---|---|---|
| 後半の投数（軽め/標準/しっかり） | 2投 / 3投 / 4投 | **1投 / 2投 / 3投** |
| 濃度配分（300g例） | 軽め90×2・標準60×3・しっかり45×4 | **軽め180×1・標準90×2・しっかり60×3** |
| 甘め前半配分（120g） | 48 / 72 (0.4/0.6) | **50 / 70 (5:12, 7:12)** |
| 明るめ前半配分（120g） | 72 / 48 | **70 / 50** |
| 5投構成の最終投タイム | 3:00 (180s) | **2:45 (165s)** ＝最後の間隔のみ30秒 |

不変だった（=もともと正しい）点:
- 総湯量 = `dose × ratio`、既定 1:15（20g → 300g）
- 前半40% = 120g / 後半60% = 180g
- バランス前半 = 60 / 60
- ドローダウン目安 3:30（`targetDrawdownSec = 210`）
- 前半2投のタイム 0:00 / 0:45、後半開始 1:30

## 目安タイム（公式 5投構成）

```
0:00  +60g  total 60g
0:45  +60g  total 120g
1:30  +60g  total 180g
2:15  +60g  total 240g
2:45  +60g  total 300g
3:30  ドリッパーを外す / 完了目安
```

タイマー仕様: 既存アーキテクチャはステップに `timeSec` を持つ target-time 方式。公式タイムは**目安ガイド**として表示し、絶対保証ではない（`instruction` に「目安 3:30」等を明記）。ドローダウン可変の手動 Next 互換は維持。

## コピー / 法的表現

- `METHODS['yon-roku'].desc` を中立表現に更新（粉量の約15倍、前半40%/後半60%、軽め1投・標準2投・しっかり3投、中粗挽き〜粗挽き、湯温 浅煎り93℃/中煎り88℃/深煎り83℃前後、「Philocoffea掲載の解説を参考に中立表現で整理」）。
- 禁止表現（完全 / 100% / 必ず / 公式完全再現 / 絶対に失敗しない / 誰でも世界チャンピオンの味 / 唯一の正解）は不使用。
- 「公式アプリ」「公式監修」「完全再現」は不使用。

## 検証 (Validation)

テストフレームワーク無し（vanilla JS PWA, no package.json）。本 PR では Node の `vm` で `app.js` の実 `RecipeEngine` をサンドボックス実行し、仕様の Case A–F を検証した（throwaway script、リポジトリには含めない）。全ケース PASS。

| Case | dose | flavor | strength | pours | totals | 結果 |
|---|---|---|---|---|---|---|
| A | 20g | basic   | しっかり | [60,60,60,60,60] | [60,120,180,240,300] | PASS |
| B | 20g | sweeter | しっかり | [50,70,60,60,60] | [50,120,180,240,300] | PASS |
| C | 20g | brighter| しっかり | [70,50,60,60,60] | [70,120,180,240,300] | PASS |
| D | 20g | basic   | 標準     | [60,60,90,90]    | [60,120,210,300]     | PASS |
| E | 20g | basic   | 軽め     | [60,60,180]      | [60,120,300]         | PASS |
| F | 24g | basic   | しっかり | [72,72,72,72,72] | [72,144,216,288,360] | PASS |

タイム検証（Case A）: `[0,45,90,135,165,210]` = 公式 0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 3:30。一致。

ビルド/テスト: ビルド工程なし（静的 PWA）。`node --check app.js` 構文 OK。

## スコープ外（本 PR で触れていない）

ICE / HYB_BASE / HYB_DEVIL / HYB_NEW / NEO / OTHER、POINT/TIPS Master v2.1、History / localStorage / CSV / JSON schema、PWA / manifest / service worker / app icon、ナビゲーション、テーマ。PR-011R1 は未着手。
