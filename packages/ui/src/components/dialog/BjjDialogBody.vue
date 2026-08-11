<script setup lang="ts">
import { inject, onMounted, onUnmounted, useId } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import { dialogInjectionKey } from "./dialog";

const ns = useNamespace("dialog");
const dialogContext = inject(dialogInjectionKey, undefined);

const id = useId();

onMounted(() => {
  if (dialogContext) {
    dialogContext.bodyId.value = id;
  }
});

onUnmounted(() => {
  if (dialogContext && dialogContext.bodyId.value === id) {
    dialogContext.bodyId.value = undefined;
  }
});
</script>

<template>
  <div :id="id" :class="ns.e('body')">
    <slot />
  </div>
</template>
