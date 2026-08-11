import { type InjectionKey, type Ref } from "vue";

export interface RadioGroupContext {
  name: Ref<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue: Ref<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeEvent: (val: any) => void;
  disabled: Ref<boolean | undefined>;
  required: Ref<boolean | undefined>;
  error: Ref<string | boolean | undefined>;
}

export const RadioGroupContextKey: InjectionKey<RadioGroupContext> = Symbol("BjjRadioGroupContext");

export interface CheckboxGroupContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue: Ref<any[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeEvent: (val: any, checked: boolean) => void;
  disabled: Ref<boolean | undefined>;
  required: Ref<boolean | undefined>;
  error: Ref<string | boolean | undefined>;
}

export const CheckboxGroupContextKey: InjectionKey<CheckboxGroupContext> =
  Symbol("BjjCheckboxGroupContext");
