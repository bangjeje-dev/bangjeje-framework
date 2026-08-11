export interface CheckboxProps {
  modelValue?: boolean | unknown[];
  value?: unknown;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  label?: string;
}

export interface CheckboxEmits {
  (e: "update:modelValue", value: boolean | unknown[] | undefined): void;
  (e: "change", value: boolean | unknown[] | undefined): void;
}
