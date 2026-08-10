import { inject, type InjectionKey } from "vue";
import type { BangjejeConfig } from "../config/types";

export const BangjejeConfigKey: InjectionKey<Readonly<BangjejeConfig>> = Symbol("BangjejeConfig");

/**
 * Safely injects the Bangjeje global configuration.
 * Must be used within a component tree where the BangjejeUI plugin is installed.
 */
export function useBangjejeConfig(): Readonly<BangjejeConfig> {
  const config = inject(BangjejeConfigKey);

  if (!config) {
    throw new Error(
      "[Bangjeje] useBangjejeConfig() called without BangjejeUI plugin installed. " +
        "Please ensure you have run app.use(BangjejeUI) in your application entry."
    );
  }

  return config;
}
