import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { BjjTooltip, BjjTooltipTrigger, BjjTooltipContent } from "../../src/components/tooltip";

const TestComponent = defineComponent({
  components: { BjjTooltip, BjjTooltipTrigger, BjjTooltipContent },
  template: `
    <BjjTooltip :open-delay="200" :close-delay="150" placement="bottom-start">
      <BjjTooltipTrigger>
        <button id="trigger">Hover me</button>
      </BjjTooltipTrigger>
      <BjjTooltipContent id="content">
        Tooltip content
      </BjjTooltipContent>
    </BjjTooltip>
  `,
});

const MultipleTooltipsComponent = defineComponent({
  components: { BjjTooltip, BjjTooltipTrigger, BjjTooltipContent },
  template: `
    <div>
      <BjjTooltip :open-delay="0" :close-delay="0">
        <BjjTooltipTrigger>
          <button id="trigger1">Trigger 1</button>
        </BjjTooltipTrigger>
        <BjjTooltipContent id="content1">
          Content 1
        </BjjTooltipContent>
      </BjjTooltip>
      <BjjTooltip :open-delay="0" :close-delay="0">
        <BjjTooltipTrigger>
          <button id="trigger2">Trigger 2</button>
        </BjjTooltipTrigger>
        <BjjTooltipContent id="content2">
          Content 2
        </BjjTooltipContent>
      </BjjTooltip>
    </div>
  `,
});

describe("BjjTooltip", () => {
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    vi.useFakeTimers();
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    // Mock window inner width/height
    Object.defineProperty(window, "innerWidth", { value: 1000, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 1000, writable: true });

    // Mock scroll/resize listeners
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.useRealTimers();
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  const mockRects = (triggerRect: Partial<DOMRect>, contentRect: Partial<DOMRect>) => {
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.id === "trigger") {
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
      if (this.id === "content" || this.classList?.contains("bjj-tooltip-content")) {
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

  describe("ARIA and Accessibility", () => {
    it("has no dangling aria-describedby when closed", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");
      expect(trigger.attributes("aria-describedby")).toBeUndefined();
    });

    it("has role=tooltip and aria-describedby when open", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      const content = document.body.querySelector(".bjj-tooltip-content");
      expect(content).not.toBeNull();
      expect(content?.getAttribute("role")).toBe("tooltip");
      expect(content?.getAttribute("aria-modal")).toBeNull();

      expect(trigger.attributes("aria-describedby")).toBe(content?.id);
    });

    it("does not focus trap", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      (trigger.element as HTMLElement).focus();
      await trigger.trigger("focusin");
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.activeElement).toBe(trigger.element); // focus stays on trigger
    });
  });

  describe("Delays and Hover/Focus behavior", () => {
    it("opens after openDelay on hover", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("mouseenter");
      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();

      vi.advanceTimersByTime(199);
      await nextTick();
      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();

      vi.advanceTimersByTime(1);
      await nextTick();
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });

    it("closes after closeDelay on mouseleave", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();

      await trigger.trigger("mouseleave");
      vi.advanceTimersByTime(149);
      await nextTick();
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull(); // still open

      vi.advanceTimersByTime(1);
      await nextTick();
      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull(); // now closed
    });

    it("opening cancels pending close", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      // Open
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      // Leave (starts close timer 150ms)
      await trigger.trigger("mouseleave");
      vi.advanceTimersByTime(100);

      // Re-enter (should cancel close timer)
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await nextTick();

      // Should still be open
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });

    it("closing cancels pending open", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      // Enter (starts open timer 200ms)
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(100);

      // Leave (cancels open timer)
      await trigger.trigger("mouseleave");
      vi.advanceTimersByTime(100);
      await nextTick();

      // Should not be open
      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();
    });

    it("focusin opens tooltip", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("focusin");
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });

    it("mouseleave while focused keeps tooltip open", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("focusin");
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();

      await trigger.trigger("mouseleave");
      vi.advanceTimersByTime(200);
      await nextTick();

      // Still open because it's focused
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });

    it("focusout while hovered keeps tooltip open", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("focusin");
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      await trigger.trigger("focusout");
      vi.advanceTimersByTime(200);
      await nextTick();

      // Still open because it's hovered
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });

    it("closes only when both hover and focus leave", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("focusin");
      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      await trigger.trigger("focusout");
      await trigger.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();
    });

    it("content hover keeps tooltip open", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();

      const content = document.body.querySelector(".bjj-tooltip-content") as HTMLElement;
      await trigger.trigger("mouseleave");
      // Before 150ms close timer finishes, enter content
      const { DOMWrapper } = await import("@vue/test-utils");
      await new DOMWrapper(content).trigger("mouseenter");

      vi.advanceTimersByTime(200);
      await nextTick();

      // Should remain open
      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();
    });
  });

  describe("Keyboard Escape behavior", () => {
    it("closes the active tooltip on Escape and preserves focus", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      (trigger.element as HTMLElement).focus();
      await trigger.trigger("focusin");
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();

      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();
      expect(document.activeElement).toBe(trigger.element);
    });
  });

  describe("Floating and Positioning", () => {
    it("positions correctly", async () => {
      mockRects(
        { top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
        { width: 50, height: 50 }
      );

      const wrapper = mount(TestComponent, { attachTo: document.body });
      await wrapper.find("#trigger").trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await nextTick();
      await nextTick();

      const content = document.body.querySelector(".bjj-tooltip-content") as HTMLElement;
      // bottom-start with 8px offset: top = 208, left = 100
      expect(content.style.top).toBe("208px");
      expect(content.style.left).toBe("100px");
    });
  });

  describe("Multiple Instances", () => {
    it("allows two tooltips to be open at the same time and maintains independent state", async () => {
      const wrapper = mount(MultipleTooltipsComponent, { attachTo: document.body });

      const trigger1 = wrapper.find("#trigger1");
      const trigger2 = wrapper.find("#trigger2");

      await trigger1.trigger("mouseenter");
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(document.body.querySelectorAll(".bjj-tooltip-content").length).toBe(1);

      await trigger2.trigger("mouseenter");
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(document.body.querySelectorAll(".bjj-tooltip-content").length).toBe(2);

      const contents = document.body.querySelectorAll(".bjj-tooltip-content");
      expect(contents[0].id).not.toBe(contents[1].id);
    });
  });

  describe("Lifecycle", () => {
    it("clears timers on unmount", async () => {
      const wrapper = mount(TestComponent, { attachTo: document.body });
      const trigger = wrapper.find("#trigger");

      await trigger.trigger("mouseenter");
      // Unmount before open timer finishes
      wrapper.unmount();

      vi.advanceTimersByTime(200);
      await nextTick();
      expect(document.body.querySelector(".bjj-tooltip-content")).toBeNull();
    });
  });
});
