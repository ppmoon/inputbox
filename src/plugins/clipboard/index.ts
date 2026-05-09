import type { Plugin } from "../types";

interface HistoryEntry {
  text: string;
  timestamp: number;
}

const history: HistoryEntry[] = [];
const MAX_HISTORY = 50;

let lastRead = "";

export function getHistory(): HistoryEntry[] {
  return [...history];
}

export function clearHistory(): void {
  history.length = 0;
  lastRead = "";
}

export function removeHistoryItem(text: string): boolean {
  const idx = history.findIndex((e) => e.text === text);
  if (idx !== -1) {
    history.splice(idx, 1);
    return true;
  }
  return false;
}

async function readClipboard(): Promise<string | null> {
  try {
    const { readText } = await import("@tauri-apps/plugin-clipboard-manager");
    return await readText();
  } catch {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  }
}

async function writeClipboard(text: string): Promise<void> {
  try {
    const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
    await writeText(text);
  } catch {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }
}

function addToHistory(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const idx = history.findIndex((e) => e.text === trimmed);
  if (idx !== -1) history.splice(idx, 1);
  history.unshift({ text: trimmed, timestamp: Date.now() });
  if (history.length > MAX_HISTORY) history.pop();
  lastRead = trimmed;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const clipboardPlugin: Plugin = {
  id: "clipboard",
  name: "Clipboard",
  icon: "📋",
  placeholder: "Search clipboard history...",
  async execute(query: string) {
    const text = query || lastRead;
    if (text) {
      await writeClipboard(text);
      return text;
    }
    return null;
  },
  async suggestions() {
    const text = await readClipboard();
    if (text && text !== lastRead) {
      addToHistory(text);
    }
    return history.map((entry, i) => ({
      title:
        entry.text.length > 100
          ? entry.text.substring(0, 100).replace(/\n/g, " ") + "..."
          : entry.text.replace(/\n/g, " "),
      value: entry.text,
      timestamp: entry.timestamp,
    }));
  },
  removeItem(value: string) {
    return removeHistoryItem(value);
  },
  clearItems() {
    clearHistory();
  },
};

export default clipboardPlugin;
