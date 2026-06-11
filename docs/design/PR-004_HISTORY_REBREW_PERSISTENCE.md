# PR-004: History Persistence and Rebrew Flow

## Purpose

PR-004 adds localStorage-backed brew history persistence to Pourō.
Brew results created in PR-003 (in-memory `state.brewResultDraft`) are now saved to localStorage
on Brew Log Save, and restored on every page load.

History, History Detail, and Rebrew all read from persisted data.

---

## localStorage key

```js
const STORAGE_KEYS = { history: 'pouroFable5.history.v1' };
const MAX_HISTORY_ENTRIES = 500;
```

Using a Pouro-Fable5-specific key (`pouroFable5.*`) — not shared with any other app.
`v1` suffix allows schema migration in a future PR if the entry format changes.

---

## History entry schema (v1)

```js
{
  schemaVersion: 1,

  id: "h_<timestamp>",
  createdAt: "2026-06-11T...",
  completedAt: "2026-06-11T...",

  methodId: "yon-roku" | "hybrid" | "neo" | "ice",
  methodName: "4:6 Method" | "Hybrid" | "10 Pour" | "Ice Brew",

  dose: 20,
  ratio: 15 | null,          // null for Ice Brew

  recipe: {
    id, name, dose, ratio,
    totalWater, hotWater, ice,
    targetDrawdownSec,
    flavor, strength,
    pourCount,
    summary: {},
    steps: []                // full step array saved at brew time
  },

  brew: {
    elapsedSec: 215,
    startedAt: 1718000000000,
    finishedAt: 1718000215000
  },

  log: {
    rating: null | 1 | 2 | 3 | 4 | 5,
    tags: ["甘い", "フルーティ"],
    note: "...",
    nextNote: "...",
    grind: "",
    temperature: "",
    bean: "",
    equipment: ""
  }
}
```

---

## rating null handling

| Saved value | Meaning |
|-------------|---------|
| `null`      | Unrated (displayed as「未評価」) |
| `1`–`5`     | Rated |

`normalizeRating()` converts all edge cases to null or a valid number:
- `0` → `null`
- `undefined` / `null` → `null`
- Non-integer or out-of-range → `null`

Rating 0 is never persisted.

---

## normalizeHistoryEntry

Every entry read from localStorage passes through `normalizeHistoryEntry()`:

- Ensures `schemaVersion: 1` is present
- Falls back to `RecipeEngine.build()` if `recipe.steps` is missing
- Converts `rating: 0` to `rating: null`
- Handles old flat schema (`entry.rating`, `entry.tags`, `entry.note`) alongside new `log.*` sub-object
- Safe for entries with missing `methodId`, `dose`, `ratio`
- Returns `null` for completely invalid entries (filtered by `.filter(Boolean)`)

---

## Save flow

On Brew Log Save (`#btn-save-log`):

1. Reads `state.activeRecipe` and `state.brewResultDraft`
2. Reads rating from `state.log.rating` → `normalizeRating()`
3. Reads tags from `state.log.tags`
4. Reads memo / next note from `<textarea>` values
5. Builds a schema v1 entry with full `recipe` snapshot
6. Prepends to `state.history` (newest first)
7. Calls `safeWriteHistory(state.history)` — try/catch around `localStorage.setItem`
8. On success: shows toast「履歴に保存しました」, navigates to History
9. On failure: shows toast「保存できませんでした。端末のストレージ容量を確認してください。」, stays on Log screen

---

## History screen behavior

On boot:
```js
state.history = safeReadHistory();
```

`safeReadHistory()` reads and JSON-parses `pouroFable5.history.v1`, normalizes all entries,
and returns an empty array on any error.

If history is empty → empty state is shown:「記録はまだありません」

If history has entries:
- Newest entry → featured card at top
- Remaining entries → scrollable list below
- Ice Brew entries: shows `20g · HOT 150g / ICE 80g` (not `1:null`)
- Unrated entries: shows「未評価」instead of stars

SAMPLE_HISTORY is retained in the source for reference but is NOT loaded into `state.history`.
The source of truth is always `localStorage`.

---

## History Detail behavior

