// ═══════════════════════════════════════════════════════════════════════
//  tAIx — Trust Badges · Hébergement Suisse · LPD · Sécurité
//  Composant réutilisable — Welcome, Paywall, Résultat, Abonnement
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { T as S } from "./ui";
import { useStore } from "./store";
import { useT } from "./i18n";

// ── TRADUCTIONS ──────────────────────────────────────────────────────
const TRUST_LABELS = {
  hosting: {
    fr: "Données hébergées en Suisse",
    de: "Daten in der Schweiz gehostet",
    it: "Dati ospitati in Svizzera",
    pt: "Dados alojados na Suíça",
    es: "Datos alojados en Suiza",
    en: "Data hosted in Switzerland",
    uk: "Дані розміщені у Швейцарії",
  },
  hosting_detail: {
    fr: "Infomaniak · Genève · Suisse",
    de: "Infomaniak · Genf · Schweiz",
    it: "Infomaniak · Ginevra · Svizzera",
    pt: "Infomaniak · Genebra · Suíça",
    es: "Infomaniak · Ginebra · Suiza",
    en: "Infomaniak · Geneva · Switzerland",
    uk: "Infomaniak · Женева · Швейцарія",
  },
  lpd: {
    fr: "Conformité LPD",
    de: "DSG-konform",
    it: "Conforme LPD",
    pt: "Conformidade LPD",
    es: "Conformidad LPD",
    en: "Swiss FADP compliant",
    uk: "Відповідність LPD",
  },
  lpd_detail: {
    fr: "Loi fédérale sur la protection des données",
    de: "Bundesgesetz über den Datenschutz",
    it: "Legge federale sulla protezione dei dati",
    pt: "Lei federal sobre a proteção dos dados",
    es: "Ley federal de protección de datos",
    en: "Federal Act on Data Protection",
    uk: "Федеральний закон про захист даних",
  },
  no_resale: {
    fr: "Données jamais revendues",
    de: "Daten werden nie verkauft",
    it: "Dati mai rivenduti",
    pt: "Dados nunca revendidos",
    es: "Datos nunca revendidos",
    en: "Data never sold",
    uk: "Дані ніколи не продаються",
  },
  no_resale_detail: {
    fr: "Vos informations fiscales restent confidentielles",
    de: "Ihre Steuerdaten bleiben vertraulich",
    it: "Le vostre informazioni fiscali rimangono riservate",
    pt: "As suas informações fiscais ficam confidenciais",
    es: "Su información fiscal permanece confidencial",
    en: "Your tax information remains confidential",
    uk: "Ваша податкова інформація залишається конфіденційною",
  },
  delete: {
    fr: "Documents supprimés après traitement",
    de: "Dokumente nach Verarbeitung gelöscht",
    it: "Documenti eliminati dopo l'elaborazione",
    pt: "Documentos eliminados após processamento",
    es: "Documentos eliminados tras el procesamiento",
    en: "Documents deleted after processing",
    uk: "Документи видалені після обробки",
  },
  delete_detail: {
    fr: "Vos fichiers uploadés ne sont pas conservés",
    de: "Ihre hochgeladenen Dateien werden nicht gespeichert",
    it: "I vostri file caricati non vengono conservati",
    pt: "Os seus ficheiros carregados não são conservados",
    es: "Sus archivos subidos no se conservan",
    en: "Your uploaded files are not retained",
    uk: "Ваші завантажені файли не зберігаються",
  },
  stripe: {
    fr: "Paiement sécurisé Stripe",
    de: "Sichere Zahlung per Stripe",
    it: "Pagamento sicuro Stripe",
    pt: "Pagamento seguro Stripe",
    es: "Pago seguro Stripe",
    en: "Secure payment via Stripe",
    uk: "Безпечна оплата через Stripe",
  },
  stripe_detail: {
    fr: "Twint · Carte · Virement · Crypté TLS",
    de: "Twint · Karte · Überweisung · TLS verschlüsselt",
    it: "Twint · Carta · Bonifico · Crittografato TLS",
    pt: "Twint · Cartão · Transferência · Encriptado TLS",
    es: "Twint · Tarjeta · Transferencia · Cifrado TLS",
    en: "Twint · Card · Transfer · TLS encrypted",
    uk: "Twint · Картка · Переказ · Зашифровано TLS",
  },
};

function L(obj, lang) { return obj?.[lang] || obj?.fr || ""; }

// ── Badge individuel ─────────────────────────────────────────────────
function TrustBadge({ icon, label, detail, color = S.green }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 14px", borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.06)`,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{
          fontSize: 12, fontWeight: 700, color,
          fontFamily: "'Outfit',sans-serif", marginBottom: 2,
        }}>{label}</div>
        <div style={{
          fontSize: 10.5, color: S.textDim,
          fontFamily: "'Outfit',sans-serif", lineHeight: 1.4,
        }}>{detail}</div>
      </div>
    </div>
  );
}

