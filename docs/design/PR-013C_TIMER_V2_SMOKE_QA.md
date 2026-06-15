# PR-013C｜Timer Ver.2.0 Public / Local Smoke QA

## 1. Status

- Type: **docs-only QA PR** (no runtime code changes).
- State: Draft / pending Independent Verification.
- Result summary: **Local QA PASS · Public QA PASS WITH NOTE.**
  - Local preview Timer Ver.2.0 smoke: all checks PASS.
  - Public GitHub Pages: deployment is **fresh** (byte-identical to the merged
    PR-013B source) and the live app renders Timer Ver.2.0; functional smoke PASS.
    The single NOTE is layout-width only — the test browser window could not be
    shrunk below ~1024 px CSS width, so exact 375 px public layout was not
    live-measured (it is verified locally on byte-identical code).
- No runtime files were changed by this PR. No blocker found.

---

## 2. Target baseline

- Repository: `NS-del346/Pouro-Fable5`, base branch `main`.
- Baseline: **PR-013B merged** (`db908f2210270cc691bd57b9de10624dcafa1924`),
  Timer Ver.2.0 runtime implementation.
- `HEAD` at QA time was at the PR-013B merge commit; this QA branch
  (`pr-013c-timer-v2-public-local-smoke-qa`) branches from it and adds docs only.

---

## 3. Environment

| Item | Value |
|---|---|
| QA date/time | 2026-06-16 08:30–08:35 JST (2026-06-15 23:30–23:35 UTC) |
| Local server | `npx serve .` via `.claude/launch.json` (`pouro-fable5`), served on `http://localhost:4005` |
| Local viewport | 375 × 667 (exact, iPhone SE reference frame) |
| Public URL | https://ns-del346.github.io/Pouro-Fable5/ |
| Public browser | Local Chrome (Windows) via browser automation |
| Public viewport | Window minimum ~1024 px CSS width — exact 375 px not reachable in this window (see §5 / §13) |
| Node | `node --check app.js` and `node docs/data/validate_tips_master.mjs` run from the repo root |

Local note: the dev server is configured for port 4006 in `.claude/launch.json`, but
the launcher reported and served on **port 4005** (a server was already bound to
4005); QA was performed against the served origin. This is environment-only and not
an app concern.

---

## 4. Local preview QA

Service worker / cache: for the local session the existing service worker was
**unregistered (1)** and **caches cleared (2)** via the page console; `sw.js` was
**not modified**. The app was then reloaded from the network.

Storage hygiene (local origin): before QA the local store held **History = 22**,
**My Recipes = 0 (`[]`)**, settings present. All QA artifacts were removed afterward
(see §12).

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | App loads | PASS | Home rendered, no console logs |
| 2 | Home renders | PASS | 4:6 / Hybrid / 10 Pour / Ice + My Recipes entry + tabs |
| 3 | 4:6 Setup → Preview → Start Brew | PASS | Setup (20 g / 1:15 / balanced / standard) → Preview → Timer |
| 4 | Timer Ver.2.0 layout appears | PASS | Hero + Countdown row + Sequence Bar + controls |
| 5 | Target Total visually dominant | PASS | 72 px Lora ink numeral (`#brew-cum-amt`) |
| 6 | Countdown visible but subordinate | PASS | 29 px amber seconds; ratio Countdown/Target = **0.403** (≈ ⅓) |
| 7 | Countdown reaches 0 without auto-advance | PASS | elapsed pushed to 71 s → seconds = `0`, step index stayed 0 |
| 8 | This Pour is `+` signed and secondary | PASS | `+60` at 18 px in ink (color-separated from amber Countdown) |
| 9 | Sequence / progress area readable | PASS | 4 windowed rows: current 第1投 (+1-line Tip) / next 第2投 / later 第3投·第4投 |
| 10 | Back works | PASS | idx 1→0, Target 120→60 |
| 11 | Pause / Resume works | PASS | Pause → not running, label「再開」, PAUSED chip shown; Resume → running,「一時停止」 |
| 12 | Next works | PASS | idx 0→1, Target 60→120, current row → 第2投 |
| 13 | Timer reaches Finish | PASS | Advancing all steps → Brew Log screen (`screen-log`), `isFinished = true` |
| 14 | Save to History only by explicit action | PASS | Full brew + Finish left History at 22; explicit「記録を保存」added exactly 1 (→23) |
| 15 | Finish → Same Setup → Preview | PASS |「同じ条件でもう一度」→ Preview (method preserved, Start Brew present) |
| 16 | History Detail → Rebrew → Preview → Start Brew | PASS | Detail → rebrew → Preview (rebrew banner visible, Start Brew present) |
| 17 | My Recipes select → Preview → Start Brew | PASS | QA recipe → select → Preview (`recipeFrom = myRecipe`) → Timer |
| 18 | My Recipes rename / delete | PASS | Rename committed (name changed); delete removed it → store back to `[]` |
| 19 | Timer does not write History before explicit Save | PASS | History unchanged through brew + Finish (22→22) |
| 20 | Timer does not mutate My Recipes storage | PASS | My Recipe intact after a brew started from it |
| 21 | No horizontal overflow at 375 px | PASS | `documentElement.scrollWidth = innerWidth = 375` |
| 22 | No vertical scroll on Active Brew at 375 × 667 | PASS | scroll container `scrollHeight = clientHeight = 667` |
| 23 | Bottom controls visible, not blocked by safe-area | PASS | Controls row fixed at bottom within the 667 px frame (screenshot) |
| 24 | No console errors | PASS | No console logs of any level across the session |

