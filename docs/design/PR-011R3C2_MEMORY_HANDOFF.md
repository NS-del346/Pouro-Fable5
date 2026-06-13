# PR-011R3C2｜Settings Future Update Note｜Memory / Handoff

## 1. Status

- PR status: **DRAFT / OPEN** (do not merge until independent verification is complete)
- Independent Verification: **PENDING**
- Nature: **Settings-only static UI note**. A quiet, non-interactive roadmap memo
  recording future update ideas for My Recipes / Custom Recipe. The feature
  itself is **not implemented** — this is copy only.
- Builds on (all merged): PR-011R3A (Setup/Preview tips), PR-011R3B (Finish tips),
  PR-011R3C (Method/Recipe Detail planning), PR #26 (R3C post-merge handoff).

## 2. Branch / PR info

- Branch: `pr-011r3c2-settings-future-update-note`
- Base: `main` (branched from `origin/main` @ PR #26 merge `093edc1`)
- PR title: `PR-011R3C2 Settings future update note`
- Commit message: `feat: add future update note to settings`
- PR URL: _(filled at PR creation)_
- Merge method: Squash and merge (planned)
- Merge commit: _(placeholder — fill after merge)_

## 3. What changed

UI only:

- **`index.html`** — added one quiet `.card` in the Settings screen
  (`#screen-settings`), placed between the "データ管理" (Data) card and the
  "About" card. The card contains:
  - Header: section title **今後のアップデート候補** + a quiet **検討中** pill badge.
  - Body paragraph describing a future My Recipes idea.
  - A 3-item bullet list of candidate capabilities.
  - A caution line clarifying the note has no effect on current data.
  The card reuses the existing `.card` style and inline-style conventions used by
  the other Settings cards. It is fully static and non-interactive (no buttons,
  no toggles, no links, no new tab, no new route).
- **`docs/design/PR-011R3C2_MEMORY_HANDOFF.md`** (new) — this file.

No JS was required: the Settings screen is static markup in `index.html`, so
`app.js` and `styles.css` were not touched.

## 4. What did NOT change

- `app.js`, `styles.css`, `src/`, `sw.js`.
- `RecipeEngine` / `_buildYonRoku` / all recipe logic (406 / ICE / HYB_* / NEO).
- Timer logic and timer semantics.
- History schema, localStorage schema, CSV/JSON export schema.
- No My Recipes / Custom Recipe data model, step editor, import logic, or
  sharing/backup implementation was added.
- `docs/data/*` (tips master JSON, audit CSV, `validate_tips_master.mjs`).
- PWA files / manifest / service worker / build configuration.
- Pre-existing untracked files (`.claude/launch.json`,
  `docs/PR-006A-VISUAL-PARITY-AUDIT.md`) were left untouched.
- Existing Setup / Preview / Finish / Timer / History / Settings behavior.

## 5. Settings placement

- Screen: `#screen-settings`.
- Position: a new `.card` inserted **after** the "データ管理" card and **before**
  the About card — i.e. low in Settings, as an advanced/roadmap/future-note area.
- Visual: matches the quiet Settings card aesthetic; no modal, no promotional
  banner, no CTA, no badge implying released functionality. Fits iPhone width.

## 6. Final UI copy

- Section title: `今後のアップデート候補`
- Badge: `検討中`
- Body:
  `マイレシピ機能を検討中です。投数、各投の時刻や注湯量、次ステップの文言、注意点を自分用に登録できる形を想定しています。`
- Bullets:
  - `オリジナルレシピの作成`
  - `各ステップの時刻・注湯量・メモ設定`
  - `CSV / JSON による共有・バックアップ`
- Caution:
  `この項目は今後の検討メモです。現在の抽出レシピや履歴データには影響しません。`

Copy is intentionally non-promissory. No forbidden expressions are used
(近日公開 / 必ず実装 / 公式対応 / 完全な共有機能 / リリース予定 / Coming soon!).

## 7. Validation results

```
git status              → only index.html modified (+ pre-existing untracked files)
git diff --stat         → index.html | 17 +++++++++++++++++
git diff --name-only    → index.html
node docs/data/validate_tips_master.mjs → PASS: 40  FAIL: 0  ALL CHECKS PASS
node --check app.js     → OK (no syntax errors; app.js unchanged)
```

Visual check (mobile preset, port 4005 dev server): the note renders in Settings
between the Data and About cards, static and non-interactive. (Note: the project
service worker is cache-first — unregister the SW / clear caches before reloading
to see fresh markup during local preview.)

## 8. Known limitations

- This is copy only; nothing in the note is wired to functionality.
- The note is hardcoded markup, not driven by the tips master or any data source.
- If the My Recipes scope changes, this copy must be updated manually.

## 9. Follow-up PRs (not started)

- **PR-011R3D** — not started.
- **History Detail integration** — not started.
- **PR-011R4** — not started.
- **PR-012 My Recipes / Custom Recipe implementation** — not started; planning
  not begun. This note does not commit the project to that feature.

## 10. Merge metadata placeholders

- PR number: _(fill)_
- PR URL: _(fill)_
- Merge commit: _(fill)_
- Merge date: _(fill)_
- Independent Verification result: _(fill: PASS / PASS WITH MINOR NOTES / FAIL)_
