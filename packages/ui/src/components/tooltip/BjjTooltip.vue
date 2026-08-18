<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, watch, onBeforeUnmount, useId, toRef, computed } from "vue";
import { tooltipInjectionKey } from "./tooltip";
import type { PopoverPlacement } from "../../composables/use-floating";

defineOptions({
  name: "BjjTooltip",
});

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    openDelay?: number;
    closeDelay?: number;
    placement?: PopoverPlacement;
    offset?: number;
  }>(),
  {
    modelValue: undefined,
    openDelay: 200,
    closeDelay: 150,
    placement: "top",
    offset: 8,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isControlled = computed(() => props.modelValue !== undefined);
const internalIsOpen = ref(false);

const isOpen = computed({
  get: () => (isControlled.value ? props.modelValue! : internalIsOpen.value),
  set: (val) => {
    if (isControlled.value) {
      emit("update:modelValue", val);
    } else {
      internalIsOpen.value = val;
    }
  },
});

const isHovered = ref(false);
const isFocused = ref(false);

const contentId = useId();
const triggerRef = ref<HTMLElement | null | undefined>(null);
const contentRef = ref<HTMLElement | null | undefined>(null);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const requestOpen = () => {
  isOpen.value = true;
};

const requestClose = () => {
  isOpen.value = false;
};

const open = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (!isOpen.value && !openTimer) {
    openTimer = setTimeout(() => {
      requestOpen();
      openTimer = null;
    }, props.openDelay);
  }
};

const close = () => {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  // Only start close timer if both are false
  if (!isHovered.value && !isFocused.value && isOpen.value && !closeTimer) {
    closeTimer = setTimeout(() => {
      requestClose();
      closeTimer = null;
    }, props.closeDelay);
  }
};

watch([isHovered, isFocused], ([hovered, focused]) => {
  if (hovered || focused) {
    open();
  } else {
    close();
  }
});

onBeforeUnmount(() => {
  clearTimers();
});

provide(tooltipInjectionKey, {
  isOpen,
  isHovered,
  isFocused,
  contentId,
  triggerRef,
  contentRef,
  openDelay: toRef(props, "openDelay"),
  closeDelay: toRef(props, "closeDelay"),
  placement: toRef(props, "placement"),
  offset: toRef(props, "offset"),
  open,
  close,
});
</script>
