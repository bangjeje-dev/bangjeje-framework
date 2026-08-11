import { onMounted, onBeforeUnmount, type Ref, unref } from "vue";

export function useClickOutside(
  elements: Array<Ref<HTMLElement | null | undefined> | HTMLElement | null | undefined>,
  handler: (e: MouseEvent) => void
) {
  const listener = (event: MouseEvent) => {
    const path = event.composedPath();

    // Check if the click is inside any of the tracked elements
    const isInside = elements.some((el) => {
      const target = unref(el);
      return (
        target &&
        (path.includes(target) || (event.target instanceof Node && target.contains(event.target)))
      );
    });

    // Ignore clicks that originate from ANY popover trigger or content
    // This allows multiple independent popovers to remain open simultaneously
    const isInsideOtherPopover =
      event.target instanceof Element && event.target.closest("[data-bjj-popover-part]");

    if (!isInside && !isInsideOtherPopover) {
      handler(event);
    }
  };

  onMounted(() => {
    // Use capture phase to ensure it runs before other click handlers might stop propagation
    document.addEventListener("click", listener, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", listener, true);
  });
}
