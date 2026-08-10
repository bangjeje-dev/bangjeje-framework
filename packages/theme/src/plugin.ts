import type { App, Plugin } from "vue";
import { ref, watchEffect } from "vue";
import { useBangjejeConfig } from "@bangjeje/core";
import type { BangjejeThemeOptions, ThemeContext, ThemeDefinition } from "./types";
import { BangjejeThemeKey } from "./composables/useTheme";
import { applyThemeVariables } from "./utils/css-variables";

import {
  primitiveColors,
  primitiveTypography,
  primitiveSpacing,
  primitiveRadius,
  primitiveShadows,
  primitiveBreakpoints,
  primitiveZIndex,
} from "@bangjeje/tokens";

const builtinLightTheme: ThemeDefinition = {
  colors: {
    primary: primitiveColors.blue[600],
    background: primitiveColors.white,
    surface: primitiveColors.white,
    text: primitiveColors.gray[900],
    border: primitiveColors.gray[200],
    danger: primitiveColors.red[600],
    success: primitiveColors.green[600],
    warning: primitiveColors.yellow[500],
  },
  typography: {
    fontFamily: primitiveTypography.fontFamily,
    fontSize: primitiveTypography.fontSize,
    fontWeight: primitiveTypography.fontWeight,
    lineHeight: primitiveTypography.lineHeight,
    letterSpacing: primitiveTypography.letterSpacing,
  },
  spacing: primitiveSpacing,
  radius: primitiveRadius,
  shadows: primitiveShadows,
  breakpoints: primitiveBreakpoints,
  zIndex: primitiveZIndex,
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
