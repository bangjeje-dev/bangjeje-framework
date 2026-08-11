<script setup lang="ts">
import { provide, toRefs, useId, ref } from "vue";
import { FormContextKey, type FormContext } from "../../composables/use-form-control";
import { useNamespace } from "../../composables/use-namespace";
import type { FormGroupProps } from "./form-group";

const props = withDefaults(defineProps<FormGroupProps>(), {
  disabled: undefined,
  required: undefined,
});

const ns = useNamespace("form-group");

const { disabled, error, required } = toRefs(props);

const contextId = ref(props.id || useId());

const context: FormContext = {
  id: contextId,
  disabled,
  error,
  required,
};

provide(FormContextKey, context);
</script>

<template>
  <div :class="ns.b()">
    <slot />
  </div>
</template>

<style>
.bjj-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--bjj-spacing-1);
}
</style>
