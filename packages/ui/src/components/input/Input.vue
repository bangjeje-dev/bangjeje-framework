<script setup lang="ts">
import { computed, useId } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import type { InputProps, InputEmits } from "./input";

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: "",
  type: "text",
  size: "md",
  disabled: false,
  readonly: false,
});

const emit = defineEmits<InputEmits>();

const ns = useNamespace("input");

const generatedId = useId();
const inputId = computed(() => props.id || `bjj-input-${generatedId}`);

const classes = computed(() => [
  ns.b(),
  ns.m(props.size),
  ns.is("disabled", props.disabled),
  ns.is("error", !!props.error),
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleFocus = (event: FocusEvent) => emit("focus", event);
const handleBlur = (event: FocusEvent) => emit("blur", event);
</script>

<template>
  <div :class="ns.e('wrapper')">
    <label v-if="label" :for="inputId" :class="ns.e('label')">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :class="classes"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="!!error"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div v-if="error" :class="ns.e('error-message')" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<style>
.bjj-input__wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--bjj-spacing-1);
}

.bjj-input__label {
  font-family: var(--bjj-typography-font-family-base, inherit);
  font-size: var(--bjj-typography-font-size-sm);
  font-weight: var(--bjj-typography-font-weight-medium, 500);
  color: var(--bjj-colors-text);
}

.bjj-input {
  width: 100%;
  font-family: var(--bjj-typography-font-family-base, inherit);
  color: var(--bjj-colors-text);
  background-color: var(--bjj-colors-surface);
  border: 1px solid var(--bjj-colors-border);
  border-radius: var(--bjj-radius-md, 0.375rem);
  outline: none;
  transition: all 0.2s ease-in-out;
}

.bjj-input:focus-visible {
  border-color: var(--bjj-colors-primary);
  box-shadow: 0 0 0 1px var(--bjj-colors-primary);
}

.bjj-input::placeholder {
  color: var(--bjj-colors-border); /* Placeholder needs a token, using border or some muted text */
}

.bjj-input.is-disabled {
  background-color: var(--bjj-colors-background);
  cursor: not-allowed;
  opacity: 0.7;
}

.bjj-input.is-error {
  border-color: var(--bjj-colors-danger);
}

.bjj-input.is-error:focus-visible {
  box-shadow: 0 0 0 1px var(--bjj-colors-danger);
}

.bjj-input__error-message {
  font-family: var(--bjj-typography-font-family-base, inherit);
  font-size: var(--bjj-typography-font-size-sm);
  color: var(--bjj-colors-danger);
}

/* Sizes */
.bjj-input--sm {
  padding: var(--bjj-spacing-1) var(--bjj-spacing-2);
  font-size: var(--bjj-typography-font-size-sm);
  line-height: var(--bjj-typography-line-height-tight);
}

.bjj-input--md {
  padding: var(--bjj-spacing-2) var(--bjj-spacing-3);
  font-size: var(--bjj-typography-font-size-base);
  line-height: var(--bjj-typography-line-height-normal);
}

.bjj-input--lg {
  padding: var(--bjj-spacing-3) var(--bjj-spacing-4);
  font-size: var(--bjj-typography-font-size-lg);
  line-height: var(--bjj-typography-line-height-relaxed);
}
</style>
