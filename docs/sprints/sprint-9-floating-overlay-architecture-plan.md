# Sprint 9 — Floating & Anchored Overlay Architecture

## 1. Sprint Name

Sprint 9 — Floating & Anchored Overlay Architecture

## 2. Objective

Establish the core positioning foundation for anchored overlays (Dropdowns, Selects, Tooltips, Popovers) and implement a generic `BjjPopover` component family to validate the architecture.

## 3. Why This is the Logical Next Milestone

In Sprint 8, we implemented `BjjDialog`, which handles full-page, screen-blocking overlays. However, many remaining components on the roadmap (`Select`, `DropdownMenu`, `Tooltip`, `DatePicker`) require a completely different overlay behavior: they must **float** and **anchor** relative to a specific trigger element in the DOM.

Implementing a shared positioning foundation now prevents us from writing fragmented, buggy, one-off positioning implementations in future sprints. By building `BjjPopover` as the generic primitive, future components can simply compose it.

## 4. Existing Architecture Dependencies

- **Teleport infrastructure:** Reuses the `<Teleport to="body">` pattern established in Sprint 8.
- **Keyboard utilities:** Reuses the internal `useEscapeKey` composable from Sprint 8.
- **Design Tokens:** Relies on existing `var(--bjj-z-index-popover)` (or modal), surface colors, and shadow tokens.

## 5. Components & Composables to be Introduced

### Internal Composables

- `useFloating(triggerRef, contentRef, options)`: Calculates `x` and `y` coordinates for an anchored element.
- `useClickOutside(elements, handler)`: Detects interactions outside a specified set of elements.

### Public Components

- `BjjPopover`: The root state provider component.
- `BjjPopoverTrigger`: A wrapper component that designates the anchor element.
- `BjjPopoverContent`: The actual floating content that teleports to the document body.

## 6. Public vs Internal API Boundaries

- **Strictly Internal:** `useFloating` and `useClickOutside`. These MUST NOT be exported from `packages/ui/src/index.ts`.
- **Public API:** `BjjPopover`, `BjjPopoverTrigger`, `BjjPopoverContent`, and associated TypeScript prop interfaces (`PopoverProps`).

## 7. State Model

- Choose ONE canonical API: `v-model:modelValue` (boolean).
- Default is `false`.
- Trigger click toggles state.
- Outside click sets to `false`.
- Escape sets to `false`.
- `disabled` prop on trigger prevents opening.
- Programmatic changes to `modelValue` update rendering and positioning.
- No competing internal state source.

## 8. Positioning Engine

- **referenceElement:** HTMLElement
- **floatingElement:** HTMLElement
- **Default placement:** `bottom-start`
- **Supported placements:** `top`, `bottom`, `left`, `right`
- **Supported alignments:** `start`, `center`, `end`
- **Offset:** `8px` default
- **Viewport padding:** `8px` default
- **Measurement timing:** Measurement occurs after DOM mount/update using Vue's `nextTick()`.
- **Position Calculation:** Calculated after measurement.
- **Initial positioning:** Content remains visually hidden until the first valid coordinates are calculated.
- **Recalculation:** Coordinates are recalculated when required (e.g. window resize, window scroll).

## 9. Teleport + Coordinate Model

The popover content MUST use `position: fixed` because it is Teleported to `<body>`.

`getBoundingClientRect()` returns viewport-relative coordinates.
DO NOT add `window.scrollX` or `window.scrollY`. This is because the floating element uses `position: fixed`.

Coordinate formulas:

- `bottom-start`: `x = referenceRect.left`, `y = referenceRect.bottom + offset`
- `top-start`: `x = referenceRect.left`, `y = referenceRect.top - floatingRect.height - offset`
- `right-start`: `x = referenceRect.right + offset`, `y = referenceRect.top`
- `left-start`: `x = referenceRect.left - floatingRect.width - offset`, `y = referenceRect.top`

## 10. Alignment

Define exact formulas for start, center, end.

**For vertical placements (top/bottom):**

- `start`: `x = referenceRect.left`
- `center`: `x = referenceRect.left + (referenceRect.width - floatingRect.width) / 2`
- `end`: `x = referenceRect.right - floatingRect.width`

**For horizontal placements (left/right):**

- `start`: `y = referenceRect.top`
- `center`: `y = referenceRect.top + (referenceRect.height - floatingRect.height) / 2`
- `end`: `y = referenceRect.bottom - floatingRect.height`

## 11. Collision / Flipping

Define deterministic algorithm.

**For bottom placement:**

- Calculate bottom candidate.
- If candidate fits viewport (taking `viewport padding` into account), use it.
- Otherwise, attempt `top`.
- If top fits, flip to `top`.
- If neither fits, choose the side with more available space (`availableTop` vs `availableBottom`).
- Clamp the final coordinate inside viewport padding (e.g., `Math.max(padding, Math.min(viewportWidth - floatingWidth - padding, x))`).

Repeat equivalent logic for `top`, `left`, and `right` placements comparing `availableTop`, `availableBottom`, `availableLeft`, and `availableRight`. There MUST be no undefined collision state when the floating element is larger than the available viewport space.