Detail screen uses the persisted `recipe.steps` snapshot:

```js
const recipe = entry.recipe?.steps?.length
  ? entry.recipe
  : RecipeEngine.build(entry.methodId, entry.dose, entry.ratio || 15, flavor, strength);
```

This means the step timeline shown in Detail always matches what the user actually brewed,
including Hybrid switchState, 10 Pour timing, and Ice Brew HOT/ICE steps.

Fields displayed:
- methodName, completedAt (formatted as YYYY-MM-DD local time)
- rating (stars or「未評価」)
- recipe summary (dose, water, ratio/HOT+ICE, pours, estimated time)
- step timeline (from snapshot)
- flavor/strength chips (4:6 Method only)
- taste tags (if any)
- memo
- next note
- equipment fields (bean, grind, temperature, dripper — empty until PR-005 adds input fields)

---

## Rebrew from persisted history

`_applyRebrewEntry(entry)`:

1. Sets `state.selectedMethodId = entry.methodId`
2. Sets `state.draft.dose`, `state.draft.ratio`
3. Reads `flavor`/`strength` from `entry.recipe.flavor/.strength` (snapshot), falls back to entry-level
4. For Ice Brew: `ratio` restored as `15` (ratio field is unused in Ice Brew engine)
5. Sets `state.rebrewFrom = { id, date }` (date formatted from `completedAt`)
6. Calls `renderPreview()` + `showScreen('preview')`

Rebrew goes to Preview — not directly to Active Brew.
The preview banner shows「2026-06-11 の記録をもとにレシピを読み込みました」.
The original history entry is not modified.

---

## Method-specific persistence

### 4:6 Method
- `recipe.flavor` and `recipe.strength` are saved in the snapshot
- `recipe.steps` contains the 5-pour timeline with flavor/strength reflected amounts
- Rebrew restores both options → Preview shows the same flavor/strength chips

### Hybrid
- `recipe.steps` contains OPEN/CLOSED/OPEN switch states
- Detail shows the switch state timeline from snapshot
- Rebrew restores as Hybrid method

### 10 Pour
- `recipe.steps` contains the correct 0:00/0:30/0:45/.../2:30 timeline
- The 30s-then-15s rhythm is preserved in the snapshot, not 45s equal intervals

### Ice Brew
- `recipe.hotWater` and `recipe.ice` are saved in snapshot
- `ratio` is `null` in the entry
- History card shows `HOT Xg / ICE Yg` instead of ratio
- Detail summary shows HOT/ICE columns

---

## localStorage error handling

Both read and write are wrapped in try/catch:

```js
function safeReadHistory() {
  try { ... }
  catch (error) { console.warn('[Pouro] Failed to read history:', error); return []; }
}

function safeWriteHistory(entries) {
  try { ... return true; }
  catch (error) { console.warn('[Pouro] Failed to write history:', error); return false; }
}
```

A QuotaExceededError during write shows a user-visible toast rather than crashing the app.

---

## Clear History (PR-004 stub)

The existing Clear History button does an in-memory clear only:

```js
// PR-004: in-memory clear only. localStorage is NOT cleared here to prevent data loss.
// Full clear (including localStorage) will be implemented in PR-005.
state.history = [];
```

The user sees a toast clarifying that a page reload will restore from storage.
This prevents accidental data loss before PR-005 implements the full clear.

---

## Export (PR-004 stub)

Export JSON / CSV buttons remain toast-only:
- 「JSON エクスポートは PR-005 で実装予定」
- 「CSV エクスポートは PR-005 で実装予定」

---

## PR-005 handoff

The following items are NOT implemented in PR-004 and are deferred to PR-005:

- Clear History: full localStorage deletion + confirmation UX
- Export JSON: serialize `state.history` to downloadable JSON file
- Export CSV: serialize `state.history` to downloadable CSV file
- Equipment input fields in Brew Log (bean, grind, temperature, dripper)
- Settings persistence to localStorage

---

## Not implemented in PR-004

- Service worker / offline cache
- PWA manifest
- GitHub Pages publishing
- User accounts / cloud sync
- Real-time timer rewind accuracy improvement (noted in PR-003)
