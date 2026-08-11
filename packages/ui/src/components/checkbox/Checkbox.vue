<script setup lang="ts">
import { computed, inject, useId } from "vue";
import type { CheckboxProps, CheckboxEmits } from "./checkbox";
import { useFormControl } from "../../composables/use-form-control";
import { CheckboxGroupContextKey } from "../../composables/use-choice-group";

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

const groupContext = inject(CheckboxGroupContextKey, null);
const formControl = useFormControl(props);

// ID Isolation: Local Prop > Leaf Fallback. NEVER use FormGroup/Group ID.
const fallbackId = useId();
const fieldId = computed(() => props.id || `bjj-checkbox-${fallbackId}`);

const mergedDisabled = computed(() => {
  if (props.disabled !== undefined) return props.disabled;
  if (groupContext && groupContext.disabled.value !== undefined) return groupContext.disabled.value;
  return formControl.disabled.value;
});

const mergedRequired = computed(() => {
  if (props.required !== undefined) return props.required;
  if (groupContext && groupContext.required.value !== undefined) return groupContext.required.value;
  return formControl.required.value;
});

const mergedError = computed(() => {
  if (props.error !== undefined) return props.error;
  if (groupContext && groupContext.error.value !== undefined) return groupContext.error.value;
  return formControl.error.value;
});

const hasError = computed(() => !!mergedError.value);

const isChecked = computed(() => {
  if (groupContext) {
    const groupVal = groupContext.modelValue.value;
    if (Array.isArray(groupVal)) {
      return groupVal.includes(props.value);
    }
    return false;
  }

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return !!props.modelValue;
});

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const checked = target.checked;

  if (groupContext) {
    groupContext.changeEvent(props.value, checked);
  } else {
    if (Array.isArray(props.modelValue)) {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(props.value);
      if (checked && index === -1) newValue.push(props.value);
      if (!checked && index !== -1) newValue.splice(index, 1);
      emit("update:modelValue", newValue);
      emit("change", newValue);
    } else {
      emit("update:modelValue", checked);
      emit("change", checked);
    }
  }
};
</script>

<template>
  <label
    class="bjj-checkbox"
    :class="{
      'is-disabled': mergedDisabled,
      'is-checked': isChecked,
      'has-error': hasError,
      'is-required': mergedRequired,
    }"
  >
    <input
      :id="fieldId"
      :checked="isChecked"
      type="checkbox"
      class="bjj-checkbox__input"
      :disabled="mergedDisabled"
      :required="mergedRequired"
      :aria-disabled="mergedDisabled ? 'true' : undefined"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="hasError ? formControl.messageId.value : undefined"
      :value="value"
      v-bind="$attrs"
      @change="handleChange"
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
