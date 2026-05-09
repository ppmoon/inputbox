import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock Tauri window API
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    hide: vi.fn(),
    show: vi.fn(),
    setFocus: vi.fn(),
    isVisible: vi.fn(() => Promise.resolve(true)),
  })),
}));

// Mock Tauri clipboard plugin
vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
  readText: vi.fn(() => Promise.resolve("mocked clipboard")),
  writeText: vi.fn(() => Promise.resolve()),
}));

// jsdom polyfill: scrollIntoView not implemented
Element.prototype.scrollIntoView ??= vi.fn();
