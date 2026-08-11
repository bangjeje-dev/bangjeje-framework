<script setup lang="ts">
import { provide, ref, watch, useId } from "vue";
import { useEscapeKey } from "../../composables/use-escape-key";
import { useClickOutside } from "../../composables/use-click-outside";
import type { PopoverProps } from "./popover";
import { popoverInjectionKey } from "./popover";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjPopover",
});

const props = withDefaults(defineProps<PopoverProps>(), {
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const ns = useNamespace("popover-root");

const internalIsOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    internalIsOpen.value = val;
  }
);

const open = () => {
  internalIsOpen.value = true;
  emit("update:modelValue", true);
};

const close = () => {
  internalIsOpen.value = false;
  emit("update:modelValue", false);

  // Restore focus to trigger
  if (triggerRef.value) {
    triggerRef.value.focus();
  }
};

const toggle = () => {
  if (internalIsOpen.value) {
    close();
  } else {
    open();
  }
};

const triggerRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const contentId = useId();

useEscapeKey(internalIsOpen, () => {
  close();
});

useClickOutside([triggerRef, contentRef], () => {
  if (internalIsOpen.value) {
    close();
  }
});

provide(popoverInjectionKey, {
  isOpen: internalIsOpen,
  open,
  close,
  toggle,
  triggerRef,
  contentRef,
  contentId,
  placement: ref(props.placement),
  offset: ref(props.offset),
});
</script>

<template>
  <div :class="ns.b()">
    <slot />
  </div>
</template>
