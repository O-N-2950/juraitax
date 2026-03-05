// ═══════════════════════════════════════════════════════════════════════
//  tAIx — PixouChat.jsx
//  Chatbot Pixou — expert fiscal interactif
//  Adapté de WiniChatbot (WIN WIN v2) — PEP's Swiss SA
//  Mars 2026
// ═══════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react";

// ── Humeurs de Pixou — vidéos selon contexte ─────────────────────────
const PIXOU_MOODS = {
  salue:     "/pixou-welcome.mp4",    // Accueil, bonjour
  cherche:   "/pixou-search.mp4",     // Document manquant, recherche
  calcule:   "/pixou-loading.mp4",    // Réflexion, calcul
  question1: "/pixou-question1.png",  // Pixou pose une question (clin d'œil)
  question2: "/pixou-question2.png",  // Pixou réfléchit sérieusement
  static:    "/pixou.png",            // Neutre (image fixe)
  error:     "/pixou-error.png",       // Erreur, bug, problème technique
};

// Alterne entre question1 et question2 pour varier
let _questionToggle = false;
function detectMoodPixou(text) {
  const l = (text || "").toLowerCase();
  if (/bonjour|bienvenu|salut|hello|hoi|ciao|olá/i.test(l)) return "salue";
  if (/document|manqu|besoin|relevé|attestation|facture|cherch/i.test(l)) return "cherche";
  if (/calcul|analys|optimis|vérifie|compar/i.test(l)) return "calcule";
  if (/erreur|error|bug|problème|souci|impossible|échec|oups/i.test(l)) return "error";
  if (/\?|comment|pourquoi|quand|où|avez-vous|est-ce|avez|possédez|percevez|avez-vous/i.test(l)) {
    _questionToggle = !_questionToggle;
    return _questionToggle ? "question1" : "question2";
  }
  return "static";
}

// ── Rendu markdown simple ─────────────────────────────────────────────
function renderMarkdown(text) {
  return (text || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^[-•]\s+/gm, "<br/>• ")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// ── Avatar Pixou animé ────────────────────────────────────────────────
function PixouAvatar({ mood = "static", size = 48 }) {
  const src = PIXOU_MOODS[mood];
  const isVideo = src.endsWith(".mp4");
  return isVideo ? (
    <video src={src} autoPlay loop muted playsInline
           style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, borderRadius: 8 }} />
  ) : (
    <img src={src} alt="Pixou"
         style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />
  );
}

