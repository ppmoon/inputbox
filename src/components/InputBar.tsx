import { useState, useRef, useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { Plugin, Suggestion } from "../plugins/types";
import "./InputBar.css";

interface Props {
  activePlugin: Plugin | null;
  plugins: Plugin[];
  query: string;
  suggestions: Suggestion[];
  selectedIndex: number;
  onQueryChange: (q: string) => void;
  onPluginChange: (p: Plugin) => void;
  onExecute: (plugin: Plugin, query: string) => void;
  onSelectSuggestion: (index: number) => void;
  onSelectedIndexChange: (index: number) => void;
}

export default function InputBar({
  activePlugin,
  plugins,
  query,
  suggestions,
  selectedIndex,
  onQueryChange,
  onPluginChange,
  onExecute,
  onSelectSuggestion,
  onSelectedIndexChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const [pluginMenuOpen, setPluginMenuOpen] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global ESC listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        getCurrentWindow().hide();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelectSuggestion(selectedIndex);
          if (activePlugin) onExecute(activePlugin, suggestions[selectedIndex].value);
        } else if (activePlugin) {
          onExecute(activePlugin, query);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onSelectedIndexChange(
          selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onSelectedIndexChange(
          selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1,
        );
      }
    },
    [
      activePlugin,
      query,
      suggestions,
      selectedIndex,
      onExecute,
      onSelectSuggestion,
      onSelectedIndexChange,
    ],
  );

  const handleVoice = () => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      return;
    }
    const SR: SpeechRecognitionConstructor | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onQueryChange(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="inputbar-glass">
      <div className="inputbar-inner">
        {/* Left: Plugin icon */}
        <button
          className="inputbar-plugin-btn"
          onClick={() => setPluginMenuOpen(!pluginMenuOpen)}
          title={activePlugin?.name ?? "Select plugin"}
        >
          <span className="inputbar-plugin-icon">
            {activePlugin?.icon ?? "⚡"}
          </span>
        </button>

        {/* Plugin dropdown */}
        {pluginMenuOpen && (
          <div className="inputbar-plugin-menu">
            {plugins.map((p) => (
              <button
                key={p.id}
                className={`inputbar-plugin-item ${p.id === activePlugin?.id ? "active" : ""}`}
                onClick={() => {
                  onPluginChange(p);
                  setPluginMenuOpen(false);
                  inputRef.current?.focus();
                }}
              >
                <span className="plugicon">{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Middle: Input */}
        <input
          ref={inputRef}
          className="inputbar-input"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activePlugin?.placeholder ?? "Type a command..."}
          autoFocus
        />

        {/* Right: Voice */}
        <button
          className={`inputbar-voice-btn ${listening ? "listening" : ""}`}
          onClick={handleVoice}
          title="Voice input"
        >
          <span className="voice-icon">{listening ? "🔴" : "🎤"}</span>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="inputbar-suggestions" ref={listRef}>
          {suggestions.map((item, i) => (
            <button
              key={i}
              className={`inputbar-suggestion-item ${i === selectedIndex ? "selected" : ""}`}
              onClick={() => {
                onSelectSuggestion(i);
                if (activePlugin) onExecute(activePlugin, item.value);
              }}
              onMouseEnter={() => onSelectedIndexChange(i)}
            >
              <span className="suggestion-title">{item.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
