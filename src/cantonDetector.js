// ═══════════════════════════════════════════════════════════
//  JurAI Tax — Détection automatique canton & config locale
//  par nom de domaine
// ═══════════════════════════════════════════════════════════

import { CANTON_DEFAULT_LANG } from "./i18n.js";

// Map domaine → config canton
const DOMAIN_MAP = {
  // Jura
  "juraitax.ch":       { canton: "JU", appName: "JurAI Tax",   accent: "#C9A84C", flagEmoji: "🏔️" },
  "juraitax.com":      { canton: "JU", appName: "JurAI Tax",   accent: "#C9A84C", flagEmoji: "🏔️" },
  // Neuchâtel
  "neuchtaix.ch":      { canton: "NE", appName: "NeuChTAIX",   accent: "#2E7D32", flagEmoji: "🌲" },
  // Fribourg
  "fritaix.ch":        { canton: "FR", appName: "FriTAIX",     accent: "#1A1A1A", flagEmoji: "⚫" },
  // Vaud
  "vaudtaix.ch":       { canton: "VD", appName: "VaudTAIX",    accent: "#1B5E20", flagEmoji: "🌿" },
  // Valais
  "vstaix.ch":         { canton: "VS", appName: "VSTAIX",      accent: "#C62828", flagEmoji: "🏔️" },
  // Genève
  "getaix.ch":         { canton: "GE", appName: "GeTAIX",      accent: "#B71C1C", flagEmoji: "🦅" },
  // Tessin
  "ticinaitax.ch":     { canton: "TI", appName: "TicinaITax",  accent: "#1565C0", flagEmoji: "🌞" },
  "ticinaitax.online": { canton: "TI", appName: "TicinaITax",  accent: "#1565C0", flagEmoji: "🌞" },
  // Zurich
  "zuritaix.ch":       { canton: "ZH", appName: "ZuriTAIX",    accent: "#1565C0", flagEmoji: "🦁" },
};

// Config par défaut (développement / Railway)
const DEFAULT_CONFIG = {
  canton: "JU",
  appName: "JurAI Tax",
  accent: "#C9A84C",
  flagEmoji: "🏔️",
  lang: "fr",
};

/**
 * Détecte le canton et la config locale selon le hostname du navigateur.
 * En développement (localhost/railway), retourne la config JU par défaut.
 */
export function detectCantonConfig() {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  const host = window.location.hostname.replace("www.", "").toLowerCase();

  // Cherche dans la map exacte
  if (DOMAIN_MAP[host]) {
    const cfg = DOMAIN_MAP[host];
    return {
      ...cfg,
      lang: CANTON_DEFAULT_LANG[cfg.canton] || "fr",
    };
  }

  // Détection par mot-clé dans le host (fallback)
  if (host.includes("neuch"))  return { canton:"NE", appName:"NeuChTAIX",  accent:"#2E7D32", flagEmoji:"🌲", lang:"fr" };
  if (host.includes("fri"))    return { canton:"FR", appName:"FriTAIX",    accent:"#1A1A1A", flagEmoji:"⚫", lang:"fr" };
  if (host.includes("vaud"))   return { canton:"VD", appName:"VaudTAIX",   accent:"#1B5E20", flagEmoji:"🌿", lang:"fr" };
  if (host.includes("vs") || host.includes("valais")) return { canton:"VS", appName:"VSTAIX", accent:"#C62828", flagEmoji:"🏔️", lang:"fr" };
  if (host.includes("ge") || host.includes("geneve")) return { canton:"GE", appName:"GeTAIX", accent:"#B71C1C", flagEmoji:"🦅", lang:"fr" };
  if (host.includes("ticin"))  return { canton:"TI", appName:"TicinaITax", accent:"#1565C0", flagEmoji:"🌞", lang:"it" };
  if (host.includes("zuri") || host.includes("zh")) return { canton:"ZH", appName:"ZuriTAIX", accent:"#1565C0", flagEmoji:"🦁", lang:"de" };

  // Défaut: Jura
  return DEFAULT_CONFIG;
}

/**
 * Injecte la couleur accent dans les variables CSS racine.
 * Appelé au démarrage de l'app.
 */
export function applyCantonTheme(accent) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty(
    "--accent-dim",
    accent + "33" // 20% opacité
  );
}

export { DOMAIN_MAP };
