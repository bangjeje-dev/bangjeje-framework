import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import { nextTick } from "vue";
import {
  BjjDialog,
  BjjDialogHeader,
  BjjDialogTitle,
  BjjDialogBody,
} from "../../src/components/dialog";

enableAutoUnmount(afterEach);

describe("BjjDialog", () => {
  let triggerBtn: HTMLButtonElement;

  beforeEach(() => {
    // Mock getBoundingClientRect for JSDOM so focusable elements are considered visible
    HTMLElement.prototype.getBoundingClientRect = () => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Add a trigger button to test focus restoration
    triggerBtn = document.createElement("button");
    triggerBtn.textContent = "Trigger";
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();

    // Clear DOM before each test
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders nothing when modelValue is false", () => {
    const wrapper = mount(BjjDialog, {
      props: { modelValue: false },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find(".bjj-dialog-root").exists()).toBe(false);
  });

  it("renders and teleports when modelValue is true", async () => {
    mount(BjjDialog, {
      props: { modelValue: true },
      slots: {
        default: '<div class="content">Hello</div>',
      },
    });

    // Component uses <Teleport to="body">, so we need to check document.body
    const dialogRoot = document.body.querySelector(".bjj-dialog-root");
    expect(dialogRoot).not.toBeNull();
    expect(dialogRoot?.querySelector(".content")?.textContent).toBe("Hello");
  });

  it("has correct ARIA attributes", async () => {
    const Component = {
      components: { BjjDialog, BjjDialogHeader, BjjDialogTitle, BjjDialogBody },
      template: `
        <BjjDialog :modelValue="true">
          <BjjDialogHeader>
            <BjjDialogTitle>Test Title</BjjDialogTitle>
          </BjjDialogHeader>
          <BjjDialogBody>Test Body</BjjDialogBody>
        </BjjDialog>
      `,
    };

    mount(Component);
    await nextTick();

    const dialogContent = document.body.querySelector(".bjj-dialog__content") as HTMLElement;
    expect(dialogContent.getAttribute("role")).toBe("dialog");
    expect(dialogContent.getAttribute("aria-modal")).toBe("true");

    const titleEl = document.body.querySelector(".bjj-dialog__title") as HTMLElement;
    const bodyEl = document.body.querySelector(".bjj-dialog__body") as HTMLElement;

    expect(titleEl.id).toBeTruthy();
    expect(bodyEl.id).toBeTruthy();

    expect(dialogContent.getAttribute("aria-labelledby")).toBe(titleEl.id);
    expect(dialogContent.getAttribute("aria-describedby")).toBe(bodyEl.id);
  });

  it("closes on backdrop click", async () => {
    const wrapper = mount(BjjDialog, {
      props: { modelValue: true },
    });

    const overlay = document.body.querySelector(".bjj-dialog__overlay") as HTMLElement;
    overlay.click();
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual([false]);
  });

  it("does not close on backdrop click when preventClose is true", async () => {
    const wrapper = mount(BjjDialog, {
      props: { modelValue: true, preventClose: true },
    });

    const overlay = document.body.querySelector(".bjj-dialog__overlay") as HTMLElement;
    overlay.click();
    await nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("closes on Escape key", async () => {
    const wrapper = mount(BjjDialog, {
      props: { modelValue: true },
    });

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual([false]);
  });

  it("locks body scroll with padding compensation", async () => {
    // Mock scrollbar width calculation (simulating innerWidth > clientWidth)
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 1000,
    });
    // Scrollbar width should be 24px

    const wrapper = mount(BjjDialog, {
      props: { modelValue: true },
    });

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("24px");

    await wrapper.setProps({ modelValue: false });

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    wrapper.unmount();
  });

  it("handles multiple nested dialogs scroll locking", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 1000,
    });

    const wrapper1 = mount(BjjDialog, { props: { modelValue: true } });
    const wrapper2 = mount(BjjDialog, { props: { modelValue: true } });

    expect(document.body.style.overflow).toBe("hidden");

    await wrapper2.setProps({ modelValue: false });
    // Still locked by wrapper1
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper1.setProps({ modelValue: false });
    // Now unlocked
    expect(document.body.style.overflow).toBe("");
    wrapper1.unmount();
    wrapper2.unmount();
  });

  it("restores focus on close", async () => {
    // triggerBtn is focused in beforeEach
    expect(document.activeElement).toBe(triggerBtn);

    const wrapper = mount(BjjDialog, {
      props: { modelValue: true },
      slots: {
        default: '<button class="inner-btn">Inner</button>',
      },
    });

    // Wait for setTimeout in useFocusTrap
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Focus should have moved into the dialog
    const innerBtn = document.body.querySelector(".inner-btn");
    expect(document.activeElement).toBe(innerBtn);

    // Close the dialog
    await wrapper.setProps({ modelValue: false });

    // Focus should be restored
    expect(document.activeElement).toBe(triggerBtn);
  });

  it("restores focus on unmount", async () => {
    expect(document.activeElement).toBe(triggerBtn);

    const wrapper = mount(BjjDialog, {
      props: { modelValue: true },
      slots: {
        default: '<button class="inner-btn">Inner</button>',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    wrapper.unmount();

    expect(document.activeElement).toBe(triggerBtn);
  });

  it("traps focus with Tab and Shift+Tab", async () => {
    const Component = {
      components: { BjjDialog },
      template: `
        <BjjDialog :modelValue="true">
          <button id="btn1">1</button>
          <button id="btn2">2</button>
        </BjjDialog>
      `,
    };

    mount(Component);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const btn1 = document.getElementById("btn1") as HTMLElement;
    const btn2 = document.getElementById("btn2") as HTMLElement;

    // Focus is initially on first element
    expect(document.activeElement).toBe(btn1);

    // Move to last element manually
    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    // Press Tab on the last element -> should wrap to first
    const tabEvent = new KeyboardEvent("keydown", { key: "Tab" });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(btn1);

    // Press Shift+Tab on the first element -> should wrap to last
    const shiftTabEvent = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true });
    document.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(btn2);
  });
});
