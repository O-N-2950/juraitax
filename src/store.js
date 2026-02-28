import { create } from "zustand";

// Statuts de source pour l'audit trail
export const SOURCE = {
  AI: "ai",           // Extrait automatiquement par l'IA
  USER: "user",       // Modifié manuellement par le client
  MANUAL: "manual",   // Saisi manuellement (aucun document)
  IMPORTED: "imported", // Importé depuis DI précédente (identité seulement)
};

export const useStore = create((set, get) => ({
  // Mode d'accès
  mode: "b2c", // "b2c" | "b2b"
  b2bUser: null, // { email, firm, plan }
  clientDossier: null, // pour B2B: { nom, prenom, ... }

  // Écran actuel
  screen: "welcome", // welcome | courrier | form | loading | paywall | result

  // Section du formulaire
  section: 0,

  // Données du formulaire avec audit trail
  // Structure: { valeur, source, modifiedAt, modifiedBy }
  fields: {},

  // Données calculées
  calcResult: null,

  // Compteur clients pour pricing lancement
  clientCount: 47, // simulation — en prod viendrait de l'API

  // Actions
  setScreen: (screen) => set({ screen }),
  setSection: (s) => set({ section: s }),
  setMode: (mode, user) => set({ mode, b2bUser: user || null }),

  // Setter avec audit trail
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
  },

  // Import depuis DI précédente — IDENTITÉ SEULEMENT
  importFromDI: (extracted) => {
    const identiteKeys = [
      "prenom", "nom", "naissance", "commune", "adresse",
      "no_contribuable", "etat_civil", "confession", "enfants",
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
            note: "Importé depuis DI précédente — identité uniquement, chiffres recalculés",
          };
        }
      }
      return { fields: newFields };
    });
  },

  // Import depuis attestation — chiffres recalculés depuis source primaire
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
  },

  // Getter simple
  get: (key) => get().fields[key]?.value ?? null,
  getField: (key) => get().fields[key] ?? null,

  // Toutes les valeurs brutes
  getAll: () => {
    const fields = get().fields;
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.value]));
  },

  setCalcResult: (result) => set({ calcResult: result }),

  reset: () => set({
    screen: "welcome", section: 0, fields: {}, calcResult: null,
  }),
}));
