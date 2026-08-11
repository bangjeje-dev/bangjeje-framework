<script setup lang="ts">
import { computed } from "vue";
import { useFormControl } from "../../composables/use-form-control";
import { useNamespace } from "../../composables/use-namespace";
import type { LabelProps } from "./label";

const props = withDefaults(defineProps<LabelProps>(), {
  for: undefined,
  required: undefined,
});

const ns = useNamespace("label");

const formControl = useFormControl({
  id: props.for,
  required: props.required,
});

const classes = computed(() => [ns.b(), ns.is("required", formControl.required.value)]);
</script>

<template>
  <label :for="formControl.id.value" :class="classes">
    <slot />
    <span v-if="formControl.required.value" :class="ns.e('asterisk')" aria-hidden="true">*</span>
  </label>
</template>

<style>
.bjj-label {
  font-family: var(--bjj-typography-font-family-base, inherit);
  font-size: var(--bjj-typography-font-size-sm);
  font-weight: var(--bjj-typography-font-weight-medium, 500);
  color: var(--bjj-colors-text);
  display: inline-block;
}

.bjj-label__asterisk {
  color: var(--bjj-colors-danger);
  margin-left: var(--bjj-spacing-1);
}
</style>
