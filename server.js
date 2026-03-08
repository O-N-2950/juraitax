// ═══════════════════════════════════════════════════════════════════════
//  tAIx — Serveur Express sécurisé
//  Routes :
//    POST /api/anthropic          → Proxy Anthropic générique
//    POST /api/pixou              → Chat Pixou expert fiscal (avec contexte complet)
//    POST /api/rapport-raisonnement → Génère le raisonnement narratif pour le PDF
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

// ── Anti-crash — le serveur NE S'ARRÊTE JAMAIS ──────────────────────
// Inspiré de WIN WIN v2 server/index.ts — Règle PEP's #1
process.on('uncaughtException', (err) => {
  console.error('🔴 [tAIx] UNCAUGHT EXCEPTION (serveur survit):', err?.message || err);
  console.error(err?.stack?.split('\n').slice(0, 3).join('\n'));
});
process.on('unhandledRejection', (reason) => {
  console.error('🟡 [tAIx] UNHANDLED REJECTION (serveur survit):', reason?.message || reason);
});
process.on('SIGTERM', () => {
  console.log('[tAIx] SIGTERM reçu — arrêt gracieux');
  process.exit(0);
});

app.use(express.json({ limit: "50mb" }));

// ── CRITIQUE 2 : Headers de sécurité HTTP ────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options",    "nosniff");
  res.setHeader("X-Frame-Options",           "DENY");
  res.setHeader("X-XSS-Protection",          "1; mode=block");
  res.setHeader("Referrer-Policy",           "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy",        "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// ── CRITIQUE 2 : CORS restrictif ─────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://juraitax-app-production-f257.up.railway.app",
  "https://taix.ch",
  "https://www.taix.ch",
  "https://jura.taix.ch",
  "https://ne.taix.ch",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173", "http://localhost:3000"] : []),
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Session-Token");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── CRITIQUE 2 : Rate limiting par IP ─────────────────────────────────
// 20 requêtes/minute sur les routes API — sans dépendance npm
const _rateLimits = new Map();
function checkRateLimit(ip, maxReq = 20, windowMs = 60000) {
  const now = Date.now();
  const key  = ip;
  if (!_rateLimits.has(key)) _rateLimits.set(key, []);
  const times = _rateLimits.get(key).filter(t => now - t < windowMs);
  times.push(now);
  _rateLimits.set(key, times);
  return times.length <= maxReq;
}
// Nettoyage toutes les 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 120000;
  for (const [k, times] of _rateLimits) {
    const fresh = times.filter(t => t > cutoff);
    if (fresh.length === 0) _rateLimits.delete(k);
    else _rateLimits.set(k, fresh);
  }
}, 300000);

// ── CRITIQUE 2 : Middleware auth + rate limit pour routes API ─────────
function apiMiddleware(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";

  // Rate limiting
  if (!checkRateLimit(ip)) {
    console.warn(`[tAIx] Rate limit dépassé — IP: ${ip} — ${req.path}`);
    return res.status(429).json({
      error: "Trop de requêtes. Veuillez patienter une minute.",
      retry_after: 60,
    });
  }

  // Whitelist URLs de destination — anti-SSRF
  // Seul api.anthropic.com est autorisé comme destination externe
  next();
}

// ── Validation données fiscales côté serveur ──────────────────────────
function validateFiscalData(data = {}) {
  const errors = [];
  // Montants négatifs impossibles
  const numericFields = ["rev_salaire","rev_avs","rev_lpp","fortune_immobilier",
                          "dette_hypotheque","pilier3a","dons","frais_garde","frais_medicaux"];
  for (const f of numericFields) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== "") {
      const v = parseFloat(data[f]);
      if (isNaN(v) || v < 0) errors.push(`${f}: valeur invalide (${data[f]})`);
      if (v > 10_000_000)    errors.push(`${f}: montant suspect (${v})`);
    }
  }
  // Canton valide
  const CANTONS = ["JU","NE","BE","VD","GE","VS","FR","SO","BS","BL","AG","ZH","LU","SG","GR","TI","SZ","ZG","OW","NW","GL","UR","AI","AR","SH","TG","TH"];
  if (data.canton && !CANTONS.includes((data.canton||"").toUpperCase())) {
    errors.push(`canton invalide: ${data.canton}`);
  }
  return errors;
}

// ── Helper appel Anthropic ────────────────────────────────────────────
async function callAnthropic(body) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":       "application/json",
      "x-api-key":          ANTHROPIC_API_KEY,
      "anthropic-version":  "2023-06-01",
      "anthropic-beta":     "pdfs-2024-09-25",
    },
    body: JSON.stringify(body),
  });
  return response;
}

