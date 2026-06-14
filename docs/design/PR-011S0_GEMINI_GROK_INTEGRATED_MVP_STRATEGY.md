# PR-011S0 — Gemini + Grok Integrated MVP Strategy

> **Docs-only strategy guardrail.** This document records the integrated market
> research conclusions (Gemini + Grok) and the product principles they imply. It
> changes **no** app, runtime, data, schema, or UI behavior. Its purpose is to
> align future development priorities **before** further UI/runtime work.

## 1. Purpose

To establish a single, durable product principle for Pouro-Fable5 and to record
the integrated Gemini + Grok market research that supports it, so that every
future feature decision can be checked against a shared benchmark.

The top-level principle:

> **Pouro-Fable5 is an extraction execution tool, not a coffee platform.**

The core benchmark question for all future features:

> **Does this make brewing easier than YouTube videos, screenshots, paper notes,
> mental calculation, or a phone timer?**

If the answer is **no**, do not implement.

## 2. Integrated conclusion

**Gemini conclusion**
- Demand exists.
- Good fit with the Japanese market.
- Strong fit with the 4:6 Method and Hybrid / Switch brewing.
- Auto calculation, execution support, and a simple UI are valued.

**Grok conclusion**
- The market is niche.
- Not a large VC-scale opportunity.
- Retention risk exists.
- "Once learned, not needed" risk exists.
- Still valuable if it is easier than video and paper notes.

**Common conclusion**
- Pouro-Fable5 is **not** a recipe search app.
- It is **not** a data analytics app.
- It is **not** a coffee SNS.
- It **is** an extraction execution tool.

Both analyses converge: the opportunity is real but modest, and it lives entirely
in **making the act of brewing easier**, not in building a platform around coffee.

## 3. Product identity

Pouro-Fable5 is an **extraction execution tool**. Its single job is to reduce the
cognitive load of brewing a cup right now: take a dose and a ratio, and tell the
user exactly how much to pour, the cumulative water target, the current and next
step, the time, and a relevant Tip — so the user does not have to calculate or
remember anything mid-brew.

The main job is to **reduce cognitive load during brewing**.

## 4. What Pouro-Fable5 is not

Pouro-Fable5 should **not** evolve toward any of the following:

- Beanconqueror
- Filtru
- Brewfather
- a coffee SNS
- a coffee analytics platform
- a bean inventory platform
- a Bluetooth-scale / hardware-first tool

Stated as product decisions:

- It should **not** become a coffee SNS.
- It should **not** become an analytics platform.
- It should **not** become a bean inventory tool.
- It should **not** pursue the Beanconqueror / Filtru / Brewfather direction.

These are full apps optimized for cataloguing, analysis, hardware integration, or
community. Pouro-Fable5 deliberately does not compete in that space.

## 5. Real competitors

The practical competitor is not other coffee apps. It is whatever the user does
**today** to reproduce a recipe:

- YouTube videos
- Instagram posts
- screenshots
- paper notes
- mental calculation
- the phone timer

Every feature must beat these on ease for the brewing moment. If a screenshot and
the phone clock already do the job better, the feature is not worth building.

## 6. Target users

**Primary persona**
- 4:6 Method beginner-to-intermediate user.
- V60 user.
- Watches YouTube recipes and wants to reproduce them.
- Struggles with dose / ratio calculation.
- Brews one cup every morning.
- Pain points: next grams, current step, Switch timing.

**Secondary persona**
- HARIO Switch user.
- Pain points: open / close timing, Hybrid steps, temperature change.

**Out of target**
- Bluetooth-scale enthusiasts.
- TDS-analysis users.
- Advanced competitors.
- Bean-inventory users.

## 7. MVP core value

- The user inputs **dose** and **ratio**.
- The app provides **pour amount, cumulative water, next step, time, and Tips**.
- The goal is to **eliminate mental calculation**.

Everything else is secondary to this loop. The MVP succeeds if a user can brew a
recipe without holding numbers, steps, or timing in their head.

## 8. Priority S / A / X

**Priority S — core execution (build / protect first)**
- Recipe Setup
- Auto Calculation
- Brew Timer
- Hybrid Switch open / close guidance
- Brew Finish
- Rebrew

**Priority A — supportive, retention-helping (build after S is solid)**
- Minimal Brew Log
- Taste Tags
- Dark Mode

