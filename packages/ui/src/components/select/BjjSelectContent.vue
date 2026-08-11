<script setup lang="ts">
import { inject } from "vue";
import { selectInjectionKey } from "./select";
import BjjPopoverContent from "../popover/BjjPopoverContent.vue";
import { useNamespace } from "../../composables/use-namespace";

defineOptions({
  name: "BjjSelectContent",
});

const ns = useNamespace("select__content");

const selectContext = inject(selectInjectionKey);
if (!selectContext) {
  throw new Error("BjjSelectContent must be used within a BjjSelect");
}
</script>

<template>
  <BjjPopoverContent :class="ns.b()" role="listbox" aria-multiselectable="false">
    <slot />
  </BjjPopoverContent>
</template>
