export interface CheckboxGroupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any[];
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
  error?: string | boolean;
}

export interface CheckboxGroupEmits {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "update:modelValue", value: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "change", value: any[]): void;
}
