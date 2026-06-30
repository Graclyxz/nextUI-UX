# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

**This directory is the library `@nextui-ux/react`** (git root) — almost all work happens here. A sibling app lives one level up:

- `.` (this repo) — the library `@nextui-ux/react`.
- `../nextUI-UX-playground/` — a Next.js 16 (App Router, Turbopack, React 19) app that consumes the library **via a packed tarball**, as a real integration check. It does not symlink the source.

All commands below run from this repo root unless noted.

## Commands

```bash
pnpm test                 # vitest run (jsdom) — full suite
pnpm test:watch           # vitest watch
pnpm vitest run src/components/Button/Button.test.tsx   # single test file
pnpm lint                 # eslint .
pnpm format               # prettier --write .
pnpm storybook            # dev Storybook on :6006 (a11y + docs addons)
pnpm build                # build:js (tsup) + build:css (tailwind CLI) → dist/
pnpm changeset            # record a version bump for release
```

**Never run `pnpm build` just to check your work** — tests and types are the feedback loop. Build only when packing for the playground or releasing.

To see a change live in the playground, from `../nextUI-UX-playground/` run `./sync-lib.sh`. It rebuilds the library, `pnpm pack`s it, and reinstalls the tarball into the playground. The playground will not reflect library source edits until you do this.

## Architecture

This is a themeable, accessible component library. The big-picture pieces that span files:

### Build is per-file, not bundled
`tsup.config.ts` sets `bundle: false` so every source module emits its own `dist` file. This **preserves each file's `'use client'` directive**, which lets Next.js Server Components import the server-safe components (Badge, Input, Card) without dragging in a client boundary. Interactive components carry `'use client'`; static ones do not. Don't add bundling — it would collapse the directives. CSS is built separately by the Tailwind CLI (`build:css`), not by tsup.

### Theming is a token contract (`src/styles/`)
- `tokens.css` defines **semantic CSS variables** (`--primary`, `--background`, `--ring`, `--radius`, motion/shadow scales) on `:root`, then an `@theme inline` block maps them to Tailwind v4 utilities (`bg-primary`, `text-foreground`, ...).
- Theme files (`styles/themes/*.css`: `classic-light`, `classic-dark`, `purple-night`) **only override the token values** under a `[data-theme='...']` selector. A new theme is one CSS block — no component changes.
- `styles.css` is the entry that `@import`s tokens, motion, and all themes; it's what consumers import (`@nextui-ux/react/styles.css`).
- **Components reference semantic roles, never raw colors.** `bg-primary`, not `bg-[#7c5cff]`. This is the rule that keeps theming working.
- `ThemeProvider` (`src/theme/`) wraps `next-themes`, hardcoding `attribute="data-theme"` and the built-in theme list. Switching themes = setting `data-theme` on `<html>`.

### Component pattern (every component follows it)
Each lives in `src/components/<Name>/` with `<Name>.tsx`, `.test.tsx`, `.stories.tsx`, `index.ts`. The shape:
- Variants via **`cva`** (class-variance-authority); merge with **`cn`** (`src/lib/cn.ts` = `twMerge(clsx(...))`, which resolves conflicting Tailwind classes).
- `asChild` prop → renders styles onto the child via radix `Slot.Root` instead of the default element.
- `React.forwardRef` + `displayName` for DOM-element components; compound components (Tabs, Dialog) re-export and wrap radix primitives (`radix-ui` package) part-by-part.
- Export the `*Variants` cva fn alongside the component.
- `src/index.ts` is a flat barrel re-exporting every component's `index.ts`. **Imports use `.js` extensions** (`verbatimModuleSyntax` + bundler resolution) — match that.

### Variant contract (`src/lib/variants.ts`)
The canonical style vocabulary lives in one internal module — the single source of truth, not exported from the public barrel. Full spec: `docs/superpowers/specs/2026-06-30-variant-contract-design.md`.

- **`intent`** (emphasis): `default`, `secondary`, `outline`, `ghost`, `destructive` — for action/label components (Button, Badge). Never put `intent` on a form field.
- **`size`** (controls): `sm`/`md`/`lg` with shared heights (h-8/h-10/h-12); `icon` is Button-only.
- **State** (form fields): validation is `invalid` via `aria-invalid`, not an intent.
- Components import the fragments (`focusRing`, `disabledControl`, `disabledField`, `invalidField`, `controlSize`, `intentColors`) and compose them in their own `cva` base. They own only their geometry (padding/radius/shape).

When adding or refactoring a component: use only canonical axes/values (never invent variant names), pull state/size/intent strings from `variants.ts` (don't retype them), and add a test asserting variant/size classes plus a story per variant and size.

### Testing
vitest + jsdom + `@testing-library/react`. Every component test includes an **accessibility assertion** via `vitest-axe` (`expect(await axe(container)).toHaveNoViolations()`). The axe matcher is registered manually in `vitest.setup.ts` because `vitest-axe@0.1.0` ships an empty `extend-expect`. Keep the a11y assertion when adding components.

## Conventions

- **Code identifiers are always English** — `data-theme` values, file names, variables, tokens (e.g. `data-theme="classic-dark"`). User-facing labels are the consuming app's concern, not the library's.
- TS is strict with `noUnusedLocals`/`noUnusedParameters` and `verbatimModuleSyntax` — type-only imports must use `import type`.
- Versioning is via **changesets**; releases run `pnpm build && changeset publish`.