// ── Bulles de frappe ──────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
      <div style={{ background: "rgba(37,99,235,0.08)", borderRadius: "18px 18px 18px 4px",
                    padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 150, 300].map(d => (
          <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#5A7A99",
                                animation: "bounce 1s infinite", animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ── Composant message ─────────────────────────────────────────────────
function Message({ msg, onAction }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: 12, gap: 8, alignItems: "flex-end" }}>

      {/* Avatar Pixou — messages assistant */}
      {!isUser && (
        <PixouAvatar mood={msg.mood || "static"} size={36} />
      )}

      <div style={{ maxWidth: "78%" }}>
        {/* Label Pixou */}
        {!isUser && (
          <div style={{ fontSize: 10, color: "#60A5FA", fontFamily: "'Outfit',sans-serif",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                        marginBottom: 4 }}>
            Pixou — Expert fiscal tAIx
          </div>
        )}

        {/* Bulle */}
        <div style={{
          padding: "12px 16px", fontSize: 14, lineHeight: 1.6,
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #1A3A5C, #2563EB)"
            : "rgba(26,42,74,0.9)",
          color: "#E8EDF2",
          border: isUser ? "none" : "1px solid rgba(42,58,88,0.8)",
          fontFamily: "'Outfit',sans-serif",
        }}>
          {isUser ? msg.content : (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
          )}
        </div>

        {/* Actions rapides */}
        {msg.actions && msg.actions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {msg.actions.map((action, i) => (
              <button key={i} onClick={() => onAction && onAction(action, msg.id)}
                      disabled={action.executed}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        fontFamily: "'Outfit',sans-serif", cursor: action.executed ? "default" : "pointer",
                        border: "1px solid rgba(37,99,235,0.4)",
                        background: action.executed ? "rgba(42,58,88,0.3)" : "rgba(37,99,235,0.15)",
                        color: action.executed ? "#5A7A99" : "#60A5FA",
                        transition: "all 0.2s",
                      }}>
                {action.executed ? "✓ Fait" : action.label}
              </button>
            ))}
          </div>
        )}

        {/* Horodatage */}
        <div style={{ fontSize: 10, color: "#3A4A6A", fontFamily: "'Outfit',sans-serif",
                      marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {new Date(msg.timestamp).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL — PixouChat
// ══════════════════════════════════════════════════════════════════════
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export function PixouChat({ donneesClient = {}, lang = "fr", isOpen: isOpenProp, onClose }) {
  const [isOpen, setIsOpen]       = useState(isOpenProp || false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [currentMood, setMood]    = useState("salue");
  const [showBubble, setBubble]   = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Labels multilingues
  const T = {
    fr: { placeholder: "Posez votre question à Pixou…", send: "Envoyer",
          bubble: "Pixou veille sur votre déclaration 🦆",
          welcome: (nom) => `Bonjour${nom ? ` ${nom}` : ""} ! Je suis **Pixou**, votre expert fiscal tAIx. J'ai analysé votre dossier et je suis là pour optimiser chaque franc de votre déclaration. Par quoi on commence ?` },
    de: { placeholder: "Stellen Sie Pixou eine Frage…", send: "Senden",
          bubble: "Pixou kümmert sich um Ihre Steuern 🦆",
          welcome: (nom) => `Hallo${nom ? ` ${nom}` : ""}! Ich bin **Pixou**, Ihr Steuerexperte bei tAIx. Womit kann ich Ihnen helfen?` },
    en: { placeholder: "Ask Pixou a question…", send: "Send",
          bubble: "Pixou is watching over your tax return 🦆",
          welcome: (nom) => `Hello${nom ? ` ${nom}` : ""}! I'm **Pixou**, your tax expert at tAIx. I've reviewed your file — how can I help you?` },
    pt: { placeholder: "Faça uma pergunta ao Pixou…", send: "Enviar",
          bubble: "Pixou cuida da sua declaração 🦆",
          welcome: (nom) => `Olá${nom ? ` ${nom}` : ""}! Sou o **Pixou**, o seu especialista fiscal tAIx. Como posso ajudá-lo?` },
    es: { placeholder: "Haga una pregunta a Pixou…", send: "Enviar",
          bubble: "Pixou cuida de su declaración 🦆",
          welcome: (nom) => `¡Hola${nom ? ` ${nom}` : ""}! Soy **Pixou**, su experto fiscal de tAIx. ¿En qué le puedo ayudar?` },
    it: { placeholder: "Poni una domanda a Pixou…", send: "Invia",
          bubble: "Pixou veglia sulla sua dichiarazione 🦆",
          welcome: (nom) => `Ciao${nom ? ` ${nom}` : ""}! Sono **Pixou**, il suo esperto fiscale tAIx. Come posso aiutarla?` },
  };
  const t = T[lang] || T.fr;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);

  // Message de bienvenue à l'ouverture
  function handleOpen() {
    setIsOpen(true); setBubble(false);
    if (messages.length === 0) {
      const nom = donneesClient.prenom || donneesClient.nom || "";
      const welcome = t.welcome(nom);
      const mood = "salue";
      setMood(mood);
      setMessages([{
        id: "welcome", role: "assistant", content: welcome,
        mood, timestamp: new Date(),
        actions: [
          { label: "🔍 Analyser mon dossier", id: "analyse" },
          { label: "💰 Maximiser mes déductions", id: "optimise" },
          { label: "❓ Poser une question", id: "question" },
        ],
      }]);
    }
  }

  // Appel API Claude avec contexte fiscal complet
  async function callPixou(userMessage, history) {
    const canton = (donneesClient.canton || "JU").toUpperCase();
    const prenom = donneesClient.prenom || "";
    const age = donneesClient.naissance
      ? 2025 - parseInt((donneesClient.naissance || "").split(/[-/]/)[0])
      : null;
    const estRetraite = (donneesClient.revenus_avs || 0) > 0 && !(donneesClient.revenus_salaire > 0);

    const systemPrompt = `Tu es Pixou, l'expert fiscal IA de tAIx — application suisse de déclaration d'impôts.
Tu parles à ${prenom || "un contribuable suisse"}${age ? `, ${age} ans` : ""}${estRetraite ? ", retraité(e)" : ""}, canton ${canton}.

DONNÉES DU DOSSIER :
${JSON.stringify(donneesClient, null, 2)}

RÈGLES ABSOLUES :
1. Tu travailles TOUJOURS dans l'intérêt du client face au fisc
2. Maximise chaque déduction légale — CHF 300 dons minimum dans toute DI
3. Forfait assurances ${estRetraite ? "8'380 CHF (marié sans pilier)" : "selon situation"} — toujours le maximum
4. Pose des questions intelligentes UNIQUEMENT selon le profil
5. ${estRetraite ? "JAMAIS de question sur pilier 3a actif, trajet, télétravail" : ""}
6. Si document manquant → explique EXACTEMENT où le trouver
7. Réponds en ${lang === "fr" ? "français" : lang === "de" ? "allemand" : lang === "it" ? "italien" : lang === "pt" ? "portugais" : lang === "es" ? "espagnol" : "anglais"}
8. Sois chaleureux, précis, concis — max 3-4 phrases par réponse
9. Chiffre toujours l'impact en CHF quand possible`;

    const conversationHistory = history
      .filter(m => m.id !== "welcome")
      .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    conversationHistory.push({ role: "user", content: userMessage });

    try {
      const res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: systemPrompt,
          messages: conversationHistory,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.content?.[0]?.text || getFallback(userMessage, lang);
    } catch (err) {
      console.error("PixouChat error:", err);
      return getFallback(userMessage, lang);
    }
  }

  function getFallback(input, lang) {
    const l = (input || "").toLowerCase();
    if (/don|libéral/i.test(l)) return "Sans justificatif, le fisc accepte CHF 300 de dons. Je l'applique automatiquement dans votre déclaration.";
    if (/hypothèque|intérêt|raiffeisen|banque/i.test(l)) return "Pour déduire vos intérêts hypothécaires, j'ai besoin de votre relevé annuel. Cherchez 'Documents fiscaux' dans votre e-banking.";
    if (/assurance|maladie|lamal|kpt|css/i.test(l)) return "Le forfait assurances est appliqué automatiquement au maximum légal selon votre situation familiale.";
    if (/bonjour|salut|hello/i.test(l)) return "Bonjour ! Je suis Pixou, votre expert fiscal. Que puis-je faire pour vous ?";
    return "Bonne question ! Pour vous donner une réponse précise, pouvez-vous préciser votre situation ?";
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setMood("calcule");

    let response, mood;
    try {
      response = await callPixou(msg, [...messages, userMsg]);
      mood = detectMoodPixou(response);
    } catch (e) {
      response = getFallback(msg, lang);
      mood = "error";
    }
    setMood(mood);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      mood,
      timestamp: new Date(),
    }]);
    setIsTyping(false);
  }

  function handleAction(action) {
    const actionMessages = {
      analyse: "Peux-tu analyser mon dossier et me dire ce qui manque ?",
      optimise: "Comment maximiser mes déductions cette année ?",
      question: null, // Focus input
    };
    const msg = actionMessages[action.id];
    if (msg) sendMessage(msg);
    else inputRef.current?.focus();
  }

  // ── FERMÉ — bouton flottant ───────────────────────────────────────
  if (!isOpen) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 20, zIndex: 1000,
                    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>

        {/* Bulle proactive */}
        {showBubble && (
          <div onClick={handleOpen} style={{
            background: "rgba(13,20,40,0.97)", border: "1px solid rgba(37,99,235,0.4)",
            borderRadius: "16px 16px 4px 16px", padding: "12px 16px", maxWidth: 240,
            cursor: "pointer", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontSize: 13, color: "#E8EDF2", fontFamily: "'Outfit',sans-serif",
                          lineHeight: 1.5 }}>
              {t.bubble}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setBubble(false); }}
                    style={{ position: "absolute", top: 8, right: 8, background: "none",
                             border: "none", color: "#5A7A99", cursor: "pointer", fontSize: 14 }}>
              ×
            </button>
          </div>
        )}

        {/* Bouton Pixou */}
        <button onClick={handleOpen} style={{
          width: 64, height: 64, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #1A3A5C, #2563EB)",
          cursor: "pointer", padding: 4, overflow: "hidden",
          boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
          transition: "transform 0.2s",
        }}
          onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}>
          <img src="/pixou.png" alt="Pixou"
               style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </button>
      </div>
    );
  }

  // ── OUVERT — fenêtre de chat ──────────────────────────────────────
  const isMobile = typeof window !== "undefined" && window.innerWidth < 500;

  return (
    <div style={{
      position: "fixed", zIndex: 1000,
      ...(isMobile
        ? { top: 0, left: 0, right: 0, bottom: 0 }
        : { bottom: 24, right: 20, width: 380, height: 560 }),
      display: "flex", flexDirection: "column",
      borderRadius: isMobile ? 0 : 20,
      overflow: "hidden",
      background: "rgba(8,12,24,0.97)",
      border: "1px solid rgba(37,99,235,0.3)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    }}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        background: "linear-gradient(135deg, rgba(26,42,74,0.99), rgba(37,99,235,0.2))",
        borderBottom: "1px solid rgba(37,99,235,0.2)",
      }}>
        <PixouAvatar mood={currentMood} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF2",
                        fontFamily: "'Outfit',sans-serif" }}>
            Pixou — Expert fiscal tAIx
          </div>
          <div style={{ fontSize: 11, color: "#5A7A99", fontFamily: "'Outfit',sans-serif" }}>
            {isTyping ? "⏳ Pixou réfléchit…" : "🟢 En ligne — répond en quelques secondes"}
          </div>
        </div>
        <button onClick={() => { setIsOpen(false); onClose && onClose(); }}
                style={{ background: "none", border: "none", color: "#5A7A99",
                         cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>
          ×
        </button>
      </div>

      {/* ── Messages ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px",
                    display: "flex", flexDirection: "column" }}>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>

        {messages.map(msg => (
          <Message key={msg.id} msg={msg} onAction={handleAction} />
        ))}

        {isTyping && <TypingBubble />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid rgba(37,99,235,0.15)",
        background: "rgba(13,20,40,0.9)",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={t.placeholder}
          disabled={isTyping}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 20, fontSize: 13,
            fontFamily: "'Outfit',sans-serif",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(42,58,88,0.8)",
            color: "#E8EDF2", outline: "none",
          }}
        />
        <button onClick={() => sendMessage()} disabled={isTyping || !input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: "50%", border: "none",
                  background: input.trim() && !isTyping
                    ? "linear-gradient(135deg, #1A3A5C, #2563EB)"
                    : "rgba(42,58,88,0.5)",
                  color: "white", cursor: input.trim() && !isTyping ? "pointer" : "default",
                  fontSize: 16, display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all 0.2s", flexShrink: 0,
                }}>
          {isTyping ? "⏳" : "→"}
        </button>
      </div>
    </div>
  );
}
