// ════════════════════════════════════════════════════════════════
//  MESSAGES PROPHÉTIQUES MIEDA
//  Pour ajouter un message : copiez un bloc et modifiez-le.
//  actif: true  → affiché sur la page d'accueil
//  actif: false → archivé (non affiché)
// ════════════════════════════════════════════════════════════════

export interface MessageProphetique {
  id: string;
  titre: string;
  reference: string;       // ex: "Psaume 35"
  auteur: string;
  instruction: string;     // ex: "À lire 3 fois par jour pendant 5 jours"
  versets: string[];       // tableau de versets (chaque entrée = un verset)
  actif: boolean;
  dateDebut?: string;      // AAAA-MM-JJ (optionnel)
  dateFin?: string;        // AAAA-MM-JJ (optionnel)
  couleur?: "primary" | "gold" | "vert"; // thème de couleur
}

export const messagesProphetiques: MessageProphetique[] = [
  {
    id: "psaume-35-2026",
    titre: "Message du Prophète",
    reference: "Psaume 35",
    auteur: "Rév. Dr Prophète Djeha Kouadio",
    instruction: "À lire 3 fois par jour pendant 5 jours",
    actif: true,
    dateDebut: "2026-07-06",
    dateFin: "2026-07-11",
    couleur: "gold",
    versets: [
      "1 — Dispute ma cause, ô Éternel, avec mes adversaires ! Combats ceux qui me combattent !",
      "2 — Prends le bouclier et l'écu, et lève-toi pour me secourir !",
      "3 — Brandis la lance et la javeline contre mes persécuteurs ! Dis à mon âme : Je suis ton salut !",
      "4 — Qu'ils soient confondus et couverts de honte, ceux qui en veulent à ma vie ! Qu'ils reculent et rougissent, ceux qui méditent mon malheur !",
      "5 — Qu'ils soient comme la paille au vent, et que l'ange de l'Éternel les pousse !",
      "6 — Que leur chemin soit ténébreux et glissant, et que l'ange de l'Éternel les poursuive !",
      "7 — Car sans motif ils ont tendu leur filet pour me prendre, sans motif ils ont creusé une fosse pour mon âme.",
      "8 — Que la ruine vienne sur eux à l'improviste ! Que le filet qu'ils ont tendu les prenne eux-mêmes ! Qu'ils tombent dans la fosse en faisant leur ruine !",
      "9 — Et mon âme se réjouira en l'Éternel, elle sera dans l'allégresse à cause de son salut.",
      "10 — Tous mes os diront : Éternel, qui est semblable à toi ? Tu délivres le malheureux de celui qui est plus fort que lui, le malheureux et le pauvre de celui qui le dépouille.",
      "11 — Des témoins iniques se lèvent, ils m'interrogent sur des choses que j'ignore.",
      "12 — Ils me rendent le mal pour le bien ; c'est la désolation pour mon âme.",
      "13 — Moi, quand ils étaient malades, je me revêtais d'un sac, je humiliais mon âme par le jeûne, et je priais, la tête penchée sur ma poitrine.",
      "14 — Je me conduisais comme envers un ami, envers un frère ; je m'inclinais d'un air sombre, comme en deuil d'une mère.",
      "15 — Mais eux, dans mon malheur, ils se réjouissent et se rassemblent, ils se rassemblent contre moi des inconnus que je ne connais pas ; ils me déchirent et ne cessent pas.",
      "16 — Avec les impies bouffons pour un repas, ils grincent des dents contre moi.",
      "17 — Seigneur, jusques à quand regarderas-tu ? Arrache mon âme à leurs ravages, ma vie, à ces lions !",
      "18 — Je te louerai dans la grande assemblée, je te célébrerai au milieu d'un peuple nombreux.",
      "19 — Que mes ennemis injustes ne se réjouissent pas à mon sujet ! Que ceux qui me haïssent sans cause ne fassent pas des signes de l'œil !",
      "20 — Car ils ne parlent pas de paix, et ils méditent des tromperies contre ceux qui vivent tranquilles dans le pays.",
      "21 — Ils ouvrent leur bouche pour m'accuser : Ha ! Ha ! leur œil me voit !",
      "22 — Éternel, tu as vu ! Ne sois pas silencieux ! Seigneur, ne t'éloigne pas de moi !",
      "23 — Réveille-toi ! Lève-toi pour me défendre, pour me faire justice, mon Dieu et mon Seigneur !",
      "24 — Juge-moi selon ta justice, ô Éternel, mon Dieu ! Qu'ils ne se réjouissent pas à mon sujet !",
      "25 — Qu'ils ne disent pas en leur cœur : Ah ! voilà ce que nous voulions ! Qu'ils ne disent pas : Nous l'avons englouti !",
      "26 — Qu'ils soient confondus et honteux, tous ensemble, ceux qui se réjouissent de mon malheur ! Qu'ils se couvrent de confusion et d'ignominie, ceux qui s'élèvent contre moi !",
      "27 — Qu'ils poussent des cris de joie et de triomphe, ceux qui veulent ma délivrance ! Qu'ils disent sans cesse : Que l'Éternel soit magnifié, lui qui veut le salut de son serviteur !",
      "28 — Et ma langue publiera ta justice, ta louange, tout le jour.",
    ],
  },
];
