# Pouro-Fable5

Mobile-first hand-drip brewing guide and timer PWA — built from the Claude Design / Fable5 prototype.

**Public URL:** https://ns-del346.github.io/Pouro-Fable5/ *(pending GitHub Pages activation — see deployment section below)*

---

## Purpose

Pouro-Fable5 is a PWA that guides you through specialty hand-drip coffee brewing. Choose a method, enter your dose and ratio, and the app generates a step-by-step pour schedule and an interactive timer. Results are saved locally so you can review, rate, and rebrew past sessions.

---

## Features

- Step-by-step pour guide with real-time countdown timer
- Four supported brew methods (see below)
- Pause / resume timer during brew
- Brew Log with star rating, taste tags, free-text memo, and next-time note
- History list with featured entry and full-recipe detail view
- Rebrew — restore any past session's conditions with one tap
- Settings: default brew method, brew-assist level, Celsius / Fahrenheit toggle
- JSON + CSV export of full brew history
- Clear History with confirmation guard
- PWA — installable on iOS and Android home screen
- Offline support via Service Worker cache

---

## Supported methods

| Method | Description |
|--------|-------------|
| 4:6 Method | Tetsu Kasuya's front/back split with strength and taste controls |
| Hybrid Method | 2-phase bloom + continuous pour |
| 10 Pour Method | 10 equal pours for even extraction |
| Ice Brew | Iced pour-over with reduced water, ice fill target |

---

## Screens

| Screen | Description |
|--------|-------------|
| Brew Home | Method selection |
| Recipe Setup | Dose · ratio · method-specific options |
| Preview | Step timeline · pre-brew checklist · Rebrew state |
| Active Brew | Timer · step dots · pour info · controls |
| Brew Log | Rating · taste tags · memo · next-time note |
| History | Featured entry + scrollable history list |
| History Detail | Full recipe snapshot · steps · Rebrew CTA |
| Settings | Default brew · Brew assist · Data · About |

---

## PWA / Offline support

Pouro-Fable5 is installable as a Progressive Web App:

- **iOS:** Safari → Share → Add to Home Screen
- **Android:** Chrome → menu → Add to Home Screen / Install App

After the first online load, the app is fully usable offline. The Service Worker caches all required assets.

---

## Local storage / privacy

All data is stored in your browser's `localStorage`. Nothing is sent to any server.

- No account required
- No cloud sync
- Data is local to each device and browser profile
- Data is deleted when you clear browser data or use Clear History in Settings
- Use **Export** (Settings → Data) to back up your history as JSON or CSV before clearing

---

## Export

Go to Settings → Data → Export to download your brew history as:

- **JSON** — full structured record, suitable for re-import or archiving
- **CSV** — spreadsheet-compatible summary

---

## Implementation history

| PR | Scope |
|----|-------|
| PR-001 | Design artifact intake |
| PR-002 | App shell + design token system |
| PR-003 | Recipe engine + real timer |
| PR-004 | History + localStorage persistence + Rebrew |
| PR-005 | Settings persistence + export + clear history |
| PR-006A | Visual parity + UX clarity polish |
| PR-006B | PWA manifest + service worker + offline QA |
| PR-007 | Engine refinements + reproducibility enhancement |
| PR-008 | Post-engine QA / release hardening |
| PR-009 | Release candidate / final deploy QA |
| **PR-010** | **Public release / archive handoff** ← current |

> **PR-010** finalizes the public release handoff for GitHub Pages, documents deployment and
> cache-reset procedures, and freezes the release candidate state established in PR-009.

See [`docs/design/PR-010_PUBLIC_RELEASE_HANDOFF.md`](docs/design/PR-010_PUBLIC_RELEASE_HANDOFF.md) for deployment and post-release maintenance notes.

---

## Deployment (GitHub Pages)

The app is deployed via GitHub Pages from the `main` branch root.

**First-time setup (GitHub UI required):**

1. Repository → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Click **Save**

After saving, GitHub will build and publish to `https://ns-del346.github.io/Pouro-Fable5/` within a few minutes.

**Post-deployment verification:**

- `https://ns-del346.github.io/Pouro-Fable5/` opens and shows the Home screen
- `manifest.webmanifest` does not 404
- `sw.js` does not 404
- `assets/app-icon.png` does not 404
- Service Worker registers in DevTools → Application → Service Workers

---

## Cache reset / stale Service Worker

If an older UI appears after a deployment, the previous Service Worker cache may still be active.

**Steps:**

1. Open DevTools
2. Application → Service Workers
3. Click **Unregister**
4. Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
5. Reopen the app online once
6. Test offline reload again

---

日本語メモ: 公開後に古いUIが表示される場合は、Service Workerのキャッシュが残っている可能性があります。DevTools → Application → Service Workers → Unregister を実行し、ハードリロードしてください。その後オンラインで一度アプリを開き直してから、オフラインで再読み込みをテストしてください。

---

## Known limitations

- iOS PWA does not support Web Push notifications or Wake Lock API
- Service Worker cache may serve a stale UI until manually unregistered after a new deployment
- `localStorage` is per-device and per-browser profile — no cross-device sync
- No cloud backup or account system
- No scale integration (manual dose/water entry only)
- Timer accuracy depends on device state and OS background-process throttling

---

## Run locally

```sh
npx serve .
# open: http://localhost:PORT/
# set DevTools viewport to 375 × 667 (iPhone SE)
```

## Design source

The Claude Design / Fable5 prototype at `design-artifact/Pouro-Fable5.dc.html` is the sole visual reference for this project.