---

## 5. Public GitHub Pages QA

**Deployment freshness (verified):**

- The deployed `index.html` is **byte-identical** to the local merged source
  (1105 lines, identical).
- The deployed `app.js` is **content-identical** to the local merged source
  (MD5 of LF-normalized bytes matches: `286f76d3…`; the raw byte-count gap was
  exactly the 3265 CRLF line endings of the local working copy).
- Deployed `app.js` `Last-Modified: 2026-06-15 23:19 GMT`; `sw.js`
  `CACHE_VERSION = 'v2'`.
- All PR-013B Timer Ver.2.0 markers are present in the deployed files
  (`brew-countdown-row`, `brew-seq`, `brew-cd-label`, `brew-gauge`,
  `brew-cd-secs`; `_updateBrewCountdown`, `_updateBrewSequence`,
  `_countdownLabel`, `_setSeqProgress`).

**Service worker / cache (important):** on first load the public origin was served
by the **stale cache-first service worker** — the live DOM lacked the Timer Ver.2.0
nodes even though the deployed source contains them. After **unregistering the SW (1)
and clearing caches (2)** for the public origin and reloading, the live app rendered
the fresh PR-013B Timer Ver.2.0 (no SW controller, served from network). So: **the
public deployment includes PR-013B Timer Ver.2.0, but a returning user on the old
cache-first SW needs a cache refresh to see it.**

Storage hygiene (public origin): public store held **History = 5**, My Recipes key
absent. The QA-created History entry was removed afterward (see §12).

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Public app loads | PASS | Home rendered on `ns-del346.github.io` |
| 2 | Home renders | PASS | Method list present |
| 3 | 4:6 Setup → Preview → Timer | PASS | Built 4:6 default recipe → Timer (`screen-brew`) |
| 4 | Timer Ver.2.0 layout appears | PASS | Hero + Countdown + Sequence (live nodes present after refresh) |
| 5 | Target Total visually dominant | PASS | 72 px Lora ink numeral |
| 6 | Countdown visible but subordinate | PASS | 29 px amber; ratio **0.403** |
| 7 | Countdown does not auto-advance at 0 | PASS | elapsed pushed to 72 s → seconds `0`, step index stayed 0, History 5→5 |
| 8 | This Pour `+` signed and secondary | PASS | `+60` in ink |
| 9 | Sequence / progress readable | PASS | 4 windowed rows, same states as local |
| 10 | Back works | PASS | idx 1→0, Target 120→60 |
| 11 | Pause / Resume works | PASS | running false →「再開」; running true →「一時停止」 |
| 12 | Next works | PASS | idx 0→1, Target 60→120 |
| 13 | Finish works | PASS | Advancing to end → `screen-log`, `isFinished = true` |
| 14 | Save to History by explicit action only | PASS | Finish left History at 5; explicit「記録を保存」added exactly 1 (→6) |
| 15 | History Detail → Rebrew → Preview | PASS (local-equivalent) | Verified live on local; public runs byte-identical code |
| 16 | Finish → Same Setup → Preview | PASS (local-equivalent) | Verified live on local; public runs byte-identical code |
| 17 | My Recipes select → Preview → Timer | PASS (local-equivalent) | Verified live on local; public runs byte-identical code |
| 18 | No console errors (app) | PASS | Only browser-extension message-channel noise (not app-originating) |
| 19 | No horizontal overflow at tested width | PASS | `scrollWidth = innerWidth` (no horizontal overflow) at the tested width |

NOTE (item 19 / layout): the automation browser window could not be reduced below
~1024 px CSS width, so the **exact 375 px** public layout was not live-measured.
No horizontal overflow was observed at the tested width, and the app renders inside
its mobile-width column. Exact 375 × 667 no-scroll / no-overflow is verified locally
on byte-identical code → **PASS WITH NOTE** for public mobile layout.

