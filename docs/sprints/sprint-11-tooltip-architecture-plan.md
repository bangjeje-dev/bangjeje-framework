# Sprint 11 — Tooltip Architecture Plan

## Objective

Implement a robust, accessible Tooltip component family based on the floating overlay architecture established in Sprint 9. Unlike Popovers (which are click-triggered), Tooltips are triggered by **hover** and **focus** events. This introduces the need for precise delay management (enter/leave delays) to prevent visual flickering and provide a smooth user experience.

Tooltips logically complete the initial suite of overlay/floating components (Dialog, Popover, Select, Tooltip).

## Proposed Components

1. **`BjjTooltip`**
   - The root container that manages the open/close state, delay timers, and provides the tooltip context.
2. **`BjjTooltipTrigger`**
   - The interactive element that triggers the tooltip on `mouseenter`, `mouseleave`, `focusin`, and `focusout`.
   - Automatically maps `aria-describedby` to the tooltip content ONLY when the tooltip is open.
3. **`BjjTooltipContent`**
   - The floating element containing the tooltip text.
   - Teleported to the `body`.
   - Uses the internal `useFloating` composable for positioning relative to the trigger.

## Public API

```vue
<template>
  <BjjTooltip :open-delay="200" :close-delay="150" placement="top" :offset="8">
    <BjjTooltipTrigger>
      <BjjButton>Hover me</BjjButton>
    </BjjTooltipTrigger>

    <BjjTooltipContent> This is a helpful tooltip. </BjjTooltipContent>
  </BjjTooltip>
</template>
```

### Props

**BjjTooltip**

- `modelValue?`: `boolean` (optional controlled state)
- `openDelay?`: `number` (default: 200ms)
- `closeDelay?`: `number` (default: 150ms)
- `placement?`: `PopoverPlacement` (default: 'top')
- `offset?`: `number` (default: 8)

### Emits

- `update:modelValue(value: boolean)`

## Architecture Details

### Controlled / Uncontrolled State

- **Uncontrolled State**: Managed internally via an `isOpen` ref when `modelValue` is not provided.
- **Controlled State**: If `modelValue` is provided, the tooltip acts as a controlled component. The internal `open()` and `close()` functions MUST NOT mutate `modelValue` or internal state directly; they must emit `update:modelValue(true/false)`.
- **Delays**: The open/close timers dictate when the `open()` and `close()` functions are called. They respect controlled state boundaries by merely initiating the state change request when the timers resolve.

### Hover + Focus State Model

Tooltip visibility relies on two explicit state flags, NOT a single hover flag:

- `isHovered: boolean`
- `isFocused: boolean`

**Opening:**

- `mouseenter` sets `isHovered = true` and starts the open delay timer. It cancels any pending close timer.
- `focusin` sets `isFocused = true` and starts the open delay timer. It cancels any pending close timer.

**Closing:**

- `mouseleave` sets `isHovered = false`. It starts the close delay timer ONLY if `isFocused === false`. It cancels any pending open timer.
- `focusout` sets `isFocused = false`. It starts the close delay timer ONLY if `isHovered === false`. It cancels any pending open timer where appropriate.
- The tooltip must remain open as long as EITHER `isHovered` OR `isFocused` is true. It may only close when BOTH `isHovered === false` AND `isFocused === false`.
- All timers must be cleared on component unmount.

### Unique ID Strategy

- Use Vue's `useId()` to generate one unique ID per tooltip content instance.
- This ensures multiple tooltip instances will never collide on IDs.

### Trigger / Anchor Element

- **Wrapper**: `BjjTooltipTrigger` will NOT use a wrapper `span` or `div`. It will use a functional component or render function to clone the single default slot VNode and attach event listeners (`mouseenter`, `mouseleave`, `focusin`, `focusout`) directly to the child element.
- **Anchor & `triggerRef`**: `triggerRef` points directly to the underlying DOM element of the cloned VNode. This exact DOM element acts as the deterministic anchor for `useFloating`.
- **Focus Events**: Focus events are bound natively to the cloned actual interactive child.

### Floating Engine

