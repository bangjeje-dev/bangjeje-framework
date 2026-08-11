<script setup lang="ts">
import { inject, computed, ref, onMounted, onBeforeUnmount } from "vue";
import type { SelectValue } from "./select";
import { selectInjectionKey } from "./select";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjSelectOption",
});

const props = defineProps<{
  value: SelectValue;
  disabled?: boolean;
}>();

const ns = useNamespace("select__option");

const selectContext = inject(selectInjectionKey);
if (!selectContext) {
  throw new Error("BjjSelectOption must be used within a BjjSelect");
}

const optionEl = ref<HTMLElement>();

onMounted(() => {
  if (optionEl.value) {
    selectContext.registerOptionRef(props.value, optionEl.value, !!props.disabled);
  }
});

onBeforeUnmount(() => {
  selectContext.unregisterOptionRef(props.value);
});

const isSelected = computed(() => selectContext.modelValue.value === props.value);

const handleClick = () => {
  if (props.disabled) return;
  selectContext.selectOption(props.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return;

  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault();
      selectContext.selectOption(props.value);
      break;
    case "ArrowDown":
      e.preventDefault();
      selectContext.focusNextOption(props.value);
      break;
    case "ArrowUp":
      e.preventDefault();
      selectContext.focusPrevOption(props.value);
      break;
    case "Home":
      e.preventDefault();
      selectContext.focusFirstOption();
      break;
    case "End":
      e.preventDefault();
      selectContext.focusLastOption();
      break;
  }
};
</script>

<template>
  <div
    ref="optionEl"
    :class="[ns.b(), isSelected && ns.is('selected'), disabled && ns.is('disabled')]"
    role="option"
    :aria-selected="isSelected ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? undefined : -1"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
  </div>
</template>
