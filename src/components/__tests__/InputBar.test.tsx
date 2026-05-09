import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputBar from "../InputBar";
import type { Plugin, Suggestion } from "../../plugins/types";

const mockPlugin: Plugin = {
  id: "test-plugin",
  name: "Test Plugin",
  icon: "🧪",
  placeholder: "Test placeholder...",
  execute: vi.fn(() => Promise.resolve("result")),
};

const mockSuggestions: Suggestion[] = [
  { title: "Item one", value: "value1" },
  { title: "Item two", value: "value2" },
  { title: "Item three", value: "value3" },
];

function renderInputBar(overrides: Partial<Parameters<typeof InputBar>[0]> = {}) {
  const defaults = {
    activePlugin: mockPlugin,
    plugins: [mockPlugin],
    query: "",
    suggestions: [],
    selectedIndex: -1,
    onQueryChange: vi.fn(),
    onPluginChange: vi.fn(),
    onExecute: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSelectedIndexChange: vi.fn(),
  };
  return render(<InputBar {...defaults} {...overrides} />);
}

describe("InputBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the plugin icon", () => {
    renderInputBar();
    expect(screen.getByText("🧪")).toBeInTheDocument();
  });

  it("renders the voice button", () => {
    renderInputBar();
    expect(screen.getByText("🎤")).toBeInTheDocument();
  });

  it("renders the input with placeholder", () => {
    renderInputBar();
    const input = screen.getByPlaceholderText("Test placeholder...");
    expect(input).toBeInTheDocument();
  });

  it("calls onQueryChange on input change", async () => {
    const onQueryChange = vi.fn();
    renderInputBar({ onQueryChange });
    const input = screen.getByPlaceholderText("Test placeholder...");
    await userEvent.type(input, "hello");
    expect(onQueryChange).toHaveBeenCalled();
  });

  it("calls onExecute on Enter when no suggestion selected", () => {
    const onExecute = vi.fn();
    renderInputBar({ onExecute, query: "test" });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onExecute).toHaveBeenCalledWith(mockPlugin, "test");
  });

  it("shows suggestion dropdown when items provided", () => {
    renderInputBar({ suggestions: mockSuggestions });
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Item two")).toBeInTheDocument();
    expect(screen.getByText("Item three")).toBeInTheDocument();
  });

  it("highlights selected suggestion", () => {
    renderInputBar({ suggestions: mockSuggestions, selectedIndex: 1 });
    const items = screen.getAllByRole("button", { name: /Item/ });
    expect(items[1]).toHaveClass("selected");
  });

  it("ArrowDown increments selectedIndex", () => {
    const onSelectedIndexChange = vi.fn();
    renderInputBar({
      suggestions: mockSuggestions,
      selectedIndex: 0,
      onSelectedIndexChange,
    });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onSelectedIndexChange).toHaveBeenCalledWith(1);
  });

  it("ArrowUp decrements selectedIndex", () => {
    const onSelectedIndexChange = vi.fn();
    renderInputBar({
      suggestions: mockSuggestions,
      selectedIndex: 1,
      onSelectedIndexChange,
    });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onSelectedIndexChange).toHaveBeenCalledWith(0);
  });

  it("ArrowDown wraps to top at end of list", () => {
    const onSelectedIndexChange = vi.fn();
    renderInputBar({
      suggestions: mockSuggestions,
      selectedIndex: 2,
      onSelectedIndexChange,
    });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onSelectedIndexChange).toHaveBeenCalledWith(0);
  });

  it("ArrowUp wraps to bottom at top of list", () => {
    const onSelectedIndexChange = vi.fn();
    renderInputBar({
      suggestions: mockSuggestions,
      selectedIndex: 0,
      onSelectedIndexChange,
    });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onSelectedIndexChange).toHaveBeenCalledWith(2);
  });

  it("clicking suggestion executes with that value", () => {
    const onExecute = vi.fn();
    const onSelectSuggestion = vi.fn();
    renderInputBar({
      suggestions: mockSuggestions,
      onExecute,
      onSelectSuggestion,
    });
    fireEvent.click(screen.getByText("Item two"));
    expect(onSelectSuggestion).toHaveBeenCalledWith(1);
    expect(onExecute).toHaveBeenCalledWith(mockPlugin, "value2");
  });
});
