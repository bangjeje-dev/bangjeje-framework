import type { InjectionKey, Ref } from "vue";

export type SelectValue = string | number | undefined | null;

export interface SelectContext {
  modelValue: Ref<SelectValue>;
  isOpen: Ref<boolean>;
  disabled: Ref<boolean>;
  selectOption: (value: SelectValue) => void;
  // While we avoid a complex registry, we still need to know the DOM elements for roving focus
  // We can track registered options via their values so we can focus them programmatically
  registerOptionRef: (value: SelectValue, el: HTMLElement, disabled: boolean) => void;
  unregisterOptionRef: (value: SelectValue) => void;
  focusNextOption: (currentValue: SelectValue | null) => void;
  focusPrevOption: (currentValue: SelectValue | null) => void;
  focusFirstOption: () => void;
  focusLastOption: () => void;
  id: Ref<string>;
  ariaDescribedBy: Ref<string | undefined>;
  ariaInvalid: Ref<boolean>;
}

export const selectInjectionKey: InjectionKey<SelectContext> = Symbol("BjjSelect");
