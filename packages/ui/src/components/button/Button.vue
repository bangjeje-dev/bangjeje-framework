<script setup lang="ts">
import { computed } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import type { ButtonProps } from "./button";

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
});

const ns = useNamespace("button");

const classes = computed(() => [
  ns.b(),
  ns.m(props.variant),
  ns.m(props.size),
  ns.is("disabled", props.disabled || props.loading),
  ns.is("loading", props.loading),
]);
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
  >
    <span v-if="loading" :class="ns.e('spinner')" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="path" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      </svg>
    </span>
    <span :class="ns.e('content')">
      <slot />
    </span>
  </button>
</template>

<style>
.bjj-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--bjj-typography-font-family-base, inherit);
  font-weight: var(--bjj-typography-font-weight-medium, 500);
  border: 1px solid transparent;
  border-radius: var(--bjj-radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
  text-decoration: none;
  user-select: none;
}

.bjj-button:focus-visible {
  box-shadow:
    0 0 0 2px var(--bjj-colors-surface),
    0 0 0 4px var(--bjj-colors-primary);
}

.bjj-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Sizes */
.bjj-button--sm {
  padding: var(--bjj-spacing-1) var(--bjj-spacing-2);
  font-size: var(--bjj-typography-font-size-sm);
  line-height: var(--bjj-typography-line-height-tight);
}

.bjj-button--md {
  padding: var(--bjj-spacing-2) var(--bjj-spacing-4);
  font-size: var(--bjj-typography-font-size-base);
  line-height: var(--bjj-typography-line-height-normal);
}

.bjj-button--lg {
  padding: var(--bjj-spacing-3) var(--bjj-spacing-6);
  font-size: var(--bjj-typography-font-size-lg);
  line-height: var(--bjj-typography-line-height-relaxed);
}

/* Variants */
.bjj-button--primary {
  background-color: var(--bjj-colors-primary);
  color: var(--bjj-colors-surface);
}

.bjj-button--primary:hover:not(.is-disabled) {
  opacity: 0.9;
}

.bjj-button--secondary {
  background-color: transparent;
  color: var(--bjj-colors-primary);
  border-color: var(--bjj-colors-primary);
}

.bjj-button--secondary:hover:not(.is-disabled) {
  background-color: var(--bjj-colors-primary);
  color: var(--bjj-colors-surface);
}

.bjj-button--danger {
  background-color: var(--bjj-colors-danger);
  color: var(--bjj-colors-surface);
}

.bjj-button--danger:hover:not(.is-disabled) {
  opacity: 0.9;
}

.bjj-button--ghost {
  background-color: transparent;
  color: var(--bjj-colors-text);
}

.bjj-button--ghost:hover:not(.is-disabled) {
  background-color: var(
    --bjj-colors-surface
  ); /* Assuming surface acts as a subtle background here if we don't have a specific hover token yet */
  /* To avoid hardcoding, we use text with opacity or something, but let's stick to semantic variables */
  opacity: 0.8;
}

/* Spinner */
.bjj-button__spinner {
  display: inline-block;
  margin-right: var(--bjj-spacing-2);
  width: 1em;
  height: 1em;
  animation: bjj-spin 1s linear infinite;
}

.bjj-button__spinner .path {
  stroke-linecap: round;
  animation: bjj-dash 1.5s ease-in-out infinite;
}

@keyframes bjj-spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes bjj-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
