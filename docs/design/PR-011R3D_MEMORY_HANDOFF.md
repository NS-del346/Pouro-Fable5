# PR-011R3D｜Method Detail UI implementation｜Memory Handoff｜Pouro-Fable5

> Status: **Implemented (draft PR open, awaiting independent verification).**
> This is the first Method Detail UI surface. It implements the plan defined in
> PR-011R3C (planning) and follows the PR-011R3C3 smoke-QA baseline. It is a
> limited, secondary, explanatory surface only — no Timer, History Detail,
> My Recipes, schema, export, or `docs/data` work was started or touched.

---

## 1. Status

- Method Detail / Recipe Detail screen implemented as a single in-app screen.
- One entry point, from Preview only ("メソッド詳細").
- Clear return to Preview ("プレビューに戻る") that preserves Preview state.
- Method-specific content for 406 / ICE / HYB_NEW / NEO.
- Compact POINT/TIPS section aggregated from the existing read-only `TIPS_DATA`.
- Neutral / non-official wording note + "Pourōが主張しないこと".
- Validator: `PASS: 40 / FAIL: 0 / ALL CHECKS PASS` (data unchanged).
- `node --check app.js`: OK.
- Local 375px manual QA: all 4 methods pass.

## 2. Branch / PR info

- Branch: `pr-011r3d-method-detail-ui` (from `origin/main` @ `ed8d814`).
- PR title: `PR-011R3D Method Detail UI implementation`.
- Commit: `feat: add method detail screen`.
- PR number / merge commit: _(placeholders — see §14)_.

## 3. What changed

Files changed (only the allowed set):

```text
index.html   — Preview "メソッド詳細" entry button + new #screen-methoddetail markup
app.js       — METHOD_DETAIL content, selectMethodDetailTips(), renderMethodDetail(),
               _mdSection() helper, and event wiring (open + 2 back actions)
styles.css   — .btn-method-detail + .md-* Method Detail styles
docs/design/PR-011R3D_MEMORY_HANDOFF.md — this handoff
```

No other files were modified.

## 4. What did NOT change

```text
docs/data/*                        (unchanged — validator still PASS: 40 / FAIL: 0)
RecipeEngine / _buildYonRoku       (unchanged)
Timer logic / Timer semantics      (unchanged)
History / History Detail UI        (unchanged — no aggregation started)
localStorage / History / CSV / JSON schema   (unchanged)
PWA / manifest / service worker    (unchanged)
package / build configuration      (unchanged)
.claude/launch.json, docs/PR-006A-VISUAL-PARITY-AUDIT.md  (untouched untracked files)
```

No `localStorage` reads/writes, no new History entries, no import/export behavior,
no new bottom tab, no new app-level route.

## 5. Method Detail entry point

- A single secondary button `#btn-method-detail` ("メソッド詳細") on the Preview
  screen, placed inside the scroll body below the contextual TIPS card and above
  the bottom spacer — i.e. clearly below the recipe summary / TIPS and visually
  secondary to the primary "抽出を開始" CTA (which stays in the `.cta-bar`).
- Clicking it calls `renderMethodDetail(state.selectedMethodId)` then
  `showScreen('methoddetail')`. It does not mutate draft/recipe state.
- The tab bar is hidden on this flow screen (it is not in `TAB_BAR_SCREENS`).

## 6. Method Detail screen structure

`#screen-methoddetail` = header ("メソッド詳細" + method subtitle) + scroll body
(method header card + JS-rendered sections) + a `.cta-bar` "プレビューに戻る"
button. `renderMethodDetail(methodId)` builds the 10 planning sections in order:

```text
1. メソッド概要              6. 味づくりの考え方
2. 基準レシピ                7. POINT / TIPS (hidden if empty)
3. 器具・前提                8. 確認状況
4. 挽き目・湯温の目安        9. 中立メモ
5. 注湯スケジュール / 進行モデル   10. Pourōが主張しないこと
```

Section 5 renders as a static **reference table** (time + per-pour or cumulative
amount) — never a countdown / auto-advancing timer. HYB_NEW uses a textual
"進行モデル" list because exact room-temperature water amounts are intentionally
not fixed.

## 7. Method-specific content decisions

All values are carried verbatim from PR-011R3C §9 as 目安 (guides); none re-derived.

- **406 (4:6 Method):** 20g / 300g / 1:15; total = dose×15; 前半40% / 後半60%
  model; 5投 60g×5 baseline schedule `0:00 / 0:45 / 1:30 / 2:15 / 2:45 / 約3:30`;
  60/60/90/90 4投 example noted; first-pour sweet/acid framing. No 48/72 or 72/48;
  final standard pour at 2:45 (not 3:00).
