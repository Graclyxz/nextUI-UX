# Variant Contract — @nextui-ux/react

**Date:** 2026-06-30
**Status:** Approved design, pending implementation plan
**Scope:** Define the canonical variant/size/state vocabulary for the design system and the development rules every component must follow.

## Problem

Only 2 of 9 components have a variant system. Button (`cva`: default/destructive/outline/ghost + sizes) and Badge (`cva`: default/secondary/destructive/outline). The other 7 (Input, Card, Checkbox, Switch, Tooltip, Dialog, Tabs) are single-appearance, hardcoded in their `className`.

Worse, the two that *do* have variants disagree: Button has `ghost` and `size`, Badge has `secondary` and neither. There is no shared vocabulary, so every new component re-invents its styling decisions. This compounds with each component added.

## Goal

A **canonical contract** that defines:
1. Which style axes exist and their canonical values.
2. Which axes apply to which kind of component (semantic consistency, not forced uniformity).
3. A shared code module that makes the contract enforceable, not just documented.
4. A development checklist every new/refactored component must satisfy.

## Decisions

1. **Semantic consistency, not literal uniformity.** All components share one vocabulary, but each implements only the axes that make sense for it. No `outline` Switch, no `destructive` Tooltip.
2. **5 intent variants:** `default` (primary), `secondary`, `outline`, `ghost`, `destructive`. Maps directly to existing tokens — no new colors.
3. **Size scale `sm` / `md` / `lg`** with shared control heights: `sm`=h-8, `md`=h-10 (default), `lg`=h-12. `icon` stays a Button-only special case.
4. **Shared module** (`src/lib/variants.ts`) holds the reusable cva fragments — single source of truth.

## The two-axis color model (the core insight)

Components do not "change color" for the same reason. Conflating these is the #1 design-system mistake.

- **`intent`** — expresses *emphasis / hierarchy*. For actionable and label components. The 5-variant set. A button is "primary" or "secondary" because of its importance.
- **`state`** — expresses *validation*. For form fields. An Input is not "primary"; it is neutral with a state (`default` or `invalid`). Its color comes from `aria-invalid`, never from an emphasis prop.

Form fields therefore get `invalid` (a state), **never** `intent`. This separation is load-bearing for the whole contract.

## Canonical axes

| Axis | Values | Default | Applies to |
|------|--------|---------|------------|
| `intent` | default, secondary, outline, ghost, destructive | default | emphasis components |
| `size` | sm, md, lg | md | sizable controls |
| `surface` | outline, elevated | (per component) | container components |
| `invalid` (state, via `aria-invalid`) | true/false | false | form fields |

Interactive **states** (focus, disabled) are not props — they are shared class fragments applied by every interactive component (see States Contract).

## Component matrix

Which axes each category supports. `opcional` = contract-ready but not implemented in this pass (YAGNI).

| Category | Components | `intent` | `size` | `invalid` | `surface` |
|----------|-----------|:--------:|:------:|:---------:|:---------:|
| Action | Button | ✅ | ✅ + `icon` | — | — |
| Label | Badge | ✅ | opcional | — | — |
| Field | Input *(future: Textarea, Select)* | — | ✅ | ✅ | — |
| Selection | Checkbox, Switch | — | ✅ | opcional | — |
| Surface | Card, Dialog | — | — | — | ✅ |
| Overlay | Tooltip | — | — | — | — |
| Navigation | Tabs | — | opcional | — | — |

## States contract (all interactive components)

These make the system feel like one hand built it. Sourced from the shared module so they cannot drift.

- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- **Disabled (action controls):** `disabled:pointer-events-none disabled:opacity-50`
- **Disabled (form fields):** `disabled:cursor-not-allowed disabled:opacity-50`
- **Invalid (fields):** `aria-invalid:border-destructive aria-invalid:ring-destructive`

## Shared module: `src/lib/variants.ts`

Single source of truth. Components import these fragments and compose them inside their own `cva` base. The module owns *cross-component* concerns (state, color mapping, sizing); each component owns its *own geometry* (padding, radius, shape).

Exports (illustrative — exact class strings finalized in implementation):

```ts
// Cross-component state fragments
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
export const disabledControl = 'disabled:pointer-events-none disabled:opacity-50'
export const disabledField = 'disabled:cursor-not-allowed disabled:opacity-50'
export const invalidField =
  'aria-invalid:border-destructive aria-invalid:ring-destructive'

// Canonical control heights + horizontal padding (shared vertical rhythm so
// Input md ↔ Button md align). Padding is shared here; only components that
// genuinely differ (e.g. icon-only) override it.
export const controlSize = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
} as const

// Canonical intent → token color mapping (emphasis components)
// Geometry (radius/padding) stays in each component's cva base.
export const intentColors = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const
```

Components reference these in their `variants` maps. Example (Button):

```ts
const buttonVariants = cva(
  cn('inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors', focusRing, disabledControl),
  {
    variants: {
      intent: intentColors,
      size: { ...controlSize, icon: 'h-10 w-10' },
    },
    defaultVariants: { intent: 'default', size: 'md' },
  },
)
```

> Note: the current prop name is `variant`, not `intent`. Renaming is a breaking API change — see Migration.

## Development checklist (every new/refactored component)

1. Use `cva` if the component has ≥2 visual variations; export `<name>Variants`.
2. Merge with `cn`. **Only semantic tokens — zero raw hex.**
3. **Only canonical axes/values** — never invent ad-hoc variant names.
4. Pull state fragments and size/intent maps from `src/lib/variants.ts` — don't re-type the class strings.
5. `asChild` via `Slot.Root` on single-element components.
6. `React.forwardRef` + `displayName`. `'use client'` only if interactive.
7. Test: a11y assertion (`axe`) + assert variant/size classes render. One story per variant and per size.

## Migration (existing components)

This pass reconciles the two divergent components and seeds the shared module:

- **`src/lib/variants.ts`** — create with the fragments above.
- **Button** — refactor to consume `intentColors` + `controlSize` + state fragments. Gains `secondary`. Keeps `icon`.
- **Badge** — refactor to consume `intentColors` + state fragments. Gains `ghost`. Reconcile `outline` (border-input vs border-border → pick `border-input` to match Button) and keep `rounded-full` geometry.

**API decision (locked):** rename the prop `variant` → `intent` on Button and Badge. This aligns the prop name with the canonical axis and the shared `intentColors` map. It is a breaking change, but we are pre-1.0, so it is the cheapest moment to do it. The exported cva fns keep their names (`buttonVariants`, `badgeVariants`).

## Out of scope (YAGNI)

- Textarea, Select, Radio, IconButton — the contract is designed to absorb them, but they are not built in this pass.
- A global `icon` size across all components (deferred; Button-only for now).
- Density/compact modes, color-theme-per-component overrides.

## Success criteria

- `src/lib/variants.ts` exists and is the only place state/size/intent class strings live.
- Button and Badge consume it and share the 5-variant vocabulary.
- The development checklist is documented where future work will see it (CLAUDE.md reference).
- All existing tests still pass; new variants have test + story coverage.
