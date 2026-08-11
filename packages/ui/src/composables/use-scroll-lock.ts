import { onBeforeUnmount, ref, watch, type Ref } from "vue";

// Shared state across all instances to handle nested/multiple dialogs
let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

function getScrollbarWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function useScrollLock(isLocked: Ref<boolean>) {
  const isCurrentlyLockedByThisInstance = ref(false);

  const lock = () => {
    if (typeof window === "undefined") return;
    if (isCurrentlyLockedByThisInstance.value) return;

    if (lockCount === 0) {
      const scrollbarWidth = getScrollbarWidth();
      const body = document.body;

      originalOverflow = body.style.overflow;
      originalPaddingRight = body.style.paddingRight;

      if (scrollbarWidth > 0) {
        const currentPadding = window.getComputedStyle(body).paddingRight;
        const currentPaddingValue = parseFloat(currentPadding) || 0;
        body.style.paddingRight = `${currentPaddingValue + scrollbarWidth}px`;
      }

      body.style.overflow = "hidden";
    }

    lockCount++;
    isCurrentlyLockedByThisInstance.value = true;
  };

  const unlock = () => {
    if (typeof window === "undefined") return;
    if (!isCurrentlyLockedByThisInstance.value) return;

    lockCount--;
    isCurrentlyLockedByThisInstance.value = false;

    if (lockCount === 0) {
      const body = document.body;
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;

      // Clean up inline styles if they were empty originally
      if (!originalOverflow) {
        body.style.removeProperty("overflow");
      }
      if (!originalPaddingRight) {
        body.style.removeProperty("padding-right");
      }
    }
  };

  watch(
    isLocked,
    (locked) => {
      if (locked) {
        lock();
      } else {
        unlock();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    unlock();
  });

  return {
    lock,
    unlock,
  };
}
