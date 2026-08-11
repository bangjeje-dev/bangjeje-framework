# Sprint 8: Overlay and Dialog Architecture

## Sprint Objective

Introduce the structural capability to render content above the main application flow, handling z-index layering, keyboard accessibility, and DOM un-nesting (Portals).

## Architectural Problem

The current UI foundation (Sprints 4–7) handles standard in-flow components (Forms, Buttons, Data Entry). However, it completely lacks the ability to break out of the DOM hierarchy. Features like modals, alerts, and eventually popovers/selects require a mechanism to render at the top of the z-index stack without being clipped by parent `overflow: hidden` or `z-index` rules. Furthermore, rendering above the page introduces strict accessibility requirements: focus must be trapped within the active overlay, the background must not scroll (without layout shifts), and the overlay must be dismissible via the keyboard.

## Why This Milestone Comes Next

Before building complex interactive elements like `Select`, `Dropdown`, or `Datepicker`—which require complex relative positioning—we need a robust foundational system for rendering floating content. A Modal Dialog is the most foundational version of this pattern because it relies on simple viewport-fixed positioning. It acts as the perfect architectural stepping stone to introduce `<Teleport>`, focus trapping, and scroll locking to the repository.

## Existing Architecture Reused

- **Design Tokens**: Direct consumption of `var(--bjj-z-index-modal)` and `var(--bjj-colors-surface)`.
- **CSS Architecture**: Strict adherence to the `useNamespace` BEM composable (`bjj-dialog`, `bjj-dialog__overlay`, etc.).
- **UI Components**: `BjjButton` will be heavily utilized for Dialog actions.

## New Architecture Introduced (Internal Utilities)

The following composables will be introduced but MUST remain strictly internal. Their APIs are intentionally private and may change in future sprints. They MUST NOT be exported from `packages/ui/src/index.ts`.

1. **`useScrollLock`**: A composable to safely lock the `<body>` scroll.
2. **`useFocusTrap`**: A composable that constrains focus within the Dialog.
3. **`useEscapeKey`**: A composable to globally listen for the `Escape` key to safely unmount the overlay.

## Scroll Lock Contract

When the first active dialog locks the document:

- Detect the current scrollbar width: `window.innerWidth - document.documentElement.clientWidth`.
- Preserve the body's existing `padding-right`.
- Add the calculated scrollbar width to the body's `padding-right` (preventing horizontal layout shift).
- Set body `overflow` to `hidden`.

When the lock is released:

- Restore the body's original `overflow`.
- Restore the body's original `padding-right` exactly.
- Remove all DOM mutations created by the composable.

**Important**: The design MUST account for multiple/nested dialogs through shared/reference counting. One dialog closing must not unlock scrolling while another dialog remains open. All DOM mutations MUST be strictly cleaned up on close/unmount.

## Focus Management Contract

Focus restoration is REQUIRED, not optional.

**On dialog open:**

- Capture `document.activeElement` BEFORE moving focus into the dialog.
- Store the trigger/focused element safely.
- Move focus into the dialog according to a defined initial-focus strategy (e.g., the close button or first focusable element).

**While open:**

- `Tab` and `Shift+Tab` MUST remain trapped within the dialog.
- Background content MUST NOT receive keyboard focus.

**On close:**

- Restore focus to the exact previously active element if it is still connected and focusable.
- Safely fall back (e.g., to the `<body>`) if that element no longer exists.
- Cleanup must explicitly run if the dialog unmounts while open.

## ARIA Contract

Exact DOM relationships must be maintained:

