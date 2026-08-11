import type { InjectionKey, Ref } from "vue";

export interface DialogProps {
  modelValue?: boolean;
  preventClose?: boolean;
}

export interface DialogEmits {
  (e: "update:modelValue", value: boolean): void;
}

export interface DialogContext {
  titleId: Ref<string | undefined>;
  bodyId: Ref<string | undefined>;
  close: () => void;
}

export const dialogInjectionKey: InjectionKey<DialogContext> = Symbol("bjj-dialog");
