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
| PR-008 | Post-engine QA / release hardening |
| **PR-009** | **Release candidate / final deploy QA** ← current |
| PR-010 | Public release / archive handoff |

> **PR-009** confirms the app is release-candidate ready after full flow, PWA/offline,
> storage/export, and 375px viewport QA. Fixes stale About card version string
> (PR-006A → PR-009). No engine or schema changes.

See [`docs/design/PR-009_RELEASE_CANDIDATE_QA.md`](docs/design/PR-009_RELEASE_CANDIDATE_QA.md) for full details.
