# PR-011R3C｜Method Detail Field Mapping (companion)｜Pouro-Fable5

> Status: **Planning companion doc only (docs-only).**
> This is an optional companion to `PR-011R3C_METHOD_DETAIL_PLANNING.md`. It exists
> because the future implementation PR benefits from a single at-a-glance table
> tying each Method Detail section to the concrete v2.1 fields and filters it may
> read. It implements nothing, imports nothing, and changes no data.

---

## 1. Why this doc is useful

The main planning doc (`PR-011R3C_METHOD_DETAIL_PLANNING.md`) is the normative
source. This companion compresses §6–§8 of that doc into two lookup tables so the
implementer can answer, per section, "which fields, which filter, which length"
without re-reading prose. If anything here conflicts with the planning doc, the
**planning doc wins**.

---

## 2. Section → field / filter / length matrix

`recipeCode` filter = (method code **or** `ALL`); `appAdoption` = `adoptable`
always; `quarantine` and `timer`-context items are excluded everywhere on this
surface (see planning §8).

| # | Section | Primary fields | Filter / context source | Length |
|---|---------|----------------|--------------------------|--------|
| 1 | Method overview | authored prose; `category: overview` summarized | method scope only | 1 short para |
| 2 | Recipe baseline | §9 baseline; `contentShortJa` | carried values (not item-driven) | small list/table |
| 3 | Equipment / dripper premise | `contentJa`; authored premise | equipment-related items, method scope | 1–3 lines |
| 4 | Grind / temperature guide | `contentJa` + `whyJa`; `contentShortJa` | grind/temp items, method scope | 1–2 lines/dim |
| 5 | Pour schedule / progression | §9 schedule (verbatim) | carried values (reference table) | static table |
| 6 | Taste adjustment model | `contentJa` + `whyJa` | `finish` / adjustment items | short block |
| 7 | POINT / TIPS grouped by context | `contentJa` + `whyJa`; `contentShortJa` for sub-lists | aggregate `setup`/`preview`/`finish`/`historyDetail` per §8.1 | grouped lists |
| 8 | Source / verification status | `source` (summarized), `verificationLevel` (summarized), `confidence` (summarized) | method scope; never raw | 1–2 lines |
| 9 | Safety / legal-neutral note | authored from `textRules.legalNote` | n/a | 1 line |
| 10 | What Pourō does not claim | authored fixed copy | n/a | 1 short para |

---

## 3. Field → exposure rules (quick reference)

| Field | Exposed in Method Detail? | How |
|---|---|---|
| `id` | no (internal) | selection key + deterministic tiebreak (ascending) |
| `type` | indirectly | POINT vs TIPS grouping/label |
| `scope` | no | internal |
| `recipeCode` | no | filter only (method or `ALL`) |
| `category` | optional | sub-grouping within a context group |
| `displayContext` | no | grouping/filter key (§8.1) |
| `contentShortJa` | yes | compact rows / sub-lists |
| `contentJa` | yes | body text |
| `whyJa` | yes | "why this matters" block (never in Timer) |
| `source` | summarized only | neutral provenance line; raw `videoTitle` never shown |
| `verificationLevel` | summarized only | plain status, not a debug label |
| `confidence` | summarized only | neutral language, not a raw label |
| `appAdoption` | no | gate; only `adoptable`, never `quarantine` |
| `notes` | no (default) | internal planning; only carefully summarized if ever |

---

## 4. Excluded-from-this-surface checklist

```text
- appAdoption: quarantine            -> never
- displayContext includes quarantine -> never
- P-OTHER-001 (recipeCode OTHER)      -> never
- recipeCode HYB_BASE / HYB_DEVIL     -> never surfaced (app maps hybrid -> HYB_NEW)
- displayContext: timer               -> excluded on Method Detail (active-step copy)
- raw source.videoTitle               -> never app-facing
- forbidden wording (完全/100%/必ず/究極/神/悪魔/…)  -> never
```

---

## 5. Determinism note

No `priority` field exists in v2.1. The deterministic order for any selected/
grouped list is: `recipeCode` (method-specific before `ALL`) → then stable
**ascending `id`**. This matches the PR-011R3A/R3B selector contract and must be
reused, not replaced with randomization. This PR adds no `priority` field.
