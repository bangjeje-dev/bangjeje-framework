<script setup lang="ts">
import { computed, provide } from "vue";
import type { CheckboxGroupProps, CheckboxGroupEmits } from "./checkbox-group";
import { useFormControl } from "../../composables/use-form-control";
import { CheckboxGroupContextKey } from "../../composables/use-choice-group";

defineOptions({
  name: "BjjCheckboxGroup",
});

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: () => [],
  orientation: "vertical",
  disabled: undefined,
  required: undefined,
  error: undefined,
});

const emit = defineEmits<CheckboxGroupEmits>();

const formControl = useFormControl(props);

const modelValue = computed(() => props.modelValue);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const changeEvent = (val: any, checked: boolean) => {
  const currentArray = [...(props.modelValue || [])];
  const index = currentArray.indexOf(val);

  if (checked && index === -1) {
    currentArray.push(val);
  } else if (!checked && index !== -1) {
    currentArray.splice(index, 1);
  }

  emit("update:modelValue", currentArray);
  emit("change", currentArray);
};

provide(CheckboxGroupContextKey, {
  modelValue,
  changeEvent,
  disabled: formControl.disabled,
  required: formControl.required,
  error: formControl.error,
});
</script>

<template>
  <div
    class="bjj-checkbox-group"
    :class="[`bjj-checkbox-group--${orientation}`]"
    role="group"
    :aria-orientation="orientation"
    :aria-labelledby="formControl.id.value"
    :aria-disabled="formControl.disabled.value ? 'true' : undefined"
    :aria-invalid="formControl.hasError.value ? 'true' : undefined"
  >
    <slot></slot>
  </div>
</template>

<style>
.bjj-checkbox-group {
  display: flex;
}

.bjj-checkbox-group--vertical {
  flex-direction: column;
  gap: var(--bjj-spacing-2);
}

.bjj-checkbox-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--bjj-spacing-3);
}
</style>
