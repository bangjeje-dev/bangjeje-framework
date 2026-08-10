export interface BangjejeConfig {
  // Global framework configuration properties will be added here
  // For Sprint 1, we keep it simple to establish the architecture
  theme?: string;
  debug?: boolean;
}

export type BangjejePluginOptions = Partial<BangjejeConfig>;
