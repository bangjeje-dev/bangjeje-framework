# Bangjeje Framework

## Sprint 3 — Design Token System

### 1. Sprint Objective

Design and implement the foundational Design Token architecture for Bangjeje Framework. The token system will serve as the structural blueprint for visual values, replacing hardcoded values in future UI components. It will be a highly semantic, strongly-typed system.

### 2. Token vs Theme Relationship (Dependency Direction)

The architecture preserves a strict distinction:

- **Design Tokens (`@bangjeje/tokens`)**: Defines the structural blueprint, semantic roles, and base primitive values (the "Token Dictionary").
- **Theme (`@bangjeje/theme`)**: Defines specific visual values for those roles, resolves overrides, and manages CSS/DOM application.

The dependency chain remains unidirectional and clean:
`@bangjeje/theme` → depends on → `@bangjeje/tokens`

- `@bangjeje/tokens` will have **no** dependencies. It remains entirely framework-agnostic.
- `@bangjeje/theme` provides the actual default `light` theme implementation, which fulfills the Token Schema defined by `@bangjeje/tokens`.
- `@bangjeje/core` remains strictly independent from both.

### 3. Token Architecture (Primitive vs Semantic)

The system uses a strict two-tier approach natively:

- **Primitive Tokens (Base Scale)**: The raw immutable values (e.g., `blue.500`, `spacing.4`). These belong in `@bangjeje/tokens`.
- **Semantic Tokens (Role-based)**: The meaning assigned to primitives (e.g., `color.primary`, `color.surface`). `@bangjeje/tokens` defines the **schema/interface** for these roles, but `@bangjeje/theme` maps the actual values for its specific themes.
- **Component Tokens**: Not implemented. The system avoids premature component-specific abstractions.

### 4. Reconciled Token Categories

Based on framework requirements, categories are prioritized to prevent an unnecessarily huge catalog:

**Implemented in Sprint 3 (Minimum Coherent Architecture):**

- **Colors**: Semantic roles (`primary`, `background`, `surface`, `text`, `border`, `danger`, `success`, `warning`).
- **Typography**:
  - `fontFamily`: Primary (`Outfit`), Mono.
  - `fontSize`: xs, sm, base, md, lg, xl, 2xl.
  - `fontWeight`: normal, medium, semibold, bold.
  - `lineHeight`: tight, normal, relaxed.
  - `letterSpacing`: tight, normal, wide.
- **Spacing**: Standard proportional scale (e.g., 1, 2, 3, 4, 6, 8, 12, 16).
- **Border Radius**: none, sm, md, lg, full.
- **Shadows**: none, sm, md, lg.
- **Breakpoints**: sm, md, lg, xl, 2xl.
- **Z-index**: base, dropdown, sticky, fixed, modal, popover, tooltip.

**Architecturally Defined but Deferred:**

- Opacity, Animation, Transition, Elevation, Container, Grid, Icon Size.

### 5. Naming Conventions & CSS Variable Mapping

Tokens will map deterministically to a flat CSS Custom Property structure prefixed with `--bjj-`.

- Schema: `colors.primary` → CSS: `--bjj-color-primary`
- Schema: `spacing[4]` → CSS: `--bjj-spacing-4`
- Schema: `typography.fontSize.base` → CSS: `--bjj-font-size-base`

### 6. Theme Overrides & TypeScript API

To allow type-safe partial theme overrides without introducing a fragile, overly generic `DeepPartial` utility, the schema will use explicitly mapped partials:

```typescript
// In @bangjeje/tokens
export interface SemanticColors {
  primary: string;
  background: string; /* ... */
}
export interface TypographyScale {
  fontSize: Record<string, string>; /* ... */
}

export interface ThemeSchema {
  colors: SemanticColors;
  typography: TypographyScale;
  // ...
}

export interface ThemeOverrides {
  colors?: Partial<SemanticColors>;
  typography?: Partial<TypographyScale>; // explicitly mapped nested partials
  // ...
}
```

**Public API of `@bangjeje/tokens`:**
Consumers import strictly from the package root:
`import { primitiveColors, type ThemeSchema, type ThemeOverrides } from '@bangjeje/tokens';`
Internal source paths will not be exposed.

### 7. CSS/DOM Responsibilities & Automatic Flattening

`@bangjeje/tokens` is purely structural. It will **not** become a CSS utility package.

- `@bangjeje/theme` is strictly responsible for token resolution, theme state, CSS variable serialization (automatic object flattening), and `document.documentElement` injection.

### 8. Build Strategy

The package will follow the established standard:

- **Tool**: `tsup`
- **Output**: Dual CJS (`index.cjs`) and ESM (`index.js`), with TypeScript declarations (`index.d.ts`).
- **External Dependencies**: None. (No Vue, no core dependencies, no CSS libraries).

### 9. Out of Scope

- Dark mode.
- UI components (Typography, Buttons, Inputs).
- Design system documentation website.
- Component-specific tokens.
