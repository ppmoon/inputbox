import type { Plugin } from "../types";

const clipboardPlugin: Plugin = {
  id: "clipboard",
  name: "Clipboard",
  icon: "📋",
  placeholder: "Read clipboard contents...",
  async execute(_query: string) {
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
  },
};

export default clipboardPlugin;
