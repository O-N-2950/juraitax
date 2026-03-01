// ═══════════════════════════════════════════════════════════
//  JurAI Tax — Sélecteur de langue
//  Composant réutilisable, s'intègre dans le header
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { useStore } from "./store";
import { LANGUAGES } from "./i18n";

export default function LangSelector() {
  const lang    = useStore(s => s.lang);
  const setLang = useStore(s => s.setLang);
  const [open, setOpen]   = useState(false);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ position: "relative", zIndex: 200 }}>
      {/* Bouton trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(201,168,76,0.35)",
          borderRadius: 8, padding: "6px 12px",
          color: "#E8C060", cursor: "pointer",
          fontSize: 13, fontFamily: "Outfit, sans-serif",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ opacity: 0.6, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#0D1B2A",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          minWidth: 160,
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px",
                background: l.code === lang ? "rgba(201,168,76,0.15)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                color: l.code === lang ? "#E8C060" : "#C8C0B0",
                cursor: "pointer", fontSize: 13,
                fontFamily: "Outfit, sans-serif",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if(l.code !== lang) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if(l.code !== lang) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <div>
                <div style={{ fontWeight: l.code === lang ? 600 : 400 }}>{l.label}</div>
              </div>
              {l.code === lang && <span style={{ marginLeft: "auto", color: "#C9A84C" }}>✓</span>}
            </button>
          ))}

          {/* Note multilingue */}
          <div style={{
            padding: "8px 16px", fontSize: 11,
            color: "rgba(200,192,176,0.5)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            🇨🇭 Interface disponible en 6 langues
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: -1,
          }}
        />
      )}
    </div>
  );
}
