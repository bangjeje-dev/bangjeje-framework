import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { BjjInput } from "../../src/components/input";

describe("BjjInput", () => {
  it("renders correctly", () => {
    const wrapper = mount(BjjInput, {
      props: {
        modelValue: "test value",
        placeholder: "Enter text",
      },
    });
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe("test value");
    expect(input.attributes("placeholder")).toBe("Enter text");
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(BjjInput);
    const input = wrapper.find("input");
    await input.setValue("new value");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new value"]);
  });

  it("renders label when provided", () => {
    const wrapper = mount(BjjInput, {
      props: {
        label: "Username",
      },
    });
    const label = wrapper.find("label");
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe("Username");
    expect(label.attributes("for")).toBe(wrapper.find("input").attributes("id"));
  });

  it("displays error message and applies error class", () => {
    const wrapper = mount(BjjInput, {
      props: {
        error: "Invalid input",
      },
    });
    const errorMsg = wrapper.find(".bjj-input__error-message");
    expect(errorMsg.exists()).toBe(true);
    expect(errorMsg.text()).toBe("Invalid input");

    const input = wrapper.find("input");
    expect(input.classes()).toContain("is-error");
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("handles disabled state", () => {
    const wrapper = mount(BjjInput, {
      props: {
        disabled: true,
      },
    });
    const input = wrapper.find("input");
    expect(input.classes()).toContain("is-disabled");
    expect(input.attributes("disabled")).toBeDefined();
  });
});
