<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import { popoverInjectionKey } from "./popover";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjPopoverTrigger",
});

const props = defineProps<{
  disabled?: boolean;
}>();

const ns = useNamespace("popover__trigger");
const context = inject(popoverInjectionKey);

if (!context) {
  throw new Error("BjjPopoverTrigger must be used within a BjjPopover");
}

const triggerEl = ref<HTMLElement>();

onMounted(() => {
  context.triggerRef.value = triggerEl.value;
});

const handleToggle = () => {
  if (props.disabled) return;
  context.toggle();
};
</script>

<template>
  <div
    ref="triggerEl"
    :class="ns.b()"
    :aria-expanded="context.isOpen.value ? 'true' : 'false'"
    :aria-controls="context.contentId"
    aria-haspopup="dialog"
    tabindex="0"
    role="button"
    data-bjj-popover-part
    @click="handleToggle"
    @keydown.enter.prevent="handleToggle"
    @keydown.space.prevent="handleToggle"
  >
    <slot />
  </div>
</template>
