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
| PR-005 | Settings persistence + export + clear history |
| **PR-006A** | **Visual parity + UX clarity polish** ← current |
| PR-006 | PWA manifest + service worker + offline |
| PR-007 | Engine refinements (variable 4:6 back pours, assist hardening) |

> **PR-006A** is display-layer only: method PNG icons restored across all screens,
> tab bar shown only on Home / History / Settings, softened selected-chip tone,
> consistent Hybrid OPEN/CLOSED vocabulary, Ice Brew ratio card hidden with
> HOT/ICE guidance, Japanese date display, rating clear-on-retap, rebrew pill,
> Settings assist sub-text + history count, and an artifact-style clear sheet.
> RecipeEngine, timer, localStorage schema, and export/clear logic are unchanged.

See [`docs/design/PR-006A_VISUAL_PARITY_UX_CLARITY.md`](docs/design/PR-006A_VISUAL_PARITY_UX_CLARITY.md) for full details.
