# Sprint 5: Form Control Architecture Plan

## 1. Sprint Objective

Establish the composable Form Control Architecture for `@bangjeje/ui`. This sprint focuses on decoupling the monolithic `BjjInput` component into composable, highly accessible primitives (`FormGroup`, `Label`, `FormMessage`) connected via Vue's Dependency Injection (`provide`/`inject`), while strictly maintaining 100% backward compatibility with the Sprint 4 public API.

## 2. Current Repository Context

- **`@bangjeje/core`**: Stable DI and configuration context.
- **`@bangjeje/tokens`**: Stable primitive schema for colors, typography, spacing.
- **`@bangjeje/theme`**: Stable engine generating `--bjj-*` CSS variables based on tokens.
- **`@bangjeje/ui`**: Contains a monolithic `BjjInput` component that currently hardcodes its wrapper, label, and error message into a single SFC.

## 3. Architectural Problem / Need

Currently, `BjjInput` handles its own label and error rendering. As we prepare to add `Select`, `Textarea`, `Checkbox`, `Radio`, and `Switch` in future sprints, duplicating this wrapper and validation logic across every component will lead to visual inconsistencies, brittle layouts, and poor maintainability.

More importantly, ensuring strict WAI-ARIA compliance (linking `label for`, `input id`, and `aria-describedby` error messages) becomes fragile if handled manually per component. We need a robust architecture to decouple the form layout from the specific input control, while guaranteeing automated accessibility linkages and preserving the legacy API without introducing CSS or DOM breakages.

## 4. Form Context Definition

The FormContext will be strictly limited to the shared state required to link labels, inputs, and validation messages. No global form state, validation engines, or field registration systems will be introduced.

```typescript
// Internal strictly-typed context
export interface FormContext {
  id: Ref<string>;
  disabled: Ref<boolean | undefined>;
  error: Ref<string | boolean | undefined>;
  required: Ref<boolean | undefined>;
}
```

## 5. Shared Logic Architecture

To avoid structural dependencies, recursion, and DOM changes, the core logic will be extracted into a shared internal composable: `useFormControl`.

**Architecture Flow:**

```text
Legacy BjjInput
        ↓
useFormControl (Resolves ID, disabled, error)
        ↓
Renders legacy Sprint 4 DOM (.bjj-input__wrapper, .bjj-input__label)

New Composed API
        ↓
BjjFormGroup (Provides FormContext)
        ↓
BjjLabel / BjjFormMessage (Consumes context for UI)
BjjInput (Consumes context via useFormControl)
        ↓
Renders bare <input> (No wrapper)
```

## 6. Composition Model

We officially support three usage patterns, all powered by `useFormControl`:

### Pattern A: New Composed Usage (Recommended)

```html
<BjjFormGroup :error="errorMessage" disabled>
  <BjjLabel>Email</BjjLabel>
  <BjjInput v-model="email" />
  <BjjFormMessage />
</BjjFormGroup>
```

Produces fully linked ARIA attributes, derived from the FormGroup's ID. `BjjInput` renders only the bare `<input>` element.

### Pattern B: Legacy Usage (Backward Compatible)

```html
<BjjInput label="Email" error="Invalid email" v-model="email" disabled />
```

If `BjjInput` detects `label` or `error` props, it uses an internal `v-if` branch to render the **exact same DOM structure** as Sprint 4 (`.bjj-input__wrapper`, `.bjj-input__label`). It does **not** recursively wrap itself in `BjjFormGroup`. This ensures 100% CSS and DOM compatibility for existing consumers.

### Pattern C: Standalone Usage

```html
<BjjInput v-model="searchQuery" aria-label="Search" />
```

Functions as a raw input control. Generates its own internal ID without providing wrappers or form contexts.

## 7. Backward Compatibility & Migration

The Sprint 4 `BjjInput` public API **MUST NOT** be silently broken.

- **Preserved Props**: `modelValue`, `type`, `size`, `placeholder`, `label`, `error`, `disabled`, `readonly`.
- **Existing `v-model` Behavior**: Remains unchanged.
- **Legacy Rendering**: Legacy props trigger the legacy DOM rendering branch inside `BjjInput.vue`. No additional wrapper elements are introduced compared to Sprint 4. Label and error placement remains identical.
- **Deprecation Warning**: Using the legacy `label` and `error` props on `BjjInput` will emit a console warning in development mode, instructing developers to migrate to the composed `<BjjFormGroup>` syntax. Removal is deferred to a future major version.

## 8. State Precedence Matrix

Both legacy mode and composed mode use the **exact same state resolution rules** via `useFormControl`:

**Rule: Explicit Local Prop > Injected Context > Component Default**

For boolean props (`disabled`, `required`), Vue treats "not provided" as `undefined` (when using `boolean | undefined` types) or `false`. We will structure `useFormControl` as follows:

| Property     | Local Prop      | Context Prop      | Resulting State                   |
| :----------- | :-------------- | :---------------- | :-------------------------------- |
| **id**       | `"custom-id"`   | `"group-id"`      | `"custom-id"`                     |
| **id**       | `undefined`     | `"group-id"`      | `"group-id"`                      |
| **id**       | `undefined`     | `undefined`       | `useId()` (Standalone)            |
| **disabled** | `true`          | `false`           | `true`                            |
| **disabled** | `false`         | `true`            | `false` (Local explicit override) |
| **disabled** | `undefined`     | `true`            | `true`                            |
| **disabled** | `undefined`     | `undefined`       | `false` (Default)                 |
| **error**    | `"Local Error"` | `"Context Error"` | `"Local Error"`                   |
| **error**    | `undefined`     | `"Context Error"` | `"Context Error"`                 |
| **error**    | `undefined`     | `undefined`       | `false` / `undefined`             |

