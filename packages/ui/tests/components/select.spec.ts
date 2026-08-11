import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import { defineComponent, ref, nextTick } from "vue";
import {
  BjjSelect,
  BjjSelectTrigger,
  BjjSelectContent,
  BjjSelectOption,
} from "../../src/components/select";
import { BjjFormGroup } from "../../src/components/form-group";

const TestComponent = defineComponent({
  components: { BjjSelect, BjjSelectTrigger, BjjSelectContent, BjjSelectOption },
  setup() {
    return {
      selectedValue: ref<string | number | undefined>(undefined),
      options: [
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
        { label: "Option 3", value: "3", disabled: true },
        { label: "Option 4", value: "4" },
      ],
    };
  },
  template: `
    <BjjSelect v-model="selectedValue" id="my-select">
      <BjjSelectTrigger>
        <button id="trigger">
          {{ options.find(o => o.value === selectedValue)?.label || 'Placeholder' }}
        </button>
      </BjjSelectTrigger>
      <BjjSelectContent>
        <BjjSelectOption v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
          {{ opt.label }}
        </BjjSelectOption>
      </BjjSelectContent>
    </BjjSelect>
  `,
});

const MultipleSelectsComponent = defineComponent({
  components: { BjjSelect, BjjSelectTrigger, BjjSelectContent, BjjSelectOption },
  setup() {
    return { val1: ref(null), val2: ref(null) };
  },
  template: `
    <div>
      <BjjSelect v-model="val1">
        <BjjSelectTrigger id="trigger1">Select 1</BjjSelectTrigger>
        <BjjSelectContent><BjjSelectOption value="1">1</BjjSelectOption></BjjSelectContent>
      </BjjSelect>
      <BjjSelect v-model="val2">
        <BjjSelectTrigger id="trigger2">Select 2</BjjSelectTrigger>
        <BjjSelectContent><BjjSelectOption value="a">A</BjjSelectOption></BjjSelectContent>
      </BjjSelect>
    </div>
  `,
});

const FormGroupComponent = defineComponent({
  components: { BjjSelect, BjjSelectTrigger, BjjSelectContent, BjjSelectOption, BjjFormGroup },
  setup() {
    return { selectedValue: ref("1") };
  },
  template: `
    <BjjFormGroup id="test-group" label="Label" error="Error message">
      <BjjSelect v-model="selectedValue">
        <BjjSelectTrigger />
        <BjjSelectContent><BjjSelectOption value="1">1</BjjSelectOption></BjjSelectContent>
      </BjjSelect>
    </BjjFormGroup>
  `,
});

enableAutoUnmount(afterEach);

describe("BjjSelect", () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders trigger correctly with placeholder and ARIA attributes", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const trigger = wrapper.find(".bjj-select__trigger");

    expect(trigger.text()).toBe("Placeholder");
    expect(trigger.attributes("role")).toBe("combobox");
    expect(trigger.attributes("aria-haspopup")).toBe("listbox");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBeTruthy();

    expect(document.body.querySelector(".bjj-select__content")).toBeNull();
  });

  it("opens on trigger click and renders listbox", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const trigger = wrapper.find(".bjj-select__trigger");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");

    const content = document.body.querySelector(".bjj-select__content");
    expect(content).not.toBeNull();
    expect(content?.getAttribute("role")).toBe("listbox");
    expect(content?.getAttribute("aria-multiselectable")).toBe("false");
    expect(content?.id).toBe(trigger.attributes("aria-controls"));

    const options = document.body.querySelectorAll(".bjj-select__option");
    expect(options.length).toBe(4);
    expect(options[0].getAttribute("role")).toBe("option");
    expect(options[0].getAttribute("aria-selected")).toBe("false");
  });

  it("selects an option and updates model on click", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.find(".bjj-select__trigger").trigger("click");
    await nextTick();

    const options = document.body.querySelectorAll(".bjj-select__option");
    (options[1] as HTMLElement).click();

    await nextTick();
    expect(wrapper.vm.selectedValue).toBe("2");
    expect(wrapper.find(".bjj-select__trigger").text()).toBe("Option 2");

    // Should close after selection
    expect(document.body.querySelector(".bjj-select__content")).toBeNull();
  });

  it("respects disabled option on click", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.find(".bjj-select__trigger").trigger("click");
    await nextTick();

    const options = document.body.querySelectorAll(".bjj-select__option");
    expect(options[2].getAttribute("aria-disabled")).toBe("true");
    (options[2] as HTMLElement).click();

    await nextTick();
    expect(wrapper.vm.selectedValue).toBeUndefined();
    expect(document.body.querySelector(".bjj-select__content")).not.toBeNull(); // remains open
  });

  it("navigates options via ArrowDown and ArrowUp from trigger", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const trigger = wrapper.find(".bjj-select__trigger");

    // Open via arrow down
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await nextTick(); // wait for open
    await new Promise((r) => setTimeout(r, 0)); // wait for setTimeout focus

    // Focus should be on first option
    const activeOption = document.activeElement as HTMLElement;
    expect(activeOption.classList.contains("bjj-select__option")).toBe(true);
    expect(activeOption.textContent?.trim()).toBe("Option 1");

    // Because we are now focused on activeOption, further keyboard navigation
    // should happen on activeOption itself. This is tested in the next test.
  });

  it("navigates options via keyboard from inside the option", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.find(".bjj-select__trigger").trigger("click");
    await nextTick();

    const options = document.body.querySelectorAll(".bjj-select__option");
    (options[1] as HTMLElement).focus();

    // From option 2, hit ArrowDown
    await (options[1] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown" })
    );
    await nextTick();
    let activeOption = document.activeElement as HTMLElement;
    expect(activeOption.textContent?.trim()).toBe("Option 4"); // skipped 3

    // Hit Home
    await activeOption.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
    await nextTick();
    activeOption = document.activeElement as HTMLElement;
    expect(activeOption.textContent?.trim()).toBe("Option 1");

    // Hit End
    await activeOption.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    await nextTick();
    activeOption = document.activeElement as HTMLElement;
    expect(activeOption.textContent?.trim()).toBe("Option 4");

    // Hit Enter
    await activeOption.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await nextTick();
    expect(wrapper.vm.selectedValue).toBe("4");
    expect(document.body.querySelector(".bjj-select__content")).toBeNull();
  });

  it("supports multiple independent select instances", async () => {
    const wrapper = mount(MultipleSelectsComponent, { attachTo: document.body });
    const triggers = wrapper.findAll(".bjj-select__trigger");

    await triggers[0].trigger("click");
    await nextTick();
    expect(document.body.querySelectorAll(".bjj-select__content").length).toBe(1);
    expect(triggers[0].attributes("aria-expanded")).toBe("true");

    await triggers[1].trigger("click");
    await nextTick();
    // BjjPopover handles click-outside on first, but testing programmatic multi-open:
    // VTU does not propagate click to window.
    expect(triggers[0].attributes("aria-expanded")).toBe("true");
    expect(triggers[1].attributes("aria-expanded")).toBe("true");
  });

  it("integrates with form control", async () => {
    const wrapper = mount(FormGroupComponent, { attachTo: document.body });
    const trigger = wrapper.find(".bjj-select__trigger");

    // ID should match the form control
    expect(trigger.attributes("id")).toBe("test-group");
    expect(trigger.attributes("aria-invalid")).toBe("true");
    expect(trigger.attributes("aria-describedby")).toBe("test-group-message");
  });
});
