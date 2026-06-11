# PR-005: Settings Persistence, Export, and Clear History

## Purpose

PR-005 extends the localStorage foundation from PR-004 to let users safely manage their data.

Implemented:
- Settings persistence (default brew + brew assist toggles)
- Brew Log equipment input fields (bean, grind, temperature, equipment)
- JSON export
- CSV export
- Full Clear History (localStorage removal)
- localStorage error handling refinement

## Settings storage key

```
pouroFable5.settings.v1
```

The history key from PR-004 is unchanged:

```
pouroFable5.history.v1
```

## Settings schema (localStorage)

```json
{
  "schemaVersion": 1,
  "defMethodId": "yon-roku",
  "defDose": 20,
  "defRatio": 15,
  "defFlavor": "balanced",
  "defStrength": "standard",
  "wake": false,
  "sound": true,
  "haptic": true
}
```

`schemaVersion: 1` is included for future migration support.

## Settings read/write flow

```
Boot
  └─ safeReadSettings()
       ├─ localStorage.getItem(STORAGE_KEYS.settings)
       ├─ JSON.parse → normalizeSettings()
       └─ returns state-compatible flat object

Change (dose/ratio/method/toggle)
  └─ renderSettings()
       └─ safeWriteSettings(state.settings)
            └─ localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(payload))
```

On failure, `safeReadSettings()` silently returns `getDefaultSettings()`.  
On write failure, `safeWriteSettings()` returns `false` — the caller can show a toast.

## Default brew persistence

On boot, the persisted `defDose`, `defRatio`, `defFlavor`, `defStrength`, `defMethodId` are applied to `state.draft` and `state.selectedMethodId` so Recipe Setup opens with the saved defaults.

## Brew assist persistence

The toggles `wake`, `sound`, `haptic` are persisted in the same settings schema.  
Any change to a toggle calls `renderSettings()`, which calls `safeWriteSettings()`.

## Brew Log equipment fields

`index.html` Screen 05 (Brew Log) replaces the static `equip-list` with real `<input>` elements:

| Field ID         | Label      | Saved as           |
|------------------|------------|--------------------|
| `log-bean`       | 豆          | `log.bean`         |
| `log-grind`      | 挽き目       | `log.grind`        |
| `log-temperature`| 湯温        | `log.temperature`  |
| `log-equipment`  | ドリッパー    | `log.equipment`    |

Inputs are cleared only when entering Brew Log for a newly completed brew.
They are not cleared on `renderLog()` re-renders, so rating/tag changes do not erase equipment input values.
Values are read on Save and stored inside the history entry `log` object, same structure as PR-004.

History Detail reads `entry.log.bean`, `entry.log.grind`, `entry.log.temperature`, `entry.log.equipment` — no change to Detail rendering was needed as PR-004 already handled these.

## JSON export format

```json
{
  "app": "Pouro-Fable5",
  "schemaVersion": 1,
  "exportedAt": "2026-06-12T00:00:00.000Z",
  "historyCount": 3,
  "history": [...]
}
```

Filename: `pouro-fable5-history-YYYYMMDD-HHMM.json`

Export reads from `safeReadHistory()` (not `state.history`) to ensure localStorage is the source of truth.

## CSV export columns

```
id, completedAt, methodId, methodName, dose, ratio,
totalWater, hotWater, ice, elapsedSec,
rating, tags, note, nextNote, bean, grind, temperature, equipment
```

- Tags are joined with `|` (e.g. `甘い|フルーティ`)
- All values are quote-escaped: if value contains `,` `"` or newline, it is wrapped in `"` with internal `"` doubled
- File starts with UTF-8 BOM (`﻿`) for Excel compatibility
- Line endings: `\r\n`

Filename: `pouro-fable5-history-YYYYMMDD-HHMM.csv`

## CSV escaping

```js
function _csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
```

## Clear History implementation

```
User taps "履歴をすべて削除"
  └─ confirm-overlay shown

User taps "削除する"
  └─ safeClearHistory()
       └─ localStorage.removeItem(STORAGE_KEYS.history)
  └─ state.history = []
  └─ renderHistory()       → empty state shown
  └─ overlay closed
  └─ toast: "履歴を削除しました"

On localStorage error
  └─ toast: "履歴を削除できませんでした"
```

Settings localStorage is NOT affected by Clear History.

## Error handling

| Operation        | On failure                              |
|------------------|-----------------------------------------|
| safeReadHistory  | returns `[]`, console.warn              |
| safeWriteHistory | returns `false`, caller shows toast     |
| safeReadSettings | returns `getDefaultSettings()`, warns   |
| safeWriteSettings| returns `false` (renderSettings silent) |
| safeClearHistory | returns `false`, toast shown            |

## PR-006 handoff

The following remain for PR-006:

- `manifest.webmanifest` wiring
- Service worker / offline cache
- GitHub Pages deployment configuration
- Self-hosted fonts (currently loaded from Google Fonts)

## Not implemented in PR-005

- Service worker
- Offline cache
- PWA manifest
- GitHub Pages setup
- User accounts / cloud sync
- Analytics
