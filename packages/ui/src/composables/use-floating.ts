import { type Ref, unref, watch, onBeforeUnmount } from "vue";

export type Placement = "top" | "bottom" | "left" | "right";
export type Alignment = "start" | "center" | "end";
export type PopoverPlacement = `${Placement}-${Alignment}` | Placement;

export interface UseFloatingOptions {
  placement?: PopoverPlacement;
  offset?: number;
  padding?: number;
}

export function useFloating(
  triggerRef: Ref<HTMLElement | null | undefined>,
  contentRef: Ref<HTMLElement | null | undefined>,
  isOpen: Ref<boolean>,
  options: UseFloatingOptions = {}
) {
  const { placement: defaultPlacement = "bottom-start", offset = 8, padding = 8 } = options;

  const calculatePosition = () => {
    const trigger = unref(triggerRef);
    const content = unref(contentRef);
    if (!trigger || !content) return;

    const referenceRect = trigger.getBoundingClientRect();
    const floatingRect = content.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let [basePlacement, alignment] = defaultPlacement.split("-") as [
      Placement,
      Alignment | undefined,
    ];
    if (!alignment) alignment = "center";

    // Space calculations for collisions
    const availableTop = referenceRect.top - padding;
    const availableBottom = viewportHeight - referenceRect.bottom - padding;
    const availableLeft = referenceRect.left - padding;
    const availableRight = viewportWidth - referenceRect.right - padding;

    // Flip logic
    const heightRequired = floatingRect.height + offset;
    const widthRequired = floatingRect.width + offset;

    if (basePlacement === "bottom") {
      if (heightRequired > availableBottom && heightRequired <= availableTop) {
        basePlacement = "top";
      } else if (heightRequired > availableBottom && heightRequired > availableTop) {
        basePlacement = availableBottom >= availableTop ? "bottom" : "top";
      }
    } else if (basePlacement === "top") {
      if (heightRequired > availableTop && heightRequired <= availableBottom) {
        basePlacement = "bottom";
      } else if (heightRequired > availableTop && heightRequired > availableBottom) {
        basePlacement = availableTop >= availableBottom ? "top" : "bottom";
      }
    } else if (basePlacement === "left") {
      if (widthRequired > availableLeft && widthRequired <= availableRight) {
        basePlacement = "right";
      } else if (widthRequired > availableLeft && widthRequired > availableRight) {
        basePlacement = availableLeft >= availableRight ? "left" : "right";
      }
    } else if (basePlacement === "right") {
      if (widthRequired > availableRight && widthRequired <= availableLeft) {
        basePlacement = "left";
      } else if (widthRequired > availableRight && widthRequired > availableLeft) {
        basePlacement = availableRight >= availableLeft ? "right" : "left";
      }
    }

    let x = 0;
    let y = 0;

    if (basePlacement === "bottom") {
      y = referenceRect.bottom + offset;
    } else if (basePlacement === "top") {
      y = referenceRect.top - floatingRect.height - offset;
    } else if (basePlacement === "left") {
      x = referenceRect.left - floatingRect.width - offset;
    } else if (basePlacement === "right") {
      x = referenceRect.right + offset;
    }

    // Alignments
    if (basePlacement === "top" || basePlacement === "bottom") {
      if (alignment === "start") {
        x = referenceRect.left;
      } else if (alignment === "center") {
        x = referenceRect.left + (referenceRect.width - floatingRect.width) / 2;
      } else if (alignment === "end") {
        x = referenceRect.right - floatingRect.width;
      }
    } else if (basePlacement === "left" || basePlacement === "right") {
      if (alignment === "start") {
        y = referenceRect.top;
      } else if (alignment === "center") {
        y = referenceRect.top + (referenceRect.height - floatingRect.height) / 2;
      } else if (alignment === "end") {
        y = referenceRect.bottom - floatingRect.height;
      }
    }

    // Clamping to viewport
    x = Math.max(padding, Math.min(viewportWidth - floatingRect.width - padding, x));
    y = Math.max(padding, Math.min(viewportHeight - floatingRect.height - padding, y));

    content.style.top = `${y}px`;
    content.style.left = `${x}px`;
    // We set visibility after calculation to prevent flashing
    content.style.visibility = "visible";
  };

  const update = () => {
    if (isOpen.value) {
      calculatePosition();
    }
  };

  watch(
    isOpen,
    (newVal) => {
      if (newVal) {
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update, true);
        // Let the content render first, then update (will be handled by nextTick in component)
      } else {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update, true);
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", update, true);
    window.removeEventListener("resize", update, true);
  });

  return {
    calculatePosition,
  };
}
