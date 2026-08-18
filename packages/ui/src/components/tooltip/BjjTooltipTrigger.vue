<script lang="ts">
import { defineComponent, inject, cloneVNode, ref, onMounted, onBeforeUnmount } from "vue";
import { tooltipInjectionKey } from "./tooltip";

export default defineComponent({
  name: "BjjTooltipTrigger",
  setup(_, { slots }) {
    const context = inject(tooltipInjectionKey);
    if (!context) {
      throw new Error("BjjTooltipTrigger must be used within a BjjTooltip");
    }

    const { isHovered, isFocused, isOpen, contentId, triggerRef } = context;
    const innerRef = ref<HTMLElement | null>(null);

    onMounted(() => {
      triggerRef.value = innerRef.value;
    });

    onBeforeUnmount(() => {
      if (triggerRef.value === innerRef.value) {
        triggerRef.value = null;
      }
    });

    const handleMouseEnter = () => {
      isHovered.value = true;
    };

    const handleMouseLeave = () => {
      isHovered.value = false;
    };

    const handleFocusIn = () => {
      isFocused.value = true;
    };

    const handleFocusOut = () => {
      isFocused.value = false;
    };

    return () => {
      const defaultSlot = slots.default?.();
      if (!defaultSlot || defaultSlot.length === 0) {
        return null;
      }

      // If multiple elements are passed, we only take the first one
      const vnode = defaultSlot[0];

      return cloneVNode(vnode, {
        ref: (el: any) => {
          innerRef.value = el?.$el || el;
        },
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave,
        onFocusin: handleFocusIn,
        onFocusout: handleFocusOut,
        "aria-describedby": isOpen.value ? contentId : undefined,
      });
    };
  },
});
</script>
