// ═══════════════════════════════════════════════════════════════════════
//  tAIx — Sécurité Frontend
//  Inspiré de: Soluris (CORS strict) + immo-cool (middleware JWT)
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

// ── 1. CONTENT SECURITY POLICY (via meta tag) ────────────────────────
export function injectCSP() {
  const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existing) return;

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",          // Stripe JS
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.anthropic.com https://api.stripe.com https://taix.ch https://*.railway.app https://*.infomaniak.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",          // Stripe iframes
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://buy.stripe.com",
  ].join("; ");

  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = csp;
  document.head.appendChild(meta);
}

// ── 2. RATE LIMITING CÔTÉ CLIENT ────────────────────────────────────
// Évite les abus (spam clics, bots)
const _rateLimits = {};
export function rateLimit(key, maxCalls = 5, windowMs = 60000) {
  const now = Date.now();
  if (!_rateLimits[key]) _rateLimits[key] = [];
  _rateLimits[key] = _rateLimits[key].filter(t => now - t < windowMs);
  if (_rateLimits[key].length >= maxCalls) return false;
  _rateLimits[key].push(now);
  return true;
}

// ── 3. SANITISATION DES INPUTS ───────────────────────────────────────
export function sanitize(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/[<>]/g, "")                  // XSS basique
    .replace(/javascript:/gi, "")          // XSS URL
    .replace(/on\w+\s*=/gi, "")            // Event handlers
    .trim()
    .substring(0, 500);                    // Limite longueur
}

export function sanitizeAmount(val) {
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(n) || n < 0 || n > 99_999_999) return 0;
  return Math.round(n * 100) / 100;
}

// ── 4. VALIDATION FORMULAIRE FISCAL ─────────────────────────────────
export function validateField(key, value) {
  const rules = {
    prenom:          { max: 60,  pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/ },
    nom:             { max: 60,  pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/ },
    no_contribuable: { max: 20,  pattern: /^[0-9\s\-]+$/ },
    naissance:       { max: 10,  pattern: /^\d{4}-\d{2}-\d{2}$/ },
    email:           { max: 120, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  };
  const rule = rules[key];
  if (!rule || !value) return true;
  const str = String(value);
  if (str.length > rule.max) return false;
  if (rule.pattern && !rule.pattern.test(str)) return false;
  return true;
}

// ── 5. PROTECTION CLÉS API ───────────────────────────────────────────
// Vérifie que les clés sensibles ne fuient pas dans les logs
export function maskKey(key) {
  if (!key || key.length < 10) return "***";
  return key.substring(0, 8) + "..." + key.slice(-4);
}

// ── 6. SUPPRESSION DONNÉES EN MÉMOIRE ────────────────────────────────
// Appelé après téléchargement PDF — purge les données sensibles
export function purgeSessionData() {
  try {
    // Vider sessionStorage des données de paiement en attente
    sessionStorage.removeItem("taix_pending_payment");
    sessionStorage.removeItem("taix_pending_sub");
    // Note: le store Zustand est en mémoire — vidé à la fermeture tab
    console.info("[tAIx] Données de session purgées ✓");
  } catch {}
}

// ── 7. ANTI-CLICKJACKING ─────────────────────────────────────────────
export function preventClickjacking() {
  if (window.top !== window.self) {
    // L'app est dans une iframe non autorisée
    document.body.innerHTML = "";
    window.top.location = window.self.location;
  }
}

// ── 8. DÉTECTION ENVIRONNEMENT ───────────────────────────────────────
export const ENV = {
  isDev:  import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  host:   typeof window !== "undefined" ? window.location.hostname : "taix.ch",
  isTaix: typeof window !== "undefined" && (
    window.location.hostname.includes("taix") ||
    window.location.hostname.includes("juraitax") ||
    window.location.hostname === "localhost"
  ),
};

// ── INITIALISATION (appeler dans main.jsx) ───────────────────────────
export function initSecurity() {
  if (typeof window === "undefined") return;
  preventClickjacking();
  injectCSP();
  if (ENV.isDev) {
    console.info("[tAIx Security] Mode DEV — CSP injectée, rate limiting actif");
  }
}
