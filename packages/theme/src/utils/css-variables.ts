import type { ThemeDefinition } from "../types";

/**
 * Transforms a ThemeDefinition object into CSS variables via automatic flattening.
 */
export function applyThemeVariables(themeDef: ThemeDefinition | undefined): void {
  if (!themeDef || typeof document === "undefined") return;

  const root = document.documentElement;

  const flatten = (obj: Record<string, unknown>, prefix = "--bjj") => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        const kebabKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
        const newPrefix = `${prefix}-${kebabKey}`;

        if (typeof val === "object" && val !== null) {
          flatten(val, newPrefix);
        } else if (val !== undefined && val !== null) {
          root.style.setProperty(newPrefix, String(val));
        }
      }
    }
  };

  flatten(themeDef);
}
