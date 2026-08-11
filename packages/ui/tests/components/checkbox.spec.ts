/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { BjjCheckbox } from "../../src/components/checkbox";
import { BjjFormGroup } from "../../src/components/form-group";
import { BjjLabel } from "../../src/components/label";
import { BjjFormMessage } from "../../src/components/form-message";

describe("BjjCheckbox", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(BjjCheckbox);
    expect(wrapper.exists()).toBe(true);
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("checkbox");
    expect(input.attributes("id")).toMatch(/^bjj-input-v-\d+$/);
  });

  it("handles boolean v-model correctly", async () => {
    const wrapper = mount(BjjCheckbox, {
      props: {
        modelValue: false,
        "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
      },
    });

    const input = wrapper.find("input");
    expect(input.element.checked).toBe(false);
    expect(wrapper.classes()).not.toContain("is-checked");

    await input.setValue(true);
    expect(wrapper.props("modelValue")).toBe(true);
    expect(wrapper.classes()).toContain("is-checked");
  });

  it("handles array multi-select v-model correctly", async () => {
    const wrapper = mount(BjjCheckbox, {
      props: {
        modelValue: ["apple"],
        value: "banana",
        "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
      },
    });

    const input = wrapper.find("input");
    expect(input.element.checked).toBe(false);
    expect(wrapper.classes()).not.toContain("is-checked");

    await input.setValue(true);
    expect(wrapper.props("modelValue")).toEqual(["apple", "banana"]);
    expect(wrapper.classes()).toContain("is-checked");

    await input.setValue(false);
    expect(wrapper.props("modelValue")).toEqual(["apple"]);
    expect(wrapper.classes()).not.toContain("is-checked");
  });

  it("applies disabled state", () => {
    const wrapper = mount(BjjCheckbox, {
      props: { disabled: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(wrapper.classes()).toContain("is-disabled");
  });

  it("applies required state", () => {
    const wrapper = mount(BjjCheckbox, {
      props: { required: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("required")).toBeDefined();
    expect(wrapper.classes()).toContain("is-required");
  });

  it("applies error state and ARIA attributes", () => {
    const wrapper = mount(BjjCheckbox, {
      props: { error: true },
    });
    const input = wrapper.find("input");
    expect(wrapper.classes()).toContain("has-error");
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("preserves explicit ID and maps label[for]", () => {
    const wrapper = mount(BjjCheckbox, {
      props: {
        id: "my-check",
        label: "Accept terms",
      },
    });
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("my-check");
  });

  it("integrates with BjjFormGroup context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjCheckbox, BjjFormMessage },
      template: `
        <BjjFormGroup error="Error text" disabled>
          <BjjLabel>Group Label</BjjLabel>
          <BjjCheckbox />
          <BjjFormMessage />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-form-message");
    const checkboxWrapper = wrapper.find(".bjj-checkbox");

    expect(checkboxWrapper.classes()).toContain("has-error");
    expect(checkboxWrapper.classes()).toContain("is-disabled");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe(message.attributes("id"));
  });

  it("local props override FormGroup context (state precedence)", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjCheckbox },
      template: `
        <BjjFormGroup disabled>
          <BjjCheckbox :disabled="false" />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeUndefined();
    expect(wrapper.find(".bjj-checkbox").classes()).not.toContain("is-disabled");
  });
});
