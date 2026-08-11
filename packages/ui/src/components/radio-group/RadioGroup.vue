<script setup lang="ts">
import { computed, provide, useId } from "vue";
import type { RadioGroupProps, RadioGroupEmits } from "./radio-group";
import { useFormControl } from "../../composables/use-form-control";
import { RadioGroupContextKey } from "../../composables/use-choice-group";

defineOptions({
  name: "BjjRadioGroup",
});

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  name: undefined,
  orientation: "vertical",
  disabled: undefined,
  required: undefined,
  error: undefined,
});

const emit = defineEmits<RadioGroupEmits>();

// Use form control to handle inheriting from FormGroup if placed inside one.
// This resolves the precedence: Local Prop > Form Context > Default
const formControl = useFormControl(props);

const fallbackName = useId();
const groupName = computed(() => props.name || `bjj-radio-group-${fallbackName}`);

const modelValue = computed(() => props.modelValue);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const changeEvent = (val: any) => {
  emit("update:modelValue", val);
  emit("change", val);
};

// Provide the combined context to child Radios
provide(RadioGroupContextKey, {
  name: groupName,
  modelValue,
  changeEvent,
  disabled: formControl.disabled,
  required: formControl.required,
  error: formControl.error, // Pass raw error string/boolean down
});
</script>

<template>
  <div
    class="bjj-radio-group"
    :class="[`bjj-radio-group--${orientation}`]"
    role="radiogroup"
    :aria-orientation="orientation"
    :aria-labelledby="formControl.id.value"
    :aria-disabled="formControl.disabled.value ? 'true' : undefined"
    :aria-invalid="formControl.hasError.value ? 'true' : undefined"
  >
    <slot></slot>
  </div>
</template>

<style>
.bjj-radio-group {
  display: flex;
}

.bjj-radio-group--vertical {
  flex-direction: column;
  gap: var(--bjj-spacing-2);
}

.bjj-radio-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--bjj-spacing-3);
}
</style>
