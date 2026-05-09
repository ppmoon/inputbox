import { useState, useEffect, useCallback } from "react";
import InputBar from "./components/InputBar";
import { pluginRegistry } from "./plugins/registry";
import type { Plugin, Suggestion } from "./plugins/types";

function App() {
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    pluginRegistry.loadAll().then(() => {
      const first = pluginRegistry.list()[0];
      if (first) setActivePlugin(first);
    });
  }, []);

  const loadSuggestions = useCallback(() => {
    if (!activePlugin?.suggestions) {
      setSuggestions([]);
      return;
    }
    activePlugin.suggestions().then((items) => {
      setSuggestions(items);
      setSelectedIndex(items.length > 0 ? 0 : -1);
    });
  }, [activePlugin]);

  // Load suggestions when plugin changes
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleExecute = useCallback(
    async (plugin: Plugin, q: string) => {
      const result = await plugin.execute(q);
      if (result) {
        try {
          const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
          await writeText(typeof result === "string" ? result : JSON.stringify(result));
        } catch {}
      }
      loadSuggestions();
    },
    [loadSuggestions],
  );

  const handleSelectSuggestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < suggestions.length) {
        setQuery(suggestions[index].value);
        setSelectedIndex(index);
      }
    },
    [suggestions],
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      const item = suggestions[index];
      if (item && activePlugin?.removeItem) {
        activePlugin.removeItem(item.value);
        loadSuggestions();
      }
    },
    [suggestions, activePlugin, loadSuggestions],
  );

  const handleClearItems = useCallback(() => {
    if (activePlugin?.clearItems) {
      activePlugin.clearItems();
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [activePlugin]);

  return (
    <InputBar
      activePlugin={activePlugin}
      plugins={pluginRegistry.list()}
      query={query}
      suggestions={suggestions}
      selectedIndex={selectedIndex}
      onQueryChange={(q) => {
        setQuery(q);
        setSelectedIndex(-1);
      }}
      onPluginChange={setActivePlugin}
      onExecute={handleExecute}
      onSelectSuggestion={handleSelectSuggestion}
      onSelectedIndexChange={setSelectedIndex}
      onRemoveItem={handleRemoveItem}
      onClearItems={handleClearItems}
    />
  );
}

export default App;
