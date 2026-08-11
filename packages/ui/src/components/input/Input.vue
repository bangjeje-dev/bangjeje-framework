<script setup lang="ts">
import { computed } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import { useFormControl } from "../../composables/use-form-control";
import type { InputProps, InputEmits } from "./input";

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: "",
  type: "text",
  size: "md",
  disabled: undefined,
  readonly: false,
  error: undefined,
  label: undefined,
  id: undefined,
});

const emit = defineEmits<InputEmits>();

const ns = useNamespace("input");

const formControl = useFormControl({
  id: props.id,
  disabled: props.disabled,
  error: props.error,
});

const classes = computed(() => [
  ns.b(),
  ns.m(props.size),
  ns.is("disabled", formControl.disabled.value),
  ns.is("error", formControl.hasError.value),
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleFocus = (event: FocusEvent) => emit("focus", event);
const handleBlur = (event: FocusEvent) => emit("blur", event);

// Check if legacy props are used
const hasLegacyProps = computed(() => !!props.label || !!props.error);
</script>

<template>
  <div v-if="hasLegacyProps" :class="ns.e('wrapper')">
    <label v-if="label" :for="formControl.id.value" :class="ns.e('label')">
      {{ label }}
    </label>
    <input
      :id="formControl.id.value"
      :class="classes"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="formControl.disabled.value"
      :readonly="readonly"
      :aria-invalid="formControl.hasError.value ? 'true' : undefined"
      :aria-describedby="formControl.ariaDescribedBy.value"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div v-if="error" :id="formControl.messageId.value" :class="ns.e('error-message')" role="alert">
      {{ error }}
    </div>
  </div>

  <input
    v-else
    :id="formControl.id.value"
    :class="classes"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="formControl.disabled.value"
    :readonly="readonly"
    :aria-invalid="formControl.hasError.value ? 'true' : undefined"
    :aria-describedby="formControl.ariaDescribedBy.value"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
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
  color: var(--bjj-colors-border);
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
