<script setup lang="ts">
import { computed } from "vue";
import { useFormControl } from "../../composables/use-form-control";
import { useNamespace } from "../../composables/use-namespace";
import type { FormMessageProps } from "./form-message";

const props = withDefaults(defineProps<FormMessageProps>(), {
  id: undefined,
});

const ns = useNamespace("form-message");

const formControl = useFormControl({
  id: props.id,
});

const errorMessage = computed(() => {
  const err = formControl.error.value;
  if (typeof err === "string") return err;
  return null;
});
</script>

<template>
  <div
    v-if="formControl.hasError.value"
    :id="formControl.messageId.value"
    :class="ns.b()"
    role="alert"
  >
    <slot>{{ errorMessage }}</slot>
  </div>
</template>

<style>
.bjj-form-message {
  font-family: var(--bjj-typography-font-family-base, inherit);
  font-size: var(--bjj-typography-font-size-sm);
  color: var(--bjj-colors-danger);
}
</style>
