<script setup lang="ts">
import { inject } from "vue";
import { selectInjectionKey } from "./select";
import BjjPopoverTrigger from "../popover/BjjPopoverTrigger.vue";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjSelectTrigger",
});

const ns = useNamespace("select__trigger");

const selectContext = inject(selectInjectionKey);
if (!selectContext) {
  throw new Error("BjjSelectTrigger must be used within a BjjSelect");
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (selectContext.disabled.value) return;

  switch (e.key) {
    case "ArrowDown":
    case "ArrowUp":
      e.preventDefault();
      if (!selectContext.isOpen.value) {
        selectContext.isOpen.value = true;
      }
      // Wait for DOM to render the popover before focusing
      setTimeout(() => {
        if (e.key === "ArrowDown") {
          selectContext.focusNextOption(selectContext.modelValue.value);
        } else {
          selectContext.focusPrevOption(selectContext.modelValue.value);
        }
      }, 0);
      break;
    case "Enter":
    case " ":
      // If we are closed, space/enter opens it. This is handled by BjjPopoverTrigger toggling.
      // But we might want to focus the selected option.
      if (!selectContext.isOpen.value) {
        setTimeout(() => {
          // Focus the currently selected option, or the first option if none is selected
          if (
            selectContext.modelValue.value !== undefined &&
            selectContext.modelValue.value !== null
          ) {
            // we don't have a direct `focusOption(val)` but we can just do a nextOption from null?
            // Actually `focusNextOption(null)` focuses the first. Let's just focus first.
            selectContext.focusFirstOption();
          } else {
            selectContext.focusFirstOption();
          }
        }, 0);
      }
      break;
  }
};
</script>

<template>
  <BjjPopoverTrigger
    :id="selectContext.id.value"
    :class="ns.b()"
    role="combobox"
    aria-haspopup="listbox"
    :aria-describedby="selectContext.ariaDescribedBy.value"
    :aria-invalid="selectContext.ariaInvalid.value ? 'true' : undefined"
    :disabled="selectContext.disabled.value"
    @keydown="handleKeyDown"
  >
    <slot />
  </BjjPopoverTrigger>
</template>
