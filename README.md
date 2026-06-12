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
| PR-006A | Visual parity + UX clarity polish |
| PR-006B | PWA manifest + service worker + offline QA |
| **PR-007** | **Engine refinements + reproducibility enhancement** ← current |
| PR-008 | Post-engine QA / release hardening |

> **PR-007** implements variable 4:6 strength logic (4/5/6 total pours by strength),
> refines the Hybrid recipe to the Fable5 artifact 3-pour structure, adds Active Brew
> next-pour countdown, and adds `actualDrawdown` / `nextNote` reproducibility fields
> to Brew Log, History Detail, and exports. Backward compatible with existing data.

See [`docs/design/PR-007_ENGINE_REPRODUCIBILITY.md`](docs/design/PR-007_ENGINE_REPRODUCIBILITY.md) for full details.
