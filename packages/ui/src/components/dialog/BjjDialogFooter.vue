<script setup lang="ts">
import { useNamespace } from "../../composables/use-namespace";

const ns = useNamespace("dialog");
</script>

<template>
  <div :class="ns.e('footer')">
    <slot />
  </div>
</template>
