import type { InjectionKey, Ref } from "vue";
import type { PopoverPlacement } from "../../composables/use-floating";

export interface PopoverProps {
  modelValue?: boolean;
  placement?: PopoverPlacement;
  offset?: number;
}

export interface PopoverContext {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: Ref<HTMLElement | undefined>;
  contentRef: Ref<HTMLElement | undefined>;
  contentId: string;
  placement: Ref<PopoverPlacement | undefined>;
  offset: Ref<number | undefined>;
}

export const popoverInjectionKey: InjectionKey<PopoverContext> = Symbol("BjjPopover");
