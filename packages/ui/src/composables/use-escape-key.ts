import { onBeforeUnmount, watch, type Ref } from "vue";

export function useEscapeKey(
  isActive: Ref<boolean>,
  onEscape: () => void,
  preventClose?: Ref<boolean> | boolean
) {
  let isListening = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      const isPrevented = typeof preventClose === "boolean" ? preventClose : preventClose?.value;
      if (!isPrevented) {
        onEscape();
      }
    }
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    if (isListening) return;

    document.addEventListener("keydown", handleKeyDown);
    isListening = true;
  };

  const stopListening = () => {
    if (typeof window === "undefined") return;
    if (!isListening) return;

    document.removeEventListener("keydown", handleKeyDown);
    isListening = false;
  };

  watch(
    isActive,
    (active) => {
      if (active) {
        startListening();
      } else {
        stopListening();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    stopListening();
  });
}
