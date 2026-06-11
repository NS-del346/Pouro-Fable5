---
description: Reviews Pouro-Fable5 motion, interaction smoothness, and iPhone-like animation quality. Use when the user reports jank or when screen transitions, timer UI, bottom sheets, buttons, or active brew states are changed.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash
---

# Pouro Motion QA

Use this skill to review interaction smoothness and animation quality.

## Goal

Pouro-Fable5 should feel calm, precise, and close to native iPhone interaction quality.

## Required checks

Inspect UI code for:

- screen transition behavior
- button feedback
- bottom sheet motion
- toast animation
- Active Brew timer updates
- navigation transitions
- reduced motion support
- layout stability on 375px width
- use of transform / opacity instead of layout properties
- excessive repaint or reflow risks

## Motion rules

Prefer:

```css
transition:
  transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
  opacity 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
```

Use:

* `transform: translate3d(...)`
* `opacity`
* `will-change` only on short-lived animated elements
* `requestAnimationFrame` for frame-based animation if needed
* `prefers-reduced-motion` fallback

Avoid:

* animating width / height / top / left
* excessive blur
* animated box-shadow
* frequent full-screen DOM replacement
* timer updates that cause layout shift
* long transitions over 320ms for basic navigation

## Output format

Return:

1. Motion quality assessment
2. Jank risks
3. Specific files/selectors to change
4. Recommended animation tokens
5. Whether changes stay inside current PR scope
