// ═══════════════════════════════════════════════════════════════
//  tAIx — Serveur Express (ESM)
//  - Sert le build Vite (dist/)
//  - Proxy /api/anthropic → api.anthropic.com (pas de CORS browser)
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "50mb" }));

// ── Proxy Anthropic API ──────────────────────────────────────
app.post("/api/anthropic", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key manquante côté serveur" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":       "application/json",
        "x-api-key":          ANTHROPIC_API_KEY,
        "anthropic-version":  "2023-06-01",
        "anthropic-beta":     "pdfs-2024-09-25",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Servir le front Vite ─────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));
app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`tAIx server :${PORT} — API key: ${ANTHROPIC_API_KEY ? "✓" : "✗ MANQUANTE"}`);
});
