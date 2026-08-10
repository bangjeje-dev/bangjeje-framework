/* eslint-disable vue/one-component-per-file */
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createApp, defineComponent } from "vue";
import { BangjejeUI, useBangjejeConfig } from "../src";

describe("BangjejeUI Core Infrastructure", () => {
  it("should install plugin and provide default configuration", () => {
    let injectedConfig: ReturnType<typeof useBangjejeConfig>;

    const TestComponent = defineComponent({
      setup() {
        injectedConfig = useBangjejeConfig();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    app.use(BangjejeUI);

    // Mount app to a dummy element to trigger setup()
    const el = document.createElement("div");
    app.mount(el);

    expect(injectedConfig).toBeDefined();
    expect(injectedConfig.theme).toBe("light"); // default theme
    expect(injectedConfig.debug).toBe(false); // default debug
  });

  it("should merge user configuration options shallowly", () => {
    let injectedConfig: ReturnType<typeof useBangjejeConfig>;

    const TestComponent = defineComponent({
      setup() {
        injectedConfig = useBangjejeConfig();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    app.use(BangjejeUI, { theme: "dark" });

    const el = document.createElement("div");
    app.mount(el);

    expect(injectedConfig.theme).toBe("dark");
    expect(injectedConfig.debug).toBe(false); // still fallback to default
  });

  it("should treat the provided configuration as read-only", () => {
    let injectedConfig: ReturnType<typeof useBangjejeConfig>;

    const TestComponent = defineComponent({
      setup() {
        injectedConfig = useBangjejeConfig();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    app.use(BangjejeUI);
    const el = document.createElement("div");
    app.mount(el);

    expect(() => {
      injectedConfig.theme = "dark"; // trying to mutate
    }).toThrow();
  });

  it("should throw an actionable error if useBangjejeConfig is called without plugin installation", () => {
    const TestComponent = defineComponent({
      setup() {
        useBangjejeConfig(); // This should throw
        return () => null;
      },
    });

    const app = createApp(TestComponent);

    // We expect the app.mount() to throw an error since the setup function throws.
    // In Vue 3, setup errors can be caught via app.config.errorHandler.
    const errorHandler = vi.fn();
    app.config.errorHandler = errorHandler;

    const el = document.createElement("div");
    app.mount(el);

    expect(errorHandler).toHaveBeenCalled();
    const error = errorHandler.mock.calls[0][0] as Error;
    expect(error.message).toContain(
      "[Bangjeje] useBangjejeConfig() called without BangjejeUI plugin installed."
    );
  });
});
