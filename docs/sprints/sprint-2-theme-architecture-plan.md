# Bangjeje Framework

## Sprint 2 — Theme Architecture Implementation Plan

### 1. Sprint Objective

Design and implement the foundational theme architecture within the `@bangjeje/theme` package. This sprint establishes a scalable contract for themes, dynamic theme management via Vue composables, and the mechanism for applying theme values as CSS Custom Properties (variables) to the DOM.

### 2. Integration with @bangjeje/core (Dependency Direction)

- **Dependency Flow**: `@bangjeje/theme` will use `@bangjeje/core` as a standard runtime workspace dependency (`workspace:*`). `@bangjeje/core` will remain completely agnostic of `@bangjeje/theme`. Vue will be declared as a `peerDependency` aligned with the existing workspace version (`^3.5.40`).
- **Actual Integration Point**: Inspection of `@bangjeje/core/src/config/types.ts` confirms that `BangjejeConfig` currently includes a `theme?: string` property. This property acts as the initial integration point. The theme plugin will use `useBangjejeConfig()` to read this static, immutable configuration and use it as the initial active theme upon initialization.

### 3. Re-evaluating the Two-Plugin Architecture

**Developer Experience**:

```ts
import { BangjejeUI } from "@bangjeje/core";
import { BangjejeTheme } from "@bangjeje/theme";

app.use(BangjejeUI, { theme: "light" }); // Core provides immutable baseline config
app.use(BangjejeTheme, {/* theme options */}); // Theme provides reactivity and CSS effects
```

**Why this is preferable**:
A two-plugin approach keeps the architecture perfectly clean. If we merged these into a single `app.use(BangjejeUI, { themeOptions })` call, `@bangjeje/core` would either need to know about theme definitions and typings (forcing a dependency on `@bangjeje/theme`) or `@bangjeje/theme` would have to intercept core initialization. By keeping them separate, `@bangjeje/core` remains a foundational primitive. Consumers can opt-out of `@bangjeje/theme` entirely if they choose to build a custom theming solution, fulfilling the architectural requirement of uncoupled foundations.

### 4. Theme Contract & Interfaces (Strictly Minimal)

We will define the minimum TypeScript interfaces required to prove the architecture, avoiding a full design token catalog.

- `ThemeDefinition`: An object containing raw CSS values. For Sprint 2, it will only contain a basic placeholder structure to prove the serializer works (e.g., `{ colors: { primary: string, background: string } }`).
- `BangjejeThemeOptions`: Configuration options passed to the theme plugin containing the theme catalog (e.g., `{ themes: { light: ThemeDefinition } }`).
- **Light Mode Only**: For this sprint, only the foundational structures will be created, and we will implement a basic `light` theme. We will not implement Dark Mode or other production themes (like Corporate/Minimal) yet, though the type structures will easily support them in the future.

### 5. Active Theme Management (Lightweight)

Runtime theme switching will be extremely lightweight. We will not introduce complex state-management abstractions like Pinia or Vuex.

- **State**: The `BangjejeTheme` plugin will initialize a simple Vue `ref<string>` representing the active theme name.
- **Injection**: A strictly typed `ThemeContext` will be `provide`d, exposing the active theme `ref` and a simple `setTheme(name: string)` updater function.
- **Composable**: `useTheme()` will inject this context, allowing UI components or developer apps to cleanly read and toggle the active theme without massive overhead.

### 6. CSS Custom Property Architecture (Output Mechanism)

The architecture explicitly dictates that theme values flow unidirectionally to the DOM:
**Theme Definition → CSS Variable Serializer → `document.documentElement` → Future UI Components**

- **Naming Convention**: The framework will strictly use the `--bjj-` prefix to avoid collisions with user applications.
  - E.g., `colors.primary` becomes `--bjj-color-primary`.
- **Mechanism**: A reactive side-effect (`watchEffect` or a direct DOM setter upon theme change) will serialize the active `ThemeDefinition` object into CSS Custom Properties and apply them directly to `:root`. Future UI components will solely consume these `var(--bjj-...)` strings instead of hardcoding any values.

### 7. Package Build Strategy

Following Sprint 1, `@bangjeje/theme` will use `tsup` for a zero-config, dual-format (ESM/CJS) build with `.d.ts` generation.

### 8. Out of Scope

- Full design token catalog (spacing scales, typography scales, extensive color palettes).
- Implementing Dark Mode or alternative themes.
- Modifying `@bangjeje/core` architecture.
- Implementing UI components (Button, Input, Layouts, etc.).

### 9. Verification Plan

1. Add Vitest and `jsdom` to `@bangjeje/theme`.
2. Test that `BangjejeTheme` correctly extracts `useBangjejeConfig().theme` as its initial state.
3. Test that `useTheme().setTheme('some-theme')` successfully mutates the lightweight active theme reference.
4. Test the CSS Variable Serializer to ensure `--bjj-` variables are correctly mounted on `document.documentElement.style`.
5. Run workspace `pnpm build`, `lint`, and `format`.
