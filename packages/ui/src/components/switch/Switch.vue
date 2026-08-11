<script setup lang="ts">
import { computed } from "vue";
import type { SwitchProps, SwitchEmits } from "./switch";
import { useFormControl } from "../../composables/use-form-control";

defineOptions({
  name: "BjjSwitch",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: undefined,
  id: undefined,
  disabled: undefined,
  required: undefined,
  error: undefined,
  label: undefined,
});
const emit = defineEmits<SwitchEmits>();

const formControl = useFormControl(props);

const internalValue = computed({
  get: () => !!props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});
</script>

<template>
  <label
    class="bjj-switch"
    :class="{
      'is-disabled': formControl.disabled.value,
      'is-checked': internalValue,
      'has-error': formControl.hasError.value,
      'is-required': formControl.required.value,
    }"
  >
    <input
      :id="formControl.id.value"
      v-model="internalValue"
      type="checkbox"
      role="switch"
      class="bjj-switch__input"
      :disabled="formControl.disabled.value"
      :required="formControl.required.value"
      :aria-checked="internalValue ? 'true' : 'false'"
      :aria-disabled="formControl.disabled.value ? 'true' : undefined"
      :aria-invalid="formControl.hasError.value ? 'true' : undefined"
      :aria-describedby="formControl.hasError.value ? formControl.messageId.value : undefined"
      v-bind="$attrs"
    />
    <span class="bjj-switch__track">
      <span class="bjj-switch__thumb"></span>
    </span>
    <span v-if="label || $slots.default" class="bjj-switch__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style>
.bjj-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--bjj-spacing-2);
  cursor: pointer;
  position: relative;
}

.bjj-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bjj-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.bjj-switch__track {
  display: inline-flex;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: var(--bjj-radius-full);
  background-color: var(--bjj-colors-surface);
  border: 1px solid var(--bjj-colors-border);
  transition: all 0.2s ease-in-out;
  padding: 2px;
  flex-shrink: 0;
}

.bjj-switch__thumb {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: var(--bjj-radius-full);
  background-color: var(--bjj-colors-border);
  transition:
    transform 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
}

.bjj-switch__input:focus-visible + .bjj-switch__track {
  outline: 2px solid var(--bjj-colors-primary);
  outline-offset: 2px;
}

.bjj-switch.has-error .bjj-switch__track {
  border-color: var(--bjj-colors-danger);
}

.bjj-switch.has-error .bjj-switch__input:focus-visible + .bjj-switch__track {
  outline-color: var(--bjj-colors-danger);
}

.bjj-switch.is-checked .bjj-switch__track {
  background-color: var(--bjj-colors-primary);
  border-color: var(--bjj-colors-primary);
}

.bjj-switch.is-checked.has-error .bjj-switch__track {
  background-color: var(--bjj-colors-danger);
  border-color: var(--bjj-colors-danger);
}

.bjj-switch.is-checked .bjj-switch__thumb {
  background-color: var(--bjj-colors-background);
  transform: translateX(1.25rem);
}

.bjj-switch__label {
  font-family: var(--bjj-typography-font-family-base);
  font-size: var(--bjj-typography-font-size-base);
  color: var(--bjj-colors-text);
  line-height: var(--bjj-typography-line-height-base);
}
</style>
