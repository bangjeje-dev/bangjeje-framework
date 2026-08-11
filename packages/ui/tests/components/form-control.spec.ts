/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { BjjFormGroup } from "../../src/components/form-group";
import { BjjLabel } from "../../src/components/label";
import { BjjFormMessage } from "../../src/components/form-message";
import { BjjInput } from "../../src/components/input";
import { defineComponent } from "vue";

describe("Form Control Architecture", () => {
  it("standalone BjjInput generates id and omits aria-describedby without error", () => {
    const wrapper = mount(BjjInput);
    const input = wrapper.find("input");

    expect(input.exists()).toBe(true);
    expect(input.attributes("id")).toMatch(/^bjj-input-v-\d+$/);
    expect(input.attributes("aria-describedby")).toBeUndefined();
    expect(input.attributes("aria-invalid")).toBeUndefined();
  });

  it("legacy BjjInput renders wrapper, label, and error, and links ARIA", () => {
    const wrapper = mount(BjjInput, {
      props: {
        label: "Email",
        error: "Invalid email",
      },
    });

    const wrapperDiv = wrapper.find(".bjj-input__wrapper");
    expect(wrapperDiv.exists()).toBe(true);

    const label = wrapper.find("label.bjj-input__label");
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-input__error-message");

    expect(label.exists()).toBe(true);
    expect(message.exists()).toBe(true);

    // ARIA linking
    const expectedId = input.attributes("id");
    expect(expectedId).toMatch(/^bjj-input-v-\d+$/);
    expect(label.attributes("for")).toBe(expectedId);

    const messageId = message.attributes("id");
    expect(messageId).toBe(`${expectedId}-message`);
    expect(input.attributes("aria-describedby")).toBe(messageId);
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("composed FormGroup links ARIA attributes correctly", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjInput, BjjFormMessage },
      template: `
        <BjjFormGroup error="Too short">
          <BjjLabel>Username</BjjLabel>
          <BjjInput />
          <BjjFormMessage />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);

    const label = wrapper.find("label");
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-form-message");

    const inputId = input.attributes("id");
    const messageId = message.attributes("id");

    expect(label.attributes("for")).toBe(inputId);
    expect(input.attributes("aria-describedby")).toBe(messageId);
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("state precedence: local prop overrides context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjInput },
      template: `
        <BjjFormGroup disabled>
          <BjjInput :disabled="false" />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");

    // Explicit local false overrides context true
    expect(input.attributes("disabled")).toBeUndefined();
    expect(input.classes()).not.toContain("is-disabled");
  });

  it("state precedence: undefined local prop inherits context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjInput },
      template: `
        <BjjFormGroup disabled>
          <BjjInput />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");

    expect(input.attributes("disabled")).toBeDefined();
    expect(input.classes()).toContain("is-disabled");
  });

  it("aria-describedby is omitted when there is no error message in context", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjInput, BjjFormMessage },
      template: `
        <BjjFormGroup>
          <BjjLabel>Username</BjjLabel>
          <BjjInput />
          <BjjFormMessage />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-form-message");

    expect(message.exists()).toBe(false);
    expect(input.attributes("aria-describedby")).toBeUndefined();
    expect(input.attributes("aria-invalid")).toBeUndefined();
  });

  it("required state propagates to label", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjLabel, BjjInput },
      template: `
        <BjjFormGroup required>
          <BjjLabel>Username</BjjLabel>
          <BjjInput />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const label = wrapper.find("label");
    const asterisk = label.find(".bjj-label__asterisk");

    expect(asterisk.exists()).toBe(true);
    expect(asterisk.text()).toBe("*");
  });
  it("preserves explicit local ID exactly", () => {
    const wrapper = mount(BjjInput, {
      props: {
        id: "my-email",
      },
    });
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("my-email");
  });

  it("preserves FormGroup ID exactly", () => {
    const ComposedForm = defineComponent({
      components: { BjjFormGroup, BjjInput },
      template: `
        <BjjFormGroup id="customer-email">
          <BjjInput />
        </BjjFormGroup>
      `,
    });

    const wrapper = mount(ComposedForm);
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("customer-email");
  });

  it("preserves legacy BjjInput API exactly including ARIA linkage", () => {
    const wrapper = mount(BjjInput, {
      props: {
        id: "my-email",
        label: "Email",
        error: "Invalid email",
      },
    });

    const label = wrapper.find("label");
    const input = wrapper.find("input");
    const message = wrapper.find(".bjj-input__error-message");

    expect(input.attributes("id")).toBe("my-email");
    expect(label.attributes("for")).toBe("my-email");
    expect(message.attributes("id")).toBe("my-email-message");
    expect(input.attributes("aria-describedby")).toBe("my-email-message");
    expect(input.attributes("aria-invalid")).toBe("true");
  });
});
