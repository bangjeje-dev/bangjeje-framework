<script setup lang="ts">
import { inject } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import { dialogInjectionKey } from "./dialog";
import BjjDialogTitle from "./BjjDialogTitle.vue";

withDefaults(
  defineProps<{
    title?: string;
    showClose?: boolean;
  }>(),
  {
    title: undefined,
    showClose: true,
  }
);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const ns = useNamespace("dialog");
const dialogContext = inject(dialogInjectionKey, undefined);

const handleClose = () => {
  emit("close");
  if (dialogContext) {
    dialogContext.close();
  }
};
</script>

<template>
  <div :class="ns.e('header')">
    <slot>
      <BjjDialogTitle v-if="title">{{ title }}</BjjDialogTitle>
    </slot>
    <button
      v-if="showClose"
      type="button"
      :class="ns.e('close')"
      aria-label="Close"
      @click="handleClose"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>
