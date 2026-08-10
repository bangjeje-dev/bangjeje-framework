import type { App, Plugin } from "vue";
import type { BangjejePluginOptions } from "../config/types";
import { mergeConfig } from "../config/defaults";
import { BangjejeConfigKey } from "../providers/config-provider";

/**
 * BangjejeUI Vue Plugin
 * Orchestrates the global configuration and dependency injection for the framework.
 */
export const BangjejeUI: Plugin = {
  install(app: App, options?: BangjejePluginOptions) {
    const config = Object.freeze(mergeConfig(options));

    // Provide the read-only configuration to the application
    app.provide(BangjejeConfigKey, config);
  },
};
