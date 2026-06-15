# Diseño: Librería de componentes `@nextui-ux/react`

> Fecha: 2026-06-15
> Estado: Aprobado (brainstorming) — pendiente plan de implementación

## 1. Propósito y contexto

Construir un design system de componentes React reutilizable. **Interno-primero** (para reutilizar en proyectos propios) pero **construido con buenas prácticas para poder abrirse a open source** sin reescribir nada.

Principio rector: **pocos componentes con una fundación sólida** (tokens, theming, sistema de variantes, build, accesibilidad) **antes que muchos componentes a medias**.

## 2. Restricciones y decisiones de arquitectura

| Decisión | Elección | Razón |
|---|---|---|
| Scope npm | `@nextui-ux/react` | — |
| Stack consumidor | Next.js App Router | RSC-aware: solo componentes interactivos llevan `'use client'`; el build PRESERVA esas directivas |
| Estilos | Tailwind CSS v4 | Cero runtime, theming por variables CSS, ecosistema dominante |
| Headless base | Radix UI | Madurez, accesibilidad probada, máximo material de aprendizaje y recetas (shadcn) |
| Distribución | Paquete npm | Versionado semver, se actualiza una vez y se propaga |
| Estructura repo | Un solo paquete (Opción A) | YAGNI: un monorepo resuelve un problema (múltiples paquetes) que aún no existe |
| Dev & Docs | Storybook | Estándar de industria; desarrollo aislado + docs + tests de a11y/interacción |
| Sistema de variantes | CVA + `tailwind-merge` + `clsx` | Lo que usa shadcn; mil ejemplos de referencia |
| Build | `tsup` (esbuild) | ESM+CJS, genera `.d.ts`, externaliza React, preserva `'use client'` |
| Testing | Vitest + React Testing Library + `axe` | Interacción + accesibilidad automática |
| Versionado/release | Changesets | Semver, changelog y publicación profesional desde el día uno |
| Íconos | `lucide-react` (peer recomendado) | No se empaqueta; el consumidor lo instala |

## 3. Estructura del repositorio

```
nextUI-UX/
├── src/
│   ├── components/                 # un folder por componente
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.stories.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   ├── lib/
│   │   └── cn.ts                   # clsx + tailwind-merge
│   ├── styles/
│   │   ├── tokens.css              # @theme: contrato de tokens semánticos
│   │   └── themes/                 # un archivo por tema (identificadores en inglés)
│   │       ├── classic-light.css
│   │       ├── classic-dark.css
│   │       └── purple-night.css
│   ├── theme/
│   │   └── ThemeProvider.tsx       # wrapper sobre next-themes
│   └── index.ts                    # barrel export público
├── .storybook/
├── tsup.config.ts
├── package.json
├── tsconfig.json
└── docs/
```

## 4. Sistema de estilos y theming (multi-tema)

### 4.1 Tokens semánticos (el contrato)

Los componentes **NUNCA hardcodean colores**. Solo referencian roles semánticos. Esta es la decisión que habilita el multi-tema sin tocar componentes.

Set de tokens v1:

```
--background            --primary           --border
--foreground            --primary-foreground --input
--card                  --secondary         --ring
--card-foreground       --secondary-foreground --radius
--muted                 --accent
--muted-foreground      --accent-foreground
--destructive           --destructive-foreground
```

Un componente escribe `bg-[--primary] text-[--primary-foreground]` — es CIEGO al color real.

### 4.2 Temas

Un tema es un **mapa de valores** para esos tokens, aplicado por atributo. **El identificador del tema va en inglés**; la etiqueta visible la decide la app consumidora.

```css
[data-theme="classic-dark"] {
  color-scheme: dark;
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  /* resto de roles */
}
```

Cambiar de tema = cambiar `data-theme` en `<html>`. Instantáneo, todos los componentes reaccionan solos.

### 4.3 Switch de tema

`next-themes` configurado con `attribute="data-theme"` y una lista arbitraria de temas (NO se limita a claro/oscuro). Maneja el FOUC inicial en App Router. Se expone un `<ThemeProvider>` que envuelve a `next-themes`.

### 4.4 Alcance de temas en v1

**Sistema completo + 3 temas de ejemplo**, para probar light, dark y acento de marca. Identificador técnico en inglés / etiqueta de presentación sugerida:

