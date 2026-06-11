# Common Icon Asset Map

## Overview

This document describes the canonical flat icon set for Pouro-Fable5 UI support actions and metadata.

**Visual source of truth:** `design-artifact/Pouro-Fable5.dc.html`
The Fable5 artifact remains authoritative for all layout and visual direction decisions.
Icons are supplemental implementation assets only.

---

## Directories

| Role | Path |
|---|---|
| Source (optional reference originals) | `reference/optional-ui-icons/` |
| Production (canonical flat set) | `assets/icons/` |

Filenames with suffixes like `(1)` were normalized during copy (e.g. `icon-back (1).png` → `icon-back.png`).

---

## Filename Mapping

| Production file | Source file | Available |
|---|---|---|
| `assets/icons/icon-back.png` | `reference/optional-ui-icons/icon-back (1).png` | ✓ |
| `assets/icons/icon-bean.png` | `reference/optional-ui-icons/icon-bean (1).png` | ✓ |
| `assets/icons/icon-dripper.png` | `reference/optional-ui-icons/icon-dripper.png` | ✓ |
| `assets/icons/icon-drop.png` | `reference/optional-ui-icons/icon-drop.png` | ✓ |
| `assets/icons/icon-export.png` | `reference/optional-ui-icons/icon-export.png` | ✓ |
| `assets/icons/icon-history.png` | `reference/optional-ui-icons/icon-history (1).png` | ✓ |
| `assets/icons/icon-next.png` | `reference/optional-ui-icons/icon-next.png` | ✓ |
| `assets/icons/icon-note.png` | `reference/optional-ui-icons/icon-note.png` | ✓ |
| `assets/icons/icon-pause.png` | `reference/optional-ui-icons/icon-pause (1).png` | ✓ |
| `assets/icons/icon-play.png` | `reference/optional-ui-icons/icon-play (1).png` | ✓ |
| `assets/icons/icon-scale.png` | `reference/optional-ui-icons/icon-scale (1).png` | ✓ |
| `assets/icons/icon-settings.png` | `reference/optional-ui-icons/icon-settings (1).png` | ✓ |
| `assets/icons/icon-thermometer.png` | `reference/optional-ui-icons/icon-thermometer (1).png` | ✓ |
| `assets/icons/icon-timer.png` | `reference/optional-ui-icons/icon-timer (1).png` | ✓ |
| `assets/icons/icon-volume.png` | `reference/optional-ui-icons/icon-volume.png` | ✓ |
| `assets/icons/icon-wake-lock.png` | `reference/optional-ui-icons/icon-wake-lock.png` | ✓ |

All 16 icons are available. The current implementation uses inline SVGs for all UI icons; the `assets/icons/` set is organized for use in future PRs.

---

## Method icons — separate, do not replace

Method icons are managed independently and must not be overwritten by the common icon set:

```
assets/method-46.png
assets/method-hybrid.png
assets/method-10-pour.png
assets/method-ice-brew.png
```

---

## Intended usage

Icons in `assets/icons/icon-*.png` are for UI support actions and metadata only:

- Navigation actions: Back, Next
- Playback controls: Play, Pause
- Timer display
- Brew metadata: Scale, Bean, Drop, Dripper, Thermometer
- Screen navigation: History, Settings
- Secondary actions (future PRs): Note, Export, Volume, Wake Lock

Do not add icons to the UI just because an icon exists.
Unused icons remain available but must not be forced into screens.

---

## PR-002 scope note

PR-002 uses inline SVGs for all icons. The `assets/icons/` flat set is organized here for
production use in PR-003 and beyond. Not all icons will be needed in every PR.
