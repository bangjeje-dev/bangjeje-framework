/* eslint-disable vue/one-component-per-file */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { createApp, defineComponent } from "vue";
import { BangjejeUI } from "@bangjeje/core";
import { BangjejeTheme, useTheme } from "../src";
import type { ThemeContext } from "../src";

describe("BangjejeTheme Architecture", () => {
  beforeEach(() => {
    // Clean up DOM before each test
    document.documentElement.style.removeProperty("--bjj-color-primary");
    document.documentElement.style.removeProperty("--bjj-color-background");
  });

  it("should initialize with default light theme if no BangjejeUI config is provided", () => {
    let themeContext: ThemeContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        themeContext = useTheme();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    // Suppress Vue warning about missing provide (handled gracefully by our plugin fallback)
    const originalWarn = console.warn;
    console.warn = () => {};

    app.use(BangjejeTheme);
    app.mount(document.createElement("div"));

    console.warn = originalWarn;

    expect(themeContext).toBeDefined();
    expect(themeContext?.activeTheme.value).toBe("light");
  });

  it("should read the initial theme from BangjejeUI core config", () => {
    let themeContext: ThemeContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        themeContext = useTheme();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    app.use(BangjejeUI, { theme: "enterprise" }); // Core config integration
    app.use(BangjejeTheme);
    app.mount(document.createElement("div"));

    expect(themeContext).toBeDefined();
    expect(themeContext?.activeTheme.value).toBe("enterprise");
  });

  it("should apply CSS Custom Properties to the root element when theme changes", async () => {
    let themeContext: ThemeContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        themeContext = useTheme();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    app.use(BangjejeTheme, {
      themes: {
        light: {
          colors: {
            primary: "#ffffff",
            background: "#000000",
          },
        },
        enterprise: {
          colors: {
            primary: "#123456",
          },
        },
      },
    });

    app.mount(document.createElement("div"));

    // By default, it initializes as 'light' (if BangjejeUI isn't used to override)
    // watchEffect is async in Vue, but during mount it flushes synchronously or microtask
    // Let's use a microtask delay to ensure watchEffect has run
    await Promise.resolve();

    expect(document.documentElement.style.getPropertyValue("--bjj-color-primary")).toBe("#ffffff");
    expect(document.documentElement.style.getPropertyValue("--bjj-color-background")).toBe(
      "#000000"
    );

    // Change theme to enterprise
    themeContext!.setTheme("enterprise");
    await Promise.resolve(); // wait for watchEffect

    expect(document.documentElement.style.getPropertyValue("--bjj-color-primary")).toBe("#123456");
    // background property should remain #000000 because 'enterprise' didn't define it,
    // and standard CSS style object retains old properties unless explicitly removed.
    // In a real scenario, we might clear previous styles, but for this basic proof, it's fine.
    expect(document.documentElement.style.getPropertyValue("--bjj-color-background")).toBe(
      "#000000"
    );
    expect(themeContext?.activeTheme.value).toBe("enterprise");
  });

  it("should throw an error if useTheme is called without BangjejeTheme installed", () => {
    // Calling useTheme outside of any Vue setup or injection context should throw our custom error
    expect(() => useTheme()).toThrowError(
      /\[Bangjeje Framework\] useTheme\(\) must be used within an app where BangjejeTheme is installed/
    );
  });

  it("should apply built-in light theme CSS Custom Properties when no custom theme configuration is provided", async () => {
    const TestComponent = defineComponent({
      setup() {
        useTheme();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    // Suppress the BangjejeUI not installed warning
    const originalWarn = console.warn;
    console.warn = () => {};
    app.use(BangjejeTheme);
    app.mount(document.createElement("div"));
    console.warn = originalWarn;

    await Promise.resolve(); // Wait for watchEffect

    expect(document.documentElement.style.getPropertyValue("--bjj-color-primary")).toBe("#0052cc");
    expect(document.documentElement.style.getPropertyValue("--bjj-color-background")).toBe(
      "#ffffff"
    );
  });

  it("should throw a clear error when an unknown theme is requested in setTheme()", () => {
    let themeContext: ThemeContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        themeContext = useTheme();
        return () => null;
      },
    });

    const app = createApp(TestComponent);
    const originalWarn = console.warn;
    console.warn = () => {};
    app.use(BangjejeTheme);
    app.mount(document.createElement("div"));
    console.warn = originalWarn;

    expect(() => themeContext!.setTheme("unknown-theme")).toThrowError(
      /\[Bangjeje Framework\] Theme "unknown-theme" is not registered\./
    );
  });
});
