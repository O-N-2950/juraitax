"""
tAIx Knowledge Scraper
======================
Scrappe et structure la connaissance fiscale pratique suisse :

1. Barèmes cantonaux 2025 (26 cantons) — sites officiels
2. Plafonds et limites de déduction fédéraux 2025 (AFC)
3. Programme diplôme fédéral expert fiscal (XPERT.CH)
4. Programme diplôme fédéral fiduciaire (EXPERTsuisse)
5. Brevet fédéral comptable
6. Techniques d'optimisation fiscale (base interne structurée)
7. Cas pratiques par profil (retraité, salarié, indépendant, famille)

Usage :
  python -m knowledge.scrapers.fiscal_scraper --source all
  python -m knowledge.scrapers.fiscal_scraper --source baremes
  python -m knowledge.scrapers.fiscal_scraper --source diplomes
  python -m knowledge.scrapers.fiscal_scraper --source techniques
"""

import argparse
import asyncio
import json
import logging
import re
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("taix.scraper")

REQUEST_DELAY   = 1.5
MAX_CHUNK_CHARS = 1500
MIN_CHUNK_CHARS = 80
OUTPUT_DIR      = Path("knowledge/data")

# ── Catalogue des sources ──────────────────────────────────────────────────

BAREME_SOURCES = {
    "JU": {
        "name": "Barème fiscal Canton du Jura 2025",
        "url": "https://www.jura.ch/Themes/Fiscalite/Personnes-physiques/Calcul-impots.html",
        "url_loi": "https://rsju.jura.ch/en/viewdocument.html?idn=28021",
        "lang": "fr",
    },
    "NE": {
        "name": "Barème fiscal Canton de Neuchâtel 2025",
        "url": "https://www.ne.ch/autorites/DFF/SFISC/Pages/bareme.aspx",
        "lang": "fr",
    },
    "FR": {
        "name": "Barème fiscal Canton de Fribourg 2025",
        "url": "https://www.fr.ch/scc/impots/personnes-physiques",
        "lang": "fr",
    },
    "VD": {
        "name": "Barème fiscal Canton de Vaud 2025",
        "url": "https://www.vd.ch/themes/etat-droit-finances/impots/personnes-physiques",
        "lang": "fr",
    },
    "GE": {
        "name": "Barème fiscal Canton de Genève 2025",
        "url": "https://www.ge.ch/calculer-impots",
        "lang": "fr",
    },
    "VS": {
        "name": "Barème fiscal Canton du Valais 2025",
        "url": "https://www.vs.ch/web/scc/impot-cantonal-personnes-physiques",
        "lang": "fr",
    },
    "BE": {
        "name": "Steuerbarème Kanton Bern 2025",
        "url": "https://www.fin.be.ch/de/start/themen/steuern/natuerlichepersonen.html",
        "lang": "de",
    },
    "ZH": {
        "name": "Steuerbarème Kanton Zürich 2025",
        "url": "https://www.zh.ch/de/steuern-finanzen/steuern/natuerliche-personen.html",
        "lang": "de",
    },
    "AG": {
        "name": "Steuerbarème Kanton Aargau 2025",
        "url": "https://www.ag.ch/de/verwaltung/dfi/steuern",
        "lang": "de",
    },
    "SO": {
        "name": "Steuerbarème Kanton Solothurn 2025",
        "url": "https://www.so.ch/verwaltung/finanzdepartement/kantonales-steueramt/",
        "lang": "de",
    },
    "BL": {
        "name": "Steuerbarème Kanton Basel-Landschaft 2025",
        "url": "https://www.baselland.ch/politik-und-behorden/direktionen/finanz-und-kirchendirektion/steuerverwaltung",
        "lang": "de",
    },
    "TI": {
        "name": "Barème fiscal Canton du Tessin 2025",
        "url": "https://www4.ti.ch/dfe/dc/dichiarazioni/persone-fisiche/",
        "lang": "it",
    },
}

