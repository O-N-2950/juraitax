// ═══════════════════════════════════════════════════════════════════════
//  tAIx — Modalités de dépôt de la déclaration par canton
//  Affiché dans l'écran résultat après téléchargement
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { T as S } from "./ui";

const CANTONS = {
  JU: {
    nom:       { fr:"Canton du Jura", de:"Kanton Jura", it:"Cantone del Giura", en:"Canton of Jura", pt:"Cantão do Jura", es:"Cantón del Jura", uk:"Кантон Юра" },
    delai:     { fr:"31 mars 2026 (prolongation possible jusqu'au 30 septembre)", de:"31. März 2026 (Verlängerung bis 30. September möglich)", it:"31 marzo 2026 (proroga possibile fino al 30 settembre)", en:"31 March 2026 (extension possible to 30 September)", pt:"31 de março de 2026 (prorrogação possível até 30 de setembro)", es:"31 de marzo de 2026 (prórroga posible hasta el 30 de septiembre)", uk:"31 березня 2026 (продовження можливе до 30 вересня)" },
    methodes: [
      {
        icon: "💻",
        label: { fr:"En ligne — eJU Tax", de:"Online — eJU Tax", it:"Online — eJU Tax", en:"Online — eJU Tax", pt:"Online — eJU Tax", es:"Online — eJU Tax", uk:"Онлайн — eJU Tax" },
        detail: { fr:"Portail officiel: https://www.ju.ch/impots → eJU Tax → Soumettre la déclaration", de:"Offizielles Portal: https://www.ju.ch/steuern → eJU Tax", it:"Portale ufficiale: https://www.ju.ch/tasse → eJU Tax", en:"Official portal: https://www.ju.ch/impots → eJU Tax", pt:"Portal oficial: https://www.ju.ch/impots", es:"Portal oficial: https://www.ju.ch/impots", uk:"Офіційний портал: https://www.ju.ch/impots" },
        recommended: true,
      },
      {
        icon: "📮",
        label: { fr:"Voie postale", de:"Per Post", it:"Per posta", en:"By post", pt:"Por correio", es:"Por correo", uk:"Поштою" },
        detail: { fr:"Service cantonal des contributions · Rue de la Justice 2 · 2800 Delémont · Joindre toutes les pièces justificatives originales", de:"Kantonales Steueramt · Rue de la Justice 2 · 2800 Delsberg · Alle Originalbelege beilegen", it:"Servizio cantonale dei contributi · Rue de la Justice 2 · 2800 Delémont · Allegare tutti i giustificativi originali", en:"Cantonal Tax Office · Rue de la Justice 2 · 2800 Delémont · Attach all original supporting documents", pt:"Serviço cantonal de contribuições · Rue de la Justice 2 · 2800 Delémont", es:"Servicio cantonal de contribuciones · Rue de la Justice 2 · 2800 Delémont", uk:"Кантональна податкова служба · Rue de la Justice 2 · 2800 Delémont" },
      },
      {
        icon: "🏢",
        label: { fr:"Dépôt à la commune", de:"Gemeindeabgabe", it:"Deposito al comune", en:"Drop off at municipality", pt:"Entrega no município", es:"Entrega en el municipio", uk:"Здача в муніципалітет" },
        detail: { fr:"Déposer directement à l'administration communale de votre commune. Demander un accusé de réception.", de:"Direkt bei der Gemeindeverwaltung abgeben. Empfangsbestätigung verlangen.", it:"Consegnare direttamente all'amministrazione comunale. Chiedere ricevuta.", en:"Deposit directly at your municipal administration. Request receipt.", pt:"Entregar diretamente na administração municipal. Pedir recibo.", es:"Depositar directamente en la administración municipal. Pedir acuse de recibo.", uk:"Здати безпосередньо до муніципальної адміністрації. Запитати підтвердження." },
      },
    ],
    prolongation: { fr:"Demande de prolongation avant le 31 mars sur eJU Tax ou par courrier. Coût: CHF 9 (inclus dans votre abonnement tAIx).", de:"Fristverlängerung vor dem 31. März über eJU Tax oder per Brief. Kosten: CHF 9 (in Ihrem tAIx-Abo enthalten).", it:"Richiesta di proroga prima del 31 marzo su eJU Tax o per lettera. Costo: CHF 9 (incluso nell'abbonamento tAIx).", en:"Request extension before 31 March on eJU Tax or by letter. Cost: CHF 9 (included in your tAIx subscription).", pt:"Pedido de prorrogação antes de 31 de março no eJU Tax ou por carta. Custo: CHF 9.", es:"Solicitud de prórroga antes del 31 de marzo en eJU Tax o por carta. Coste: CHF 9.", uk:"Запит на продовження до 31 березня на eJU Tax або листом. Вартість: CHF 9." },
  },

  NE: {
    nom:       { fr:"Canton de Neuchâtel", de:"Kanton Neuenburg", it:"Cantone di Neuchâtel", en:"Canton of Neuchâtel", pt:"Cantão de Neuchâtel", es:"Cantón de Neuchâtel", uk:"Кантон Невшатель" },
    delai:     { fr:"31 mars 2026", de:"31. März 2026", it:"31 marzo 2026", en:"31 March 2026", pt:"31 de março de 2026", es:"31 de marzo de 2026", uk:"31 березня 2026" },
    methodes: [
      {
        icon: "💻",
        label: { fr:"En ligne — TaxNE", de:"Online — TaxNE", it:"Online — TaxNE", en:"Online — TaxNE", pt:"Online — TaxNE", es:"Online — TaxNE", uk:"Онлайн — TaxNE" },
        detail: { fr:"https://www.ne.ch/autorites/DFF/SFIFD → TaxNE · Déclaration électronique", de:"https://www.ne.ch → TaxNE", it:"https://www.ne.ch → TaxNE", en:"https://www.ne.ch → TaxNE", pt:"https://www.ne.ch → TaxNE", es:"https://www.ne.ch → TaxNE", uk:"https://www.ne.ch → TaxNE" },
        recommended: true,
      },
      {
        icon: "📮",
        label: { fr:"Voie postale", de:"Per Post", it:"Per posta", en:"By post", pt:"Por correio", es:"Por correo", uk:"Поштою" },
        detail: { fr:"Service des contributions · Rue du Temple-Neuf 2 · 2010 Neuchâtel", de:"Steueramt · Rue du Temple-Neuf 2 · 2010 Neuenburg", it:"Servizio dei contributi · Rue du Temple-Neuf 2 · 2010 Neuchâtel", en:"Tax Office · Rue du Temple-Neuf 2 · 2010 Neuchâtel", pt:"Serviço de contribuições · Rue du Temple-Neuf 2 · 2010 Neuchâtel", es:"Servicio de contribuciones · Rue du Temple-Neuf 2 · 2010 Neuchâtel", uk:"Податкова служба · Rue du Temple-Neuf 2 · 2010 Neuchâtel" },
      },
    ],
    prolongation: { fr:"Prolongation sur demande écrite avant le 31 mars.", de:"Fristverlängerung auf schriftlichen Antrag vor dem 31. März.", it:"Proroga su richiesta scritta prima del 31 marzo.", en:"Extension on written request before 31 March.", pt:"Prorrogação mediante pedido escrito antes de 31 de março.", es:"Prórroga previa solicitud escrita antes del 31 de marzo.", uk:"Продовження за письмовим запитом до 31 березня." },
  },

  TI: {
    nom:       { fr:"Canton du Tessin", de:"Kanton Tessin", it:"Canton Ticino", en:"Canton of Ticino", pt:"Cantão do Ticino", es:"Cantón del Tesino", uk:"Кантон Тічино" },
    delai:     { fr:"31 mars 2026", de:"31. März 2026", it:"31 marzo 2026", en:"31 March 2026", pt:"31 de março de 2026", es:"31 de marzo de 2026", uk:"31 березня 2026" },
    methodes: [
      {
        icon: "💻",
        label: { fr:"En ligne — SiTax", de:"Online — SiTax", it:"Online — SiTax", en:"Online — SiTax", pt:"Online — SiTax", es:"Online — SiTax", uk:"Онлайн — SiTax" },
        detail: { fr:"https://www4.ti.ch/dfe/dc/sitax · Dichiarazione elettronica", de:"https://www4.ti.ch/dfe/dc/sitax", it:"https://www4.ti.ch/dfe/dc/sitax · Caricamento documenti incluso", en:"https://www4.ti.ch/dfe/dc/sitax", pt:"https://www4.ti.ch/dfe/dc/sitax", es:"https://www4.ti.ch/dfe/dc/sitax", uk:"https://www4.ti.ch/dfe/dc/sitax" },
        recommended: true,
      },
      {
        icon: "📮",
        label: { fr:"Voie postale", de:"Per Post", it:"Per posta", en:"By post", pt:"Por correio", es:"Por correo", uk:"Поштою" },
        detail: { fr:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", de:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", it:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", en:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", pt:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", es:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona", uk:"Divisione delle contribuzioni · Viale S. Franscini 6 · 6501 Bellinzona" },
      },
    ],
    prolongation: { fr:"Proroga su richiesta scritta — https://www4.ti.ch/dfe/dc/sitax", de:"Fristverlängerung auf Antrag — https://www4.ti.ch/dfe/dc/sitax", it:"Proroga su richiesta scritta o tramite SiTax. Gratuita fino al 30 giugno.", en:"Extension on written request or via SiTax. Free until 30 June.", pt:"Prorrogação mediante pedido. Gratuita até 30 de junho.", es:"Prórroga previa solicitud. Gratuita hasta el 30 de junio.", uk:"Продовження за запитом. Безкоштовно до 30 червня." },
  },

  ZH: {
    nom:       { fr:"Canton de Zurich", de:"Kanton Zürich", it:"Canton Zurigo", en:"Canton of Zurich", pt:"Cantão de Zurique", es:"Cantón de Zúrich", uk:"Кантон Цюрих" },
    delai:     { fr:"31 mars 2026", de:"31. März 2026", it:"31 marzo 2026", en:"31 March 2026", pt:"31 de março de 2026", es:"31 de marzo de 2026", uk:"31 березня 2026" },
    methodes: [
      {
        icon: "💻",
        label: { fr:"En ligne — ZHtax", de:"Online — ZHtax", it:"Online — ZHtax", en:"Online — ZHtax", pt:"Online — ZHtax", es:"Online — ZHtax", uk:"Онлайн — ZHtax" },
        detail: { fr:"https://www.steueramt.zh.ch → ZHtax · Elektronische Einreichung", de:"https://www.steueramt.zh.ch → ZHtax · Elektronische Einreichung", it:"https://www.steueramt.zh.ch → ZHtax", en:"https://www.steueramt.zh.ch → ZHtax · Electronic submission", pt:"https://www.steueramt.zh.ch → ZHtax", es:"https://www.steueramt.zh.ch → ZHtax", uk:"https://www.steueramt.zh.ch → ZHtax" },
        recommended: true,
      },
      {
        icon: "📮",
        label: { fr:"Voie postale", de:"Per Post", it:"Per posta", en:"By post", pt:"Por correio", es:"Por correo", uk:"Поштою" },
        detail: { fr:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", de:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", it:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", en:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", pt:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", es:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich", uk:"Kantonales Steueramt Zürich · Bändliweg 21 · 8090 Zürich" },
      },
    ],
    prolongation: { fr:"Prolongation de 3 mois automatique sur demande en ligne.", de:"3-monatige Verlängerung automatisch auf Online-Antrag.", it:"Proroga di 3 mesi automatica su richiesta online.", en:"3-month extension automatic on online request.", pt:"Prorrogação de 3 meses automática a pedido online.", es:"Prórroga de 3 meses automática a petición online.", uk:"Продовження на 3 місяці автоматично за онлайн-запитом." },
  },
};

