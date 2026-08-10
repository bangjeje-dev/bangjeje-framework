import type { ThemeDefinition } from "../types";

/**
 * Transforms a ThemeDefinition object into CSS variables.
 * For Sprint 2, this is a basic implementation to prove the architecture.
 */
export function applyThemeVariables(themeDef: ThemeDefinition | undefined): void {
  if (!themeDef || typeof document === "undefined") return;

  const root = document.documentElement;

  if (themeDef.colors) {
    if (themeDef.colors.primary) {
      root.style.setProperty("--bjj-color-primary", themeDef.colors.primary);
    }
    if (themeDef.colors.background) {
      root.style.setProperty("--bjj-color-background", themeDef.colors.background);
    }
  }
}
