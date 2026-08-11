<script setup lang="ts">
import { ref, provide, toRef, computed } from "vue";
import { useNamespace } from "../../composables/use-namespace";
import { useScrollLock } from "../../composables/use-scroll-lock";
import { useFocusTrap } from "../../composables/use-focus-trap";
import { useEscapeKey } from "../../composables/use-escape-key";
import { dialogInjectionKey, type DialogProps, type DialogEmits } from "./dialog";

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  preventClose: false,
});

const emit = defineEmits<DialogEmits>();

const ns = useNamespace("dialog");

const titleId = ref<string | undefined>(undefined);
const bodyId = ref<string | undefined>(undefined);
const dialogRef = ref<HTMLElement | null>(null);

const isOpen = toRef(props, "modelValue");

const close = () => {
  if (!props.preventClose) {
    emit("update:modelValue", false);
  }
};

useScrollLock(isOpen);
useFocusTrap(dialogRef, isOpen);
useEscapeKey(isOpen, close, toRef(props, "preventClose"));

provide(dialogInjectionKey, {
  titleId,
  bodyId,
  close,
});

const handleBackdropClick = () => {
  close();
};

const ariaLabelledby = computed(() => titleId.value || undefined);
const ariaDescribedby = computed(() => bodyId.value || undefined);
</script>

<template>
  <Teleport to="body">
    <Transition :name="ns.b('fade')">
      <div v-if="isOpen" :class="ns.b('root')">
        <!-- Backdrop -->
        <div :class="ns.e('overlay')" aria-hidden="true" @click="handleBackdropClick"></div>

        <!-- Dialog Content -->
        <div
          ref="dialogRef"
          :class="ns.e('content')"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="ariaDescribedby"
          tabindex="-1"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* Transitions */
.bjj-dialog-fade-enter-active,
.bjj-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.bjj-dialog-fade-enter-from,
.bjj-dialog-fade-leave-to {
  opacity: 0;
}

.bjj-dialog-fade-enter-active .bjj-dialog__content {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.bjj-dialog-fade-leave-active .bjj-dialog__content {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.bjj-dialog-fade-enter-from .bjj-dialog__content,
.bjj-dialog-fade-leave-to .bjj-dialog__content {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Base structural classes */
.bjj-dialog-root {
  position: fixed;
  inset: 0;
  z-index: var(--bjj-z-index-modal, 1040);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--bjj-spacing-4, 1rem);
}

.bjj-dialog__overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.bjj-dialog__content {
  position: relative;
  background-color: var(--bjj-colors-surface, #ffffff);
  border-radius: var(--bjj-radius-md, 0.375rem);
  box-shadow: var(--bjj-shadows-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  width: 100%;
  max-width: 32rem; /* approx 512px */
  max-height: calc(100vh - var(--bjj-spacing-8, 2rem));
  display: flex;
  flex-direction: column;
  outline: none;
}

.bjj-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--bjj-spacing-4, 1rem) var(--bjj-spacing-6, 1.5rem);
  border-bottom: 1px solid var(--bjj-colors-gray-200, #e5e7eb);
}

.bjj-dialog__title {
  margin: 0;
  font-size: var(--bjj-typography-font-size-lg, 1.25rem);
  font-weight: var(--bjj-typography-font-weight-semibold, 600);
  color: var(--bjj-colors-gray-900, #111827);
}

.bjj-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--bjj-radius-md, 0.375rem);
  color: var(--bjj-colors-gray-500, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.bjj-dialog__close:hover {
  background-color: var(--bjj-colors-gray-100, #f3f4f6);
  color: var(--bjj-colors-gray-900, #111827);
}

.bjj-dialog__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.bjj-dialog__body {
  padding: var(--bjj-spacing-6, 1.5rem);
  overflow-y: auto;
  color: var(--bjj-colors-gray-700, #374151);
  font-size: var(--bjj-typography-font-size-base, 1rem);
  line-height: var(--bjj-typography-line-height-normal, 1.5);
}

.bjj-dialog__footer {
  padding: var(--bjj-spacing-4, 1rem) var(--bjj-spacing-6, 1.5rem);
  border-top: 1px solid var(--bjj-colors-gray-200, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--bjj-spacing-3, 0.75rem);
}
</style>
