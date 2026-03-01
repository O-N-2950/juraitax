// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax / tAIx — Stripe Payment Service
//  CHF 49 — Déclaration fiscale / CHF 49 Abonnement annuel
//  Mars 2026 — PEP's Swiss SA
//  NOTE: Clé publiable Stripe (pk_live_...) requise pour le frontend.
//        La clé secrète (sk_live_...) est UNIQUEMENT côté backend.
// ═══════════════════════════════════════════════════════════════════════

import { loadStripe } from "@stripe/stripe-js";

// Clé PUBLIABLE (pk_live_...) — à récupérer sur dashboard.stripe.com
// PAS la clé secrète sk_live_ qui doit rester côté serveur
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise = null;
function getStripe() {
  if (!stripePromise && STRIPE_PK) {
    stripePromise = loadStripe(STRIPE_PK);
  }
  return stripePromise;
}

// ── Métadonnées Stripe (pour identifier l'origine dans le dashboard) ─
function buildMetadata(data, mode = "b2c_declaration") {
  return {
    app: "taix.ch",
    mode,
    nom: `${data.prenom || ""} ${data.nom || ""}`.trim(),
    commune: data.commune || "",
    langue: data.lang || "fr",
    canton: data.canton || "JU",
    annee: "2025",
    source: window.location.hostname,
  };
}

// ── Paiement CHF 49 — Déclaration (Stripe Checkout) ──────────────────
// Nécessite backend pour créer session. En attendant: Payment Link Stripe.
export async function payerDeclaration({ data, onSuccess, onCancel }) {
  // 🟡 TEMPORAIRE: Payment Link Stripe (créer sur dashboard.stripe.com)
  // → Produit "Déclaration fiscale tAIx 2025" CHF 49
  // → Activer "Collecter les adresses e-mail"
  // → Ajouter métadonnées: app=taix.ch
  const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK_49;

  if (PAYMENT_LINK) {
    // Ajouter paramètres client dans l'URL
    const params = new URLSearchParams({
      prefilled_email: data.email || "",
      client_reference_id: `${data.no_contribuable || ""}_${Date.now()}`,
    });
    window.location.href = `${PAYMENT_LINK}?${params}`;
    return;
  }

  // Fallback si pas de Payment Link configuré
  console.warn("VITE_STRIPE_PAYMENT_LINK_49 manquant — mode développement");
  onSuccess?.(); // Bypass pour développement
}

// ── Paiement CHF 49 — Abonnement annuel ──────────────────────────────
export async function payerAbonnement({ email, data, onSuccess }) {
  const PAYMENT_LINK_SUB = import.meta.env.VITE_STRIPE_PAYMENT_LINK_SUB;

  if (PAYMENT_LINK_SUB) {
    const params = new URLSearchParams({
      prefilled_email: email || "",
      client_reference_id: `sub_${email}_${Date.now()}`,
    });
    window.location.href = `${PAYMENT_LINK_SUB}?${params}`;
    return;
  }

  // Dev bypass
  console.warn("VITE_STRIPE_PAYMENT_LINK_SUB manquant — mode développement");
  onSuccess?.();
}

// ── Statut paiement (retour depuis Stripe) ───────────────────────────
export function checkStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("payment_status") || params.get("redirect_status");
  const sessionId = params.get("session_id");

  if (status === "succeeded" || status === "paid") {
    // Nettoyer URL
    window.history.replaceState({}, "", window.location.pathname);
    return { success: true, sessionId };
  }
  if (status === "canceled") {
    window.history.replaceState({}, "", window.location.pathname);
    return { success: false, canceled: true };
  }
  return null;
}

export { getStripe };
