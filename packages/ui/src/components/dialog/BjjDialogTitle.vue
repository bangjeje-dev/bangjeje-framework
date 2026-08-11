<script setup lang="ts">
import { inject, onMounted, onUnmounted, useId } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import { dialogInjectionKey } from "./dialog";

const ns = useNamespace("dialog");
const dialogContext = inject(dialogInjectionKey, undefined);

const id = useId();

onMounted(() => {
  if (dialogContext) {
    dialogContext.titleId.value = id;
  }
});

onUnmounted(() => {
  if (dialogContext && dialogContext.titleId.value === id) {
    dialogContext.titleId.value = undefined;
  }
});
</script>

<template>
  <h2 :id="id" :class="ns.e('title')">
    <slot />
  </h2>
</template>
