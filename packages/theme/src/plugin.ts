import type { App, Plugin } from "vue";
import { ref, watchEffect } from "vue";
import { useBangjejeConfig } from "@bangjeje/core";
import type { BangjejeThemeOptions, ThemeContext, ThemeDefinition } from "./types";
import { BangjejeThemeKey } from "./composables/useTheme";
import { applyThemeVariables } from "./utils/css-variables";

const builtinLightTheme: ThemeDefinition = {
  colors: {
    primary: "#0052cc",
    background: "#ffffff",
  },
};

export const BangjejeTheme: Plugin = {
  install(app: App, options?: BangjejeThemeOptions) {
    // 1. Get initial theme from core configuration
    let initialTheme = "light";
    try {
      const config = app.runWithContext(() => useBangjejeConfig());
      if (config.theme) {
        initialTheme = config.theme;
      }
    } catch (e) {
      console.warn(
        "[Bangjeje Framework] BangjejeTheme installed without BangjejeUI. Falling back to default light theme."
      );
    }

    // 2. Setup lightweight reactive state
    const activeTheme = ref(initialTheme);
    const themes: Record<string, ThemeDefinition> = {
      light: builtinLightTheme,
      ...(options?.themes || {}),
    };

    // 3. Define Context
    const context: ThemeContext = {
      activeTheme,
      setTheme: (name: string) => {
        if (!themes[name]) {
          throw new Error(`[Bangjeje Framework] Theme "${name}" is not registered.`);
        }
        activeTheme.value = name;
      },
      getThemeDefinition: (name: string) => themes[name],
    };

    // 4. Provide Context
    app.provide(BangjejeThemeKey, context);

    // 5. Setup Side Effect for CSS Custom Properties
    watchEffect(() => {
      const currentDef = themes[activeTheme.value];
      applyThemeVariables(currentDef);
    });
  },
};
