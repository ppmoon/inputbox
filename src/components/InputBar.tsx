import { useState, useRef, useEffect } from "react";
import type { Plugin } from "../plugins/registry";
import "./InputBar.css";

interface Props {
  activePlugin: Plugin | null;
  plugins: Plugin[];
  query: string;
  onQueryChange: (q: string) => void;
  onPluginChange: (p: Plugin) => void;
  onExecute: (plugin: Plugin, query: string) => void;
}

export default function InputBar({
  activePlugin,
  plugins,
  query,
  onQueryChange,
  onPluginChange,
  onExecute,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState(false);
  const [pluginMenuOpen, setPluginMenuOpen] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global ESC listener — works even when input is not focused
  useEffect(() => {
    const hideWindow = () => {
      try {
        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
          getCurrentWindow().hide();
        });
      } catch {}
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideWindow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && activePlugin) {
      onExecute(activePlugin, query);
    }
  };

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
    </div>
  );
}