const LABELS = {
  title:      { fr:"Comment soumettre votre déclaration", de:"Wie Sie Ihre Steuererklärung einreichen", it:"Come presentare la vostra dichiarazione", en:"How to submit your tax return", pt:"Como submeter a sua declaração", es:"Cómo presentar su declaración", uk:"Як подати вашу декларацію" },
  deadline:   { fr:"⏰ Délai", de:"⏰ Frist", it:"⏰ Scadenza", en:"⏰ Deadline", pt:"⏰ Prazo", es:"⏰ Plazo", uk:"⏰ Термін" },
  recommended:{ fr:"Recommandé", de:"Empfohlen", it:"Consigliato", en:"Recommended", pt:"Recomendado", es:"Recomendado", uk:"Рекомендовано" },
  extension:  { fr:"Prolongation de délai", de:"Fristverlängerung", it:"Proroga dei termini", en:"Deadline extension", pt:"Prorrogação de prazo", es:"Prórroga de plazo", uk:"Продовження терміну" },
  no_data:    { fr:"🛡️ Aucune donnée fiscale conservée sur nos serveurs", de:"🛡️ Keine Steuerdaten auf unseren Servern gespeichert", it:"🛡️ Nessun dato fiscale conservato sui nostri server", en:"🛡️ No tax data retained on our servers", pt:"🛡️ Nenhum dado fiscal conservado nos nossos servidores", es:"🛡️ Ningún dato fiscal conservado en nuestros servidores", uk:"🛡️ Жодні податкові дані не зберігаються на наших серверах" },
  no_data2:   { fr:"Vos documents sont analysés en mémoire et immédiatement effacés. Aucune information financière n'est stockée sur nos serveurs suisses Infomaniak.", de:"Ihre Dokumente werden im Arbeitsspeicher analysiert und sofort gelöscht. Keine Finanzdaten auf unseren Schweizer Servern (Infomaniak).", it:"I vostri documenti vengono analizzati in memoria e immediatamente cancellati. Nessuna informazione finanziaria sui nostri server svizzeri Infomaniak.", en:"Your documents are analysed in memory and immediately deleted. No financial information is stored on our Swiss servers (Infomaniak).", pt:"Os seus documentos são analisados em memória e imediatamente apagados. Nenhuma informação financeira nos nossos servidores suíços Infomaniak.", es:"Sus documentos se analizan en memoria y se borran inmediatamente. Ninguna información financiera en nuestros servidores suizos Infomaniak.", uk:"Ваші документи аналізуються в пам'яті та одразу видаляються. Жодна фінансова інформація не зберігається на наших швейцарських серверах Infomaniak." },
};

