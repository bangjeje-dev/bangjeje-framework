<script setup lang="ts">
import { provide, ref } from "vue";
import type { SelectValue } from "./select";
import { selectInjectionKey } from "./select";
import { useFormControl } from "../../composables/use-form-control";
import BjjPopover from "../popover/BjjPopover.vue";
import type { PopoverPlacement } from "../../composables/use-floating";

defineOptions({
  name: "BjjSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue?: SelectValue;
    id?: string;
    disabled?: boolean;
    error?: string | boolean;
    required?: boolean;
    placement?: PopoverPlacement;
    offset?: number;
  }>(),
  {
    modelValue: undefined,
    id: undefined,
    disabled: undefined,
    error: undefined,
    required: undefined,
    placement: undefined,
    offset: undefined,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: SelectValue];
}>();

const formControl = useFormControl(props);
const isOpen = ref(false);
const internalValue = ref<SelectValue>(props.modelValue);

const setModelValue = (val: SelectValue) => {
  internalValue.value = val;
  emit("update:modelValue", val);
};

// Roving focus tracking
type OptionRef = { value: SelectValue; el: HTMLElement; disabled: boolean };
const optionRefs = ref<OptionRef[]>([]);

const registerOptionRef = (value: SelectValue, el: HTMLElement, disabled: boolean) => {
  if (!optionRefs.value.some((o) => o.value === value)) {
    optionRefs.value.push({ value, el, disabled });
  }
};

const unregisterOptionRef = (value: SelectValue) => {
  optionRefs.value = optionRefs.value.filter((o) => o.value !== value);
};

const getAvailableOptions = () => {
  return optionRefs.value.filter((o) => !o.disabled);
};

const focusOptionEl = (option: OptionRef | undefined) => {
  if (option && option.el) {
    option.el.focus();
  }
};

const focusFirstOption = () => {
  const options = getAvailableOptions();
  focusOptionEl(options[0]);
};

const focusLastOption = () => {
  const options = getAvailableOptions();
  focusOptionEl(options[options.length - 1]);
};

const focusNextOption = (currentValue: SelectValue | null) => {
  const options = getAvailableOptions();
  if (options.length === 0) return;

  const currentIndex = options.findIndex((o) => o.value === currentValue);
  if (currentIndex === -1 || currentIndex === options.length - 1) {
    // If not found or at the end, non-wrapping means stay or focus last (already there)
    if (currentIndex === -1) focusOptionEl(options[0]);
  } else {
    focusOptionEl(options[currentIndex + 1]);
  }
};

const focusPrevOption = (currentValue: SelectValue | null) => {
  const options = getAvailableOptions();
  if (options.length === 0) return;

  const currentIndex = options.findIndex((o) => o.value === currentValue);
  if (currentIndex === -1 || currentIndex === 0) {
    // If not found or at start, non-wrapping means stay or focus first
    if (currentIndex === -1) focusOptionEl(options[options.length - 1]);
  } else {
    focusOptionEl(options[currentIndex - 1]);
  }
};

provide(selectInjectionKey, {
  modelValue: internalValue,
  isOpen,
  disabled: formControl.disabled,
  selectOption: (val: SelectValue) => {
    setModelValue(val);
    isOpen.value = false;
  },
  registerOptionRef,
  unregisterOptionRef,
  focusFirstOption,
  focusLastOption,
  focusNextOption,
  focusPrevOption,
  id: formControl.id,
  ariaDescribedBy: formControl.ariaDescribedBy,
  ariaInvalid: formControl.ariaInvalid,
});
</script>

<template>
  <BjjPopover v-model="isOpen" :placement="placement" :offset="offset">
    <slot />
  </BjjPopover>
</template>