| `data-theme` (código) | Etiqueta sugerida (UI) | Esquema |
|---|---|---|
| `classic-light` | Claro Clásico | LIGHT |
| `classic-dark` | Oscuro Clásico | DARK |
| `purple-night` | Morado Noche | DARK (acento fuerte) |

Agregar más temas después = solo un archivo CSS nuevo. No requiere cambios de código.

### 4.5 Distribución del CSS

El paquete envía una hoja precompilada que el consumidor importa una vez:

```ts
import '@nextui-ux/react/styles.css'  // tokens + temas + estilos base
```

Funciona SIN que el consumidor configure Tailwind. El theming se personaliza sobreescribiendo variables CSS.

## 5. Sistema de variantes

Cada componente define variantes tipadas con CVA:

```ts
const button = cva('inline-flex items-center justify-center rounded-[--radius] ...', {
  variants: {
    variant: { default: '...', destructive: '...', outline: '...', ghost: '...' },
    size: { sm: '...', md: '...', lg: '...', icon: '...' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})
```

El helper `cn` (clsx + tailwind-merge) resuelve conflictos de clases del consumidor.

## 6. Componentes v1 (Foundation Set — 9)

Uno o más por categoría para estresar toda la arquitectura:

| # | Componente | Categoría | Qué valida |
|---|---|---|---|
| 1 | Button | Atom interactivo | Sistema CVA (variant/size), estados |
| 2 | Input | Form base | Estados (error, disabled, focus-ring) |
| 3 | Badge | Display | Variantes simples sin estado |
| 4 | Card | Layout | Composición de slots (Header/Content/Footer) |
| 5 | Checkbox | Form (Radix) | Estado controlado + indeterminado |
| 6 | Switch | Form (Radix) | Estado controlado + animación toggle |
| 7 | Tooltip | Overlay ligero (Radix) | Portal + posicionamiento |
| 8 | Dialog | Overlay completo (Radix) | Focus trap, teclado (Esc), portal, overlay |
| 9 | Tabs | Navegación (Radix) | Estado compartido entre piezas |

Cada componente nace con: `*.tsx`, `*.stories.tsx`, `*.test.tsx`, `index.ts`.

## 7. Contratos de API (principios)

- **Composición sobre configuración**: componentes compuestos (Card.Header, Dialog.Trigger) siguen el patrón de Radix.
- **`asChild` / forwardRef**: todos los componentes reenvían `ref` y aceptan `className` para extensión.
- **`'use client'`** solo en componentes con interactividad/estado (Dialog, Tooltip, Tabs, Checkbox, Switch). Button/Input/Badge/Card pueden ser server-safe salvo que usen handlers.

## 8. Testing

- **Interacción**: Vitest + React Testing Library por componente.
- **Accesibilidad**: `axe` automático — un componente que falla a11y se considera roto.
- **Visual/manual**: stories de Storybook por variante y estado.

## 9. Build y publicación

- **`tsup`**: salida ESM + CJS, `.d.ts`, externaliza `react`/`react-dom`, preserva banners `'use client'`, tree-shakeable.
- **Exports**: `package.json#exports` con entradas para JS y `./styles.css`.
- **Changesets**: gestión de versiones, changelog y publish.

## 10. Tooling base

TypeScript estricto, ESLint + Prettier.

## 10.1 Convenciones de código

- **Identificadores siempre en inglés** (variables, archivos, tokens, valores `data-theme`). Las etiquetas visibles para el usuario las decide la app consumidora.
- **Comentarios cortos y precisos.** Describen el estado actual de lo que hace el código (qué ES), nunca el cambio que se hizo (nada de "se cambió", "se rehizo", "ahora hace X").

## 11. Fuera de alcance (v1 — explícito)

- Los otros 8 temas de la imagen de referencia (se agregan post-v1 como CSS).
- Componentes más allá del Foundation Set (Dropdown, Popover, Toast, Select, Combobox, Table, etc.).
- Monorepo / paquetes separados (`icons`, `tokens`).
- Sitio de docs propio (Storybook cubre v1).
- Registry tipo shadcn (copy-paste).

## 12. Camino de evolución (post-v1)

1. Ampliar catálogo de temas (los 11 de la referencia).
2. Más componentes por categoría siguiendo los mismos patrones.
3. Si se separan paquetes → migrar a monorepo (Turborepo + pnpm).
4. Opcional: exponer registry shadcn para consumidores que quieran "ownear" el código.
