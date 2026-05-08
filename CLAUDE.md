# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: inputBox — Raycast-like launcher

- **Tech stack:** Tauri 2.x (Rust backend), Bun + TypeScript + React (frontend), PWA (mobile)
- **Core feature:** Glass-morphism floating input bar triggered by Alt+Space
- **Desktop:** Cross-platform via Tauri (Windows, macOS, Linux)
- **Mobile:** PWA

## Build & Dev Commands

```bash
bun install          # Install frontend deps
bun run dev          # Start Vite dev server
bun run tauri dev    # Start Tauri dev (desktop)
bun run build        # Build frontend
bun run tauri build  # Build Tauri desktop app
```

## Architecture

- `src-tauri/` — Rust backend: window management, global shortcut, plugin host, clipboard access
- `src/` — TypeScript/React frontend: glass input bar UI, plugin renderer
- `plugins/` — Plugin system (each plugin: manifest + entry point)
- `public/` — PWA manifest, service worker, icons
