export interface SwitchProps {
  modelValue?: boolean;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  label?: string;
}

export interface SwitchEmits {
  (e: "update:modelValue", value: boolean | undefined): void;
  (e: "change", value: boolean | undefined): void;
}
