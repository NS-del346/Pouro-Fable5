# Fable5 Artifact Report

## Overview

This document describes the Claude Design / Fable5 prototype received for `NS-del346/Pouro-Fable5`. It serves as the design source of truth for the production PWA implementation.

Prototype file: `design-artifact/Pouro-Fable5.dc.html`
Runtime dependency: `design-artifact/support.js`

---

## How to open the prototype locally

1. Open a terminal in the repo root.
2. Serve the repo with any static file server — for example:

```sh
npx serve .
# or
python -m http.server 8000
```

3. Navigate to `http://localhost:PORT/design-artifact/Pouro-Fable5.dc.html`
4. Open DevTools and set the viewport to **375 × 667** (iPhone SE / primary target).

> Do not open the `.dc.html` as a `file://` URL directly. `support.js` and relative asset paths require a local server.

---

## Artifact inspection results

### Asset check

All assets referenced in `Pouro-Fable5.dc.html` are present at `design-artifact/assets/`:

| Asset | Referenced as | Present |
|---|---|---|
| `wordmark-ink.png` | `assets/wordmark-ink.png` | ✓ |
| `app-icon.png` | `assets/app-icon.png` | ✓ |
| `method-46.png` | `assets/method-46.png` | ✓ |
| `method-hybrid.png` | `assets/method-hybrid.png` | ✓ |
| `method-10-pour.png` | `assets/method-10-pour.png` | ✓ |
| `method-ice-brew.png` | `assets/method-ice-brew.png` | ✓ |

### External dependencies

The prototype loads three font families from Google Fonts:

- Lora (serif — screen headings, recipe values)
- Shippori Mincho (Japanese serif — hero text)
- Zen Kaku Gothic New (Japanese sans-serif — body text)

No other CDN or external runtime is loaded. The Claude Design runtime is bundled locally as `support.js`.

**Note for production:** Google Fonts requests require a network connection. For full offline PWA support, fonts must be self-hosted or bundled. See §Production implementation options below.

### Screen inventory

The artifact contains 8 named screens plus 3 overlay elements:

| # | Label | Screens |
|---|---|---|
| 01 | Brew Home | Method list + selected method card + CTA |
| 02 | Recipe Setup | Dose / water / flavor / strength / notes / grind controls |
| 03 | Preview | Full recipe summary; rebrew banner when `rebrewFrom` is set |
| 04 | Active Brew | Step-by-step timer, step progress, cumulative water |
| 05 | Brew Log | Post-brew rating and note entry |
| 06 | History | Scrollable history list with rebrew action |
| — | History Detail | Single entry detail with rebrew CTA |
| 07 | Settings | Language toggle, caffeine flag, export, factory reset |
| — | Tab Bar | Persistent bottom navigation (Home / History / Settings) |
| — | Toast | Success/info notification overlay |
| — | Clear Confirm Sheet | Confirm sheet for factory reset |

**Rebrew state:** Not a separate screen. `rebrewFrom` state flag on the Preview screen (line 1319 `rebrewFromEntry`) shows a banner and pre-fills the draft from history.

---

## File layout in this repository

```
design-artifact/
  Pouro-Fable5.dc.html    ← Claude Design / Fable5 prototype (source of truth)
  support.js               ← Claude Design runtime (do not edit)
  assets/
    wordmark-ink.png
    app-icon.png
    method-46.png
    method-hybrid.png
    method-10-pour.png
    method-ice-brew.png

reference/
  optional-ui-icons/       ← Supplemental icon set (not yet applied — optional)
  source-zips/
    Pouro-Fable5｜Final Mock Rebuild.zip     ← 337 KB, included
    Pouro-Fable5｜Final Mock Rebuild (1).zip ← 30 KB, included
    Pouro-Fable5｜Final Mock Rebuild (2).zip ← 13.4 MB, excluded from git
                                               (add to .gitignore; store separately)

docs/
  design/
    FABLE5_ARTIFACT_REPORT.md  ← this file

```

---

## Production implementation options

Three paths forward — decide before starting PR-002:

| Option | Description | Tradeoff |
|---|---|---|
| **A — Prototype-only** | Keep `.dc.html` + `support.js` as a design reference under `design-artifact/`. Build production app separately. | Clean separation; Claude Design runtime never ships to users. Recommended. |
| **B — Convert** | Hand-convert the `.dc.html` into plain `index.html` + CSS + JS. Remove `support.js` and all `<x-dc>` / `<sc-if>` custom elements. | Clean production output; significant manual effort; must preserve Fable5 visual fidelity exactly. |
| **C — Use as-is** | Ship the `.dc.html` + `support.js` directly as the production PWA. | Fast, but the Claude Design runtime adds ~49 KB of JS and custom element overhead; offline font dependency remains. Needs documented acceptance. |

The recommended path for this project is **Option A**: build production `index.html` against the Fable5 design as a pixel-accurate visual reference.

---

## Pouro-Fable5 production implementation plan

### PR-001 — Design artifact intake *(this PR)*
- Import `design-artifact/`, `reference/`, `docs/design/FABLE5_ARTIFACT_REPORT.md`
- Document how to open prototype locally

### PR-002 — App shell and design token system
- Create `index.html`, `app.css`, `app.js` skeleton
- Extract Fable5 color tokens, typography scale, spacing
- Set up tab-bar navigation shell
- No logic yet — layout only

### PR-003 — Recipe/timer logic
- Implement 4:6 Method, Hybrid, 10 Pour, Ice Brew step generators
- State machine: Setup → Preview → Active Brew → Brew Log
- Timer countdown logic per step

### PR-004 — History and Rebrew
- LocalStorage history persistence
- History list screen
- History Detail screen
- Rebrew → Preview state

### PR-005 — Settings / Export / Clear
- Language toggle (JA/EN)
- Caffeine flag
- Export (JSON download)
- Factory reset with confirm sheet

### PR-006 — PWA manifest, service worker, offline QA
- `manifest.json` with correct icon set
- Service worker with cache-first strategy
- Self-hosted font bundle or system fallback
- Offline smoke test

---

## Legal wording reminder

Pouro-Fable5 is unofficial. Use **guide / reference / estimated** wording throughout. Do not use: official, certified, supervised, endorsed, perfect reproduction, or guaranteed.
