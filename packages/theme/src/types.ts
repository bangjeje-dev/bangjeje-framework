import type { ThemeOverrides } from "@bangjeje/tokens";

export type ThemeDefinition = ThemeOverrides;

export interface BangjejeThemeOptions {
  themes?: Record<string, ThemeDefinition>;
}

export interface ThemeContext {
  activeTheme: import("vue").Ref<string>;
  setTheme: (name: string) => void;
  getThemeDefinition: (name: string) => ThemeDefinition | undefined;
}
