export interface ThemeDefinition {
  colors?: {
    primary?: string;
    background?: string;
  };
}

export interface BangjejeThemeOptions {
  themes?: Record<string, ThemeDefinition>;
}

export interface ThemeContext {
  activeTheme: import("vue").Ref<string>;
  setTheme: (name: string) => void;
  getThemeDefinition: (name: string) => ThemeDefinition | undefined;
}