## 12. Initial Render / Flash Prevention

The floating content MUST follow this exact lifecycle using Vue's `nextTick()`:

- Mount hidden (`visibility: hidden` or `opacity: 0`).
- Measure reference + floating element (`getBoundingClientRect()`).
- Calculate coordinates.
- Apply coordinates (`top`, `left`).
- Become visible only after valid coordinates exist.

## 13. Scroll / Resize

The popover MUST reposition while open on:

- window scroll
- window resize

Listeners are registered ONLY while open.
Listeners are removed on:

- close
- unmount

**Known zero-dependency limitation:** Ancestor scrolling containers are explicitly OUT OF SCOPE for Sprint 9. Document this limitation clearly.

## 14. Click Outside

`useClickOutside` MUST use `event.composedPath()`.
The event is NOT outside when `composedPath()` contains:

- trigger element
- floating content element

Therefore:

- clicking trigger does not invoke outside dismissal.
- clicking content does not dismiss.
- clicking elsewhere dismisses.

Define event ordering so trigger toggle cannot immediately reopen/close due to the document listener.

## 15. Escape

- Reuse the existing internal `useEscapeKey` composable from Sprint 8.
- Do NOT create another Escape implementation.
- Escape closes the current popover.

## 16. Focus Model

`BjjPopover` is NON-MODAL.
Therefore:

- No focus trap.
- No `aria-modal`.
- `Tab` behaves naturally (leaves/continues focus).
- Focus is NOT forcibly moved into the popover on open.
- Focus remains on the trigger unless consumer code moves it.
- When dismissed, focus remains on/restores to the trigger when appropriate.

Explicitly contrast this with Sprint 8 `BjjDialog`, which IS modal and uses focus trapping.

## 17. ARIA Contract

**Trigger MUST expose:**

- `aria-expanded="true"` when open
- `aria-expanded="false"` when closed
- `aria-controls="<unique-content-id>"`

**Content MUST have:**

- A unique ID generated with Vue `useId()`.
- `aria-modal` MUST NOT be rendered.
- Explicit default role: `role="region"`. (Do not automatically use `role="dialog"`, as this is a non-modal generic floating container.)

## 18. ID Strategy

Every `BjjPopover` instance MUST use Vue `useId()`.

- IDs must be unique across multiple simultaneous instances.
- The popover ID must not inherit an ID from `FormGroup`.
- Exact IDs: popover content ID = generated unique ID.
- Trigger references content through `aria-controls`.

## 19. Multiple Popovers

- Each `BjjPopover` owns independent state.
- Opening one does NOT close another.
- No global overlay manager.
- No sibling coordination.
- Multiple popovers may remain open simultaneously.

## 20. CSS/BEM Strategy

- Unscoped BEM: `.bjj-popover-root`, `.bjj-popover__trigger`, `.bjj-popover__content`.
- No hardcoded design primitives.
- Positioning styles are not tokenized incorrectly.
- Z-index uses existing token architecture.

## 21. Backward Compatibility

Verify Sprint 4–8 APIs remain untouched (especially `BjjDialog`, `BjjInput`, `BjjCheckbox`, `BjjRadio`, `BjjSwitch`, `FormGroup`, and existing composables).

## 22. Architectural Trade-off

Sprint 9 intentionally implements a minimal dependency-free positioning engine.
It does NOT attempt to replace mature libraries such as Floating UI.

**Known limitation:**
Nested/ancestor scroll-container repositioning is OUT OF SCOPE.
Future `Select`, `Tooltip`, `DropdownMenu`, `DatePicker`, etc. may require expanding or replacing `useFloating`.
Do not over-engineer this sprint.

## 23. Test Acceptance Matrix

The plan MUST explicitly require actual DOM/behavior tests for:

**Positioning:**

- `bottom-start`
- `top`
- `left`
- `right`
- `start`
- `center`
- `end`
- `offset`

**Collision:**

- `bottom` -> `top`
- `top` -> `bottom`
- `left` -> `right`
- `right` -> `left`
- both sides insufficient
- viewport clamping

**Rendering:**

- hidden before measurement
- visible after coordinates are calculated

**Viewport:**

- resize reposition
- scroll reposition
- listener cleanup
- repeated open/close

**Interaction:**

- trigger click
- content click
- outside click using `composedPath`
- `Escape`
- `disabled`

**Focus:**

- non-modal behavior
- no focus trap
- `Tab` naturally leaves/continues
- focus remains/restores appropriately

**ARIA:**

- `aria-expanded`
- `aria-controls`
- unique content IDs
- `aria-modal` absence
- correct role

**Multiple instances:**

- two popovers simultaneously
- unique IDs
- independent state
- independent dismissal

**Lifecycle:**

- unmount cleanup
- no duplicate listeners

## 24. Explicit Scope Control

Sprint 9 does NOT implement:

- `Select`
- `DropdownMenu`
- `Tooltip`
- `DatePicker`
- `Menu`
- complex positioning middleware
- arrow pointer
- global overlay manager
- unrelated form controls
