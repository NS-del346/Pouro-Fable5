# PR-011S0 — Roadmap Impact (Derived)

> **Docs-only.** This is a focused summary of the roadmap consequences of the
> integrated MVP strategy
> ([PR-011S0_GEMINI_GROK_INTEGRATED_MVP_STRATEGY.md](./PR-011S0_GEMINI_GROK_INTEGRATED_MVP_STRATEGY.md)).
> It introduces **no** implementation and changes no app / runtime / data /
> schema / UI behavior.

## Guiding rule

> If a proposed feature does not improve **extraction execution**, defer it.

The single benchmark: *does this make brewing easier than YouTube videos,
screenshots, paper notes, mental calculation, or a phone timer?* If no, do not
implement.

## Roadmap adjustment

| Bucket | Items |
|---|---|
| **Immediate** | Store this strategy as a design guardrail. |
| **Next recommended** | PR-011R4 — Timer UI / Target Total priority audit planning. |
| **Possible follow-up** | PR-011R4A — Timer UI refinement. |
| **Deprioritized / hold** | History Detail contextual TIPS integration; PR-012 My Recipes implementation. |
| **Still valuable later** | Rebrew refinement; Minimal Brew Log; Taste Tags; Dark Mode. |
| **Explicitly avoid** | Account; Cloud; Community; Hardware / Bluetooth scale; Inventory; Analytics dashboards; Advanced logging. |

## Sequencing decision

**Timer UI audit / planning is prioritized over History Detail integration.**

Rationale: the Timer is the core execution surface, and the research says the
cumulative Target Total must dominate the brewing view. Tuning that surface beats
adding secondary, post-brew reading like History Detail.

## Priority mapping (from strategy §8)

- **Priority S (protect first):** Recipe Setup, Auto Calculation, Brew Timer,
  Hybrid Switch open/close guidance, Brew Finish, Rebrew.
- **Priority A (after S):** Minimal Brew Log, Taste Tags, Dark Mode.
- **Priority X (out of scope):** Account, Cloud sync, Community / SNS, Bluetooth
  hardware, Bean inventory, Analytics / graphs, Advanced logging.

## Status of named future work

- **PR-011R4** — Timer UI / Target Total audit planning. **Not started.**
- **PR-011R4A** — Timer UI refinement. **Not started.**
- **History Detail integration** — **on hold** (secondary to execution).
- **PR-012 My Recipes / Custom Recipe** — **deprioritized**; must never become a
  recipe-sharing community feature.