DIPLOME_SOURCES = {
    "expert_fiscal": {
        "name": "Diplôme fédéral d'expert fiscal — Programme et compétences",
        "url": "https://www.expertsuisse.ch/formation/examens/expert-fiscal/",
        "url_alt": "https://www.xpert.ch/de/pruefungen/steuerexperte/",
        "category": "diplome_expert_fiscal",
    },
    "fiduciaire": {
        "name": "Diplôme fédéral fiduciaire — Programme et compétences",
        "url": "https://www.expertsuisse.ch/formation/examens/fiduciaire/",
        "category": "diplome_fiduciaire",
    },
    "brevet_comptable": {
        "name": "Brevet fédéral de spécialiste en finance et comptabilité",
        "url": "https://www.veb.ch/fr/formation/brevet-federal/",
        "category": "brevet_comptable",
    },
}

# ── Base de connaissances intégrée (ne nécessite pas de scraping) ────────────
# Techniques d'optimisation et cas pratiques — structurés à la main
# basés sur le programme du diplôme fédéral expert fiscal

TECHNIQUES_INTEGREES = [
    # ── DÉDUCTIONS FÉDÉRALES 2025 ──────────────────────────────────────────
    {
        "category": "deductions_federales",
        "source_ref": "AFC 2025 — Déductions LIFD art. 26-33",
        "canton": None,
        "year": 2025,
        "keywords": ["déduction", "fédéral", "LIFD"],
        "text": """DÉDUCTIONS LIFD 2025 — PERSONNES PHYSIQUES

Pilier 3a (art. 82 LPP + OPP3) :
- Salarié avec caisse de pension LPP : max CHF 7'258/an
- Indépendant sans caisse de pension : max CHF 36'288/an (20% revenu AVS)
- Déductible à 100% du revenu imposable
- Limite : versement avant 31.12.2025

Rachat caisse de pension (art. 79b LPP) :
- 100% déductible, aucun plafond légal
- Condition : pas de retrait en capital dans les 3 ans
- Stratégie optimale : rachat l'année de revenus élevés

Primes d'assurance-maladie et vie (art. 33 al. 1 let. g LIFD) :
- Célibataire : déduction forfaitaire CHF 1'800/an
- Couple marié : CHF 3'600/an
- Par enfant à charge : + CHF 700/an
- Déduction effective si primes réelles > forfait

Frais professionnels salariés (art. 26 LIFD) :
- Frais de déplacement : max CHF 3'000/an (TP) ou selon barème km
- Frais de repas : CHF 3'200/an si cantine non disponible
- Autres frais prof : 3% du salaire net, min CHF 2'000, max CHF 4'000
- Frais formation : max CHF 12'900/an (perfectionnement professionnel)

Frais médicaux (art. 33 al. 1 let. h LIFD) :
- Déductibles au-delà de 5% du revenu net
- Inclus : médecin, dentiste, médicaments sur ordonnance, lunettes
- Exclut : esthétique, médecines alternatives non reconnues
- Conseil : regrouper les frais sur une année pour dépasser le seuil""",
    },
    {
        "category": "deductions_retraite",
        "source_ref": "Manuel Expert Fiscal — Fiscalité des personnes en retraite",
        "canton": None,
        "year": 2025,
        "keywords": ["retraité", "AVS", "LPP", "rente", "âge", "senior"],
        "text": """FISCALITÉ DES RETRAITÉS — SPÉCIFICITÉS 2025

Revenus imposables :
- Rente AVS : 100% imposable (art. 22 LIFD)
- Rente LPP/caisse de pension : 100% imposable (art. 22 LIFD)
- Rente d'assurance vie : selon le taux de conversion
- Capital LPP reçu : imposition séparée à taux réduit (1/5 du taux ordinaire)

Déductions spécifiques retraités :
- Frais médicaux : seuil 5% du revenu net — particulièrement important car revenus bas
  Exemple : revenu AVS+LPP CHF 42'000 → seuil = CHF 2'100 → tout au-dessus déductible
- Primes maladie : forfait CHF 3'600 (couple) ou CHF 1'800 (seul)
- Subsides LAMal : à demander impérativement si revenu < seuils cantonaux
- Intérêts dettes : déductibles si dettes documentées

Subsides LAMal — seuils indicatifs (varient par canton) :
- Canton JU : jusqu'à CHF 38'000 revenu imposable (couple)
- Montant subside : CHF 200–500/mois selon situation
- Démarche : formulaire cantonal annuel (délai souvent 31 mars)

Stratégies d'optimisation pour retraités :
1. Regrouper frais médicaux sur une année pour dépasser le seuil 5%
2. Faire des dons à des associations reconnues (déductibles > CHF 100)
3. Vérifier si encore propriétaire : entretien immeuble déductible
4. Vérifier rentes d'assurance vie — taux d'imposition variable selon âge
5. Ne jamais oublier la fortune : comptes, titres, immobilier à déclarer""",
    },
    {
        "category": "deductions_salarie",
        "source_ref": "Manuel Expert Fiscal — Salarié à temps plein et partiel",
        "canton": None,
        "year": 2025,
        "keywords": ["salarié", "salaire", "certificat", "LPP", "transport", "télétravail"],
        "text": """OPTIMISATION FISCALE SALARIÉS 2025

Checklist déductions à ne pas manquer :

TRANSPORT (art. 26 al. 1 let. a LIFD) :
- Transports publics : déduction du coût réel (abonnement TP), max CHF 3'000
- Voiture privée : seulement si TP impossible/inadapté
  Barème : 0.70 CHF/km × jours ouvrés × distance AR
- Vélo / trottinette : frais réels si > 10 km domicile-travail

TÉLÉTRAVAIL (circulaire AFC 2022) :
- 1 jour/semaine : CHF 200/an
- 2 jours/semaine : CHF 400/an
- 3 jours/semaine : CHF 600/an
- 4+ jours/semaine : CHF 800/an
- ATTENTION : télétravail réduit déduction transport proportionnellement

PILIER 3A :
- Verser le maximum annuel avant le 31.12 : CHF 7'258 (2025)
- Ouvrir plusieurs comptes 3a pour flexibilité au moment du retrait
- Retrait capital : imposé séparément à taux réduit (1/5 du taux ordinaire)
- Stratégie : décaler les retraits sur plusieurs années fiscales

FRAIS PROFESSIONNELS EFFECTIFS (si > forfait 3%) :
- Matériel professionnel (ordinateur, téléphone si usage >50% pro)
- Abonnement téléphone/internet (part professionnelle)
- Vêtements professionnels spécifiques
- Repas si déplacement professionnel > 10 km
- Formation continue liée à l'emploi actuel""",
    },
    {
        "category": "deductions_independant",
        "source_ref": "Manuel Expert Fiscal — Indépendants et TNS",
        "canton": None,
        "year": 2025,
        "keywords": ["indépendant", "TNS", "AVS", "bénéfice", "amortissement"],
        "text": """FISCALITÉ INDÉPENDANTS 2025

Base imposable : bénéfice net (revenus - charges d'exploitation)

Charges déductibles (art. 27 LIFD) :
- Loyer bureau ou quote-part domicile (usage pro documenté)
- Matériel, outillage, logiciels
- Frais de véhicule (proportionnels à l'usage professionnel)
- Salaires du personnel
- Cotisations AVS/AI/APG (100% déductibles)
- Primes assurance perte de gain
- Formation et perfectionnement professionnels
- Frais de représentation (documentés, raisonnables)
- Amortissements selon taux fiscaux admis

Pilier 3a renforcé (art. 7 al. 1 OPP3) :
- Sans LPP : max 20% du revenu AVS net, plafond CHF 36'288 (2025)
- Avec LPP : max CHF 7'258 comme salarié
- Impact : réduction directe du revenu imposable ET des cotisations AVS

Cotisations AVS — optimisation :
- Base de calcul : bénéfice net
- Réduire légalement le bénéfice (frais effectifs) = réduire les cotisations AVS
- Attention : réduire trop = lacunes futures dans la rente AVS

Rachat LPP (si affilié à une caisse) :
- 100% déductible, aucun plafond
- Particulièrement intéressant les années de revenus élevés""",
    },
    {
        "category": "bareme_federal",
        "source_ref": "AFC — Taux impôt fédéral direct 2025",
        "canton": None,
        "year": 2025,
        "keywords": ["barème", "taux", "fédéral", "IFD", "tranches"],
        "text": """BARÈME IMPÔT FÉDÉRAL DIRECT (IFD) 2025

PERSONNES SEULES (célibataires, veufs, divorcés) :
- 0 – 17'800 CHF : 0%
- 17'801 – 31'600 CHF : 0.77%
- 31'601 – 41'400 CHF : 0.88%
- 41'401 – 55'200 CHF : 2.64%
- 55'201 – 72'500 CHF : 2.97%
- 72'501 – 78'100 CHF : 5.94%
- 78'101 – 103'600 CHF : 6.60%
- 103'601 – 134'600 CHF : 8.80%
- 134'601 – 176'000 CHF : 11.00%
- > 176'000 CHF : 13.20% (taux max IFD)

COUPLES MARIÉS / PARTENAIRES ENREGISTRÉS :
- 0 – 28'300 CHF : 0%
- 28'301 – 50'900 CHF : 1.00%
(barème majoré — progressivité atténuée pour 2 revenus)
- Taux max : 11.50% sur la part > 895'900 CHF

DÉDUCTION SOCIALE (art. 213 LIFD) :
- Par enfant à charge : CHF 6'700
- Personnes à charge nécessiteuses : CHF 6'700

Note : L'IFD représente environ 10-15% de la charge fiscale totale.
Les impôts cantonaux et communaux représentent 70-80% de la charge totale.""",
    },
    {
        "category": "bareme_cantonal",
        "source_ref": "Barèmes cantonaux 2025 — Cantons romands",
        "canton": None,
        "year": 2025,
        "keywords": ["barème", "canton", "taux", "communal", "multiplicateur"],
        "text": """COMPARATIF TAUX CANTONAUX 2025 — RÉSUMÉ

Charge fiscale totale estimée (IFD + cantonal + communal) pour revenu imposable CHF 80'000, célibataire :

Canton ZG (Zoug) : ~12% — fiscalité la plus douce
Canton SZ (Schwyz) : ~14%
Canton NW (Nidwald) : ~15%
Canton OW (Obwald) : ~15%
Canton UR (Uri) : ~16%

Cantons romands :
- VD (Vaud) : ~28–30%
- GE (Genève) : ~33–35%
- NE (Neuchâtel) : ~31–33%
- FR (Fribourg) : ~27–29%
- VS (Valais) : ~23–25%
- JU (Jura) : ~26–28%

Note : Ces taux sont INDICATIFS. La charge exacte dépend de :
- La commune de domicile (multiplicateur communal)
- La situation familiale
- Les déductions effectives
- La confession (impôt ecclésiastique)

Pour le calcul exact : utiliser le calculateur officiel du canton concerné
JU : https://www.jura.ch/Themes/Fiscalite
VD : https://www.vd.ch/themes/etat-droit-finances/impots
GE : https://www.ge.ch/calculer-impots""",
    },
    {
        "category": "optimisation_avancee",
        "source_ref": "Diplôme fédéral expert fiscal — Module 4 : Optimisation",
        "canton": None,
        "year": 2025,
        "keywords": ["optimisation", "stratégie", "planification", "timing", "retraite"],
        "text": """TECHNIQUES D'OPTIMISATION FISCALE AVANCÉES 2025

TIMING DES REVENUS ET DÉDUCTIONS :
- Année impaire vs paire : étaler les revenus extraordinaires sur 2 ans si possible
- Revenus exceptionnels (bonus, héritage, vente immobilière) : imposition l'année de réception
- Regrouper les dépenses déductibles sur une année pour dépasser les seuils

STRATÉGIE PILIER 3A MULTI-COMPTES :
- Ouvrir 3-5 comptes 3a différents (banques ou assurances)
- Avantage : retrait échelonné sur 5 ans à la retraite
- Économie fiscale sur retrait : CHF 5'000–15'000 selon situation
- Règle : un seul compte retiré par année fiscale

RACHAT CAISSE DE PENSION — TIMING OPTIMAL :
- Effectuer le rachat l'année du revenu le plus élevé
- Interdiction de retrait en capital dans les 3 ans suivants
- Combiner avec versement 3a la même année pour maximiser la déduction
- Simuler l'impact avant décision (coefficient marginal d'imposition)

DÉMÉNAGEMENT INTERCANTONAL :
- Imposition au 31.12 du canton de domicile
- Déménager avant fin d'année si canton cible moins fiscalisé
- Attention : résidence principale effectivement transférée

PROPRIÉTAIRES IMMOBILIERS :
- Entretien vs plus-value : seul l'entretien courant est déductible
- Conserver toutes les factures d'entretien (10 ans)
- Déduction forfaitaire vs effective : choisir la plus avantageuse
  Forfait : 10% (bien < 10 ans) ou 20% (bien > 10 ans) de la valeur locative
  Effectif : frais réels documentés si > forfait

DONS STRATÉGIQUES (art. 33a LIFD) :
- Seuil minimal : CHF 100 par organisation
- Maximum déductible : 20% du revenu net (fédéral)
- Regrouper les dons sur une année pour maximiser l'impact""",
    },
    {
        "category": "cas_pratiques",
        "source_ref": "Diplôme fédéral fiduciaire — Cas pratiques types",
        "canton": None,
        "year": 2025,
        "keywords": ["cas pratique", "exemple", "calcul", "déclaration", "famille"],
        "text": """CAS PRATIQUES TYPES — OPTIMISATION FISCALE

CAS 1 — RETRAITÉ SEUL (Canton JU)
Situation : M. Dupont, 78 ans, rente AVS CHF 28'800/an + LPP CHF 14'400/an
Revenu brut : CHF 43'200
Déductions applicables :
- Primes maladie forfait : CHF 1'800
- Frais médicaux (si > CHF 2'160 = 5%) : ex. CHF 3'800 – CHF 2'160 = CHF 1'640 déductible
- Dons associations : CHF 500
Revenu imposable net : CHF 43'200 – CHF 1'800 – CHF 1'640 – CHF 500 = CHF 39'260
Action prioritaire : vérifier subsides LAMal JU (seuil ~CHF 40'000)

CAS 2 — COUPLE MARIÉ, DEUX SALAIRES (Canton VD)
Situation : M. et Mme Martin, 45 ans, salaires CHF 95'000 + CHF 65'000
Optimisations identifiées :
- Pilier 3a x2 : CHF 7'258 × 2 = CHF 14'516 économie revenu imposable
- Rachat LPP Mme : CHF 25'000 → économie fiscale estimée CHF 7'000–9'000
- Transport TP : CHF 2'400 chacun
- Frais garde enfant : CHF 8'000 (2 enfants crèche)
Économie fiscale potentielle : CHF 4'000–8'000/an

CAS 3 — INDÉPENDANT (Canton ZH)
Situation : M. Keller, graphiste indépendant, bénéfice net CHF 120'000
Optimisations :
- Pilier 3a max sans LPP : CHF 24'000 (20% de CHF 120'000)
- Bureau à domicile : 20% du loyer si pièce dédiée = CHF 3'600/an
- Matériel professionnel : CHF 8'000 (ordinateurs, logiciels, appareils photo)
- Formation : CHF 2'000 (cours, conférences)
Revenu imposable réduit : CHF 120'000 → CHF 82'400
Économie fiscale estimée : CHF 15'000–20'000""",
    },
    {
        "category": "diplome_competences",
        "source_ref": "EXPERTsuisse — Diplôme fédéral expert fiscal : domaines d'examen",
        "canton": None,
        "year": 2025,
        "keywords": ["expert fiscal", "compétences", "examen", "diplôme", "fiduciaire"],
        "text": """DIPLÔME FÉDÉRAL D'EXPERT FISCAL — DOMAINES DE COMPÉTENCES

Matières examinées (référentiel EXPERTsuisse) :

1. IMPÔT SUR LE REVENU ET LA FORTUNE (personnes physiques)
   - Calcul du revenu imposable (toutes sources)
   - Fortune mobilière et immobilière
   - Déductions ordinaires et spéciales
   - Cas particuliers : divorce, succession, expatriés

2. IMPÔT SUR LE BÉNÉFICE ET LE CAPITAL (personnes morales)
   - SA, Sàrl, sociétés de personnes
   - Réorganisations fiscalement neutres
   - Prix de transfert intercantonaux

3. TVA (LTVA)
   - Assujettissement et taux
   - Déduction de l'impôt préalable
   - Déclaration et contrôle

4. DROIT FISCAL INTERNATIONAL
   - Conventions de double imposition (CDI)
   - Résidence fiscale, établissement stable
   - Retenue à la source

5. IMPÔTS SPÉCIAUX
   - Droits de timbre, impôt anticipé
   - Droits de mutation immobiliers
   - Impôt sur les gains immobiliers

6. PLANIFICATION ET OPTIMISATION FISCALE
   - Évaluation d'entreprises (angle fiscal)
   - Succession et transmission d'entreprise
   - Restructurations

DIPLÔME FÉDÉRAL FIDUCIAIRE — domaines couverts :
- Comptabilité financière (Swiss GAAP RPC)
- Clôture annuelle, consolidation
- Révision limitée et audit
- Droit des sociétés (CO)
- Fiscalité des PME
- Conseil aux entreprises et personnes physiques""",
    },
]


