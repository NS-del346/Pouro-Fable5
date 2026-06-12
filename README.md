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
| PR-007 | Engine refinements + reproducibility enhancement |
| **PR-008** | **Post-engine QA / release hardening** ← current |
| PR-009 | Release candidate / final deploy QA |

> **PR-008** performs a full post-engine regression QA across all four brewing methods,
> verifies 4:6 variable strength (4/5/6 pours), Hybrid 3-pour structure, Active Brew
> countdown, History/Rebrew/Export/Clear, PWA offline behavior, and 375px viewport.
> Fixes Hybrid setup card times that were stale from pre-PR-007 (0:45/1:30/2:15/3:30 → 0:30/1:15/1:45).

See [`docs/design/PR-008_RELEASE_HARDENING.md`](docs/design/PR-008_RELEASE_HARDENING.md) for full details.
