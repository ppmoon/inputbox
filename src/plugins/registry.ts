export interface Plugin {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  execute: (query: string) => Promise<string | null>;
}

type PluginModule = { default: Plugin };

class PluginRegistry {
  private plugins: Plugin[] = [];

  async loadAll() {
    // Built-in plugins
    const modules = import.meta.glob<PluginModule>("./*/index.ts", { eager: false });
    for (const path of Object.keys(modules)) {
      try {
        const mod = await modules[path]();
        if (mod.default) {
          this.plugins.push(mod.default);
        }
      } catch (e) {
        console.warn(`Failed to load plugin: ${path}`, e);
      }
    }
  }

  list(): Plugin[] {
    return this.plugins;
  }
}

export const pluginRegistry = new PluginRegistry();
