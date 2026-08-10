import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { BjjButton } from "../../src/components/button";

describe("BjjButton", () => {
  it("renders default slot content", () => {
    const wrapper = mount(BjjButton, {
      slots: {
        default: "Click me",
      },
    });
    expect(wrapper.text()).toContain("Click me");
  });

  it("applies variant and size classes correctly", () => {
    const wrapper = mount(BjjButton, {
      props: {
        variant: "danger",
        size: "lg",
      },
    });
    const classes = wrapper.classes();
    expect(classes).toContain("bjj-button");
    expect(classes).toContain("bjj-button--danger");
    expect(classes).toContain("bjj-button--lg");
  });

  it("handles disabled state", () => {
    const wrapper = mount(BjjButton, {
      props: {
        disabled: true,
      },
    });
    expect(wrapper.classes()).toContain("is-disabled");
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });

  it("handles loading state", () => {
    const wrapper = mount(BjjButton, {
      props: {
        loading: true,
      },
    });
    expect(wrapper.classes()).toContain("is-loading");
    expect(wrapper.classes()).toContain("is-disabled");
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".bjj-button__spinner").exists()).toBe(true);
  });
});
