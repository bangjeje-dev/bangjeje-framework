import { inject } from "vue";
import type { ThemeContext } from "../types";

export const BangjejeThemeKey = Symbol("BangjejeTheme");

export function useTheme(): ThemeContext {
  const context = inject<ThemeContext>(BangjejeThemeKey);
  if (!context) {
    throw new Error(
      "[Bangjeje Framework] useTheme() must be used within an app where BangjejeTheme is installed."
    );
  }
  return context;
}
