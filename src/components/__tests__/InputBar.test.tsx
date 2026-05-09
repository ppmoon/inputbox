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
  removeItem: vi.fn(() => true),
  clearItems: vi.fn(),
};

const mockSuggestions: Suggestion[] = [
  { title: "Item one", value: "value1", timestamp: Date.now() - 60000 },
  { title: "Item two", value: "value2", timestamp: Date.now() - 3600000 },
  { title: "Item three", value: "value3", timestamp: Date.now() - 86400000 },
];

function renderInputBar(overrides: Partial<Parameters<typeof InputBar>[0]> = {}) {
  const defaults = {
    activePlugin: mockPlugin,
    plugins: [mockPlugin],
    query: "search", // non-empty => panel hidden by default
    suggestions: [],
    selectedIndex: -1,
    onQueryChange: vi.fn(),
    onPluginChange: vi.fn(),
    onExecute: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSelectedIndexChange: vi.fn(),
    onRemoveItem: vi.fn(),
    onClearItems: vi.fn(),
  };
  return render(<InputBar {...defaults} {...overrides} />);
}

describe("InputBar — basic render", () => {
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
    expect(screen.getByPlaceholderText("Test placeholder...")).toBeInTheDocument();
  });

  it("calls onQueryChange on input change", async () => {
    const onQueryChange = vi.fn();
    renderInputBar({ onQueryChange });
    const input = screen.getByPlaceholderText("Test placeholder...");
    await userEvent.type(input, "hello");
    expect(onQueryChange).toHaveBeenCalled();
  });

  it("calls onExecute on Enter when no selection", () => {
    const onExecute = vi.fn();
    renderInputBar({ onExecute, query: "test" });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onExecute).toHaveBeenCalledWith(mockPlugin, "test");
  });
});

describe("History panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithPanel(overrides = {}) {
    return renderInputBar({
      query: "",
      suggestions: mockSuggestions,
      selectedIndex: 0,
      ...overrides,
    });
  }

  it("shows when query is empty and suggestions exist", () => {
    renderWithPanel();
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Item two")).toBeInTheDocument();
    expect(screen.getByText("Item three")).toBeInTheDocument();
  });

  it("does not show when query is non-empty", () => {
    renderInputBar({ query: "hello", suggestions: mockSuggestions });
    expect(screen.queryByText("Item one")).not.toBeInTheDocument();
  });

  it("shows item count", () => {
    renderWithPanel();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("shows index numbers", () => {
    renderWithPanel();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows timestamp on items", () => {
    renderWithPanel();
    expect(screen.getByText("1m ago")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
    expect(screen.getByText("1d ago")).toBeInTheDocument();
  });

  it("shows keyboard hints in footer", () => {
    renderWithPanel();
    expect(screen.getByText(/navigate/)).toBeInTheDocument();
    expect(screen.getByText(/paste/)).toBeInTheDocument();
    expect(screen.getByText(/remove/)).toBeInTheDocument();
  });

  it("highlights selected item", () => {
    renderWithPanel({ selectedIndex: 1 });
    const items = screen.getAllByText("×").map((el) => el.closest("button.history-item"));
    expect(items[1]).toHaveClass("selected");
  });

  it("calls onClearItems when Clear all clicked", () => {
    const onClearItems = vi.fn();
    renderWithPanel({ onClearItems });
    fireEvent.click(screen.getByText("Clear all"));
    expect(onClearItems).toHaveBeenCalled();
  });

  it("calls onRemoveItem when delete button clicked", () => {
    const onRemoveItem = vi.fn();
    renderWithPanel({ onRemoveItem, selectedIndex: 0 });
    const deleteBtns = screen.getAllByText("×");
    fireEvent.click(deleteBtns[0]);
    expect(onRemoveItem).toHaveBeenCalledWith(0);
  });

  it("calls onRemoveItem on Delete key", () => {
    const onRemoveItem = vi.fn();
    renderWithPanel({ onRemoveItem, selectedIndex: 1 });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "Delete" });
    expect(onRemoveItem).toHaveBeenCalledWith(1);
  });

  it("clicking a history item executes with that value", () => {
    const onExecute = vi.fn();
    const onSelectSuggestion = vi.fn();
    renderWithPanel({ onExecute, onSelectSuggestion });
    fireEvent.click(screen.getByText("Item two"));
    expect(onSelectSuggestion).toHaveBeenCalledWith(1);
    expect(onExecute).toHaveBeenCalledWith(mockPlugin, "value2");
  });
});

describe("Keyboard navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderForNav(overrides = {}) {
    return renderInputBar({
      query: "",
      suggestions: mockSuggestions,
      selectedIndex: 0,
      ...overrides,
    });
  }

  it("ArrowDown increments selectedIndex", () => {
    const cbs = { onSelectedIndexChange: vi.fn() };
    renderForNav(cbs);
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(cbs.onSelectedIndexChange).toHaveBeenCalledWith(1);
  });

  it("ArrowUp decrements selectedIndex", () => {
    const cbs = { onSelectedIndexChange: vi.fn(), selectedIndex: 1 };
    renderForNav(cbs);
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(cbs.onSelectedIndexChange).toHaveBeenCalledWith(0);
  });

  it("ArrowDown wraps to top at end", () => {
    const cbs = { onSelectedIndexChange: vi.fn(), selectedIndex: 2 };
    renderForNav(cbs);
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(cbs.onSelectedIndexChange).toHaveBeenCalledWith(0);
  });

  it("ArrowUp wraps to bottom at start", () => {
    const cbs = { onSelectedIndexChange: vi.fn(), selectedIndex: 0 };
    renderForNav(cbs);
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(cbs.onSelectedIndexChange).toHaveBeenCalledWith(2);
  });

  it("Enter on selected item executes", () => {
    const cbs = { onExecute: vi.fn(), onSelectSuggestion: vi.fn() };
    renderForNav({ ...cbs, selectedIndex: 0 });
    const input = screen.getByPlaceholderText("Test placeholder...");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(cbs.onSelectSuggestion).toHaveBeenCalledWith(0);
    expect(cbs.onExecute).toHaveBeenCalledWith(mockPlugin, "value1");
  });
});
