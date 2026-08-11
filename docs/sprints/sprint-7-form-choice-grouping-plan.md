# Sprint 7: Form Choice Grouping Architecture Plan

## Sprint Objective

Finalize the Form Control ecosystem by introducing structural grouping components (`BjjRadioGroup` and `BjjCheckboxGroup`). This sprint solves model delegation, layout standardization, and automated native grouping, bridging the gap between leaf inputs (Sprint 6) and global form state (Sprint 5).

## Architectural Problem

1. **Model Fragmentation:** Users currently must bind `v-model` individually to every `BjjRadio` and `BjjCheckbox`.
2. **Manual Attribute Management:** The `name` attribute for native radio exclusivity must be manually synchronized across multiple components to allow browser-native keyboard navigation.
3. **Layout Inconsistency:** There is no standardized way to stack radios or checkboxes (horizontal vs. vertical) with consistent spacing.
4. **State Precedence Gap:** Group-level states (e.g., disabling an entire group of radios, but not the whole form) require a new context layer between `BjjFormGroup` and the individual inputs.
5. **ID & Name Isolation:** Ensuring that group-level IDs do not pollute leaf-level inputs, and ensuring that group-level names strictly override leaf-level names to preserve accessibility and exclusivity.

## Why This is the Most Logical Next Step

With Sprint 5 handling global form wrappers and Sprint 6 handling individual boolean inputs, the architecture lacks the specific grouping layer required for choice-based inputs. Building this now strictly completes the standard data-entry foundation without needing external dependencies, preparing the framework for more complex overlay-based inputs (like `Select` or `Datepicker`) in future sprints.

## Component / API Scope

1. **`BjjRadioGroup`**: Wrapper for multiple `BjjRadio` components.
2. **`BjjCheckboxGroup`**: Wrapper for multiple `BjjCheckbox` components.
3. **`useChoiceGroup`**: Internal composable to manage Provide/Inject context for groups.

_(Explicitly Out of Scope: `BjjSelect`, Overlay positioning, `BjjTextarea`)_

## State & Model Contract

### 1. Model contract BjjRadioGroup

- **v-model type:** `any`
- **Child Read/Write:** Child reads `modelValue` from injected context. When toggled, the child invokes a `change(value)` function injected by the group. The group handles updating the actual `v-model`.
- **Standalone BjjRadio:** Retains 100% backward compatibility by safely falling back to its local `v-model` and local events when group context is absent.

### 2. Model contract BjjCheckboxGroup (Array Mutation Rules)

- **v-model type:** `any[]`
- **Strict Array Mutation Ownership:** `BjjCheckboxGroup` is the **ONLY** entity allowed to mutate the array model.
  - The group receives the array `modelValue`.
  - Child Checkbox merely sends a toggle intent (`toggle(value, checked)`) to the Group Context.
  - The Group inspects the array. If `checked` is true and the value is not in the array, it pushes the value (preventing duplicates). If `checked` is false, it filters the value out of the array.
  - `BjjCheckbox` **MUST NOT** directly mutate the array.
- **Standalone BjjCheckbox:** The existing Sprint 6 array/boolean handling for standalone checkboxes remains entirely unaffected and active when group context is absent.

## Native Radio Grouping (Name Precedence)

`BjjRadioGroup` strictly controls native radio grouping.

- The Group generates or receives a unified `name`.
- **Precedence Rule:** Group Context `name` **MUST OVERRIDE** local child `name`.
- If a child has `<BjjRadio name="custom">`, the group will ignore "custom" and force its own name on that child to prevent breaking the native exclusivity and arrow-key navigation.
- When `BjjRadio` is used standalone outside a group, its local `name` is respected identically to Sprint 6 behavior.

## ID Isolation Architecture

- `id` is strictly the identity of the **LEAF CONTROL**.
- `BjjRadioGroup` **MUST NOT** pass the `id` from `BjjFormGroup` down to the leaf `BjjRadio` elements.
- `BjjCheckboxGroup` **MUST NOT** pass the group `id` down to the leaf `BjjCheckbox` elements.
- Every child `BjjRadio` and `BjjCheckbox` **MUST** have a unique ID for `<label for="...">` matching.
  - If a child has an explicit local `id`, it is used exactly.
  - If a child has no local `id`, it generates its own fallback ID using the Sprint 6 established mechanism.
- The Group may possess its own ID for group-level accessibility (e.g., `aria-labelledby`), but this group ID is never applied to the child `<input>` tags.

**DOM Acceptance Criteria:**

```html
<div id="payment-method-group" role="radiogroup" aria-labelledby="...">
  <div class="bjj-radio">
    <input id="payment-card" name="payment-method" type="radio" />
    <label for="payment-card">Card</label>
  </div>
  <div class="bjj-radio">
    <input id="payment-bank" name="payment-method" type="radio" />
    <label for="payment-bank">Bank</label>
  </div>
</div>
```

