# PR-013D｜Timer Hidden Context Cleanup Handoff

## 1. Status
Implementation complete. Draft PR opened. Local 375px Timer context QA passed.
Runtime hygiene only — no recipe, storage, schema, service worker, or manifest changes.

## 2. Branch / PR
- Branch: `pr-013d-timer-hidden-context-cleanup`
- Base: `main` (at merge commit `698931c`, PR-013C)
- PR: Draft — "PR-013D: Timer Hidden Context Cleanup"

## 3. Commit
- Message: `PR-013D: clear hidden timer context state`
- (Hash recorded in self-report.)

## 4. Changed files
- `app.js` — Timer context render `else` branch now clears chip/desc content.
- `docs/design/PR-013D_MEMORY_HANDOFF.md` — this handoff.

No other tracked files changed. Untracked `.claude/launch.json` and
`docs/PR-006A-VISUAL-PARITY-AUDIT.md` were left untouched.

## 5. Source of truth
- Timer context rendering lives in `updateBrewStep()` in `app.js`, around the
  `#brew-context-row` / `#brew-context-chip` / `#brew-context-desc` block.
- `.hidden { display: none !important; }` (styles.css) reliably hides the row;
  the inline `display:flex` set by visible branches is overridden by `!important`.
- PR-013C recorded the originating note: "NEO `#brew-context-chip` retains
  leftover text while its row is hidden."

## 6. What changed
In the `else` branch of the context block (the no-visible-context case for
4:6 / NEO / Hybrid drawdown), the row was hidden via `classList.add('hidden')`
but the chip `innerHTML` and desc `textContent` were never cleared, so stale
Hybrid/Ice text lingered in the hidden DOM after a method/step switch.

The branch now also clears the children:

```js
} else {
  DOM.brewContextRow.classList.add('hidden');
  DOM.brewContextChip.innerHTML  = '';
  DOM.brewContextDesc.textContent = '';
}
```

Text is the only state cleared. The chip's inline colours (background / border /
color) are always overwritten by the next visible context (Hybrid OPEN/CLOSED or
Ice HOT/ICE), so they do not need clearing and were left as-is to keep the change
minimal.

## 7. What did not change
- RecipeEngine logic.
- Recipe schedules / step counts / timing / amounts.
- Visible context wording for Hybrid (Switch OPEN/CLOSED) and Ice (HOT/ICE).
- Timer Ver.2.0 hierarchy (Target Total dominant, Countdown subordinate).
- Timer controls (Back / Pause-Resume / Next / Finish).
- History schema, My Recipes schema/behavior.
- `sw.js`, `manifest.webmanifest`, assets, package files.
- `index.html`, `styles.css` (no edits needed).

## 8. Runtime behavior
- Visible context (Hybrid / Ice): row shown, chip + desc populated as before.
- No visible context (4:6 / NEO / Hybrid drawdown): row hidden AND chip + desc
  emptied, so no stale text remains in the hidden DOM.
- Switching method in any order leaves no stale hidden context text.

## 9. Method-specific QA
Local preview, 375×667, service worker unregistered + caches cleared for local
preview only (sw.js not modified). Verified via direct DOM inspection of
`#brew-context-row` / `#brew-context-chip` / `#brew-context-desc`.

- 4:6 → Timer: row hidden (`display:none`), chip `""`, desc `""`. PASS.
- Hybrid → Timer: row visible; step 1/3 + 2/3 → "スイッチ 開 / OPEN",
  step 3/3 → "スイッチ 閉 / CLOSED". Context updates across steps. PASS.
  No fixed 20℃ / 20°C and no fixed room-temp water amount in chip/desc.
- Ice → Timer: row visible; chip "HOT 150g・ICE 80g", desc "氷はサーバーに先入れ".
  HOT 150g / ICE 80g preserved. PASS.
- NEO → Timer: row hidden, chip `""`, desc `""`; sequence "1 / 10"
  (10-pour rhythm preserved). PASS.

## 10. Regression checks
- Switch Hybrid → 4:6: chip held "スイッチ 開 / OPEN" while hidden on home,
  then cleared to `""` on 4:6 Timer. PASS.
- Switch Ice → NEO: chip held "HOT 150g・ICE 80g" while hidden on home,
  then cleared to `""` on NEO Timer. PASS.
- Within NEO: chip stays `""` after Next. PASS.
- Timer hierarchy: Target Total scale value visible and dominant; Countdown
  subordinate; unchanged from PR-013B. PASS.
- Controls: Pause/Resume toggles; Next advanced 2/10 → 3/10; Back returned
  3/10 → 2/10. PASS.
- No horizontal overflow at 375px (`scrollWidth` 375 == `innerWidth` 375).
- No console errors.

## 11. Validation
- `git diff --name-only`: `app.js` (+ this handoff once committed).
- `node --check app.js`: OK.
- `node docs/data/validate_tips_master.mjs`: PASS: 40  FAIL: 0  ALL CHECKS PASS.
- Forbidden/regression grep (`48/72`, `72/48`, `20℃`, `20°C`, marketing/legal
  claims) over `app.js`: no matches.

## 12. Issues found
None. The reported PR-013C note (stale hidden context text) is resolved.

## 13. Required fixes
None.

## 14. Next recommended step
Independent Verification for PR-013D.
If PASS, mark Ready for review and Squash and merge.
Then proceed to the next planned feature or polish item.