- **No Third-Party Dependency**: Sprint 11 MUST reuse the existing internal `useFloating` composable from Sprint 9 (`packages/ui/src/composables/use-floating.ts`).
- Remove all references to `@floating-ui/dom`.
- The existing zero-dependency architecture must be preserved.

### Teleport

- `BjjTooltipContent` is teleported to `body`.
- Coordinate calculation continues to use the existing Sprint 9 viewport-based `useFloating` model.
- No new coordinate engine is introduced.

### Scroll / Resize

- Reuses the existing Sprint 9 floating behavior.
- **Scroll listener**: Handled by the existing Sprint 9 logic.
- **Resize listener**: Handled by the existing Sprint 9 logic.
- **Cleanup**: Listeners are cleaned up on close and unmount as per Sprint 9 logic.
- Ancestor scrolling remains unsupported if that is the existing Sprint 9 architectural limitation.

### Escape Behavior

- Tooltip is strictly NON-MODAL.
- Pressing `Escape` closes the CURRENTLY interacted/focused tooltip only.
- `Escape` MUST NOT remove focus from the trigger and MUST NOT force focus elsewhere.
- **Mechanism**: The tooltip will determine if it should respond to the `Escape` key by checking if it is currently actively interacted with (i.e., `isHovered === true` or `isFocused === true`). This prevents a single global Escape event from blindly closing all open tooltips.

### Multiple Tooltip Instances

- Each tooltip owns independent state, IDs, and timers.
- Opening Tooltip B does NOT automatically close Tooltip A.
- There is NO global tooltip manager in Sprint 11.

### Accessibility (ARIA)

- **Role**: `BjjTooltipContent` uses `role="tooltip"`.
- **Association**: `BjjTooltipTrigger` receives `aria-describedby` ONLY while the tooltip content is actually open/rendered. A closed tooltip must NOT leave a dangling `aria-describedby` attribute.
- **No `aria-modal`**: The tooltip is non-modal. `aria-modal` MUST NOT be used.
- **Focus**: The tooltip content must not become a focus target. There is no focus trap. Keyboard focus remains on the trigger at all times.

### Tokens

- Sprint 11 may ONLY consume existing tokens defined in the current architecture.
- Do NOT introduce new tokens in Sprint 11 unless explicitly justified as a separate token architecture change.
- No rogue design tokens.

### CSS / BEM

- Keep the existing unscoped BEM strategy.
- Deterministic class names: `bjj-tooltip`, `bjj-tooltip-trigger`, `bjj-tooltip-content`.

## Testing Strategy

Expand the acceptance matrix with the following required tests:

**DELAY:**

- open delay
- close delay
- cancel pending open
- cancel pending close
- rapid hover in/out
- timer cleanup on unmount

**HOVER / FOCUS:**

- hover opens
- focus opens
- mouse leaves while focused → remains open
- focus leaves while hovered → remains open
- both hover and focus leave → closes after close delay

**ARIA:**

- role="tooltip"
- aria-describedby linkage
- no dangling aria-describedby when closed
- unique IDs across multiple instances
- no aria-modal
- tooltip is not focusable

**KEYBOARD:**

- Escape closes the active/interacted tooltip
- Escape preserves trigger focus
- Tab behavior remains natural
- no focus trap

**FLOATING:**

- initial positioning
- placement
- offset
- viewport collision
- flipping
- scroll update
- resize update
- listener cleanup

**MULTIPLE INSTANCES:**

- Tooltip A and Tooltip B can both remain open
- opening B does not close A
- independent IDs
- independent timers
- Escape behavior is deterministic

**LIFECYCLE:**

- timer cleanup
- listener cleanup
- teleport cleanup
- unmount while open
- unmount while timer is pending

## Dependency Boundary

- **Zero third-party dependencies.**
- Internal composables remain internal.
- `useFloating`, `useEscapeKey`, and any new hover/timer composable MUST NOT be exported from `packages/ui/src/index.ts`.

## Explicit Out-of-Scope Items

- interactive/rich tooltip content
- tooltip focus trap
- global delay provider
- global tooltip manager
- async tooltip content
- tooltip groups
- third-party floating libraries
