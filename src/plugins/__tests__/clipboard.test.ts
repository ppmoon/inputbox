import { describe, it, expect, beforeEach } from "vitest";
import clipboardPlugin, {
  getHistory,
  clearHistory,
  removeHistoryItem,
} from "../clipboard/index";

describe("Clipboard Plugin — metadata", () => {
  it("has correct id, name, icon", () => {
    expect(clipboardPlugin.id).toBe("clipboard");
    expect(clipboardPlugin.name).toBe("Clipboard");
    expect(clipboardPlugin.icon).toBe("📋");
  });

  it("has execute, suggestions, removeItem, clearItems", () => {
    expect(typeof clipboardPlugin.execute).toBe("function");
    expect(typeof clipboardPlugin.suggestions).toBe("function");
    expect(typeof clipboardPlugin.removeItem).toBe("function");
    expect(typeof clipboardPlugin.clearItems).toBe("function");
  });
});

describe("Clipboard history management", () => {
  beforeEach(() => {
    clearHistory();
  });

  it("starts empty", () => {
    expect(getHistory()).toEqual([]);
  });

  it("clearHistory empties history", () => {
    removeHistoryItem("test"); // no-op on empty
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("removeHistoryItem returns false for non-existent item", () => {
    expect(removeHistoryItem("nonexistent")).toBe(false);
  });

  it("getHistory returns a copy", () => {
    const a = getHistory();
    const b = getHistory();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("suggestions returns array with valid shape", async () => {
    const items = await clipboardPlugin.suggestions!();
    expect(Array.isArray(items)).toBe(true);
    items.forEach((item) => {
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("value");
      expect(item).toHaveProperty("timestamp");
    });
  });

  it("clearItems calls clearHistory", () => {
    clipboardPlugin.clearItems!();
    expect(getHistory()).toEqual([]);
  });

  it("removeItem returns false for non-existent value", () => {
    expect(clipboardPlugin.removeItem!("not there")).toBe(false);
  });
});
