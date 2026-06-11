# Pouro-Fable5

Mobile-first hand-drip brewing guide and timer PWA — built from the Claude Design / Fable5 prototype.

## Design source of truth

The Claude Design / Fable5 prototype at `design-artifact/Pouro-Fable5.dc.html` is the sole visual reference for this project.

The current `NS-del346/Pouro-Claude` UI layout, HTML, CSS, card placement, CTA placement, and tab bar treatment must not be referenced or reused. `Pouro-Claude` is reference-only for recipe logic, method specs, and behavior requirements.

## Prototype preview

```sh
npx serve .
# then open: http://localhost:PORT/design-artifact/Pouro-Fable5.dc.html
# set DevTools viewport to 375 × 667
```

## Implementation plan

See [`docs/design/FABLE5_ARTIFACT_REPORT.md`](docs/design/FABLE5_ARTIFACT_REPORT.md) for the artifact inspection report, screen inventory, and 6-PR production implementation plan.

Current status: **PR-001 — design artifact intake** (no production app code yet).
