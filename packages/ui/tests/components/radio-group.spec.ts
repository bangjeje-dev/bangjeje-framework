/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { BjjRadioGroup } from "../../src/components/radio-group";
import { BjjRadio } from "../../src/components/radio";
import { BjjFormGroup } from "../../src/components/form-group";

const TestWrapper = defineComponent({
  components: { BjjRadioGroup, BjjRadio },
  setup() {
    const selectedValue = ref("apple");
    const groupDisabled = ref(false);
    const groupError = ref<string | boolean>(false);
    const localDisabled = ref<boolean | undefined>(undefined);
    return { selectedValue, groupDisabled, groupError, localDisabled };
  },
  template: `
    <BjjRadioGroup v-model="selectedValue" name="test-group" :disabled="groupDisabled" :error="groupError">
      <BjjRadio value="apple" id="apple-id" />
      <BjjRadio value="banana" name="local-name" :disabled="localDisabled" />
    </BjjRadioGroup>
  `,
});

describe("BjjRadioGroup", () => {
  it("renders with correct ARIA roles", () => {
    const wrapper = mount(BjjRadioGroup);
    expect(wrapper.attributes("role")).toBe("radiogroup");
    expect(wrapper.classes()).toContain("bjj-radio-group");
    expect(wrapper.classes()).toContain("bjj-radio-group--vertical"); // Default orientation
  });

  it("delegates model to children and responds to child selection", async () => {
    const wrapper = mount(TestWrapper);
    const radios = wrapper.findAllComponents(BjjRadio);

    // Apple should be checked initially
    expect(radios[0].classes()).toContain("is-checked");
    expect(radios[1].classes()).not.toContain("is-checked");

    // Click banana
    await radios[1].find("input").setValue(true);

    // Group model should update
    expect(wrapper.vm.selectedValue).toBe("banana");
    expect(radios[0].classes()).not.toContain("is-checked");
    expect(radios[1].classes()).toContain("is-checked");
  });

  it("propagates group name and overrides child local name", () => {
    const wrapper = mount(TestWrapper);
    const inputs = wrapper.findAll("input");

    expect(inputs[0].attributes("name")).toBe("test-group");
    // The second radio tried to use 'local-name', but group context must override it
    expect(inputs[1].attributes("name")).toBe("test-group");
  });

  it("isolates IDs correctly", () => {
    const wrapper = mount(TestWrapper);
    const inputs = wrapper.findAll("input");

    // Explicit local ID is preserved
    expect(inputs[0].attributes("id")).toBe("apple-id");
    // Fallback ID generated, not using group ID
    expect(inputs[1].attributes("id")).toMatch(/^bjj-radio-/);
    expect(inputs[0].attributes("id")).not.toBe(inputs[1].attributes("id"));
    expect(wrapper.find(".bjj-radio-group").attributes("id")).toBeUndefined();
  });

  it("respects state precedence: Local > Group > Default", async () => {
    const wrapper = mount(TestWrapper);
    const radios = wrapper.findAllComponents(BjjRadio);

    // Disable the group
    wrapper.vm.groupDisabled = true;
    await wrapper.vm.$nextTick();

    expect(radios[0].classes()).toContain("is-disabled");
    expect(radios[1].classes()).toContain("is-disabled");

    // Re-enable the local radio explicitly
    wrapper.vm.localDisabled = false;
    await wrapper.vm.$nextTick();

    expect(radios[0].classes()).toContain("is-disabled");
    // Local explicitly defined wins!
    expect(radios[1].classes()).not.toContain("is-disabled");
  });
});

const FormTestWrapper = defineComponent({
  components: { BjjRadioGroup, BjjRadio, BjjFormGroup },
  setup() {
    const formDisabled = ref(true);
    return { formDisabled };
  },
  template: `
    <BjjFormGroup id="form-group-id" :disabled="formDisabled">
      <BjjRadioGroup>
        <BjjRadio value="1" />
      </BjjRadioGroup>
    </BjjFormGroup>
  `,
});

describe("BjjRadioGroup Form Integration", () => {
  it("isolates form context ID from leaf inputs but links aria-labelledby", () => {
    const wrapper = mount(FormTestWrapper);
    const group = wrapper.find(".bjj-radio-group");
    const input = wrapper.find("input");

    // Group gets aria-labelledby from form control
    expect(group.attributes("aria-labelledby")).toBe("form-group-id");
    // But leaf input DOES NOT use the form control id!
    expect(input.attributes("id")).not.toBe("form-group-id");
    expect(input.attributes("id")).toMatch(/^bjj-radio-/);
  });

  it("inherits form context disabled state", () => {
    const wrapper = mount(FormTestWrapper);
    const radio = wrapper.findComponent(BjjRadio);

    expect(radio.classes()).toContain("is-disabled");
  });
});
