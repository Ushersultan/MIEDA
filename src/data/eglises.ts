// ════════════════════════════════════════════════════════════════
//  DONNÉES DES ÉGLISES MIEDA DANS LE MONDE
//  Pour ajouter une église : copiez un bloc { ... } et modifiez-le.
//  Tous les champs marqués "?" sont optionnels (peuvent être omis).
// ════════════════════════════════════════════════════════════════

export type Continent = "Afrique" | "Europe" | "Amérique" | "Asie" | "Océanie";

export interface Pasteur {
  nom: string;
  titre?: string;        // ex: "Pasteur responsable"
  photo?: string;        // URL d'une photo (laisser vide = initiales auto)
  telephone?: string;
  email?: string;
}

export interface Reseaux {
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  instagram?: string;
}

export interface Media {
  youtubeChannel?: string;  // lien de la chaîne (pour le live)
  youtubeVideoId?: string;  // ID d'une vidéo à intégrer (ex: "dQw4w9WgXcQ")
}

export interface Eglise {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  drapeau: string;          // emoji drapeau, ex: "🇨🇮"
  continent: Continent;
  adresse?: string;
  estSiege?: boolean;       // true = siège principal (mis en avant)
  exemple?: boolean;        // true = fiche exemple à personnaliser (badge "Exemple")
  pasteur: Pasteur;
  reseaux?: Reseaux;
  media?: Media;
}

export const eglises: Eglise[] = [
  // ─── SIÈGE PRINCIPAL ───
  {
    id: "yamoussoukro",
    nom: "MIEDA Yamoussoukro",
    ville: "Yamoussoukro",
    pays: "Côte d'Ivoire",
    drapeau: "🇨🇮",
    continent: "Afrique",
    adresse: "2062, Yamoussoukro, Côte d'Ivoire",
    estSiege: true,
    pasteur: {
      nom: "Rév. Dr. Prophète Djeha Kouadio",
      titre: "Fondateur & Pasteur Principal",
      // photo: "https://...",      // ✏️ ajoutez la photo du fondateur
      // telephone: "+225 ...",
      // email: "communication@eglisesmieda.org",
    },
    reseaux: {
      facebook: "https://www.facebook.com/mieda225",
      youtube: "https://www.youtube.com/@VsdCommunicationMIEDA",
      tiktok: "https://www.tiktok.com/@mieda97",
    },
    media: {
      youtubeChannel: "https://www.youtube.com/@VsdCommunicationMIEDA",
    },
  },

  // ─── EXEMPLES À PERSONNALISER (remplacez ou supprimez) ───
  {
    id: "exemple-paris",
    nom: "MIEDA Diaspora — Paris",
    ville: "Paris",
    pays: "France",
    drapeau: "🇫🇷",
    continent: "Europe",
    exemple: true,
    pasteur: {
      nom: "Pasteur [Nom à compléter]",
      titre: "Pasteur responsable",
    },
    reseaux: {
      // facebook: "https://...",
      // youtube: "https://...",
    },
  },
  {
    id: "exemple-usa",
    nom: "MIEDA Diaspora — USA",
    ville: "[Ville]",
    pays: "États-Unis",
    drapeau: "🇺🇸",
    continent: "Amérique",
    exemple: true,
    pasteur: {
      nom: "Pasteur [Nom à compléter]",
      titre: "Pasteur responsable",
    },
  },
];

// Ordre d'affichage des continents
export const ordreContinents: Continent[] = [
  "Afrique", "Europe", "Amérique", "Asie", "Océanie",
];
