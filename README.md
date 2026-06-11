# Pouro-Fable5

Mobile-first hand-drip brewing guide and timer PWA — built from the Claude Design / Fable5 prototype.

## Design source of truth

The Claude Design / Fable5 prototype at `design-artifact/Pouro-Fable5.dc.html` is the sole visual reference for this project.

The current `NS-del346/Pouro-Claude` UI layout, HTML, CSS, card placement, CTA placement, and tab bar treatment must not be referenced or reused. `Pouro-Claude` is reference-only for recipe logic, method specs, and behavior requirements.

## Run the production app

```sh
npx serve .
# open: http://localhost:PORT/
# set DevTools viewport to 375 × 667 (iPhone SE)
```

## Run the design prototype

```sh
npx serve .
# open: http://localhost:PORT/design-artifact/Pouro-Fable5.dc.html
# set DevTools viewport to 375 × 667
```

## Screens

| Screen | Description |
|--------|-------------|
| Brew Home | Method selection (4:6 / Hybrid / 10 Pour / Ice Brew) |
| Recipe Setup | Dose · ratio · method-specific options |
| Preview | Step timeline · pre-brew checklist · Rebrew state |
| Active Brew | Timer · step dots · pour info · controls (no tab bar) |
| Brew Log | Rating · taste tags · memo · next-time note |
| History | Featured entry + scrollable history list |
| History Detail | Full recipe snapshot · steps · Rebrew CTA |
| Settings | Default brew · Brew assist · Data · About |

## Implementation plan

| PR | Scope |
|----|-------|
| PR-001 | Design artifact intake |
| PR-002 | App shell + design token system |
| PR-003 | Recipe engine + real timer |
| PR-004 | History + localStorage persistence + Rebrew |
| **PR-005** | **Settings persistence + export + clear history** ← current |
| PR-006 | PWA manifest + service worker + offline |

> **PR-005** adds settings persistence (`pouroFable5.settings.v1`).
> Default brew settings (method, dose, ratio) are applied to Recipe Setup on boot.
> Brew Log now has equipment input fields (bean, grind, temperature, dripper).
> JSON and CSV export are fully implemented.
> Clear History now fully removes `pouroFable5.history.v1` from localStorage.
> Clearing history does not delete settings.
> PWA manifest and service worker remain PR-006.

See [`docs/design/PR-005_SETTINGS_EXPORT_CLEAR.md`](docs/design/PR-005_SETTINGS_EXPORT_CLEAR.md) for full details.
