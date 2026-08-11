<script setup lang="ts">
import { computed } from "vue";
import type { CheckboxProps, CheckboxEmits } from "./checkbox";
import { useFormControl } from "../../composables/use-form-control";

defineOptions({
  name: "BjjCheckbox",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: undefined,
  value: undefined,
  id: undefined,
  disabled: undefined,
  required: undefined,
  error: undefined,
  label: undefined,
});
const emit = defineEmits<CheckboxEmits>();

const formControl = useFormControl(props);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});

const isChecked = computed(() => {
  if (Array.isArray(internalValue.value)) {
    return internalValue.value.includes(props.value);
  }
  return !!internalValue.value;
});
</script>

<template>
  <label
    class="bjj-checkbox"
    :class="{
      'is-disabled': formControl.disabled.value,
      'is-checked': isChecked,
      'has-error': formControl.hasError.value,
      'is-required': formControl.required.value,
    }"
  >
    <input
      :id="formControl.id.value"
      v-model="internalValue"
      type="checkbox"
      class="bjj-checkbox__input"
      :disabled="formControl.disabled.value"
      :required="formControl.required.value"
      :aria-disabled="formControl.disabled.value ? 'true' : undefined"
      :aria-invalid="formControl.hasError.value ? 'true' : undefined"
      :aria-describedby="formControl.hasError.value ? formControl.messageId.value : undefined"
      :value="value"
      v-bind="$attrs"
    />
    <span class="bjj-checkbox__facade">
      <!-- CSS will render the checkmark -->
    </span>
    <span v-if="label || $slots.default" class="bjj-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style>
.bjj-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--bjj-spacing-2);
  cursor: pointer;
  position: relative;
}

.bjj-checkbox.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bjj-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.bjj-checkbox__facade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--bjj-colors-border);
  border-radius: var(--bjj-radius-sm);
  background-color: var(--bjj-colors-surface);
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
}

.bjj-checkbox__input:focus-visible + .bjj-checkbox__facade {
  outline: 2px solid var(--bjj-colors-primary);
  outline-offset: 2px;
}

.bjj-checkbox.has-error .bjj-checkbox__facade {
  border-color: var(--bjj-colors-danger);
}

.bjj-checkbox.has-error .bjj-checkbox__input:focus-visible + .bjj-checkbox__facade {
  outline-color: var(--bjj-colors-danger);
}

.bjj-checkbox.is-checked .bjj-checkbox__facade {
  background-color: var(--bjj-colors-primary);
  border-color: var(--bjj-colors-primary);
}

.bjj-checkbox.is-checked.has-error .bjj-checkbox__facade {
  background-color: var(--bjj-colors-danger);
  border-color: var(--bjj-colors-danger);
}

.bjj-checkbox.is-checked .bjj-checkbox__facade::after {
  content: "";
  display: block;
  width: 0.35rem;
  height: 0.6rem;
  border: solid var(--bjj-colors-background);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-10%, -10%);
}

.bjj-checkbox__label {
  font-family: var(--bjj-typography-font-family-base);
  font-size: var(--bjj-typography-font-size-base);
  color: var(--bjj-colors-text);
  line-height: var(--bjj-typography-line-height-base);
}
</style>
