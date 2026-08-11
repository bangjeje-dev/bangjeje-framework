/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { BjjCheckboxGroup } from "../../src/components/checkbox-group";
import { BjjCheckbox } from "../../src/components/checkbox";
import { BjjFormGroup } from "../../src/components/form-group";

const TestWrapper = defineComponent({
  components: { BjjCheckboxGroup, BjjCheckbox },
  setup() {
    const selectedValues = ref(["apple"]);
    const groupDisabled = ref(false);
    const localDisabled = ref<boolean | undefined>(undefined);
    return { selectedValues, groupDisabled, localDisabled };
  },
  template: `
    <BjjCheckboxGroup v-model="selectedValues" :disabled="groupDisabled">
      <BjjCheckbox value="apple" id="apple-id" />
      <BjjCheckbox value="banana" :disabled="localDisabled" />
    </BjjCheckboxGroup>
  `,
});

describe("BjjCheckboxGroup", () => {
  it("renders with correct ARIA roles", () => {
    const wrapper = mount(BjjCheckboxGroup);
    expect(wrapper.attributes("role")).toBe("group");
    expect(wrapper.classes()).toContain("bjj-checkbox-group");
  });

  it("evaluates array model semantics correctly", () => {
    const wrapper = mount(TestWrapper);
    const checkboxes = wrapper.findAllComponents(BjjCheckbox);

    // Apple should be checked initially
    expect(checkboxes[0].classes()).toContain("is-checked");
    expect(checkboxes[1].classes()).not.toContain("is-checked");
  });

  it("group strictly owns array mutation (add and remove)", async () => {
    const wrapper = mount(TestWrapper);
    const checkboxes = wrapper.findAllComponents(BjjCheckbox);

    // Check banana
    await checkboxes[1].find("input").setValue(true);
    expect(wrapper.vm.selectedValues).toEqual(["apple", "banana"]);

    // Uncheck apple
    await checkboxes[0].find("input").setValue(false);
    expect(wrapper.vm.selectedValues).toEqual(["banana"]);
  });

  it("prevents duplicate values during add operations", async () => {
    const wrapper = mount(TestWrapper);
    const checkboxes = wrapper.findAllComponents(BjjCheckbox);

    // Check apple again (which is already checked)
    // Simulating the child sending an intent to check an already existing value
    await checkboxes[0].find("input").setValue(true);

    // Should still only have one "apple"
    expect(wrapper.vm.selectedValues).toEqual(["apple"]);
  });

  it("isolates IDs correctly", () => {
    const wrapper = mount(TestWrapper);
    const inputs = wrapper.findAll("input");

    // Explicit local ID is preserved
    expect(inputs[0].attributes("id")).toBe("apple-id");
    // Fallback ID generated, not using group ID
    expect(inputs[1].attributes("id")).toMatch(/^bjj-checkbox-/);
    expect(inputs[0].attributes("id")).not.toBe(inputs[1].attributes("id"));
    expect(wrapper.find(".bjj-checkbox-group").attributes("id")).toBeUndefined();
  });

  it("respects state precedence: Local > Group > Default", async () => {
    const wrapper = mount(TestWrapper);
    const checkboxes = wrapper.findAllComponents(BjjCheckbox);

    // Disable the group
    wrapper.vm.groupDisabled = true;
    await wrapper.vm.$nextTick();

    expect(checkboxes[0].classes()).toContain("is-disabled");
    expect(checkboxes[1].classes()).toContain("is-disabled");

    // Re-enable the local checkbox explicitly
    wrapper.vm.localDisabled = false;
    await wrapper.vm.$nextTick();

    expect(checkboxes[0].classes()).toContain("is-disabled");
    // Local explicitly defined wins!
    expect(checkboxes[1].classes()).not.toContain("is-disabled");
  });
});

const FormTestWrapper = defineComponent({
  components: { BjjCheckboxGroup, BjjCheckbox, BjjFormGroup },
  setup() {
    const formDisabled = ref(true);
    return { formDisabled };
  },
  template: `
    <BjjFormGroup id="form-group-id" :disabled="formDisabled">
      <BjjCheckboxGroup>
        <BjjCheckbox value="1" />
      </BjjCheckboxGroup>
    </BjjFormGroup>
  `,
});

describe("BjjCheckboxGroup Form Integration", () => {
  it("isolates form context ID from leaf inputs but links aria-labelledby", () => {
    const wrapper = mount(FormTestWrapper);
    const group = wrapper.find(".bjj-checkbox-group");
    const input = wrapper.find("input");

    // Group gets aria-labelledby from form control
    expect(group.attributes("aria-labelledby")).toBe("form-group-id");
    // But leaf input DOES NOT use the form control id!
    expect(input.attributes("id")).not.toBe("form-group-id");
    expect(input.attributes("id")).toMatch(/^bjj-checkbox-/);
  });

  it("inherits form context disabled state", () => {
    const wrapper = mount(FormTestWrapper);
    const checkbox = wrapper.findComponent(BjjCheckbox);

    expect(checkbox.classes()).toContain("is-disabled");
  });
});
