export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "password" | "email" | "number" | "tel" | "url";

export interface InputProps {
  modelValue?: string | number;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
  id?: string;
  error?: string;
}

export interface InputEmits {
  (e: "update:modelValue", value: string | number): void;
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
}
