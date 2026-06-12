# PR-010: Public Release / Archive Handoff

## Release baseline

| Item | Value |
|------|-------|
| Branch | `feat/pr-010-public-release-handoff` |
| Base commit (main before PR-010) | `f92d469` — PR-009: Release candidate and final deploy QA |
| Model | Claude Sonnet 4.6 |

---

## Public URL

| Item | Value |
|------|-------|
| Expected URL | `https://ns-del346.github.io/Pouro-Fable5/` |
| Status | Pending GitHub Pages activation (requires GitHub UI setup — see below) |

---

## GitHub Pages settings

GitHub Pages must be configured via the repository's Settings UI. Claude Code cannot perform this step.

**Steps:**

1. Open the repository on GitHub: `https://github.com/NS-del346/Pouro-Fable5`
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Branch: **main** / Folder: **/ (root)**
5. Click **Save**

GitHub will build and publish within a few minutes. The URL becomes active at `https://ns-del346.github.io/Pouro-Fable5/`.

---

## Deployment verification checklist

After GitHub Pages is activated and the URL is live:

| Check | Expected |
|-------|----------|
| GitHub Pages source set to `main / root` | ✓ |
| `https://ns-del346.github.io/Pouro-Fable5/` opens | Home screen visible |
| `index.html` — no 404 | ✓ |
| CSS loads (`styles.css` or inlined) | No layout breakage |
| `app.js` loads | No console errors on load |
| Method icons load (`assets/method-icon-*.svg` or similar) | Icons visible on Home |
| App icon loads (`assets/app-icon.png`) | ✓ |
| `manifest.webmanifest` — no 404 | DevTools → Application → Manifest shows name |
| `sw.js` — no 404 | DevTools → Application → Service Workers shows registration |
| Service Worker registers | Status: activated and running |
| Offline reload works after first online load | Full UI visible with no network |
| PWA install metadata correct | Name: Pouro-Fable5, icon visible in add-to-home prompt |

---

## PWA install checklist

### iOS (Safari)

1. Open `https://ns-del346.github.io/Pouro-Fable5/` in Safari
2. Tap **Share** → **Add to Home Screen**
3. Verify name: **Pouro-Fable5**
4. Verify icon (app-icon.png, not generic globe)
5. Open from Home Screen — app launches in standalone mode (no Safari chrome)

### Android (Chrome)

1. Open the URL in Chrome
2. Tap menu → **Add to Home Screen** or banner appears automatically
3. Verify name and icon
4. Open from Home Screen — launches in standalone mode

---

## Offline checklist

1. Open the app online at least once (lets Service Worker cache all assets)
2. In DevTools → Network, select **Offline**
3. Reload the page
4. Verify: Home screen loads fully, no broken assets
5. Navigate through screens (Setup, Preview) without network
6. Return to Online — no errors

---

## Cache reset / stale Service Worker procedure

If an older UI appears after a new deployment, the previous Service Worker cache is still active.

### English

1. Open DevTools (F12 / Cmd+Option+I)
2. Go to **Application** → **Service Workers**
3. Click **Unregister** next to the registered worker
4. Hard reload: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
5. Reopen the app online once — new assets are fetched and cached
6. Test offline reload again

### 日本語

公開後に古いUIが表示される場合は、Service Workerのキャッシュが残っている可能性があります。

1. DevToolsを開く（F12 / Cmd+Option+I）
2. **Application** → **Service Workers** を開く
3. 登録されているWorkerの **Unregister** をクリック
4. ハードリロード：**Ctrl+Shift+R**（Windows/Linux）または **Cmd+Shift+R**（Mac）
5. オンラインの状態でアプリを一度開き直す（新しいアセットがキャッシュされる）
6. オフラインで再読み込みをテストする

---

## Storage / privacy note

| Item | Detail |
|------|--------|
| Storage mechanism | Browser `localStorage` |
| Server transmission | None — all data is local |
| Account required | No |
| Cloud sync | No |
| Cross-device access | No — storage is per-device / per-browser profile |
| Data deletion | Cleared when browser data is cleared, or via Settings → Data → Clear History |
| Backup | Settings → Data → Export (JSON or CSV) |

---

## Export / backup note

Before clearing browser data or switching devices, use **Export** in Settings:

- **JSON export** — full structured record of all brew sessions; suitable for archiving or later analysis
- **CSV export** — spreadsheet-compatible summary with key fields per session

There is no import flow in PR-010. JSON export is the primary archive format.

---

## Known limitations

| Area | Limitation |
|------|------------|
| iOS PWA | No Web Push notifications, no Wake Lock API — timer must stay in foreground |
| Service Worker cache | After a new deployment, stale cache may persist until manually unregistered |
| localStorage | Per-device and per-browser profile — no cross-device sync |
| Cloud backup | No cloud account or sync system |
| Scale integration | No Bluetooth/USB scale support — dose and water entered manually |
| Timer accuracy | Depends on device state; OS may throttle background timers |
| Import | No brew history import flow in this release |

---

## Future maintenance notes

| Task | Notes |
|------|-------|
| Deploying a new version | Push to `main` → GitHub Pages rebuilds automatically. Users may need to unregister SW to pick up changes. |
| Updating cache version | Increment `CACHE_VERSION` in `sw.js` to force all clients to fetch new assets on next visit. |
| Adding a method | Requires changes to RecipeEngine, Setup screen, Preview steps, and Active Brew pour info. Follow existing method patterns. |
| Debugging a prod issue | Use DevTools → Application → Storage to inspect `localStorage` keys and values. Use Network tab to verify asset loading. |
| Checking SW status | DevTools → Application → Service Workers shows registration status, active scope, and cached resources. |

---

## Final handoff decision

PR-010 freezes the release candidate established in PR-009 and hands it off for public access via GitHub Pages.

- No RecipeEngine changes
- No timer logic changes
- No localStorage key or schema changes
- No manifest.webmanifest or sw.js changes
- No icon or design-artifact changes
- No UI redesign

The codebase is stable and ready for public release. All functional QA was completed in PR-009.

The only remaining step is activating GitHub Pages via the repository Settings UI (one-time, requires repo owner access).
