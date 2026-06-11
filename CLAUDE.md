# Pouro-Fable5 Claude Code Rules

## Project

Target repository:

`NS-del346/Pouro-Fable5`

This project is a coffee brewing guide and timer PWA.

## Source of truth

The visual source of truth is:

```text
design-artifact/Pouro-Fable5.dc.html
```

Use the Claude Design / Fable5 artifact as the authoritative reference for:

* UI layout
* screen hierarchy
* typography
* color system
* spacing
* card structure
* CTA placement
* bottom navigation behavior
* safe-area behavior
* visual tone
* motion direction

## Strict prohibition

Do not copy, imitate, or derive UI layout from `NS-del346/Pouro-Claude`.
The following from Pourō-Claude must not be reused:

* HTML structure
* CSS
* component layout
* card structure
* CTA placement
* Bottom Tab treatment
* spacing system
* PR-I visual polish implementation

Pourō-Claude may be used only for recipe logic, method specifications, and behavior requirements in later PRs.

## Fable5 usage policy

Claude Design / Fable5 may be used only for:

* extracting design tokens from `design-artifact/Pouro-Fable5.dc.html`
* extracting component structure and screen hierarchy
* correcting visual drift from the Fable5 artifact
* designing iPhone-like motion tokens and transition behavior
* fixing layout issues at 375px widths

Do not use Fable5 to create a new design direction.
Implementation, Git operations, recipe logic, timer logic, storage, export, service worker, manifest, and PR creation must be handled with normal Claude Code implementation reasoning.

## PR scope discipline

Follow the current PR scope exactly.
For PR-002, do not implement:

* real recipe engine
* real timer engine
* localStorage persistence
* export
* clear history
* service worker
* manifest
* full PWA wiring

PR-002 is only:

* production app shell
* design tokens
* static screen structure
* basic navigation
* motion foundation
* optional common icon asset organization

## Motion and interaction quality

Pouro-Fable5 should feel smooth and tool-like, closer to native iPhone interaction quality.

Prefer:

* transform and opacity animations
* short transitions around 160–260ms
* easing similar to `cubic-bezier(0.2, 0.8, 0.2, 1)`
* no layout-shifting animation
* no heavy box-shadow animation
* no frequent DOM rewrites during timer display
* requestAnimationFrame or minimal state updates for animated UI
* respect `prefers-reduced-motion`

Avoid:

* janky screen changes
* abrupt CTA changes
* forced reflow loops
* animating height, width, top, left where transform can be used
* excessive blur or heavy paint effects
