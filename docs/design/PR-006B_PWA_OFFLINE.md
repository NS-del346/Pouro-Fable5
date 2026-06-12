# PR-006B — PWA Manifest + Service Worker + Offline QA

## Scope

- Web App Manifest (`manifest.webmanifest`)
- iOS home screen metadata (`theme-color`, `apple-touch-icon`)
- Service Worker registration (`sw.js`, registered from `app.js` after boot)
- Offline app shell cache (28 assets pre-cached at install time)
- Google Fonts runtime cache (stale-while-revalidate)
- GitHub Pages relative path compatibility (`start_url: ./`, `scope: ./`)

## Not changed

- RecipeEngine (pour amounts, step structure, timings)
- Timer behavior (requestAnimationFrame / elapsedSec logic)
- localStorage schema (`pouroFable5.history.v1` / `pouroFable5.settings.v1`)
- History / Settings persistence
- JSON / CSV export logic
- Clear History logic
- PR-006A visual parity

## Manifest

| Field | Value |
|---|---|
| File | `manifest.webmanifest` |
| `name` / `short_name` | Pourō |
| `display` | standalone |
| `orientation` | portrait-primary |
| `start_url` | `./` |
| `scope` | `./` |
| `theme_color` | `#8C5535` |
| `background_color` | `#FBF8F2` |
| `lang` | ja |
| Icon 192px | `assets/app-icon.png` |
| Icon 512px | `assets/pwa-512.png` (upscaled from 192px at build time) |

## Service Worker

| Property | Value |
|---|---|
| File | `sw.js` |
| App cache | `pouro-app-v1` |
| Font cache | `pouro-fonts-v1` |
| Install | Pre-cache `APP_SHELL`; `skipWaiting()` for immediate activation |
| Activate | Delete caches not in `{pouro-app-v1, pouro-fonts-v1}`; `clients.claim()` |
| Same-origin GET | Cache-first; network fallback on miss; 503 on offline miss |
| `fonts.googleapis.com` / `fonts.gstatic.com` | Stale-while-revalidate |
| Other origins | Network-only (no interference) |
| Install failure | `console.warn('[Pouro] Service worker install failed:', err)` then re-throw |

## Precache asset list (`APP_SHELL` — 28 entries)

All entries verified to exist in the repository before listing.

```
./
./index.html
./styles.css
./app.js
./manifest.webmanifest
./assets/app-icon.png
./assets/pwa-512.png
./assets/wordmark-ink.png
./assets/method-46.png
./assets/method-hybrid.png
./assets/method-10-pour.png
./assets/method-ice-brew.png
./assets/icons/icon-back.png
./assets/icons/icon-bean.png
./assets/icons/icon-dripper.png
./assets/icons/icon-drop.png
./assets/icons/icon-export.png
./assets/icons/icon-history.png
./assets/icons/icon-next.png
./assets/icons/icon-note.png
./assets/icons/icon-pause.png
./assets/icons/icon-play.png
./assets/icons/icon-scale.png
./assets/icons/icon-settings.png
./assets/icons/icon-thermometer.png
./assets/icons/icon-timer.png
./assets/icons/icon-volume.png
./assets/icons/icon-wake-lock.png
```

## Precache asset rule

Only files confirmed to exist in the repository may be listed in `APP_SHELL`.
`cache.addAll()` fails the entire install if any request returns a non-ok response (including 404).
Verify with `find assets -maxdepth 3 -type f | sort` before adding new entries.

## QA checklist

- `git diff --check` passes
- Online load works; no console errors
- Manifest recognized in DevTools → Application → Manifest
- Service Worker registered and in `activated` state
- Cache Storage shows `pouro-app-v1` with all 28 entries
- Offline reload works after first online load (DevTools Network → Offline)
- CSS / JS / method PNG icons / wordmark all available offline
- Google Fonts appear in `pouro-fonts-v1` after first online load
- localStorage v1 history and settings load unchanged
- JSON / CSV export works
- Clear History removes only `pouroFable5.history.v1`
- 375×568 / 375×667 / 390×844 — no horizontal overflow
