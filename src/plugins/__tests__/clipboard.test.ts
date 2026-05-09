import { describe, it, expect, beforeEach } from "vitest";

// Import the module-under-test directly (no Tauri runtime needed, we mock clipboard API)
import clipboardPlugin, { getHistory, clearHistory } from "../clipboard/index";

describe("Clipboard Plugin", () => {
  beforeEach(() => {
    clearHistory();
  });

  it("has correct metadata", () => {
    expect(clipboardPlugin.id).toBe("clipboard");
    expect(clipboardPlugin.name).toBe("Clipboard");
    expect(clipboardPlugin.icon).toBe("📋");
  });

  it("has a suggestions method", () => {
    expect(typeof clipboardPlugin.suggestions).toBe("function");
  });

  it("has an execute method", () => {
    expect(typeof clipboardPlugin.execute).toBe("function");
  });

  it("execute returns the given query string", async () => {
    const result = await clipboardPlugin.execute("hello world");
    expect(result).toBe("hello world");
  });

  it("suggestions returns an array", async () => {
    const items = await clipboardPlugin.suggestions!();
    expect(Array.isArray(items)).toBe(true);
    items.forEach((item) => {
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("value");
    });
  });
});

describe("Clipboard history", () => {
  beforeEach(() => {
    clearHistory();
  });

  it("starts empty", () => {
    expect(getHistory()).toEqual([]);
  });

  it("clearHistory empties the history", async () => {
    // Force-add via internal read triggers suggestions which adds to history
    await clipboardPlugin.suggestions!();
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("getHistory returns a copy, not reference", () => {
    const a = getHistory();
    const b = getHistory();
    expect(a).not.toBe(b);
  });
});