_Note: For this rule to work correctly, local boolean props must be typed to allow `undefined` so we can distinguish between an explicit `false` and an unprovided prop._

## 9. ID Generation

Requirements for ID generation:

- Uses Vue 3.5's native `useId()` to guarantee collision safety.
- The base ID (`fieldId`) is either provided explicitly by the user, or generated automatically.
- Component IDs derive deterministically from the base `fieldId`:
  - **Field ID**: `bjj-input-{id}` (e.g. `bjj-input-v-0`)
  - **Message ID**: `{fieldId}-message` (e.g. `bjj-input-v-0-message`)

## 10. ARIA Contract

The architecture guarantees the following strict WAI-ARIA relationships for BOTH composed and legacy modes:

- **Label Linking**: `<label>` dynamically binds `for="{fieldId}"` matching the `<input>`'s `id="{fieldId}"`.
- **Error Linking**: If an error exists, the `<input>` dynamically binds `aria-describedby="{fieldId}-message"`, which precisely matches the message element's `id="{fieldId}-message"`.
- **Error Status**: The `<input>` binds `aria-invalid="true"` strictly when an error is present (either string or boolean `true`).
- **Disabled Status**: The `<input>` sets the native `disabled` attribute and `aria-disabled="true"` when the merged disabled state is true.
- **Omission**: `aria-describedby` is completely omitted when no error message exists to prevent orphaned references.

## 11. Public API Contract

The `packages/ui/src/index.ts` file will explicitly export:

**Public Exports (Intended for Consumers):**

- `BjjFormGroup`
- `BjjLabel`
- `BjjFormMessage`
- `BjjInput`

**Internal / Private (Not Exported Publicly):**

- `useFormControl` (Composable)
- `FormContextKey` (Injection Token)
- `FormContext` (Interface)

Implementation utilities remain strictly internal to avoid locking the framework into premature abstraction patterns.

## 12. Styling

Styling architecture remains exactly as defined in Sprint 4:

- Unscoped BEM CSS (`.bjj-form-group`, `.bjj-label`, `.bjj-form-message`).
- Legacy BEM classes (`.bjj-input__wrapper`, `.bjj-input__label`, `.bjj-input__error-message`) are preserved when legacy props are used.
- `bjj-*` namespace.
- Direct consumption of `--bjj-*` CSS variables generated by the Theme engine (e.g., `--bjj-colors-danger`, `--bjj-typography-font-size-sm`).
- No hardcoded colors, spacing, or typography.

## 13. Dependency Boundaries

- **Sprint 5 modifies ONLY `@bangjeje/ui`**.
- `@bangjeje/core`, `@bangjeje/theme`, and `@bangjeje/tokens` MUST remain untouched. No new package dependencies are allowed.

## 14. Test Acceptance Matrix

Testing will use `vitest` + `@vue/test-utils` and requires strict DOM-level assertions.

| Component       | Scenario             | Required Assertion                                                                                    |
| :-------------- | :------------------- | :---------------------------------------------------------------------------------------------------- |
| **FormGroup**   | Context Provisioning | Children components correctly receive `id`, `disabled`, and `error` states.                           |
| **Label**       | DOM `for` Linking    | `label.attributes('for') === expectedId`                                                              |
| **FormMessage** | DOM `id` Linking     | `message.attributes('id') === expectedId`                                                             |
| **FormMessage** | Empty State          | Does not render DOM when error is falsy.                                                              |
| **BjjInput**    | New Composed API     | `input.attributes('id') === label.attributes('for')`                                                  |
| **BjjInput**    | ARIA Error Linking   | `input.attributes('aria-describedby') === message.attributes('id')`                                   |
| **BjjInput**    | ARIA Invalid         | `input.attributes('aria-invalid')` exists only when error is present.                                 |
| **BjjInput**    | Standalone API       | Generates valid `id`, manages local state correctly.                                                  |
| **BjjInput**    | Legacy API (Props)   | Renders exact Sprint 4 wrapper DOM, maintains identical CSS selectors, and emits deprecation warning. |
| **BjjInput**    | Precedence           | Explicit `disabled="false"` prop overrides `<FormGroup disabled>` context.                            |

## 15. Explicit Out of Scope

This sprint is purely architectural. We will NOT implement:

- Select, Checkbox, Radio, Switch, or Textarea.
- Client-side validation libraries (Zod, VeeValidate).
- Form submission handling.
- Global form state management or field registration.

---

### Final Approval Checklist

- [x] No Sprint 4 public API is silently removed
- [x] State precedence is deterministic
- [x] FormContext remains minimal
- [x] Legacy BjjInput remains functional with 100% DOM/CSS compatibility
- [x] New composition API is functional
- [x] ARIA relationships are explicitly defined
- [x] DOM-level accessibility tests are required
- [x] Public exports are explicitly defined
- [x] Only @bangjeje/ui is modified
- [x] No unnecessary dependencies are introduced
