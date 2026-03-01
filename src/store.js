import { create } from "zustand";

export const SOURCE = {
  AI: "ai",
  USER: "user",
  MANUAL: "manual",
  IMPORTED: "imported",
};

// ── Clé localStorage ──────────────────────────────────────────────────
const LS_KEY = "taix_dossier_v1";

// ── Sauvegarde automatique (seulement les données utiles) ─────────────
function saveToLS(state) {
  try {
    const toSave = {
      fields:       state.fields,
      lang:         state.lang,
      canton:       state.canton,
      mode:         state.mode,
      b2bUser:      state.b2bUser,
      clientDossier: state.clientDossier,
      subscriber:   state.subscriber,
      savedAt:      new Date().toISOString(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {}
}

// ── Restauration au démarrage ──────────────────────────────────────────
function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    // Expiration : 12 mois max
    if (data.savedAt) {
      const age = Date.now() - new Date(data.savedAt).getTime();
      if (age > 1000 * 60 * 60 * 24 * 365) { localStorage.removeItem(LS_KEY); return {}; }
    }
    return data;
  } catch { return {}; }
}

const saved = loadFromLS();

export const useStore = create((set, get) => ({
  // ── Mode & Auth ──────────────────────────────────────────
  mode:          saved.mode         || "b2c",
  b2bUser:       saved.b2bUser      || null,
  clientDossier: saved.clientDossier|| null,

  // ── Navigation ───────────────────────────────────────────
  screen: "welcome",   // on repart toujours de l'accueil
  section: 0,

  // ── 🌍 Langue & Canton ───────────────────────────────────
  lang:        saved.lang   || "fr",
  canton:      saved.canton || "JU",
  cantonConfig: null,

  // ── Formulaire ───────────────────────────────────────────
  fields:      saved.fields || {},
  calcResult:  null,
  clientCount: 47,

  // ── Abonnement ───────────────────────────────────────────
  subscriber:  saved.subscriber || null,

  // ── Helper interne : set + sauvegarde auto ─────────────────────────
  _set: (updater) => {
    set(updater);
    // Sauvegarde différée (évite de spammer localStorage à chaque keystroke)
    setTimeout(() => saveToLS(get()), 300);
  },

  // ── Actions ──────────────────────────────────────────────
  setScreen: (screen) => set({ screen }),
  setSection: (s) => set({ section: s }),
  setMode: (mode, user) => { set({ mode, b2bUser: user || null }); setTimeout(() => saveToLS(get()), 300); },
  setLang: (lang) => { set({ lang }); setTimeout(() => saveToLS(get()), 300); },
  setCantonConfig: (cfg) => { set({ canton: cfg.canton, cantonConfig: cfg, lang: cfg.lang }); setTimeout(() => saveToLS(get()), 300); },

  setField: (key, value, source = SOURCE.MANUAL) => {
    set((state) => ({
      fields: {
        ...state.fields,
        [key]: {
          value,
          source,
          modifiedAt: new Date().toISOString(),
          modifiedBy: source === SOURCE.USER ? "client" : "ai",
        },
      },
    }));
    setTimeout(() => saveToLS(get()), 300);
  },

  importFromDI: (extracted) => {
    const identiteKeys = [
      "prenom","nom","naissance","commune","adresse",
      "no_contribuable","etat_civil","confession","enfants",
    ];
    set((state) => {
      const newFields = { ...state.fields };
      for (const key of identiteKeys) {
        if (extracted[key] !== undefined) {
          newFields[key] = {
            value: extracted[key],
            source: SOURCE.IMPORTED,
            modifiedAt: new Date().toISOString(),
            modifiedBy: "ai",
            note: "Identité uniquement — chiffres recalculés depuis sources 2025",
          };
        }
      }
      return { fields: newFields };
    });
    setTimeout(() => saveToLS(get()), 300);
  },

  importFromDoc: (key, value, docName) => {
    set((state) => ({
      fields: {
        ...state.fields,
        [key]: {
          value,
          source: SOURCE.AI,
          modifiedAt: new Date().toISOString(),
          modifiedBy: "ai",
          docSource: docName || "document uploadé",
        },
      },
    }));
    setTimeout(() => saveToLS(get()), 300);
  },

  get: (key) => get().fields[key]?.value ?? null,
  getField: (key) => get().fields[key] ?? null,
  getAll: () => {
    const fields = get().fields;
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.value]));
  },

  setCalcResult: (result) => set({ calcResult: result }),

  // ── Abonnement CHF 49/an ─────────────────────────────────
  setSubscriber: (sub) => { set({ subscriber: sub }); setTimeout(() => saveToLS(get()), 300); },

  saveSubscriberProfile: () => {
    const { fields, lang, cantonConfig } = get();
    const identiteKeys = ["prenom","nom","naissance","commune","adresse",
      "no_contribuable","etat_civil","confession","enfants","nb_enfants"];
    const identite = {};
    for (const k of identiteKeys) {
      if (fields[k]?.value) identite[k] = fields[k].value;
    }
    const sub = {
      email: null,
      nom: (fields.prenom?.value || "") + " " + (fields.nom?.value || ""),
      lang,
      canton: cantonConfig?.canton || "JU",
      identite,
      subscribedAt: new Date().toISOString(),
      nextReminderDates: [
        new Date(new Date().getFullYear() + 1, 2, 1).toISOString(),
        new Date(new Date().getFullYear() + 1, 2, 20).toISOString(),
        new Date(new Date().getFullYear() + 1, 3, 5).toISOString(),
      ]
    };
    set({ subscriber: sub });
    setTimeout(() => saveToLS(get()), 300);
    return sub;
  },

  // ── Reset complet (nouveau dossier) ──────────────────────
  reset: () => {
    set({ screen:"welcome", section:0, fields:{}, calcResult:null });
    try { localStorage.removeItem(LS_KEY); } catch {}
  },

  // ── Reset dossier uniquement (garde mode/lang/b2bUser) ───
  resetDossier: () => {
    set({ screen:"checklist", section:0, fields:{}, calcResult:null });
    setTimeout(() => saveToLS(get()), 300);
  },

  // ── Info de reprise ────────────────────────────────────────
  hasSavedDossier: () => {
    const fields = get().fields;
    return Object.keys(fields).length > 0;
  },
  savedAt: () => {
    try { const d = JSON.parse(localStorage.getItem(LS_KEY)||"{}"); return d.savedAt || null; } catch { return null; }
  },
}));
