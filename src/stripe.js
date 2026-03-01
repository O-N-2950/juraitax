// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax / tAIx — Stripe Payment Service
//  CHF 49 — Déclaration fiscale / CHF 49/an Abonnement annuel
//  Mars 2026 — PEP's Swiss SA · taix.ch
//  NOTE: Clé publiable Stripe (pk_live_...) côté frontend UNIQUEMENT.
//        La clé secrète (sk_live_...) reste EXCLUSIVEMENT côté backend.
// ═══════════════════════════════════════════════════════════════════════

import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise = null;
function getStripe() {
  if (!stripePromise && STRIPE_PK) stripePromise = loadStripe(STRIPE_PK);
  return stripePromise;
}

// ── MÉTADONNÉES COMPLÈTES ────────────────────────────────────────────
// Transmises à Stripe pour identifier chaque paiement dans le dashboard.
// Visibles dans: dashboard.stripe.com → Paiements → Détail → Métadonnées
function buildMetadata(data = {}, mode = "b2c_declaration") {
  return {
    // Identification produit
    app:              "taix.ch",
    produit:          mode === "abonnement" ? "Abonnement tAIx CHF 49/an" : "Déclaration fiscale tAIx CHF 49",
    mode,                                        // b2c_declaration | abonnement | b2b_solo | b2b_cabinet

    // Client
    client_nom:       `${data.prenom || ""} ${data.nom || ""}`.trim() || "—",
    client_commune:   data.commune   || "—",
    client_canton:    data.canton    || "JU",
    no_contribuable:  data.no_contribuable || "—",

    // Session
    langue:           data.lang     || "fr",
    annee_di:         "2025",
    domaine_source:   typeof window !== "undefined" ? window.location.hostname : "taix.ch",
    timestamp:        new Date().toISOString(),

    // Partenaire WIN WIN (si applicable)
    partenaire:       data.b2bFirm  || "—",
    finma_ref:        "F01042365",              // WIN WIN Finance Group SARL

    // Conformité LPD
    hebergement:      "Infomaniak · Genève · Suisse",
    loi_applicable:   "LPD (Loi fédérale sur la protection des données)",
  };
}

// ── PAIEMENT CHF 49 — Déclaration ────────────────────────────────────
export async function payerDeclaration({ data, onSuccess, onCancel }) {
  const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK_49;

  if (PAYMENT_LINK) {
    const ref = `di_${data.no_contribuable || "anon"}_${Date.now()}`;
    const params = new URLSearchParams({
      prefilled_email:      data.email || "",
      client_reference_id:  ref,
      // Passer métadonnées encodées dans l'URL (max 500 chars)
      metadata_app:         "taix.ch",
      metadata_produit:     "Declaration_CHF49",
      metadata_canton:      data.canton || "JU",
      metadata_langue:      data.lang   || "fr",
      metadata_annee:       "2025",
      metadata_hebergement: "Infomaniak_Suisse",
    });
    // Stocker localement pour retrouver après retour Stripe
    try {
      sessionStorage.setItem("taix_pending_payment", JSON.stringify({
        ref, mode: "b2c_declaration", ...buildMetadata(data, "b2c_declaration")
      }));
    } catch {}
    window.location.href = `${PAYMENT_LINK}?${params}`;
    return;
  }

  // Dev: bypass paiement
  console.warn("[tAIx] VITE_STRIPE_PAYMENT_LINK_49 manquant — bypass dev");
  onSuccess?.();
}

// ── PAIEMENT CHF 49/AN — Abonnement ──────────────────────────────────
export async function payerAbonnement({ email, nom, canton, lang, onSuccess }) {
  const PAYMENT_LINK_SUB = import.meta.env.VITE_STRIPE_PAYMENT_LINK_SUB;

  if (PAYMENT_LINK_SUB) {
    const ref = `sub_${(email || "").replace("@","_at_")}_${Date.now()}`;
    const params = new URLSearchParams({
      prefilled_email:      email || "",
      client_reference_id:  ref,
      metadata_app:         "taix.ch",
      metadata_produit:     "Abonnement_CHF49_an",
      metadata_canton:      canton || "JU",
      metadata_langue:      lang   || "fr",
      metadata_type:        "abonnement_annuel",
      metadata_hebergement: "Infomaniak_Suisse",
    });
    try {
      sessionStorage.setItem("taix_pending_sub", JSON.stringify({
        ref, email, nom, canton, lang, mode: "abonnement"
      }));
    } catch {}
    window.location.href = `${PAYMENT_LINK_SUB}?${params}`;
    return;
  }

  console.warn("[tAIx] VITE_STRIPE_PAYMENT_LINK_SUB manquant — bypass dev");
  onSuccess?.();
}

// ── RETOUR DEPUIS STRIPE ─────────────────────────────────────────────
export function checkStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("payment_status") || params.get("redirect_status");

  if (status === "succeeded" || status === "paid") {
    window.history.replaceState({}, "", window.location.pathname);
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem("taix_pending_payment") || "null"); } catch {}
    return { success: true, pending };
  }
  if (status === "canceled") {
    window.history.replaceState({}, "", window.location.pathname);
    return { success: false, canceled: true };
  }
  return null;
}

export { getStripe, buildMetadata };