---

## 6. Timer Ver.2.0 hierarchy results

| Element | Local | Public | Verdict |
|---|---|---|---|
| Target Total (king) | 72 px Lora, ink `rgb(44,36,27)`, text e.g. `60` | identical | PASS |
| Countdown (rank 2) | 29 px, amber `rgb(162,103,78)` | identical | PASS |
| Countdown ÷ Target ratio | 0.403 (≈ ⅓) | 0.403 | PASS |
| This Pour | `+60`, 18 px, ink (separated from amber Countdown) | identical | PASS |
| Current row | reached cumulative + 1-line Tip | identical | PASS |
| Later rows | faint (state-later), windowed | identical | PASS |

Strong emphasis lives at Target Total only; Countdown never matches Target's size or
color. **PASS.**

---

## 7. Countdown behavior results

- Countdown can reach **0** (verified at elapsed 71 s local / 72 s public on a 45 s
  first step). **PASS.**
- At 0 the current step **does not auto-advance** — `currentStepIndex` stayed 0 with
  no Next press, and the current Sequence row stayed 第1投. **PASS.**
- History count **did not change** at 0 (local 22→22, public 5→5). **PASS.**
- The user must press **Next** to advance (verified: Next moved idx 0→1). **PASS.**
- Generic Countdown label correct by step kind: 4:6 / NEO / Ice show
 「次の注湯まで」; Hybrid context shows the Switch close time
  (「透過（湯が落ちる）・1:15で閉じる」). **PASS.**

---

## 8. Controls behavior results

| Control | Behavior observed | Verdict |
|---|---|---|
| Back | step pointer −1 (idx 1→0; Target 120→60); recipe not mutated | PASS |
| Pause | timer stops (`isRunning=false`), label「再開」, PAUSED chip shown | PASS |
| Resume | timer runs (`isRunning=true`), label「一時停止」 | PASS |
| Next | step pointer +1 (idx 0→1; Target 60→120; current row advances) | PASS |
| Finish | final Next routes to Brew Log (`screen-log`), `isFinished=true` | PASS |

Controls are bottom-fixed within the 375 × 667 frame (screenshot, §13). **PASS.**

---

## 9. Method-specific recipe truth spot-checks

All numbers sourced from `RecipeEngine.build(...)`; no prototype hard-coded values.

**4:6 (yon-roku, 20 g / 1:15 / balanced / standard):**
- Cumulative 60 / 120 / 210 / 300 → pours **60 / 60 / 90 / 90**; final **300 g**.
- No `48/72` or `72/48` regression; 60/60/90/90 baseline preserved; 20 g / 300 g
  valid. **PASS.**

**Hybrid (20 g):**
- Switch states text-visible: open / open / closed / open; context chip
 「スイッチ 開 / OPEN」, desc「透過（湯が落ちる）・1:15で閉じる」.
- Current Tip「透過の注湯（Switch OPEN のまま）」; last step
 「Switch OPEN・落とし切り」.
- **No fixed `20℃` / `20°C`** in the Timer screen; **no fixed room-temp water
  amount** shown for this variant. **PASS.**

**Ice (20 g):**
- HOT/ICE context visible: chip「HOT 150g・ICE 80g」, desc「氷はサーバーに先入れ」;
  scale label「スケール目標（湯のみ）」; current Tip「蒸らし（HOT）」.
- HOT pours to 150 g; final「急冷・完成」. HOT/ICE context unchanged. **PASS.**

**NEO / 10 Pour (20 g):**
- **10 pours preserved** (第1投…第10投) + drawdown = 11 steps.
- **`210g` reached at `t = 105 s` (1:45)** — the preserved NEO milestone
  (第7投 cum 210). **`1:45` / `210g` preserved.** Context row hidden (Standard
  Timer), correct. **PASS.**

---

## 10. History / Rebrew regression

- Timer does **not** auto-write History: a full QA brew through Finish left the count
  unchanged (local 22→22, public 5→5). **PASS.**
- Explicit「記録を保存」added exactly **one** entry (local 22→23, public 5→6); both QA
  entries were then removed (§12). **PASS.**
- History list → Detail → Rebrew → Preview (rebrew banner visible, Start Brew
  present). **PASS.**
- Finish → Brew Log →「同じ条件でもう一度」(Same Setup) → Preview. **PASS.**

---

## 11. My Recipes regression

- Select → Preview → Start Brew: QA recipe selected → Preview
  (`recipeFrom = myRecipe`) → Timer rendered. **PASS.**
