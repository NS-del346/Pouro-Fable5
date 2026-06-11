---
description: Checks whether Pouro-Fable5 UI changes preserve the Claude Design / Fable5 artifact as the visual source of truth. Use before or after UI implementation changes.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash
---

# Pouro Design Guard

Use this skill to prevent UI drift from the Fable5 artifact.

## Source of truth

Read and compare against:

```text
design-artifact/Pouro-Fable5.dc.html
docs/design/FABLE5_ARTIFACT_REPORT.md
```

## Required checks

Verify that the implementation preserves the Fable5 artifact direction:

* warm cream background
* deep charcoal text
* muted gray-brown secondary text
* restrained amber / brown / terracotta accent
* quiet notebook-like feel
* tool-like precision
* rounded cards
* calm CTA hierarchy
* safe-area aware mobile layout
* Active Brew hides bottom navigation
* Rebrew appears as Preview state, not a separate primary screen

## Prohibited drift

Flag any of the following:

* UI resembles the old Pourō-Claude layout
* generic iOS Settings look
* SaaS dashboard look
* blue system accent such as `#007AFF` as a main accent
* changed card rhythm or CTA placement without explicit instruction
* method cards reduced to generic lists without Fable5 visual hierarchy
* Bottom Tab copied from Pourō-Claude
* design-artifact ignored or only loosely referenced

## Output format

Return:

1. Pass / Needs revision
2. Drift risks
3. Files or selectors involved
4. Required corrections
5. Whether the current PR scope is still respected
