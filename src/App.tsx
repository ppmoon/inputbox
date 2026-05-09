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

  // Load suggestions when plugin changes
  useEffect(() => {
    if (!activePlugin?.suggestions) {
      setSuggestions([]);
      return;
    }
    activePlugin.suggestions().then(setSuggestions);
  }, [activePlugin]);

  const handleExecute = useCallback(
    async (plugin: Plugin, q: string) => {
      const result = await plugin.execute(q);
      if (result) {
        try {
          const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
          await writeText(typeof result === "string" ? result : JSON.stringify(result));
        } catch {}
      }
      // Reload suggestions after execute
      if (plugin.suggestions) {
        plugin.suggestions().then(setSuggestions);
      }
    },
    [],
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
    />
  );
}

export default App;