- Rename: existing recipe renamed via the list rename input; name updated in store.
  **PASS.**
- Delete: deletion (confirm) removed the recipe; store returned to `[]`. **PASS.**
- Timer did **not** mutate My Recipes storage during a brew started from a recipe.
  **PASS.**

---

## 12. Storage behavior

| Origin | Key | Before | After QA |
|---|---|---|---|
| Local | `pouroFable5.history.v1` | 22 | **22** (QA entry `h_1781566009508` removed) |
| Local | `pouroFable5.myRecipes.v1` | `[]` (0) | **`[]`** (QA recipe created → renamed → deleted) |
| Local | `pouroFable5.settings.v1` | present | present (untouched) |
| Public | `pouroFable5.history.v1` | 5 | **5** (QA entry `h_1781566466090` removed) |
| Public | `pouroFable5.myRecipes.v1` | absent | absent (no QA recipe created on public) |

Pre-existing user data preserved on both origins; no storage artifacts committed.
**Cleanup verified.**

---

## 13. Mobile layout / 375 × 667 check

- **Local (exact 375 × 667):** no horizontal overflow
  (`scrollWidth = innerWidth = 375`); no vertical scroll on Active Brew
  (`scrollHeight = clientHeight = 667`); Sequence Bar shows 4 windowed rows; controls
  bottom-fixed and fully visible. **PASS.** (Screenshot captured: dominant 60 g hero +
  gauge, subordinate Countdown row, 4-row Sequence Bar, Back / Pause / Next controls.)
- **Public:** the automation browser window could not be reduced below ~1024 px CSS
  width; no horizontal overflow at the tested width and the app renders inside its
  mobile-width column. Exact 375 px not live-measured on public. **PASS WITH NOTE**
  (verified locally on byte-identical code).

---

## 14. Console / errors

- **Local:** no console logs of any level across the full QA session. **PASS.**
- **Public:** the only console errors were browser-extension message-channel noise
  (*"A listener indicated an asynchronous response by returning true, but the message
  channel closed before a response was received"*) emitted by the automation
  extension — **not** originating from the Pouro app (the app uses no
  `chrome.runtime`). No app-originating console errors. **PASS.**

---

## 15. Service worker / cache notes

- **Local:** existing SW unregistered (1) + caches cleared (2) for the session;
  `sw.js` not modified. Fresh load confirmed.
- **Public:** first load came from the **stale cache-first SW** (Ver.2.0 nodes absent
  in the live DOM). After unregistering the SW + clearing caches for the public origin
  and reloading, the **fresh PR-013B Timer Ver.2.0** rendered (no SW controller).
- `sw.js` `CACHE_VERSION = 'v2'`; app shell is cache-first by design, so returning
  users on the old SW must refresh the cache to receive PR-013B. This is expected
  cache-first behavior, documented here, not a code change request.

---

## 16. Issues found

1. **(Informational — public cache freshness)** Returning public users on the
   pre-PR-013B cache-first service worker keep the old Timer until the SW cache
   refreshes. The deployed source is correct and fresh; this is the normal
   cache-first trade-off, surfaced for awareness. **Not a blocker.**
2. **(Minor, cosmetic, non-visible — out of scope to fix here)** For NEO, the
   `#brew-context-chip` element retains leftover text from a prior method while the
   context row is `hidden`, so it is **not user-visible** (the row's `hidden` class
   suppresses it; NEO is a Standard Timer with no context row). Documented for
   awareness only; no fix in this docs-only PR.

No blocking runtime bug found.

---

## 17. Required fixes

- **None required for PR-013C** (docs-only; no runtime bug blocks the QA).
- Optional, separate follow-up (not this PR): reset `#brew-context-chip` /
  `#brew-context-desc` text when the context row is hidden (cosmetic, non-visible).

---

## 18. Final recommendation

- **Local QA: PASS.** Timer Ver.2.0 hierarchy, Countdown-0 non-auto-advance,
  controls, recipe truth (4:6 / Hybrid / Ice / NEO), History/Rebrew, My Recipes, and
  375 × 667 layout all verified with no console errors and clean storage.
- **Public QA: PASS WITH NOTE.** The GitHub Pages deployment is fresh (byte-identical
  to PR-013B) and the live app renders Timer Ver.2.0; functional smoke passed. The
  only NOTE is that exact 375 px public layout could not be live-measured (browser
  window minimum width) and that returning users need a cache refresh to leave the old
  cache-first SW.
- Recommendation: **proceed to Independent Verification for PR-013C.** If PASS, mark
  Ready for review and Squash and merge. No blocker found.

This is unofficial / non-official QA documentation.
