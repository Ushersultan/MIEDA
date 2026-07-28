import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════
//  MIEDA — RÉCUPÉRATION DES VERSETS BIBLIQUES
//
//  Appelé par l'Espace Admin quand on saisit « Psaume 91 ».
//  Passe par le serveur pour trois raisons :
//    • la politique de sécurité du site (CSP) n'autorise que
//      les appels vers notre propre domaine ;
//    • chaque chapitre n'est téléchargé qu'une fois puis mis en
//      cache dans Supabase (rapide, et résiste aux pannes) ;
//    • la source peut être changée ici sans toucher au site.
//
//  Source : getBible API v2 — sans clé, traductions du domaine
//  public (Louis Segond 1910 en français, King James en anglais).
//
//  Usage : GET /api/bible?livre=Psaume&chapitre=91&langue=fr
// ════════════════════════════════════════════════════════════════

const SOURCE = "https://api.getbible.net/v2";
const TRADUCTION = { fr: "segond", en: "kjv" } as const;

// ── Numéros des livres (canon protestant, 1 à 66) ──
const LIVRES: Record<string, number> = {};
const ajouter = (n: number, ...noms: string[]) => {
  for (const nom of noms) LIVRES[normaliser(nom)] = n;
};

function normaliser(t: string): string {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

ajouter(1, "Genèse", "Genese", "Genesis", "Gen");
ajouter(2, "Exode", "Exodus", "Ex");
ajouter(3, "Lévitique", "Levitique", "Leviticus", "Lev");
ajouter(4, "Nombres", "Numbers", "Nom", "Num");
ajouter(5, "Deutéronome", "Deuteronome", "Deuteronomy", "Deut");
ajouter(6, "Josué", "Josue", "Joshua", "Jos");
ajouter(7, "Juges", "Judges", "Jug");
ajouter(8, "Ruth");
ajouter(9, "1 Samuel", "1Samuel", "1 Sam");
ajouter(10, "2 Samuel", "2Samuel", "2 Sam");
ajouter(11, "1 Rois", "1Rois", "1 Kings");
ajouter(12, "2 Rois", "2Rois", "2 Kings");
ajouter(13, "1 Chroniques", "1Chroniques", "1 Chronicles");
ajouter(14, "2 Chroniques", "2Chroniques", "2 Chronicles");
ajouter(15, "Esdras", "Ezra");
ajouter(16, "Néhémie", "Nehemie", "Nehemiah");
ajouter(17, "Esther");
ajouter(18, "Job");
ajouter(19, "Psaume", "Psaumes", "Psalm", "Psalms", "Ps");
ajouter(20, "Proverbes", "Proverbs", "Prov");
ajouter(21, "Ecclésiaste", "Ecclesiaste", "Ecclesiastes");
ajouter(22, "Cantique des Cantiques", "Cantique", "Song of Solomon", "Song of Songs");
ajouter(23, "Ésaïe", "Esaie", "Isaïe", "Isaie", "Isaiah");
ajouter(24, "Jérémie", "Jeremie", "Jeremiah");
ajouter(25, "Lamentations");
ajouter(26, "Ézéchiel", "Ezechiel", "Ezekiel");
ajouter(27, "Daniel", "Dan");
ajouter(28, "Osée", "Osee", "Hosea");
ajouter(29, "Joël", "Joel");
ajouter(30, "Amos");
ajouter(31, "Abdias", "Obadiah");
ajouter(32, "Jonas", "Jonah");
ajouter(33, "Michée", "Michee", "Micah");
ajouter(34, "Nahum");
ajouter(35, "Habacuc", "Habakkuk");
ajouter(36, "Sophonie", "Zephaniah");
ajouter(37, "Aggée", "Aggee", "Haggai");
ajouter(38, "Zacharie", "Zechariah");
ajouter(39, "Malachie", "Malachi");
ajouter(40, "Matthieu", "Matthew", "Matt");
ajouter(41, "Marc", "Mark");
ajouter(42, "Luc", "Luke");
ajouter(43, "Jean", "John");
ajouter(44, "Actes", "Acts", "Actes des Apôtres");
ajouter(45, "Romains", "Romans", "Rom");
ajouter(46, "1 Corinthiens", "1Corinthiens", "1 Corinthians");
ajouter(47, "2 Corinthiens", "2Corinthiens", "2 Corinthians");
ajouter(48, "Galates", "Galatians");
ajouter(49, "Éphésiens", "Ephesiens", "Ephesians");
ajouter(50, "Philippiens", "Philippians");
ajouter(51, "Colossiens", "Colossians");
ajouter(52, "1 Thessaloniciens", "1 Thessalonians");
ajouter(53, "2 Thessaloniciens", "2 Thessalonians");
ajouter(54, "1 Timothée", "1Timothee", "1 Timothy");
ajouter(55, "2 Timothée", "2Timothee", "2 Timothy");
ajouter(56, "Tite", "Titus");
ajouter(57, "Philémon", "Philemon");
ajouter(58, "Hébreux", "Hebreux", "Hebrews");
ajouter(59, "Jacques", "James");
ajouter(60, "1 Pierre", "1Pierre", "1 Peter");
ajouter(61, "2 Pierre", "2Pierre", "2 Peter");
ajouter(62, "1 Jean", "1Jean", "1 John");
ajouter(63, "2 Jean", "2Jean", "2 John");
ajouter(64, "3 Jean", "3Jean", "3 John");
ajouter(65, "Jude");
ajouter(66, "Apocalypse", "Revelation");

export default async function handler(req: any, res: any) {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Réservé aux administrateurs et au prophète ──
  const auth = req.headers?.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  const { data: userData } = await admin.auth.getUser(token);
  if (!userData?.user) return res.status(401).json({ error: "Session invalide" });

  const { data: profil } = await admin
    .from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (!profil || !["admin", "prophete"].includes(profil.role)) {
    return res.status(403).json({ error: "Réservé à l'administration" });
  }

  // ── Paramètres ──
  const q = req.query ?? {};
  const livreTexte = String(q.livre ?? "").trim();
  const chapitre = parseInt(String(q.chapitre ?? ""), 10);
  const langue = String(q.langue ?? "fr") === "en" ? "en" : "fr";

  const numeroLivre = LIVRES[normaliser(livreTexte)];
  if (!numeroLivre) {
    return res.status(400).json({
      error: `Livre inconnu : « ${livreTexte} ». Exemples : Psaume, Ésaïe, Jean, Apocalypse.`,
    });
  }
  if (!chapitre || chapitre < 1 || chapitre > 150) {
    return res.status(400).json({ error: "Numéro de chapitre invalide." });
  }

  const traduction = TRADUCTION[langue];
  const cle = `${traduction}:${numeroLivre}:${chapitre}`;

  try {
    // ── 1. Déjà en cache ? ──
    const { data: cache } = await admin
      .from("versets_cache").select("versets").eq("cle", cle).maybeSingle();

    if (cache?.versets?.length) {
      return res.status(200).json({
        ok: true, source: "cache", langue,
        livre: numeroLivre, chapitre, versets: cache.versets,
      });
    }

    // ── 2. Téléchargement ──
    const reponse = await fetch(`${SOURCE}/${traduction}/${numeroLivre}/${chapitre}.json`, {
      headers: { Accept: "application/json" },
    });
    if (!reponse.ok) {
      return res.status(502).json({
        error: "La bibliothèque biblique est momentanément indisponible. Vous pouvez saisir les versets à la main.",
      });
    }

    const json: any = await reponse.json();
    const brut: any[] = json?.verses ?? [];
    if (!Array.isArray(brut) || brut.length === 0) {
      return res.status(404).json({ error: "Chapitre introuvable dans cette traduction." });
    }

    // Format attendu par le bandeau : « 1 — texte du verset »
    const versets = brut.map((v: any) => {
      const num = v.verse ?? v.number ?? "";
      const texte = String(v.text ?? "")
        .replace(/\s+/g, " ")
        .replace(/^\s*\d+\s*/, "")
        .trim();
      return `${num} — ${texte}`;
    });

    // ── 3. Mise en cache ──
    await admin.from("versets_cache").upsert({ cle, versets, recupere_le: new Date().toISOString() });

    return res.status(200).json({
      ok: true, source: "api", langue,
      livre: numeroLivre, chapitre, versets,
    });
  } catch (e: any) {
    console.error("bible:", e?.message ?? e);
    return res.status(500).json({
      error: "Impossible de récupérer les versets. Vous pouvez les saisir à la main.",
    });
  }
}
