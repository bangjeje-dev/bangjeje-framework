/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { BjjSwitch } from "../../src/components/switch";
import { BjjFormGroup } from "../../src/components/form-group";
import { BjjLabel } from "../../src/components/label";
import { BjjFormMessage } from "../../src/components/form-message";

describe("BjjSwitch", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(BjjSwitch);
    expect(wrapper.exists()).toBe(true);
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("checkbox");
    expect(input.attributes("role")).toBe("switch");
    expect(input.attributes("id")).toMatch(/^bjj-input-v-\d+$/);
    expect(input.attributes("aria-checked")).toBe("false");
  });

  it("handles boolean v-model correctly", async () => {
    const wrapper = mount(BjjSwitch, {
      props: {
        modelValue: false,
        "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
      },
    });

    const input = wrapper.find("input");
    expect(input.element.checked).toBe(false);
    expect(wrapper.classes()).not.toContain("is-checked");
    expect(input.attributes("aria-checked")).toBe("false");

    await input.setValue(true);
    expect(wrapper.props("modelValue")).toBe(true);
    expect(wrapper.classes()).toContain("is-checked");
    expect(input.attributes("aria-checked")).toBe("true");
  });

  it("applies disabled state", () => {
    const wrapper = mount(BjjSwitch, {
      props: { disabled: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(wrapper.classes()).toContain("is-disabled");
  });

  it("applies required state", () => {
    const wrapper = mount(BjjSwitch, {
      props: { required: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("required")).toBeDefined();
    expect(wrapper.classes()).toContain("is-required");
  });

  it("applies error state and ARIA attributes", () => {
    const wrapper = mount(BjjSwitch, {
      props: { error: true },
    });
    const input = wrapper.find("input");
    expect(wrapper.classes()).toContain("has-error");
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("integrates with BjjFormGroup context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjSwitch, BjjFormMessage },
      template: `
        <BjjFormGroup error="Error text" disabled>
          <BjjLabel>Group Label</BjjLabel>
          <BjjSwitch />
          <BjjFormMessage />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-form-message");
    const switchWrapper = wrapper.find(".bjj-switch");

    expect(switchWrapper.classes()).toContain("has-error");
    expect(switchWrapper.classes()).toContain("is-disabled");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe(message.attributes("id"));
  });

  it("local props override FormGroup context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjSwitch },
      template: `
        <BjjFormGroup disabled>
          <BjjSwitch :disabled="false" />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeUndefined();
    expect(wrapper.find(".bjj-switch").classes()).not.toContain("is-disabled");
  });
});
