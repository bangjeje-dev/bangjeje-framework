# Sprint 10: Select / Combobox Architecture

## 1. Sprint Objective

Establish the core architecture for the `BjjSelect` component family. This is the first complex form control that composes the existing Form Control (Sprint 5) and Floating Overlay (Sprint 9) architectures. The goal is to build a highly accessible, standard Select component (single-select) that is robust, testable, and strictly adheres to WAI-ARIA combobox/listbox specifications.

## 2. Component Architecture

We will implement a declarative, composable component API:

- **`BjjSelect`**: The root provider. Manages the `modelValue` state, the `isOpen` state (via underlying Popover), and coordinates the active DOM focus.
- **`BjjSelectTrigger`**: The button element users interact with. Displays the currently selected value or placeholder.
- **`BjjSelectContent`**: The floating container that teleports to the body.
- **`BjjSelectOption`**: The individual selectable items.

**Internal Context:**

- `selectInjectionKey`: Provides the selected value, select/highlight methods, and listbox ID to children.

## 3. Model Contract

- **`v-model:modelValue`**: Accepts primitive values (`string | number`). Object values are deferred to avoid complex equality checking in v1.
- **Selected State**: Tracked strictly by matching primitive `value` props.
- **Unselected State**: If `modelValue` is `undefined` or `null`, the select is unselected and the Trigger displays the `placeholder`.
- **Disabled State**: Inherited from FormContext or passed explicitly. Disables the trigger.
- **Clearable**: Out of scope for Sprint 10 to maintain focus on the core floating/combobox architecture.

## 4. Option Model

We will use **declarative options** to maximize composition flexibility.

```html
<BjjSelect v-model="selectedValue">
  <BjjSelectTrigger>
    <!-- Consumer is responsible for display logic, avoiding complex internal registries -->
    {{ options.find(o => o.value === selectedValue)?.label || 'Select...' }}
  </BjjSelectTrigger>
  <BjjSelectContent>
    <BjjSelectOption
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :disabled="opt.disabled"
    >
      {{ opt.label }}
    </BjjSelectOption>
  </BjjSelectContent>
</BjjSelect>
```

- Options do not need to "register" themselves with the parent via complex lifecycle hooks.
- State is resolved strictly by matching `BjjSelectOption.value` against `BjjSelect.modelValue`.
- The Trigger remains completely agnostic to the options, pushing display logic to the consumer (or a future `BjjSelectValue` helper).

## 5. Keyboard Navigation & Focus Model

**Focus Model:**
We will use **Roving Tabindex** (actual DOM focus) for navigation rather than `aria-activedescendant`.

- When closed, focus remains on the Trigger.
- When opened, focus moves to the `BjjSelectContent` (which delegates focus to the first selected or available option).
- `BjjSelectOption` elements manage their own focus state dynamically.

**Keyboard Behavior:**

- **`ArrowDown` / `ArrowUp`** (on Trigger): Opens the Select and focuses the first/last or selected option.
- **`ArrowDown`** (in Content): Focuses the next non-disabled option (non-wrapping).
- **`ArrowUp`** (in Content): Focuses the previous non-disabled option (non-wrapping).
- **`Home` / `End`**: Focuses the first / last non-disabled option.
- **`Enter` / `Space`**: Selects the focused option, closes the popover, and returns focus to the Trigger.
- **`Escape`**: Closes the popover without selection and returns focus to the Trigger.
- **`Tab`**: Closes the popover and allows natural browser tab progression.

## 6. ARIA Contract

Strict adherence to the WAI-ARIA 1.2 Combobox pattern:

- **Trigger (`BjjSelectTrigger`)**:
  - `role="combobox"`
  - `aria-expanded="true/false"`
  - `aria-controls="{listbox-id}"`
  - `aria-haspopup="listbox"`
- **Content (`BjjSelectContent`)**:
  - `role="listbox"`
  - `id="{listbox-id}"`
  - `aria-multiselectable="false"`
- **Option (`BjjSelectOption`)**:
  - `role="option"`
  - `aria-selected="true/false"`
  - `aria-disabled="true/false"` (if disabled)
  - `tabindex="-1"` (or `0` if active in roving focus)

## 7. Popover Integration

