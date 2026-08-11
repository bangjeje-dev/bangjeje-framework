# Sprint 6: Boolean Data Entry Primitives Plan

## Sprint Objective

Complete the foundational data entry layer by implementing boolean-state form controls (`BjjCheckbox`, `BjjRadio`, `BjjSwitch`). This sprint serves as the ultimate validation of the Sprint 5 Form Control Architecture by extending `useFormControl` beyond standard text inputs into choice-based and boolean paradigms.

## Current Repository Context

- **Sprint 4** established the baseline component structure (`BjjButton`, `BjjInput`) and Unscoped BEM CSS token consumption.
- **Sprint 5** decoupled form state into a composed architecture (`BjjFormGroup`, `BjjLabel`, `BjjFormMessage`, `useFormControl`), proving it works flawlessly for text inputs.
- The repository currently lacks choice-based primitives (boolean/radio), leaving the form control ecosystem incomplete.

## Architectural Problem

The Form Control architecture currently only accommodates text-based `BjjInput`. Boolean and choice-based controls (`BjjCheckbox`, `BjjRadio`, `BjjSwitch`) have fundamentally different structural and accessibility requirements:

1. **Value Binding:** They bind to `checked` (boolean or array) rather than `value` (string).
2. **Visual Structure:** The native `<input type="checkbox">` is notoriously difficult to style uniformly across browsers. We must hide the native input visually while keeping it accessible, rendering a custom stylistic facade in its place.
3. **Accessibility:** `BjjSwitch` requires `role="switch"` and `aria-checked`, unlike standard checkboxes.

## Proposed Solution

Implement `BjjCheckbox`, `BjjRadio`, and `BjjSwitch` as controlled Vue components that:

1. Consume `useFormControl` identically to `BjjInput`, inheriting `disabled`, `error`, and `required` states.
2. Utilize visually-hidden native `<input>` elements to maintain flawless keyboard navigation and form submission compatibility.
3. Render custom CSS-based facades (using `--bjj-*` tokens) to ensure pixel-perfect cross-browser design.
4. Support standalone, legacy prop (`label`), and composed `BjjFormGroup` usage.

## Component/Module Scope

1. **`BjjCheckbox`**: A multi-choice or boolean toggle.
2. **`BjjRadio`**: A single-choice selector.
3. **`BjjSwitch`**: A boolean toggle with a distinct sliding visual metaphor.

_(Note: Grouping wrapper components like `BjjCheckboxGroup` or `BjjRadioGroup` are deferred to a later sprint)._

## Dependency Direction

Remains unchanged:
`@bangjeje/tokens` ← `@bangjeje/theme` ← `@bangjeje/ui`
No new external dependencies will be added.

## Public API

The following new components will be exported from `@bangjeje/ui/src/index.ts`:

- `BjjCheckbox`
- `BjjRadio`
- `BjjSwitch`

No internal composables (e.g., `useFormControl`) will be leaked in the public export.

## v-model Contracts

**`BjjCheckbox`**

- Supports both boolean and array multi-select.
- `modelValue`: `boolean | any[]`
- `value`: `any` (Used as the identifier when bound to an array)
- Behavior: If `modelValue` is an array, checking the box pushes `value` into the array, unchecking removes it. If `modelValue` is boolean, it simply toggles `true/false`.

**`BjjRadio`**

- `modelValue`: `any`
- `value`: `any` (Required)
- Behavior: The radio is checked strictly when `modelValue === value`.

**`BjjSwitch`**

- Strictly boolean model semantics.
- `modelValue`: `boolean`
- Behavior: Toggles between `true` and `false`. Does not support array binding.

## State Management Strategy (Form Control Integration)

All three components will internally call `useFormControl(props)` exactly as `BjjInput` does.

- **Precedence:** `Explicit Local Prop > FormGroup Context > Component Default`.
- **ID Generation:** Will use the same `id` and `fieldId` logic from `useFormControl`, preserving explicit IDs and generating `bjj-input-` prefixed fallbacks.
- **State Merging:** Do NOT duplicate merging logic. Pass props directly to `useFormControl` and consume `mergedDisabled`, `mergedError`, `mergedRequired`, `fieldId`, and `messageId`.

## Accessibility & DOM Acceptance Criteria

**`BjjCheckbox`:**

- Native `<input type="checkbox">`.
- Checked state mapped to native `checked` property.
- Disabled state mapped to native `disabled` attribute and `aria-disabled`.
- Label associated via `for` matching the `<input id>`.

**`BjjRadio`:**

