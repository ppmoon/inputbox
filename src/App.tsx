import { useState, useEffect } from "react";
import InputBar from "./components/InputBar";
import { pluginRegistry, Plugin } from "./plugins/registry";

function App() {
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    pluginRegistry.loadAll().then(() => {
      const first = pluginRegistry.list()[0];
      if (first) setActivePlugin(first);
    });
  }, []);

  const handleExecute = async (plugin: Plugin, q: string) => {
    const result = await plugin.execute(q);
    if (result) {
      // Copy result to clipboard if available
      try {
        const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
        await writeText(typeof result === "string" ? result : JSON.stringify(result));
      } catch {}
    }
  };

  return (
    <InputBar
      activePlugin={activePlugin}
      plugins={pluginRegistry.list()}
      query={query}
      onQueryChange={setQuery}
      onPluginChange={setActivePlugin}
      onExecute={handleExecute}
    />
  );
}

export default App;