_(All three IDs—the group, card input, and bank input—must be strictly distinct)._

## Form Control Integration & State Precedence Matrix

We do not use a single generic precedence rule for all attributes, because `name` and `id` have fundamentally different architectural roles than standard form states.

| Attribute          | Precedence                                  | Reasoning                                                                                           |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **`disabled`**     | Local defined > Group > FormGroup > Default | Explicit local `disabled="false"` wins over a disabled group. Follows standard Vue prop precedence. |
| **`error`**        | Local defined > Group > FormGroup > Default | Specific leaf errors can override or append to group errors.                                        |
| **`required`**     | Local defined > Group > FormGroup > Default | Similar to disabled/error.                                                                          |
| **`name`** (Radio) | **Group > Local > Default**                 | Group `name` **MUST OVERRIDE** local to ensure native radio exclusivity works flawlessly.           |
| **`id`**           | **Local > generated leaf fallback**         | Leaf inputs must have unique IDs. Group/Form ID is strictly isolated from leaf inputs.              |

## Accessibility (ARIA Contract)

- **Unique IDs:** Every radio/checkbox has a unique `id`.
- **Label Association:** Every label `for` points precisely to the correct leaf control ID.
- **Unified Names:** Radios within a group share the exact same `name`.
- **ID Isolation:** Group ID is never used as an input ID.
- **Group ARIA:** Group-level ARIA references (e.g., `aria-labelledby` on the `role="radiogroup"`) use the group's ID.
- **Leaf ARIA:** Leaf-level ARIA references (e.g., `aria-describedby` for errors) use leaf-level message IDs.
- **Orientation:** `orientation="horizontal" | "vertical"` maps to `aria-orientation`.

## CSS / BEM Strategy

- Namespaces: `.bjj-radio-group`, `.bjj-checkbox-group`.
- Layout Modifiers: `.bjj-radio-group--vertical`, `.bjj-radio-group--horizontal`.
- Uses `--bjj-spacing-2` or `--bjj-spacing-3` for gaps to maintain layout consistency.
- Strictly unscoped BEM architecture. Does not disrupt existing Sprint 6 leaf component CSS.

## Backward Compatibility

- **Standalone `BjjRadio` from Sprint 6 does not change.**
- **Standalone `BjjCheckbox` from Sprint 6 does not change.**
- Local `id` is always respected exactly.
- Local `name` is fully respected when standalone.
- Existing `v-model` behavior (boolean/array for Checkbox, value for Radio) remains exactly the same for standalone inputs.

## Dependency Boundaries

No external dependencies will be added. Only Vue 3 native APIs (`provide`, `inject`, `computed`) will be used.

## Test Acceptance Matrix

DOM-level acceptance tests must be explicitly implemented for the following:

**CheckboxGroup:**

- [ ] Boolean/array model semantics evaluate correctly.
- [ ] Group correctly adds value to array.
- [ ] Group correctly removes value from array.
- [ ] Duplicate values are prevented during add operations.
- [ ] Group strictly owns array mutation (child does not directly mutate model array).

**RadioGroup:**

- [ ] All children receive identical group `name`.
- [ ] Child local `name` is actively overridden inside the group.
- [ ] Local `name` remains fully respected when standalone.
- [ ] Radio values update group model correctly upon selection.

**ID Isolation:**

- [ ] Group ID `!=` child input ID.
- [ ] Every child receives a unique ID.
- [ ] Explicit child local ID is preserved exactly.
- [ ] `label[for]` `===` child `input[id]`.

**Form Integration:**

- [ ] Local > Group > FormGroup precedence is verified for `disabled`, `error`, and `required`.
- [ ] Group `name` override is verified for radios.
- [ ] ID isolation from `FormGroup` context is verified.

## Build Strategy

Standard Vite/Rollup build through `pnpm --filter @bangjeje/ui build`. No changes to build config.

## Expected File Changes

**New Files:**

- `packages/ui/src/components/radio-group/RadioGroup.vue`
- `packages/ui/src/components/radio-group/radio-group.ts`
- `packages/ui/src/components/radio-group/index.ts`
- `packages/ui/src/components/checkbox-group/CheckboxGroup.vue`
- `packages/ui/src/components/checkbox-group/checkbox-group.ts`
- `packages/ui/src/components/checkbox-group/index.ts`
- `packages/ui/src/composables/use-choice-group.ts` (or similar internal logic)
- `packages/ui/tests/components/radio-group.spec.ts`
- `packages/ui/tests/components/checkbox-group.spec.ts`

**Modified Files:**

- `packages/ui/src/index.ts` (Export new components)
- `packages/ui/src/components/radio/Radio.vue` (Refactor for group context injection)
- `packages/ui/src/components/checkbox/Checkbox.vue` (Refactor for group context injection)

## Risks / Architectural Trade-offs

- **Context Fallbacks**: Ensuring seamless fallback from Group Context to local props without triggering reactivity warnings requires careful computed wrapper implementations in the child components.
