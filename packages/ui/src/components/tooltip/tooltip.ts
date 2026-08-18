import type { InjectionKey, Ref } from "vue";
import type { PopoverPlacement } from "../../composables/use-floating";

export interface TooltipContext {
  isOpen: Ref<boolean>;
  isHovered: Ref<boolean>;
  isFocused: Ref<boolean>;
  contentId: string;
  triggerRef: Ref<HTMLElement | null | undefined>;
  contentRef: Ref<HTMLElement | null | undefined>;
  openDelay: Ref<number>;
  closeDelay: Ref<number>;
  placement: Ref<PopoverPlacement>;
  offset: Ref<number>;
  open: () => void;
  close: () => void;
}

export const tooltipInjectionKey: InjectionKey<TooltipContext> = Symbol("BjjTooltip");