- **ICE (Ice 4:6):** ice in server; HOT 150g (30g×5) + 約80g ice; schedule
  `0:00 / 0:30 / 1:00 / 1:30 / 2:00 / 約3:00`; flash-chill; cumulative = poured
  water only (ice excluded).
- **HYB_NEW (Hybrid / HARIO Switch):** primary Hybrid candidate; HARIO Switch
  premise; room-temperature water added into the dripper and included in total
  300g, exact amount **not** fixed; liquid temp ~70–80℃; Switch close ~2:10 /
  open ~2:45. No HYB_DEVIL wording; no single-official-recipe implication.
- **NEO (10投式ドリップ):** primary name 「10投式ドリップ」, subtitle
  「THE NEO BREW / HARIO V60 NEO」; 10×30g; very coarse (極粗挽き); 95–96℃;
  full cumulative schedule `0:00 30g … 1:45 210g … 2:30 300g / 約3:30 完成` — the
  1:45 / 210g step is present and explicitly called out in the note.

## 8. POINT/TIPS filtering decisions

- `selectMethodDetailTips(methodId)` reuses the existing read-only `TIPS_DATA`
  adapter (no runtime fetch, offline-safe via existing `APP_SHELL`).
- Aggregates only `setup` / `preview` / `finish` / `historyDetail` contexts,
  grouped and labelled (抽出前 / プランニング / 次回の調整 / ふり返り).
- `timer` active-step copy is excluded (those contexts are never iterated).
- Filters to `recipeCode` == method code or `ALL`; dedupes across groups; orders
  method-specific before `ALL`, then ascending `id` (matches R3A/R3B contract).
- Quarantine / `P-OTHER-001` / `HYB_BASE` / `HYB_DEVIL` are already absent from
  `TIPS_DATA`, so they cannot surface. No raw source metadata is rendered.
- Section 7 hides entirely when a method yields no items (e.g. HYB_NEW has no
  `finish` item, so only 抽出前 / プランニング groups appear).

## 9. Legal / neutral wording decisions

- Section 9 (中立メモ): "Pourōは非公式の個人用抽出支援ツールです。各メソッドの
  考え方を参考に、アプリ向けに中立表現で整理しています。"
- Section 10 (Pourōが主張しないこと): 公式な再現であること / 監修・提携・承認を
  受けていること / どの豆でも同じ結果になること / 唯一の正解であること.
- App-facing copy avoids 完全 / 100% / 必ず / 究極 / 神 / 悪魔 / 公式完全再現 /
  絶対に失敗しない / 唯一の正解 (as a claim) etc. The phrase「唯一の正解」appears
  only inside section 10 as something Pourō explicitly does **not** claim.

## 10. Validation results

```text
node --check app.js                       -> OK
node docs/data/validate_tips_master.mjs   -> PASS: 40  FAIL: 0  ALL CHECKS PASS
```

## 11. Manual QA results (local preview, 375px mobile)

For each of 406 / ICE / HYB_NEW / NEO: select method → Setup → Preview →
「メソッド詳細」opens the correct method's detail; all 10 sections present;
POINT/TIPS shows only grouped adoptable items (no quarantine / P-OTHER-001 /
HYB_DEVIL / raw metadata);「プレビューに戻る」returns to Preview with the same
method/recipe state. Regression: Setup POINT (2), Preview TIPS (2), Finish TIPS,
and entry button all render; bottom navigation unaffected.

Method-specific spot checks: NEO contains 1:45 / 210g / 95–96℃ / 極粗;
406 schedule includes 2:45 and 約3:30 with no 48/72; ICE shows 150g HOT + ~80g
ice + 30g×5; HYB_NEW shows room-water-into-dripper, included in 300g, amount not
fixed, 70–80℃, 2:10 close / 2:45 open.

## 12. Known limitations

- Method Detail content (overview / premise / disclaimers) is authored static
  copy embedded in `app.js`, consistent with the R3A/R3B embedded-adapter
  approach; it is not data-driven from `docs/data`.
- POINT/TIPS depth is bounded by the existing `TIPS_DATA` subset; some context
  groups are sparse or absent for some methods by design (graceful hide).
- The service worker is cache-first; during local QA the SW cache must be cleared
  to see the new shell (see `[[pouro-fable5-repo-setup]]`).

## 13. Follow-up PRs (NOT started here)

```text
- History Detail POINT/TIPS integration   (not started)
- PR-011R4 Timer semantics audit          (not started)
- PR-012 My Recipes / Custom Recipe       (not started)
```

## 14. Merge metadata placeholders

```text
PR number:      #___
Merge commit:   ___
Merged at:      ___
Independent Verification: ___
```
