import { describe, it, expect } from "vitest";
import {
  primitiveColors,
  primitiveSpacing,
  primitiveTypography,
  primitiveRadius,
  primitiveShadows,
  primitiveBreakpoints,
  primitiveZIndex,
} from "../src";

describe("Design Tokens", () => {
  it("should export primitive color scale", () => {
    expect(primitiveColors).toBeDefined();
    expect(primitiveColors.blue[500]).toBe("#3B82F6");
  });

  it("should export primitive spacing scale", () => {
    expect(primitiveSpacing).toBeDefined();
    expect(primitiveSpacing[4]).toBe("1rem");
  });

  it("should export primitive typography scale", () => {
    expect(primitiveTypography).toBeDefined();
    expect(primitiveTypography.fontFamily.sans).toContain("Outfit");
    expect(primitiveTypography.fontSize.base).toBe("1rem");
  });

  it("should export radius scale", () => {
    expect(primitiveRadius.md).toBeDefined();
  });

  it("should export shadow scale", () => {
    expect(primitiveShadows.md).toBeDefined();
  });

  it("should export breakpoint scale", () => {
    expect(primitiveBreakpoints.md).toBeDefined();
  });

  it("should export z-index scale", () => {
    expect(primitiveZIndex.base).toBeDefined();
  });
});
