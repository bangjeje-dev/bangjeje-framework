import { onBeforeUnmount, watch, type Ref } from "vue";

const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  containerRef: Ref<HTMLElement | null | undefined>,
  isActive: Ref<boolean>
) {
  let previousActiveElement: HTMLElement | null = null;
  let isCurrentlyTrapping = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    if (!containerRef.value) return;

    const focusableEls = Array.from(
      containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
    ).filter((el) => {
      // Filter out elements that are not actually visible or are disabled
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (focusableEls.length === 0) {
      e.preventDefault();
      return;
    }

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  };

  const trap = () => {
    if (typeof window === "undefined") return;
    if (isCurrentlyTrapping) return;

    previousActiveElement = document.activeElement as HTMLElement | null;

    if (containerRef.value) {
      // Focus the first focusable element or the container itself
      const firstFocusable = containerRef.value.querySelector<HTMLElement>(
        FOCUSABLE_ELEMENTS_SELECTOR
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        containerRef.value.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    isCurrentlyTrapping = true;
  };

  const untrap = () => {
    if (typeof window === "undefined") return;
    if (!isCurrentlyTrapping) return;

    document.removeEventListener("keydown", handleKeyDown);
    isCurrentlyTrapping = false;

    if (previousActiveElement && document.body.contains(previousActiveElement)) {
      previousActiveElement.focus();
    } else {
      // Safely fall back if the element no longer exists
      document.body.focus();
    }
    previousActiveElement = null;
  };

  watch(
    isActive,
    (active) => {
      if (active) {
        // Wait for next tick so containerRef is populated if it was just rendered
        setTimeout(() => {
          trap();
        }, 0);
      } else {
        untrap();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    untrap();
  });
}
