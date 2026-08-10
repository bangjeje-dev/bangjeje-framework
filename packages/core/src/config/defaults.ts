import type { BangjejeConfig } from "./types";

export const defaultConfig: BangjejeConfig = {
  theme: "light",
  debug: false,
};

/**
 * Shallow merge user options with default configuration.
 */
export function mergeConfig(options: Partial<BangjejeConfig> = {}): BangjejeConfig {
  return {
    ...defaultConfig,
    ...options,
  };
}
