/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { BjjRadio } from "../../src/components/radio";
import { BjjFormGroup } from "../../src/components/form-group";
import { BjjLabel } from "../../src/components/label";
import { BjjFormMessage } from "../../src/components/form-message";

describe("BjjRadio", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(BjjRadio, { props: { value: "A" } });
    expect(wrapper.exists()).toBe(true);
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("radio");
    expect(input.attributes("id")).toMatch(/^bjj-input-v-\d+$/);
  });

  it("handles selected value correctly", async () => {
    const wrapper = mount(BjjRadio, {
      props: {
        modelValue: "A",
        value: "B",
        "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
      },
    });

    const input = wrapper.find("input");
    expect(input.element.checked).toBe(false);
    expect(wrapper.classes()).not.toContain("is-checked");

    await input.setValue();
    expect(wrapper.props("modelValue")).toBe("B");
    expect(wrapper.classes()).toContain("is-checked");
  });

  it("applies disabled state", () => {
    const wrapper = mount(BjjRadio, {
      props: { value: "A", disabled: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(wrapper.classes()).toContain("is-disabled");
  });

  it("applies required state", () => {
    const wrapper = mount(BjjRadio, {
      props: { value: "A", required: true },
    });
    const input = wrapper.find("input");
    expect(input.attributes("required")).toBeDefined();
    expect(wrapper.classes()).toContain("is-required");
  });

  it("applies error state and ARIA attributes", () => {
    const wrapper = mount(BjjRadio, {
      props: { value: "A", error: true },
    });
    const input = wrapper.find("input");
    expect(wrapper.classes()).toContain("has-error");
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("integrates with BjjFormGroup context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjRadio, BjjFormMessage },
      template: `
        <BjjFormGroup error="Error text" disabled>
          <BjjLabel>Group Label</BjjLabel>
          <BjjRadio value="A" />
          <BjjRadio value="B" />
          <BjjFormMessage />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const radios = wrapper.findAll(".bjj-radio");
    const inputs = wrapper.findAll("input");
    const message = wrapper.find(".bjj-form-message");

    expect(radios[0].classes()).toContain("has-error");
    expect(radios[0].classes()).toContain("is-disabled");
    expect(inputs[0].attributes("disabled")).toBeDefined();
    expect(inputs[0].attributes("aria-disabled")).toBe("true");
    expect(inputs[0].attributes("aria-invalid")).toBe("true");
    expect(inputs[0].attributes("aria-describedby")).toBe(message.attributes("id"));

    // Group testing - they should share context
    expect(radios[1].classes()).toContain("has-error");
  });

  it("local props override FormGroup context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjRadio },
      template: `
        <BjjFormGroup disabled>
          <BjjRadio value="A" :disabled="false" />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeUndefined();
    expect(wrapper.find(".bjj-radio").classes()).not.toContain("is-disabled");
  });
});