**Priority X — explicitly out of scope for this product**
- Account
- Cloud sync
- Community / SNS
- Bluetooth hardware
- Bean inventory
- Analytics / graphs
- Advanced logging (TDS, water quality, full variable tracking)

## 9. Timer UI implication

During the pour, the user is **watching the scale**. The single most important
number is therefore the **cumulative target water (Target Total)**, not the
amount of this individual pour.

Recommended visual hierarchy:

- **Huge:** Target Total — e.g. `180g`
- **Medium:** This Pour — e.g. `60g`
- **Small:** Step `3/5`, `00:45`, `Next: Pour 60g`

Decision recorded:

> In the Timer UI, **cumulative target water should be more prominent than the
> this-pour amount.**

(This is a design principle only. No Timer UI change is made in this PR.)

## 10. Success indicators

- First use.
- Brew start rate.
- Brew completion rate.
- Rebrew use.
- Brew Log save rate.
- Whether it was easier than video.
- Whether it was easier than paper notes.

The last two are the decisive tests: ease versus video and ease versus paper
notes is the product's actual win condition.

## 11. Risk analysis

**Main risks**
- Once learned, the app may become unnecessary.
- Opening the app every time may feel tedious.
- The UI may be hard to read while brewing.

**Countermeasures**
- Rebrew.
- Brew Log.
- Previous-settings retention.
- Fast startup.
- One-tap rebrew.
- Large font.
- Cumulative-water priority.
- High contrast.

These countermeasures map directly onto Priority S/A items and the Timer UI
implication — retention is defended by speed and one-tap repetition, not by
adding platform features.

## 12. Roadmap impact

**Immediate**
- Store this strategy as a design guardrail.

**Next recommended**
- PR-011R4 — Timer UI / Target Total priority audit planning.

**Possible follow-up**
- PR-011R4A — Timer UI refinement.

**Deprioritized / hold**
- History Detail contextual TIPS integration.
- PR-012 My Recipes implementation.

**Still valuable later**
- Rebrew refinement.
- Minimal Brew Log.
- Taste Tags.
- Dark Mode.

**Explicitly avoid**
- Account.
- Cloud.
- Community.
- Hardware / Bluetooth scale.
- Inventory.
- Analytics dashboards.
- Advanced logging.

Key sequencing decision:

> Timer UI audit / planning is prioritized **over** History Detail integration.

Secondary-feature notes:

- History Detail is useful but **secondary** to execution.
- My Recipes is potentially useful but must **not** turn into a community /
  recipe-sharing platform.

## 13. Implementation guardrails

- Every feature must improve **extraction execution**. If it does not, defer it.
- Do not introduce account, cloud, community, or hardware assumptions.
- Do not add advanced analytics unless separately and explicitly justified.
- Preserve speed, simplicity, and a high-contrast, large-font brewing view.
- Keep the Timer's cumulative Target Total as the dominant on-screen value.
- Preserve the legal-neutral, non-official positioning (no claim of being an
  official recipe source).

## 14. Decision checklist

For every future feature, ask:

1. Does this reduce cognitive load during brewing?
2. Does this make the app easier than video or paper notes?
3. Does this help the user know what to do now or next?
4. Does this preserve speed and simplicity?
5. Does this avoid platform bloat?
6. Does this avoid new account / cloud / community / hardware assumptions?
7. Does this avoid advanced analytics unless separately justified?
8. Does this preserve legal-neutral, non-official positioning?

**Feature decision rule:**

> If a proposed feature does not improve extraction execution, defer it.

## 15. Acceptance criteria

This document is acceptable when:

- It frames Pouro-Fable5 as an **extraction execution tool**, not a platform.
- It explicitly rules out the Beanconqueror / Filtru / Brewfather direction, plus
  SNS, analytics, inventory, and hardware-first directions.
- It names the real competitors as video, Instagram posts, screenshots, paper
  notes, mental calculation, and the phone timer.
- It records the Timer UI implication that cumulative Target Total is more
  prominent than This Pour.
- It records Priority S / A / X.
- Its roadmap impact prioritizes the Timer UI audit / planning over History
  Detail integration.
- It is **docs-only**: no app / runtime / data / schema / UI behavior changes,
  and no History Detail / PR-011R4 / PR-012 / My Recipes work is started.
