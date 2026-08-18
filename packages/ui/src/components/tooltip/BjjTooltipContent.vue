<template>
  <Teleport v-if="context.isOpen.value" to="body">
    <div
      v-bind="$attrs"
      :id="context.contentId"
      ref="contentRef"
      :class="ns.b()"
      role="tooltip"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, ref, watch, nextTick } from "vue";
import { tooltipInjectionKey } from "./tooltip";
import { useFloating } from "../../composables/use-floating";
import { useEscapeKey } from "../../composables/use-escape-key";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjTooltipContent",
  inheritAttrs: false,
});

const ns = useNamespace("tooltip-content");
const context = inject(tooltipInjectionKey);

if (!context) {
  throw new Error("BjjTooltipContent must be used within a BjjTooltip");
}

const contentRef = ref<HTMLElement | null>(null);

watch(contentRef, (val) => {
  context.contentRef.value = val;
});

const { calculatePosition } = useFloating(context.triggerRef, context.contentRef, context.isOpen, {
  placement: context.placement.value,
  offset: context.offset.value,
});

// We want to handle mouse entering the content itself to keep it open
const handleMouseEnter = () => {
  context.isHovered.value = true;
};

const handleMouseLeave = () => {
  context.isHovered.value = false;
};

watch(
  () => context.isOpen.value,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      calculatePosition();
    }
  }
);

useEscapeKey(context.isOpen, () => {
  // Escape only closes the tooltip if it's the one being hovered or focused
  if (context.isHovered.value || context.isFocused.value) {
    context.isHovered.value = false;
    context.isFocused.value = false;
    context.isOpen.value = false;
  }
});
</script>

<style>
/* Unscoped deterministic classes, just applying basic styles based on tokens. */
.bjj-tooltip-content {
  position: fixed;
  z-index: var(--bjj-z-index-tooltip, 1040);
  background-color: var(--bjj-color-neutral-900, #1f2937);
  color: var(--bjj-color-neutral-50, #f9fafb);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--bjj-typography-font-size-sm, 14px);
  pointer-events: auto; /* Allow hovering over content to keep it open */
  visibility: hidden; /* Prevent flashing before positioning */
}
</style>
