// ═══════════════════════════════════════════════════════════════════════
//  tAIx — WOW UX Effects
//  • Compteur animé (tax total)
//  • Confetti celebration
//  • Watermark drapeau cantonal
//  • Fade-in staggered sections
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";

// ── 1. COMPTEUR ANIMÉ ────────────────────────────────────────────────
// Compte de 0 → target avec easing, duration ms
export function AnimatedAmount({ target = 0, duration = 1800, prefix = "CHF ", decimals = 0, color }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const from = 0;
    const to = target;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  const formatted = display.toLocaleString("fr-CH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span style={{ color, fontVariantNumeric: "tabular-nums" }}>
      {prefix}{formatted}
    </span>
  );
}

// ── 2. CONFETTI ───────────────────────────────────────────────────────
// Lance une pluie de confetti pendant 3s au chargement de Result
function randomBetween(a, b) { return a + Math.random() * (b - a); }

export function Confetti({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#C9A84C","#34D399","#60A5FA","#F87171","#A78BFA","#FBBF24"];
    const COUNT  = 80;

    particles.current = Array.from({ length: COUNT }, () => ({
      x:  randomBetween(0, canvas.width),
      y:  randomBetween(-200, -10),
      vx: randomBetween(-2, 2),
      vy: randomBetween(2, 6),
      angle: randomBetween(0, 360),
      va:    randomBetween(-3, 3),
      w:  randomBetween(8, 16),
      h:  randomBetween(4, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    const endTime = Date.now() + 3000;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const remaining = endTime - Date.now();
      const fade = Math.min(1, remaining / 800);

      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;  // gravity
        p.angle += p.va;

        ctx.save();
        ctx.globalAlpha = fade * 0.85;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });

      if (remaining > 0) rafRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 9999,
      }}
    />
  );
}

// ── 3. WATERMARK CANTONAL ─────────────────────────────────────────────
// Affiche un SVG très léger du blason/drapeau cantonal en fond
const CANTON_WATERMARKS = {
  JU: () => (
    // Jura : bandes horizontales rouges et blanches + crosse
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      {/* 3 bandes horizontales */}
      <rect x="0" y="0"   width="100" height="46" fill="#C8102E"/>
      <rect x="0" y="46"  width="100" height="48" fill="#ffffff"/>
      <rect x="0" y="94"  width="100" height="46" fill="#C8102E"/>
      {/* Crosse épiscopale stylisée */}
      <path d="M50 110 L50 60 Q50 40 40 38 Q30 36 30 46 Q30 56 40 54 Q46 53 50 60"
            fill="none" stroke="#C8102E" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  NE: () => (
    // Neuchâtel : vert et blanc + 3 chevrons
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="60" fill="#009B55"/>
      <rect x="0" y="60" width="100" height="60" fill="#ffffff"/>
      {/* 3 chevrons */}
      {[20, 50, 80].map((y,i) => (
        <path key={i} d={`M20 ${y} L50 ${y-18} L80 ${y}`}
              fill="none" stroke="#C8102E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      ))}
    </svg>
  ),
  TI: () => (
    // Tessin : bandes bleues et rouges
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="0" y={i*20} width="100" height="20"
              fill={i%2===0 ? "#003F87" : "#C8102E"}/>
      ))}
    </svg>
  ),
  ZH: () => (
    // Zurich : bleu et blanc diagonale
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="60" fill="#003F87"/>
      <rect x="0" y="60" width="100" height="60" fill="#ffffff"/>
      <path d="M0 60 L100 0 L100 60 Z" fill="rgba(255,255,255,0.3)"/>
    </svg>
  ),
  BE: () => (
    // Berne : noir et rouge
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="60" fill="#000000"/>
      <rect x="0" y="60" width="100" height="60" fill="#C8102E"/>
      {/* Ours stylisé */}
      <circle cx="50" cy="50" r="18" fill="rgba(200,16,46,0.7)"/>
    </svg>
  ),
  GE: () => (
    // Genève : moitié noir + aigle + clé
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="50" height="120" fill="#F5C518"/>
      <rect x="50" y="0" width="50" height="120" fill="#C8102E"/>
    </svg>
  ),
  VS: () => (
    // Valais : étoiles blanches sur fond rouge + blanc
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="60" fill="#C8102E"/>
      <rect x="0" y="60" width="100" height="60" fill="#ffffff"/>
      {[20,40,60,80,50,30,70].map((x,i) => (
        <polygon key={i}
          points={`${x},${10+i*2} ${x+5},${22+i*2} ${x-5},${22+i*2}`}
          fill={i<4 ? "#ffffff" : "#C8102E"}/>
      ))}
    </svg>
  ),
};
const CANTON_FALLBACK = () => (
  // Drapeau suisse générique
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#C8102E"/>
    <rect x="42" y="18" width="16" height="64" fill="#fff"/>
    <rect x="18" y="42" width="64" height="16" fill="#fff"/>
  </svg>
);

export function CantonWatermark({ canton = "JU" }) {
  const SVG = CANTON_WATERMARKS[canton] || CANTON_FALLBACK;
  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: 280, height: 320,
      opacity: 0.028,
      pointerEvents: "none",
      filter: "blur(1px)",
      zIndex: 0,
    }}>
      <SVG />
    </div>
  );
}

// ── 4. FADE-IN STAGGER ────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── 5. BADGE ÉCONOMIE FISCALE ─────────────────────────────────────────
// Affiche l'économie réalisée vs fiduciaire, animée
export function SavingsBadge({ lang = "fr", isB2B = false }) {
  if (isB2B) return null;  // Ne jamais afficher face à une fiduciaire
  const [show, setShow] = useState(false);

  const labels = {
    fr: { saved: "Vous économisez", vs: "vs fiduciaire", amount: "CHF 155" },
    de: { saved: "Sie sparen", vs: "vs Treuhänder", amount: "CHF 155" },
    it: { saved: "Risparmiate", vs: "vs fiduciario", amount: "CHF 155" },
    pt: { saved: "Poupa", vs: "vs fiduciário", amount: "CHF 155" },
    es: { saved: "Ahorra", vs: "vs fiduciario", amount: "CHF 155" },
    en: { saved: "You save", vs: "vs fiduciary", amount: "CHF 155" },
    uk: { saved: "Ви економите", vs: "vs фідуціар", amount: "CHF 155" },
  };
  const L = labels[lang] || labels.fr;

  useEffect(() => { const t = setTimeout(() => setShow(true), 1200); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 99,
      background: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.25)",
      opacity: show ? 1 : 0,
      transform: show ? "scale(1)" : "scale(0.85)",
      transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      marginTop: 10,
    }}>
      <span style={{ fontSize: 16 }}>💚</span>
      <span style={{ fontSize: 11, color: "#34D399", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>
        {L.saved} ~{L.amount} {L.vs}
      </span>
    </div>
  );
}
