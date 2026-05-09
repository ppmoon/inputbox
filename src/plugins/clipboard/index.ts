import type { Plugin, Suggestion } from "../types";

const history: string[] = [];
const MAX_HISTORY = 50;

let lastRead = "";

export function getHistory(): string[] {
  return [...history];
}

export function clearHistory(): void {
  history.length = 0;
  lastRead = "";
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
  // Deduplicate: remove existing, push to front
  const idx = history.indexOf(trimmed);
  if (idx !== -1) history.splice(idx, 1);
  history.unshift(trimmed);
  if (history.length > MAX_HISTORY) history.pop();
  lastRead = trimmed;
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
  async suggestions(): Promise<Suggestion[]> {
    const text = await readClipboard();
    if (text && text !== lastRead) {
      addToHistory(text);
    }
    return history.map((item) => ({
      title: item.length > 80 ? item.substring(0, 80) + "..." : item,
      value: item,
    }));
  },
};

export default clipboardPlugin;