# ── Utilitaires ────────────────────────────────────────────────────────────

def chunk_text(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Découpe un texte en chunks cohérents."""
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) >= MIN_CHUNK_CHARS]
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 2 <= max_chars:
            current = (current + "\n\n" + p).strip()
        else:
            if current:
                chunks.append(current)
            current = p
    if current:
        chunks.append(current)
    return chunks or [text[:max_chars]]


async def fetch_html(url: str) -> Optional[str]:
    """Télécharge une page web."""
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            r = await client.get(url, headers={
                "User-Agent": "tAIx-KnowledgeScraper/1.0 (research@taix.ch)"
            })
            r.raise_for_status()
            return r.text
    except Exception as e:
        log.warning(f"Fetch failed {url}: {e}")
        return None


def extract_text(html: str, selectors: list[str] = None) -> str:
    """Extrait le texte pertinent d'une page HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # Supprimer navigation, footer, scripts
    for tag in soup(["nav", "footer", "script", "style", "header", "aside"]):
        tag.decompose()

    if selectors:
        texts = []
        for sel in selectors:
            els = soup.select(sel)
            for el in els:
                texts.append(el.get_text(separator="\n", strip=True))
        return "\n\n".join(texts)

    return soup.get_text(separator="\n", strip=True)


# ── Insertion en base ──────────────────────────────────────────────────────

async def insert_document_chunks(pool, doc: dict, chunks: list[str]):
    """Insère un document et ses chunks en base."""
    try:
        async with pool.acquire() as conn:
            doc_id = await conn.fetchval("""
                INSERT INTO fiscal_documents (source, category, title, language, year, canton, source_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (source, title) DO UPDATE SET scraped_at = NOW()
                RETURNING id
            """, doc["source"], doc["category"], doc["title"],
                doc.get("language", "fr"), doc.get("year", 2025),
                doc.get("canton"), doc.get("url"))

            for i, chunk_text in enumerate(chunks):
                if not chunk_text.strip():
                    continue
                await conn.execute("""
                    INSERT INTO fiscal_chunks
                        (document_id, chunk_index, chunk_text, category, canton,
                         year, keywords, source_ref)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                """, doc_id, i, chunk_text, doc.get("category"),
                    doc.get("canton"), doc.get("year", 2025),
                    doc.get("keywords", []), doc.get("source_ref", doc["title"]))

        log.info(f"✅ {doc['title']} — {len(chunks)} chunks")
    except Exception as e:
        log.error(f"Insert error {doc['title']}: {e}")


# ── Scrapers par source ────────────────────────────────────────────────────

async def scrape_baremes(pool):
    """Scrappe les barèmes cantonaux depuis les sites officiels."""
    log.info("📊 Scraping barèmes cantonaux...")
    for canton, info in BAREME_SOURCES.items():
        log.info(f"  → {canton}: {info['url']}")
        html = await fetch_html(info["url"])
        if html:
            text = extract_text(html, selectors=[
                ".content", "main", "article",
                ".tax-info", ".impot", ".steuer",
            ])
            if len(text) > 200:
                chunks = chunk_text(f"BARÈME {canton} 2025\n\n{text}")
                await insert_document_chunks(pool, {
                    "source": f"bareme_{canton.lower()}_2025",
                    "category": "bareme_cantonal",
                    "title": info["name"],
                    "language": info.get("lang", "fr"),
                    "year": 2025,
                    "canton": canton,
                    "url": info["url"],
                    "keywords": ["barème", "taux", canton, "2025"],
                    "source_ref": f"Barème officiel {canton} 2025",
                }, chunks)
                time.sleep(REQUEST_DELAY)
            else:
                log.warning(f"  ⚠ {canton}: contenu insuffisant ({len(text)} chars)")
        else:
            log.warning(f"  ⚠ {canton}: page inaccessible")


async def scrape_diplomes(pool):
    """Scrappe les référentiels de diplômes fédéraux."""
    log.info("🎓 Scraping diplômes fédéraux...")
    for key, info in DIPLOME_SOURCES.items():
        html = await fetch_html(info["url"])
        if not html and info.get("url_alt"):
            html = await fetch_html(info["url_alt"])
        if html:
            text = extract_text(html, selectors=[
                ".page-content", "main", "article",
                ".content-area", ".entry-content",
            ])
            if len(text) > 200:
                chunks = chunk_text(text)
                await insert_document_chunks(pool, {
                    "source": f"diplome_{key}",
                    "category": info["category"],
                    "title": info["name"],
                    "language": "fr",
                    "year": 2025,
                    "canton": None,
                    "url": info["url"],
                    "keywords": ["diplôme", "fédéral", key.replace("_", " ")],
                    "source_ref": info["name"],
                }, chunks)
                time.sleep(REQUEST_DELAY)


async def insert_techniques_integrees(pool):
    """Insère la base de connaissances intégrée (pas de scraping nécessaire)."""
    log.info("📚 Insertion connaissances intégrées...")
    for tech in TECHNIQUES_INTEGREES:
        chunks = chunk_text(tech["text"])
        await insert_document_chunks(pool, {
            "source": f"taix_base_{tech['category']}",
            "category": tech["category"],
            "title": tech["source_ref"],
            "language": "fr",
            "year": tech.get("year", 2025),
            "canton": tech.get("canton"),
            "url": None,
            "keywords": tech.get("keywords", []),
            "source_ref": tech["source_ref"],
        }, chunks)


async def generate_embeddings_for_chunks(pool):
    """Génère les embeddings Cohere pour tous les chunks sans embedding."""
    import os
    cohere_key = os.getenv("COHERE_API_KEY", "")
    if not cohere_key:
        log.warning("COHERE_API_KEY manquante — embeddings ignorés")
        return

    log.info("🔢 Génération des embeddings Cohere...")
    async with pool.acquire() as conn:
        chunks = await conn.fetch("""
            SELECT id, chunk_text FROM fiscal_chunks
            WHERE embedding IS NULL
            ORDER BY created_at
        """)

    log.info(f"  {len(chunks)} chunks à vectoriser")

    # Traitement par batch de 96 (limite Cohere)
    BATCH = 96
    for i in range(0, len(chunks), BATCH):
        batch = chunks[i:i+BATCH]
        texts = [c["chunk_text"][:512] for c in batch]  # max 512 tokens
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    "https://api.cohere.ai/v1/embed",
                    headers={"Authorization": f"Bearer {cohere_key}"},
                    json={
                        "texts": texts,
                        "model": "embed-multilingual-v3.0",
                        "input_type": "search_document",
                    },
                )
                r.raise_for_status()
                embeddings = r.json()["embeddings"]

            async with pool.acquire() as conn:
                for chunk, emb in zip(batch, embeddings):
                    await conn.execute(
                        "UPDATE fiscal_chunks SET embedding = $1::vector WHERE id = $2",
                        str(emb), chunk["id"]
                    )
            log.info(f"  ✅ Batch {i//BATCH + 1} — {len(batch)} embeddings générés")
            time.sleep(0.5)
        except Exception as e:
            log.error(f"  Embedding batch error: {e}")


# ── Main ───────────────────────────────────────────────────────────────────

async def main(sources: list[str]):
    from knowledge.db.database import init_db, get_pool
    await init_db()
    pool = await get_pool()
    if not pool:
        log.error("Impossible de se connecter à la base de données")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if "all" in sources or "techniques" in sources:
        await insert_techniques_integrees(pool)

    if "all" in sources or "baremes" in sources:
        await scrape_baremes(pool)

    if "all" in sources or "diplomes" in sources:
        await scrape_diplomes(pool)

    if "all" in sources or "embeddings" in sources:
        await generate_embeddings_for_chunks(pool)

    log.info("✅ Scraping terminé")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="tAIx Knowledge Scraper")
    parser.add_argument(
        "--source", default="all",
        choices=["all", "techniques", "baremes", "diplomes", "embeddings"],
        help="Source à scraper"
    )
    args = parser.parse_args()
    asyncio.run(main([args.source]))