function L(obj, lang) { return obj?.[lang] || obj?.fr || ""; }

export function DepotDeclaration({ canton = "JU", lang = "fr" }) {
  const cfg = CANTONS[canton] || CANTONS.JU;

  return (
    <div style={{ marginTop: 24 }}>

      {/* Titre */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: S.surface, borderRadius: "12px 12px 0 0",
        borderBottom: `1px solid ${S.border}`,
        border: `1px solid ${S.border}`,
      }}>
        <span style={{ fontSize: 18 }}>📬</span>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, color: S.cream }}>
          {L(LABELS.title, lang)} — {L(cfg.nom, lang)}
        </span>
      </div>

      <div style={{
        border: `1px solid ${S.border}`, borderTop: "none",
        borderRadius: "0 0 12px 12px", overflow: "hidden",
      }}>

        {/* Délai */}
        <div style={{
          padding: "10px 16px",
          background: "rgba(248,113,113,0.06)",
          borderBottom: `1px solid ${S.border}`,
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#F87171", fontFamily: "'Outfit',sans-serif" }}>
            {L(LABELS.deadline, lang)} :
          </span>
          <span style={{ fontSize: 12, color: S.cream, fontFamily: "'Outfit',sans-serif" }}>
            {L(cfg.delai, lang)}
          </span>
        </div>

        {/* Méthodes */}
        {cfg.methodes.map((m, i) => (
          <div key={i} style={{
            padding: "12px 16px",
            background: i % 2 === 0 ? S.card : S.surface,
            borderBottom: `1px solid ${S.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.cream, fontFamily: "'Outfit',sans-serif" }}>
                    {L(m.label, lang)}
                  </span>
                  {m.recommended && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: S.green,
                      background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                      borderRadius: 99, padding: "1px 7px", fontFamily: "'Outfit',sans-serif",
                    }}>
                      ★ {L(LABELS.recommended, lang)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: S.textDim, fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>
                  {L(m.detail, lang)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Prolongation */}
        <div style={{ padding: "12px 16px", background: "rgba(201,168,76,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.gold, fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>
            ⏱ {L(LABELS.extension, lang)}
          </div>
          <div style={{ fontSize: 11, color: S.textDim, fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>
            {L(cfg.prolongation, lang)}
          </div>
        </div>
      </div>

      {/* Badge données — AUCUNE DONNÉE FISCALE CONSERVÉE */}
      <div style={{
        marginTop: 12, padding: "14px 16px", borderRadius: 12,
        background: "rgba(52,211,153,0.04)",
        border: "1px solid rgba(52,211,153,0.15)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: S.green, fontFamily: "'Outfit',sans-serif", marginBottom: 5 }}>
          {L(LABELS.no_data, lang)}
        </div>
        <div style={{ fontSize: 11, color: S.textDim, fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>
          {L(LABELS.no_data2, lang)}
        </div>
      </div>
    </div>
  );
}