// ── Bandeau compact (1 ligne) — pour Welcome, Paywall ────────────────
export function TrustBanner({ lang }) {
  const L2 = (obj) => L(obj, lang);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 20, flexWrap: "wrap",
      padding: "10px 16px",
      borderRadius: 10,
      background: "rgba(52,211,153,0.04)",
      border: "1px solid rgba(52,211,153,0.12)",
    }}>
      {[
        { icon: "🇨🇭", text: L2(TRUST_LABELS.hosting) },
        { icon: "🔒", text: L2(TRUST_LABELS.lpd) },
        { icon: "🗑️", text: L2(TRUST_LABELS.delete) },
        { icon: "💳", text: L2(TRUST_LABELS.stripe) },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, color: S.textDim, fontFamily: "'Outfit',sans-serif",
        }}>
          <span style={{ fontSize: 14 }}>{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── Bloc détaillé — pour Paywall, Abonnement ─────────────────────────
export function TrustBlock({ lang }) {
  const L2 = (obj) => L(obj, lang);
  return (
    <div style={{ marginTop: 16 }}>
      {/* Badge hébergement Suisse — mis en avant */}
      <div style={{
        padding: "14px 16px", borderRadius: 12, marginBottom: 10,
        background: "linear-gradient(135deg, rgba(201,168,76,0.06), rgba(201,168,76,0.02))",
        border: "1px solid rgba(201,168,76,0.2)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>🇨🇭</span>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: S.gold,
            fontFamily: "'Outfit',sans-serif", marginBottom: 2,
          }}>
            {L2(TRUST_LABELS.hosting)}
          </div>
          <div style={{
            fontSize: 11, color: S.textDim, fontFamily: "'Outfit',sans-serif",
          }}>
            {L2(TRUST_LABELS.hosting_detail)} · {L2(TRUST_LABELS.lpd)}
          </div>
          <div style={{
            fontSize: 10, color: S.muted, fontFamily: "'Outfit',sans-serif", marginTop: 2,
          }}>
            {L2(TRUST_LABELS.lpd_detail)} (LPD/DSG 2023)
          </div>
        </div>
      </div>

      {/* 3 badges secondaires */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TrustBadge
          icon="🗑️"
          label={L2(TRUST_LABELS.delete)}
          detail={L2(TRUST_LABELS.delete_detail)}
          color={S.green}
        />
        <TrustBadge
          icon="🚫"
          label={L2(TRUST_LABELS.no_resale)}
          detail={L2(TRUST_LABELS.no_resale_detail)}
          color={S.green}
        />
      </div>

      {/* Stripe */}
      <div style={{ marginTop: 8 }}>
        <TrustBadge
          icon="💳"
          label={L2(TRUST_LABELS.stripe)}
          detail={L2(TRUST_LABELS.stripe_detail)}
          color={S.textDim}
        />
      </div>
    </div>
  );
}

// ── Footer mention LPD — pour bas de tous les écrans ─────────────────
export function TrustFooter({ lang }) {
  const L2 = (obj) => L(obj, lang);
  const mentions = {
    fr: `Données hébergées exclusivement en Suisse · Infomaniak Network SA · Genève · Conformité LPD (RS 235.1) · Documents supprimés après traitement · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    de: `Daten ausschliesslich in der Schweiz gehostet · Infomaniak Network SA · Genf · DSG-konform (SR 235.1) · Dokumente nach Verarbeitung gelöscht · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    it: `Dati ospitati esclusivamente in Svizzera · Infomaniak Network SA · Ginevra · Conforme LPD (RS 235.1) · Documenti eliminati dopo l'elaborazione · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    en: `Data hosted exclusively in Switzerland · Infomaniak Network SA · Geneva · Swiss FADP compliant (RS 235.1) · Documents deleted after processing · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    pt: `Dados alojados exclusivamente na Suíça · Infomaniak Network SA · Genebra · Conformidade LPD (RS 235.1) · Documentos eliminados após processamento · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    es: `Datos alojados exclusivamente en Suiza · Infomaniak Network SA · Ginebra · Conformidad LPD (RS 235.1) · Documentos eliminados tras el procesamiento · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
    uk: `Дані розміщені виключно у Швейцарії · Infomaniak Network SA · Женева · Відповідність LPD (RS 235.1) · Документи видалені після обробки · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay`,
  };

  return (
    <p style={{
      marginTop: 20, fontSize: 9, color: S.muted,
      textAlign: "center", lineHeight: 1.7,
      fontFamily: "'Outfit',sans-serif",
      borderTop: `1px solid ${S.border}`,
      paddingTop: 14,
    }}>
      🇨🇭 {mentions[lang] || mentions.fr}
    </p>
  );
}