- Native `<input type="radio">`.
- Grouping behavior handled via the `name` attribute (either provided or auto-generated based on form context).
- Label associated via `for` matching the `<input id>`.

**`BjjSwitch`:**

- Native `<input type="checkbox">` underneath (to inherit native spacebar toggling).
- Explicit `role="switch"`.
- Explicit `aria-checked="true|false"` reflecting the checked state.
- `aria-disabled` and `disabled` reflecting disabled state.

**Common ARIA:**

- `aria-describedby` and `aria-invalid` will map to the context message ID when an error exists, matching `BjjInput`.

## Native Input Strategy & Keyboard Interaction

- **Strategy:** The native `<input>` element remains the actual interaction mechanism. We will not replace them with `div` or `button` elements.
- **Keyboard:** Because we use native `<input type="checkbox">` and `<input type="radio">`, Spacebar toggle and arrow-key navigation (for radio groups) are preserved automatically by the browser. We will NOT write custom `keydown` listeners for these basic interactions.
- **Focus:** The visually-hidden native `<input>` will receive focus. The CSS will target the custom facade using the adjacent sibling selector (`.bjj-checkbox__input:focus-visible + .bjj-checkbox__facade`) to render a focus ring.

## Token Compatibility

All visual states can be implemented using existing Sprint 3 tokens:

- **Checked State:** `--bjj-colors-primary` (background/border)
- **Unchecked State:** `--bjj-colors-surface` (background), `--bjj-colors-border` (border)
- **Checkmark/Thumb:** `--bjj-colors-background` (assuming white/base contrast)
- **Disabled:** Reduce opacity or use `--bjj-colors-border` for backgrounds.
- **Focus Ring:** `--bjj-colors-primary` combined with CSS `outline` or `box-shadow`.
- **Error Ring:** `--bjj-colors-danger`.
- **Sizing/Radius:** `--bjj-radius-*`, `--bjj-spacing-*`.

**No new tokens will be added in Sprint 6.**

## CSS/BEM Strategy

Unscoped BEM architecture will be maintained.
Namespaces:

- `.bjj-checkbox`, `.bjj-radio`, `.bjj-switch` (Wrapper)
- `.bjj-checkbox__input`, `.bjj-radio__input`, `.bjj-switch__input` (Visually hidden native input)
- `.bjj-checkbox__facade`, `.bjj-radio__facade`, `.bjj-switch__track`, `.bjj-switch__thumb` (Custom visual elements)

State Modifier Classes (applied to the wrapper):

- `.is-checked`
- `.is-disabled`
- `.has-error`
- `.is-required`

## Backward Compatibility Strategy

- `BjjInput` and `BjjButton` remain completely unaffected.
- `@bangjeje/core`, `@bangjeje/theme`, and `@bangjeje/tokens` remain completely unaffected.
- No existing public APIs or components will be modified.

## File Structure

```text
packages/ui/src/components/
├── checkbox/
│   ├── Checkbox.vue
│   ├── checkbox.ts
│   └── index.ts
├── radio/
│   ├── Radio.vue
│   ├── radio.ts
│   └── index.ts
└── switch/
    ├── Switch.vue
    ├── switch.ts
    └── index.ts
```

## Testing Strategy

Explicit DOM-level tests must be written for all components using `vitest` + `@vue/test-utils` covering:

- **v-model**: Emits correct values (boolean, array, radio values).
- **Checked state**: Renders `.is-checked` class and native `checked` attribute.
- **Disabled state**: Renders `.is-disabled` and `disabled`/`aria-disabled` attributes.
- **Required state**: Renders `.is-required` and native `required`.
- **Error state**: Renders `.has-error` and `aria-invalid="true"`.
- **ID generation & Label association**: Validates explicit IDs and `label[for]` mappings.
- **Keyboard interaction**: Ensures native input is targetable and focuses properly.
- **ARIA attributes**: Verifies `aria-describedby` when in error state.
- **FormGroup context precedence**: Context values override defaults; local props override context.
- **Standalone usage**: Functions properly without a `FormGroup`.
- **Switch-specific tests**: Validates `role="switch"`, `aria-checked`, and `aria-disabled`.

## Explicit Out of Scope

- `CheckboxGroup` or `RadioGroup` wrapper components.
- An `@bangjeje/icons` architecture integration.
- Tooltips, Popovers, or any overlay elements.

## Final Approval Checklist

- [x] Does this build logically upon Sprint 5 without redundant refactoring?
- [x] Is the scope sufficiently constrained to just boolean/choice primitives?
- [x] Are all architectural constraints (BEM, tokens, context) respected?
