# PR-011R6A — History Detail Rebrew CTA Polish — Memory Handoff

## Status
Draft / pending Independent Verification

## Branch / PR info
- Branch: `pr-011r6a-history-detail-rebrew-cta-polish`
- Base: `main`
- PR: PR-011R6A: History Detail Rebrew CTA Polish (Draft)

## Commit
- `PR-011R6A: polish history detail rebrew CTA`

## Changed files
- `index.html` — History Detail Rebrew CTA markup
- `styles.css` — `.cta-bar-label` styles
- `docs/design/PR-011R6A_MEMORY_HANDOFF.md` — this handoff
- `app.js` — **not changed** (no logic change required; button id `btn-detail-rebrew` preserved)

## What changed
- Added a compact action block to the History Detail CTA bar:
  - New calm section label **「次の一杯」** above the primary CTA (rendered with thin
    divider rules on either side via `.cta-bar-label`).
  - Helper text reworded from `プレビューで確認してから開始します` to
    **`保存時の条件をプレビューで確認してから開始します。`** to make clear that the
    saved conditions are confirmed in Preview before brewing.
- Added `.cta-bar-label` CSS: small (11.5px), bold, accent-dark, letter-spaced
  heading with `::before`/`::after` divider lines. Calm, does not overpower the
  record details above.

## What did not change
- `app.js` (no logic / label changes needed there; CTA text lives in markup).
- Button id `btn-detail-rebrew` and its click handler / rebrew flow.
- History Detail record markup (method / dose / ratio / recipe / steps / log).
- History list, featured card, list rows, detail button, list sorting/filtering.
- Finish-origin same-setup action (PR-011R5A) and its neutral banner wording.
- History item schema, localStorage schema.
- RecipeEngine, recipe schedules, pour amounts, timings, switchState data.
- CSV / JSON export, import, PWA / manifest / service worker, build config.

## History Detail CTA polish details
- Section label: 「次の一杯」
- CTA: 「この記録でもう一度淹れる」 (unchanged wording, `.btn-primary` — prominent but calm)
- Helper: 「保存時の条件をプレビューで確認してから開始します。」
- CTA does not imply custom recipe creation, editing, or automatic Timer start.

## Rebrew flow safety notes
- History Detail → 「この記録でもう一度淹れる」 → **Preview** (verified: `screen-preview`
  shown, `screen-brew` Timer stays hidden).
- history-origin Preview banner shows `履歴から再現 ・ <date> の記録`, distinct from the
  finish-origin same-setup neutral wording (unchanged in `app.js`).
- No new History entry is created on Rebrew (verified history length unchanged: 7→7).
- method / dose / ratio / recipe restored via existing `_applyRebrewEntry` (unchanged).

## QA results
- `git status --short`: only `index.html`, `styles.css`, new handoff doc tracked
  (plus pre-existing untracked `.claude/launch.json`, `docs/PR-006A-VISUAL-PARITY-AUDIT.md`,
  left untouched).
- `git diff --name-only`: `index.html`, `styles.css`
- `node --check app.js`: OK
- `node docs/data/validate_tips_master.mjs`: PASS: 40  FAIL: 0  ALL CHECKS PASS
- Local preview (375px mobile):
  - Polished CTA visible, calm, no horizontal overflow (scrollWidth 375 == 375).
  - History Detail → Rebrew → Preview confirmed (Timer not started).
  - history-origin banner appears and is distinct.
  - No console errors.
  - 4:6 spot check: steps 60/60/90/90, no old 48/72 reintroduced.

## Known limitations
- No per-row quick Rebrew added to normal History list rows (intentionally out of scope).
- No My Recipes / custom recipe creation/editing (PR-012+).
- Visual polish only; no new Rebrew runtime behavior.

## Next recommended step
Independent Verification for PR-011R6A. After PASS, mark Ready for review and
Squash and merge. Then consider PR-012 (My Recipes) planning.
