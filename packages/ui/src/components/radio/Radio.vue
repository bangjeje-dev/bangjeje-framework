<script setup lang="ts">
import { computed } from "vue";
import type { RadioProps, RadioEmits } from "./radio";
import { useFormControl } from "../../composables/use-form-control";

defineOptions({
  name: "BjjRadio",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<RadioProps>(), {
  modelValue: undefined,
  value: undefined,
  name: undefined,
  id: undefined,
  disabled: undefined,
  required: undefined,
  error: undefined,
  label: undefined,
});
const emit = defineEmits<RadioEmits>();

const formControl = useFormControl(props);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});

const isChecked = computed(() => internalValue.value === props.value);
</script>

<template>
  <label
    class="bjj-radio"
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
      type="radio"
      class="bjj-radio__input"
      :name="name || undefined"
      :disabled="formControl.disabled.value"
      :required="formControl.required.value"
      :aria-disabled="formControl.disabled.value ? 'true' : undefined"
      :aria-invalid="formControl.hasError.value ? 'true' : undefined"
      :aria-describedby="formControl.hasError.value ? formControl.messageId.value : undefined"
      :value="value"
      v-bind="$attrs"
    />
    <span class="bjj-radio__facade">
      <!-- CSS will render the inner circle -->
    </span>
    <span v-if="label || $slots.default" class="bjj-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style>
.bjj-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--bjj-spacing-2);
  cursor: pointer;
  position: relative;
}

.bjj-radio.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bjj-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.bjj-radio__facade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--bjj-colors-border);
  border-radius: var(--bjj-radius-full);
  background-color: var(--bjj-colors-surface);
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
}

.bjj-radio__input:focus-visible + .bjj-radio__facade {
  outline: 2px solid var(--bjj-colors-primary);
  outline-offset: 2px;
}

.bjj-radio.has-error .bjj-radio__facade {
  border-color: var(--bjj-colors-danger);
}

.bjj-radio.has-error .bjj-radio__input:focus-visible + .bjj-radio__facade {
  outline-color: var(--bjj-colors-danger);
}

.bjj-radio.is-checked .bjj-radio__facade {
  border-color: var(--bjj-colors-primary);
}

.bjj-radio.is-checked.has-error .bjj-radio__facade {
  border-color: var(--bjj-colors-danger);
}

.bjj-radio.is-checked .bjj-radio__facade::after {
  content: "";
  display: block;
  width: 0.625rem;
  height: 0.625rem;
  background-color: var(--bjj-colors-primary);
  border-radius: var(--bjj-radius-full);
}

.bjj-radio.is-checked.has-error .bjj-radio__facade::after {
  background-color: var(--bjj-colors-danger);
}

.bjj-radio__label {
  font-family: var(--bjj-typography-font-family-base);
  font-size: var(--bjj-typography-font-size-base);
  color: var(--bjj-colors-text);
  line-height: var(--bjj-typography-line-height-base);
}
</style>
