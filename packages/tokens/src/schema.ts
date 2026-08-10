export interface SemanticColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
}

export interface TypographySchema {
  fontFamily: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface ThemeSchema {
  colors: SemanticColors;
  typography: TypographySchema;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, string>;
}

export interface TypographyOverrides {
  fontFamily?: Record<string, string>;
  fontSize?: Record<string, string>;
  fontWeight?: Record<string, string>;
  lineHeight?: Record<string, string>;
  letterSpacing?: Record<string, string>;
}

export interface ThemeOverrides {
  colors?: Partial<SemanticColors>;
  typography?: TypographyOverrides;
  spacing?: Record<string, string>;
  radius?: Record<string, string>;
  shadows?: Record<string, string>;
  breakpoints?: Record<string, string>;
  zIndex?: Record<string, string>;
}
