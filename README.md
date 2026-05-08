# InputBox

A Raycast-like launcher with a glass-morphism UI, built with Tauri, Bun, TypeScript, and Rust.

## Features

- Glass-morphism floating input bar (Alt+Space to toggle)
- Plugin system with icon/input/voice layout
- Clipboard plugin (read clipboard contents)
- Voice input support (Web Speech API)
- Cross-platform desktop (Windows, macOS, Linux) via Tauri
- PWA support for mobile

## Tech Stack

- **Desktop:** Tauri 2.x (Rust) + Bun + TypeScript + React
- **Mobile:** PWA (manifest + service worker)
- **Shortcut:** Global Alt+Space (Tauri global-shortcut plugin)
- **Clipboard:** Tauri clipboard-manager plugin

## Development

```bash
bun install
bun run tauri:dev    # Desktop dev mode
bun run dev           # Web/PWA dev mode
bun run tauri:build   # Build desktop app
```

## Plugin System

Plugins are defined in `src/plugins/<name>/index.ts` and auto-discovered via Vite glob imports. Each plugin implements:

```ts
interface Plugin {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  execute: (query: string) => Promise<string | null>;
}
```

## Project Structure

```
src/              # TypeScript/React frontend
  components/     # UI components (InputBar)
  plugins/        # Plugin system + built-in plugins
src-tauri/        # Rust backend
  src/            # main.rs, lib.rs (window mgmt, shortcuts)
public/           # PWA manifest, service worker, icons
```
