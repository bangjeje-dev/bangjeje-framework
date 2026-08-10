import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src/**/*.ts", "src/**/*.vue"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BangjejeUI",
      fileName: "bangjeje-ui",
    },
    rollupOptions: {
      external: ["vue", "@bangjeje/core", "@bangjeje/theme", "@bangjeje/tokens"],
      output: {
        globals: {
          vue: "Vue",
          "@bangjeje/core": "BangjejeCore",
          "@bangjeje/theme": "BangjejeTheme",
          "@bangjeje/tokens": "BangjejeTokens",
        },
      },
    },
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
  },
});