**Dialog root:**

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` → Must point to the `BjjDialogTitle` unique ID. If a title is omitted, do not create invalid references; fallback to a provided `aria-label` or omit.
- `aria-describedby` → Must point to the `BjjDialogBody` unique ID when a body exists.

**BjjDialogTitle & BjjDialogBody:**

- Must generate stable, unique IDs.

**Close Button:**

- The close button MUST have an explicit `aria-label="Close"`.

## Component Scope and Structure

1. **`BjjDialog`**: The main wrapper that handles the Teleport, Backdrop/Overlay, and structural alignment.
2. **`BjjDialogHeader`**: Standardized header container.
3. **`BjjDialogTitle`**: Semantic title generating the ID for `aria-labelledby`.
4. **`BjjDialogBody`**: The scrollable content area, generating the ID for `aria-describedby`.
5. **`BjjDialogFooter`**: The action area, typically right-aligned for buttons.

## State Model

The `BjjDialog` operates on a simple boolean `v-model:open` (or `v-model`) to dictate its visibility state.

```vue
<BjjDialog v-model="isOpen">
  <BjjDialogHeader>
    <BjjDialogTitle>Confirm Action</BjjDialogTitle>
  </BjjDialogHeader>
  <BjjDialogBody>Are you sure you want to proceed?</BjjDialogBody>
  <BjjDialogFooter>
    <BjjButton variant="ghost" @click="isOpen = false">Cancel</BjjButton>
    <BjjButton variant="primary">Confirm</BjjButton>
  </BjjDialogFooter>
</BjjDialog>
```

## Public API

The exact public exports in `packages/ui/src/index.ts` will ONLY include the dialog components:

- `BjjDialog`
- `BjjDialogHeader`
- `BjjDialogTitle`
- `BjjDialogBody`
- `BjjDialogFooter`

Internal composables (`useScrollLock`, `useFocusTrap`, `useEscapeKey`) MUST remain private.

## Styling & CSS/BEM Strategy

- `bjj-dialog-root`: The teleported container.
- `bjj-dialog-overlay`: The fixed, semi-transparent black backdrop.
- `bjj-dialog-content`: The actual modal surface box (white background, rounded corners, shadow).
- `bjj-dialog-header`, `bjj-dialog-body`, `bjj-dialog-footer`: Inner layout sections.
- **Animation**: Implement basic Vue `<Transition>` wrappers.

## Dependency Boundaries

Keep the implementation completely dependency-free.
Do NOT introduce Floating UI or another positioning library in Sprint 8. This sprint is for viewport/dialog overlay architecture, not floating-anchor positioning.

## Explicit Out-of-Scope Items

- Select
- Dropdown
- Popover
- Tooltip
- Datepicker
- Toast
- Drawer
- Floating UI / anchor positioning
- Generic public focus/scroll/keyboard composable APIs

## Testing Strategy

The test matrix MUST include explicit DOM/runtime tests for:

**Scroll Lock:**

- Body `overflow` becomes `hidden`.
- Scrollbar width is calculated and `padding-right` compensation is applied.
- Original `padding-right` is preserved and restored on close.
- Styles are fully restored on unmount.
- Multiple dialogs do not prematurely unlock body scrolling.

**Focus:**

- `activeElement` is captured before open.
- Focus moves into dialog.
- `Tab` stays inside dialog and `Shift+Tab` wraps correctly.
- Focus returns to original trigger on close.
- Focus restoration safely handles a removed trigger.
- Unmount while open restores focus and cleans up.

**ARIA:**

- `role="dialog"` and `aria-modal="true"`.
- `aria-labelledby` matches title ID.
- `aria-describedby` matches body ID.
- No broken ARIA references when optional title/body are absent.
- Close button has `aria-label="Close"`.

**Teleport & Keyboard:**

- Dialog is rendered outside the component's original DOM subtree via Teleport.
- Cleanup occurs after unmount.
- `Escape` closes when enabled (and can be disabled).
- Keyboard listeners are removed after close/unmount.

## Final Approval Checklist

Before proceeding to implementation, verify:

- [ ] Focus restoration is mandatory and correctly caches the trigger.
- [ ] Scrollbar compensation works without layout shift.
- [ ] Scroll lock is reference-counted/shared safely across multiple overlays.
- [ ] DOM cleanup is guaranteed on unmount.
- [ ] ARIA references are valid and fallback correctly.
- [ ] Internal composables (`useScrollLock`, `useFocusTrap`, `useEscapeKey`) are NOT exported.
- [ ] No third-party dependency is introduced.
- [ ] Existing Sprint 4–7 public APIs remain unchanged.
