<script setup lang="ts">
import { inject, ref, nextTick, watch } from "vue";
import { popoverInjectionKey } from "./popover";
import { useFloating } from "../../composables/use-floating";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjPopoverContent",
  inheritAttrs: false,
});

const ns = useNamespace("popover__content");
const context = inject(popoverInjectionKey);

if (!context) {
  throw new Error("BjjPopoverContent must be used within a BjjPopover");
}

const contentEl = ref<HTMLElement>();

watch(contentEl, (el) => {
  context.contentRef.value = el;
});

const { calculatePosition } = useFloating(context.triggerRef, context.contentRef, context.isOpen, {
  placement: context.placement.value,
  offset: context.offset.value,
});

watch(context.isOpen, (val) => {
  if (val) {
    nextTick(() => {
      calculatePosition();
    });
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="context.isOpen.value"
      :id="context.contentId"
      ref="contentEl"
      :class="ns.b()"
      role="region"
      style="position: fixed; z-index: var(--bjj-z-index-popover, 1030)"
      data-bjj-popover-part
      v-bind="$attrs"
    >
      <slot />
    </div>
  </Teleport>
</template>
