import { inject, computed, type Ref, type InjectionKey, useId } from "vue";

export interface FormContext {
  id: Ref<string>;
  disabled: Ref<boolean | undefined>;
  error: Ref<string | boolean | undefined>;
  required: Ref<boolean | undefined>;
}

export const FormContextKey: InjectionKey<FormContext> = Symbol("BjjFormContext");

export interface UseFormControlProps {
  id?: string;
  disabled?: boolean;
  error?: string | boolean;
  required?: boolean;
}

export function useFormControl(props: UseFormControlProps) {
  const context = inject(FormContextKey, null);
  const fallbackId = useId();

  const fieldId = computed(() => {
    if (props.id !== undefined) return props.id;
    if (context && context.id.value) return context.id.value;
    return `bjj-input-${fallbackId}`;
  });

  const messageId = computed(() => `${fieldId.value}-message`);

  const mergedDisabled = computed(() => {
    if (props.disabled !== undefined) return props.disabled;
    if (context && context.disabled.value !== undefined) return context.disabled.value;
    return false;
  });

  const mergedError = computed(() => {
    if (props.error !== undefined) return props.error;
    if (context && context.error.value !== undefined) return context.error.value;
    return false;
  });

  const mergedRequired = computed(() => {
    if (props.required !== undefined) return props.required;
    if (context && context.required.value !== undefined) return context.required.value;
    return false;
  });

  const hasError = computed(() => !!mergedError.value);

  const ariaDescribedBy = computed(() => {
    return hasError.value ? messageId.value : undefined;
  });

  return {
    id: fieldId,
    messageId,
    disabled: mergedDisabled,
    error: mergedError,
    required: mergedRequired,
    hasError,
    ariaDescribedBy,
    ariaInvalid: hasError,
  };
}
