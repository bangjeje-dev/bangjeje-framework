import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import { defineComponent, ref, nextTick } from "vue";
import { BjjPopover, BjjPopoverTrigger, BjjPopoverContent } from "../../src/components/popover";

const TestComponent = defineComponent({
  components: { BjjPopover, BjjPopoverTrigger, BjjPopoverContent },
  setup() {
    return {
      isOpen: ref(false),
      placement: ref("bottom-start"),
      offset: ref(8),
    };
  },
  template: `
    <BjjPopover v-model="isOpen" :placement="placement" :offset="offset">
      <BjjPopoverTrigger>
        <button id="trigger">Trigger</button>
      </BjjPopoverTrigger>
      <BjjPopoverContent>
        <div id="content">Content</div>
      </BjjPopoverContent>
    </BjjPopover>
  `,
});

const MultiplePopoversComponent = defineComponent({
  components: { BjjPopover, BjjPopoverTrigger, BjjPopoverContent },
  setup() {
    return { isOpen1: ref(false), isOpen2: ref(false) };
  },
  template: `
    <div>
      <BjjPopover v-model="isOpen1">
        <BjjPopoverTrigger><button id="trigger1">T1</button></BjjPopoverTrigger>
        <BjjPopoverContent><div id="content1">C1</div></BjjPopoverContent>
      </BjjPopover>
      <BjjPopover v-model="isOpen2">
        <BjjPopoverTrigger><button id="trigger2">T2</button></BjjPopoverTrigger>
        <BjjPopoverContent><div id="content2">C2</div></BjjPopoverContent>
      </BjjPopover>
    </div>
  `,
});

enableAutoUnmount(afterEach);

describe("BjjPopover", () => {
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    // Mock window inner width/height
    Object.defineProperty(window, "innerWidth", { value: 1000, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 1000, writable: true });

    // Mock scroll/resize listeners
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  const mockRects = (triggerRect: Partial<DOMRect>, contentRect: Partial<DOMRect>) => {
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.classList.contains("bjj-popover__trigger") || this.id === "trigger") {
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
          ...triggerRect,
        } as DOMRect;
      }
      if (this.classList.contains("bjj-popover__content") || this.id === "content") {
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
          ...contentRect,
        } as DOMRect;
      }
      return originalGetBoundingClientRect.call(this);
    };
  };

  it("renders correctly with proper ARIA attributes", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const trigger = wrapper.find("#trigger");
    const triggerWrapper = wrapper.findComponent(BjjPopoverTrigger);

    expect(triggerWrapper.attributes("aria-expanded")).toBe("false");
    expect(triggerWrapper.attributes("aria-haspopup")).toBe("dialog");
    expect(triggerWrapper.attributes("aria-controls")).toBeTruthy();

    expect(document.body.querySelector("#content")).toBeNull(); // not mounted yet
  });

  it("toggles on click and renders content", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const triggerWrapper = wrapper.findComponent(BjjPopoverTrigger);

    await triggerWrapper.trigger("click");
    expect(triggerWrapper.attributes("aria-expanded")).toBe("true");

    // Content should be teleported
    const content = document.body.querySelector("#content");
    expect(content).not.toBeNull();

    // Verify it has region role and matches aria-controls
    const contentWrapper = document.body.querySelector(".bjj-popover__content");
    expect(contentWrapper?.getAttribute("role")).toBe("region");
    expect(contentWrapper?.id).toBe(triggerWrapper.attributes("aria-controls"));
    expect(contentWrapper?.getAttribute("aria-modal")).toBeNull(); // no aria-modal
  });

  it("handles basic positioning for bottom-start", async () => {
    // 100x100 trigger at (100, 100)
    mockRects(
      { top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
      { width: 50, height: 50 }
    );

    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick(); // await internal layout wait
    await nextTick(); // await calculatePosition

    const contentWrapper = document.body.querySelector(".bjj-popover__content") as HTMLElement;
    expect(contentWrapper.style.visibility).toBe("visible");
    // bottom-start -> y = bottom(200) + offset(8) = 208; x = left(100)
    expect(contentWrapper.style.top).toBe("208px");
    expect(contentWrapper.style.left).toBe("100px");
  });

  it("handles collision flipping bottom -> top", async () => {
    // 100x100 trigger at bottom of screen
    mockRects(
      { top: 900, left: 100, bottom: 1000, right: 200, width: 100, height: 100 },
      { width: 50, height: 50 } // requires 58px. availableBottom = 1000 - 1000 - 8 = -8. availableTop = 900 - 8 = 892.
    );

    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();

    const contentWrapper = document.body.querySelector(".bjj-popover__content") as HTMLElement;
    // flipped to top -> y = top(900) - height(50) - offset(8) = 842;
    expect(contentWrapper.style.top).toBe("842px");
    expect(contentWrapper.style.left).toBe("100px");
  });

  it("handles scroll and resize listener registration", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();

    expect(window.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function), true);

    await wrapper.findComponent(BjjPopoverTrigger).trigger("click"); // close
    await nextTick();

    expect(window.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function), true);
  });

  it("dismisses on escape key", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();

    expect(wrapper.vm.isOpen).toBe(true);

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    await nextTick();
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it("dismisses on click outside", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();
    expect(wrapper.vm.isOpen).toBe(true);

    // Clicking document body should close it
    document.body.click();
    await nextTick();
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it("does not dismiss when clicking trigger or content", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const trigger = wrapper.findComponent(BjjPopoverTrigger).element;

    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();
    expect(wrapper.vm.isOpen).toBe(true);

    // Click trigger again (should toggle off via regular handler, but let's test if we programmatically click inside content)
    const content = document.body.querySelector("#content") as HTMLElement;
    content.click();
    await nextTick();
    await nextTick();
    expect(wrapper.vm.isOpen).toBe(true); // Still open
  });

  it("supports multiple independent popovers", async () => {
    const wrapper = mount(MultiplePopoversComponent, { attachTo: document.body });

    const triggers = wrapper.findAllComponents(BjjPopoverTrigger);

    // Open first
    await triggers[0].trigger("click");
    expect(wrapper.vm.isOpen1).toBe(true);
    expect(wrapper.vm.isOpen2).toBe(false);

    // Open second
    await triggers[1].trigger("click");
    await nextTick();
    expect(wrapper.vm.isOpen1).toBe(true); // Should still be open
    expect(wrapper.vm.isOpen2).toBe(true);

    // Close first
    await triggers[0].trigger("click");
    expect(wrapper.vm.isOpen1).toBe(false);
    expect(wrapper.vm.isOpen2).toBe(true);
  });

  it("does not trap focus", async () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    await wrapper.findComponent(BjjPopoverTrigger).trigger("click");
    await nextTick();

    // Ensure we don't have focus trap logic that forcefully grabs focus on open
    // (BjjPopoverContent should not automatically call focus() unless implemented by consumer)
    expect(document.activeElement).not.toBe(document.body.querySelector("#content"));
  });
});