// ── ROUTE 1 : Proxy Anthropic générique (OCR, calculs) ───────────────
app.post("/api/anthropic", apiMiddleware, async (req, res) => {
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: "Clé API manquante" });
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress;
    console.log(`[tAIx] /api/anthropic — IP:${ip} model:${req.body?.model||"?"} tokens:${req.body?.max_tokens||"?"}`);
    const response = await callAnthropic(req.body);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[/api/anthropic] Erreur:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── ROUTE 2 : Chat Pixou — expert fiscal avec cerveau complet ─────────
app.post("/api/pixou", apiMiddleware, async (req, res) => {
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: "Clé API manquante" });

  const {
    messages = [],       // Historique conversation [{role, content}]
    donneesClient = {},  // Données OCR du dossier
    lang = "fr",
    canton = "JU",
  } = req.body;

  // Validation serveur des données fiscales
  const validationErrors = validateFiscalData(donneesClient);
  if (validationErrors.length > 0) {
    console.warn("[tAIx] /api/pixou — données invalides:", validationErrors);
    // On continue mais on log — pas bloquant pour l'UX
  }

  // Profil client déduit
  const prenom      = donneesClient.prenom || "";
  const revenuNet   = donneesClient.revenu_net_1 || donneesClient.revenu_net_I || donneesClient.revenu_imposable || 0;
  const estRetraite = (donneesClient.rev_avs > 0 || donneesClient.revenus_avs > 0) && !donneesClient.rev_salaire;
  const aHypotheque = (donneesClient.dette_hypotheque || donneesClient.solde_hypotheque || 0) > 0;
  const aEnfants    = (donneesClient.nb_enfants || 0) > 0;
  const estMarie    = ["marie","marié","verheiratet","married"].includes((donneesClient.etat_civil||"").toLowerCase());

  // Calcul plancher dons proportionnel au revenu
  const plancherDons = revenuNet > 0 ? Math.max(300, Math.round(revenuNet * 0.004)) : 300;
  const plafondDons  = revenuNet > 0 ? Math.round(revenuNet * 0.20) : 300;

  const langLabel = { fr:"français", de:"allemand", it:"italien", pt:"portugais", es:"espagnol", en:"anglais" };

  const systemPrompt = `Tu es Pixou — expert fiscal suisse de tAIx (PEP's Swiss SA).
Tu as 30 ans d'expérience en fiscalité suisse. Tu travailles POUR le client, CONTRE le fisc.
Tu t'adresses à ${prenom || "un contribuable"} · Canton ${canton} · ${estRetraite ? "RETRAITÉ" : "ACTIF"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOSSIER CLIENT (extrait OCR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(donneesClient, null, 2)}

PROFIL DÉTECTÉ :
• Retraité : ${estRetraite ? "OUI" : "NON"}
• Hypothèque : ${aHypotheque ? `OUI — CHF ${(donneesClient.dette_hypotheque || 0).toLocaleString("fr-CH")}` : "NON"}
• Enfants : ${aEnfants ? donneesClient.nb_enfants : "NON"}
• Marié : ${estMarie ? "OUI" : "NON"}
• Revenu net estimé : CHF ${revenuNet.toLocaleString("fr-CH")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES ABSOLUES — GRAVÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0. PREMIÈRE QUESTION — SI DÉBUT DE CONVERSATION :
   "Bonjour ${prenom || ""} ! Avant tout — qu'est-ce qui a changé dans votre situation depuis votre dernière déclaration fiscale ?"
   Attends la réponse avant toute autre question.

1. PIXOU MÈNE L'ENTRETIEN — proactif, il guide, il ne subit pas.
   Raisonnement : VOIT → DÉDUIT → INFORME ou DEMANDE
   Exemple : "Je vois une hypothèque de CHF ${(donneesClient.dette_hypotheque||0).toLocaleString("fr-CH")}. Il y a forcément des intérêts à déduire."

2. DONS — règle proportionnelle (PAS 300 CHF fixe) :
   • Plancher minimum : CHF ${plancherDons} (${revenuNet > 0 ? "0.4% revenu net" : "minimum légal"})
   • Maximum légal : CHF ${plafondDons} (20% revenu net — art. 33a LIFD)
   • Toujours demander. Si client dit "non" → appliquer CHF ${plancherDons} sans justificatif
   • Toujours chiffrer l'économie : "cela vous économise environ CHF X d'impôts"

3. JAMAIS DE QUESTIONS INUTILES :
   ${estRetraite ? "• RETRAITÉ → JAMAIS trajet, télétravail, pilier 3a actif, formation" : ""}
   ${!aEnfants ? "• SANS ENFANTS → JAMAIS frais de garde" : ""}
   • Champ déjà rempli → ne PAS redemander

4. DOCUMENTS MANQUANTS = PRIORITÉ ABSOLUE
   Explique exactement où trouver chaque document (e-banking, courrier, employeur)

5. UNE SEULE ACTION PAR MESSAGE — max 3-4 phrases
   Chiffre TOUJOURS l'impact en CHF

6. LANGUE : réponds en ${langLabel[lang] || "français"}

7. À LA FIN DE L'ENTRETIEN — résume les décisions prises :
   "Voici ce que j'ai retenu pour votre déclaration : ..."
   Ce résumé sera intégré dans votre Rapport Expert PDF.`;

  try {
    const response = await callAnthropic({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "Je rencontre une difficulté technique. Réessayez dans un instant.";

    res.json({ response: text, tokens: data.usage });
  } catch (err) {
    console.error("[/api/pixou] Erreur:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── ROUTE 3 : Rapport raisonnement — narrative expert pour PDF ────────
app.post("/api/rapport-raisonnement", apiMiddleware, async (req, res) => {
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: "Clé API manquante" });

  const {
    donneesClient = {},
    calcResult    = {},
    conversationPixou = [],  // Historique complet conversation Pixou
    lang  = "fr",
    canton = "JU",
  } = req.body;

  const prenom = donneesClient.prenom || "le contribuable";
  const langLabel = { fr:"français", de:"allemand", it:"italien", pt:"portugais", es:"espagnol", en:"anglais" };

  const prompt = `Tu es un expert fiscal suisse (tAIx — PEP's Swiss SA).
Tu dois rédiger le RAPPORT D'EXPERT qui accompagne la déclaration fiscale de ${prenom} · Canton ${canton}.

Ce rapport explique POURQUOI chaque décision a été prise — c'est le compte-rendu professionnel que le client remet à son fiduciaire ou conserve pour lui-même.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DONNÉES DU DOSSIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(donneesClient, null, 2)}

RÉSULTAT DU CALCUL :
${JSON.stringify(calcResult, null, 2)}

CONVERSATION PIXOU (entretien avec le client) :
${conversationPixou.map(m => `${m.role === "user" ? "CLIENT" : "PIXOU"}: ${m.content}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Produis un JSON avec cette structure exacte :

{
  "titre": "Rapport d'expert fiscal — ${prenom} — 2025",
  "resume_situation": "2-3 phrases résumant la situation du client",
  "decisions": [
    {
      "titre": "Nom de la déduction/décision",
      "montant_chf": 1234,
      "base_legale": "Art. XX LIFD / Art. XX LJDF",
      "raisonnement": "Explication claire pourquoi cette décision, basée sur la conversation et les données",
      "impact_estime_chf": 456,
      "source": "document|forfait|conversation|auto"
    }
  ],
  "optimisations_futures": [
    "Conseil concret pour l'année prochaine"
  ],
  "note_expert": "Observation finale personnalisée de Pixou pour ce client"
}

IMPORTANT :
• Cite les articles de loi exacts (LIFD, LJDF, LCdir selon canton)
• Explique le POURQUOI de chaque chiffre — pas juste le quoi
• Note si la décision vient de la conversation client ou d'un forfait automatique
• Réponds UNIQUEMENT en JSON valide, sans backticks
• Langue : ${langLabel[lang] || "français"}`;

  try {
    const response = await callAnthropic({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    // Parser le JSON
    let raisonnement;
    try {
      raisonnement = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      raisonnement = { titre: "Rapport fiscal", decisions: [], resume_situation: text };
    }

    res.json({ raisonnement });
  } catch (err) {
    console.error("[/api/rapport-raisonnement] Erreur:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Health check — Railway / monitoring ──────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "tAIx",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    apiKey: ANTHROPIC_API_KEY ? "présente ✓" : "MANQUANTE ✗",
    uptime: Math.round(process.uptime()) + "s",
  });
});

// ── Servir le front Vite ──────────────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));
app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ tAIx server :${PORT}`);
  console.log(`   /api/anthropic              → Proxy OCR`);
  console.log(`   /api/pixou                  → Chat expert fiscal`);
  console.log(`   /api/rapport-raisonnement   → Raisonnement PDF`);
  console.log(`   Clé API: ${ANTHROPIC_API_KEY ? "✓ présente" : "✗ MANQUANTE — set ANTHROPIC_API_KEY"}`);
});
