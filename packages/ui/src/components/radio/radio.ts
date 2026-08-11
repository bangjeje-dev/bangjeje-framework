export interface RadioProps {
  modelValue?: unknown;
  value: unknown;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  label?: string;
}

export interface RadioEmits {
  (e: "update:modelValue", value: unknown): void;
  (e: "change", value: unknown): void;
}