Select MUST seamlessly compose the Sprint 9 floating architecture without duplicating logic.

- `BjjSelect` will internally render a `<BjjPopover>` to provide the floating context.
- `BjjSelectTrigger` will wrap `<BjjPopoverTrigger>` but override its roles via Vue's fallthrough attributes: `<BjjPopoverTrigger role="combobox" aria-haspopup="listbox">`. It will also append keyboard listeners.
- `BjjSelectContent` will wrap `<BjjPopoverContent>` and override its role: `<BjjPopoverContent role="listbox">`.

By relying on attribute fallthrough, we inherit `useFloating`, `useClickOutside`, and positioning styles for free, with zero logic duplication.

## 8. Form Control Integration

`BjjSelect` will use `useFormControl` (from Sprint 5) to integrate with `BjjFormGroup`.

- Inherits `id`, `disabled`, `error`, `required`.
- Applies `aria-describedby` and `aria-invalid` to the Trigger element.
- The base `id` applies to the Trigger.

## 9. Single vs Multi Select

**Single-select only for Sprint 10.**
Multi-select fundamentally changes the model contract (Array vs Primitive), the ARIA contract (`aria-multiselectable`, focus persistence), and the UI (tags, checkboxes). This is explicitly deferred to validate the core architecture first.

## 10. Search / Combobox Scope

**Select only.**
A true combobox with an editable `<input type="text">` introduces significant complexity (typeahead filtering, distinct focus targets, composition events). We will build the architecture to _support_ a future `BjjCombobox`, but Sprint 10 is strictly a non-editable Select.

## 11. Empty / Loading States

Deferred to future scope.

## 12. ID Strategy

- Use `useId()` in `BjjSelect` to generate a unique `listboxId`.
- The `listboxId` is injected and applied to `BjjSelectContent`.
- The Trigger references it via `aria-controls`.
- The Trigger ID is generated via `useFormControl()`.

## 13. Public API

Exported from `packages/ui/src/index.ts`:

- `BjjSelect`
- `BjjSelectTrigger`
- `BjjSelectContent`
- `BjjSelectOption`

Internal composables and injection keys remain strictly private.

## 14. CSS / BEM

- Unscoped BEM: `.bjj-select-root`, `.bjj-select__trigger`, `.bjj-select__content`, `.bjj-select__option`.
- Options will use `--bjj-colors-primary` for active/selected backgrounds and text tokens for typography.

## 15. Backward Compatibility

- No changes permitted to `BjjInput`, `BjjCheckbox`, `BjjRadio`, `BjjSwitch`, `BjjDialog`, or the existing `BjjPopover` contracts.
- Modifying `BjjPopover` components to accept fallthrough attributes (if they don't already) is allowed provided the defaults remain intact.

## 16. Test Acceptance Matrix

The implementation must pass rigorous DOM-level tests:

| Category               | Required Assertions                                                                                 |
| :--------------------- | :-------------------------------------------------------------------------------------------------- |
| **Model**              | Updates correctly when options are clicked; trigger reflects state.                                 |
| **Form Control**       | Respects injected `disabled`, `error`, and `aria-describedby`.                                      |
| **ARIA**               | `role="combobox"`, `role="listbox"`, `role="option"`, `aria-selected` accurately bind to DOM state. |
| **Keyboard**           | `ArrowDown`/`Up` navigate options; `Enter` selects; `Escape` closes and restores focus.             |
| **Focus**              | Roving focus properly shifts `document.activeElement` between options.                              |
| **Popover**            | Content dynamically positions (inheriting Sprint 9 collision tests).                                |
| **Multiple Instances** | Opening one select does not affect another; IDs remain strictly unique.                             |

## 17. Explicit Out of Scope

- Multi-select arrays
- Typeahead search / text input
- Virtualized scrolling for massive lists
- Async remote option fetching
- Clearable buttons
- Option grouping (`<optgroup>`)

## 18. Architectural Trade-offs

By enforcing declarative `<BjjSelectOption>` without a central state registry, we avoid brittle component lifecycle synchronization. However, this shifts the burden of display logic (mapping `value` to `label` when closed) to the consumer. This is a common and acceptable trade-off for v1 headless/composable UI primitives, which can be mitigated in v2 by introducing a generic `<BjjSelectValue>` display helper.
