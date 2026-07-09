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
  instructionEn?: string;  // version anglaise de l'instruction
  referenceEn?: string;    // ex: "Psalm 35"
  versets: string[];       // versets en français (chaque entrée = un verset)
  versetsEn?: string[];    // versets en anglais (King James, domaine public)
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
    instructionEn: "To be read 3 times a day for 5 days",
    referenceEn: "Psalm 35",
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
    versetsEn: [
      "1 — Plead my cause, O LORD, with them that strive with me: fight against them that fight against me.",
      "2 — Take hold of shield and buckler, and stand up for mine help.",
      "3 — Draw out also the spear, and stop the way against them that persecute me: say unto my soul, I am thy salvation.",
      "4 — Let them be confounded and put to shame that seek after my soul: let them be turned back and brought to confusion that devise my hurt.",
      "5 — Let them be as chaff before the wind: and let the angel of the LORD chase them.",
      "6 — Let their way be dark and slippery: and let the angel of the LORD persecute them.",
      "7 — For without cause have they hid for me their net in a pit, which without cause they have digged for my soul.",
      "8 — Let destruction come upon him at unawares; and let his net that he hath hid catch himself: into that very destruction let him fall.",
      "9 — And my soul shall be joyful in the LORD: it shall rejoice in his salvation.",
      "10 — All my bones shall say, LORD, who is like unto thee, which deliverest the poor from him that is too strong for him, yea, the poor and the needy from him that spoileth him?",
      "11 — False witnesses did rise up; they laid to my charge things that I knew not.",
      "12 — They rewarded me evil for good to the spoiling of my soul.",
      "13 — But as for me, when they were sick, my clothing was sackcloth: I humbled my soul with fasting; and my prayer returned into mine own bosom.",
      "14 — I behaved myself as though he had been my friend or brother: I bowed down heavily, as one that mourneth for his mother.",
      "15 — But in mine adversity they rejoiced, and gathered themselves together: yea, the abjects gathered themselves together against me, and I knew it not; they did tear me, and ceased not:",
      "16 — With hypocritical mockers in feasts, they gnashed upon me with their teeth.",
      "17 — Lord, how long wilt thou look on? rescue my soul from their destructions, my darling from the lions.",
      "18 — I will give thee thanks in the great congregation: I will praise thee among much people.",
      "19 — Let not them that are mine enemies wrongfully rejoice over me: neither let them wink with the eye that hate me without a cause.",
      "20 — For they speak not peace: but they devise deceitful matters against them that are quiet in the land.",
      "21 — Yea, they opened their mouth wide against me, and said, Aha, aha, our eye hath seen it.",
      "22 — This thou hast seen, O LORD: keep not silence: O Lord, be not far from me.",
      "23 — Stir up thyself, and awake to my judgment, even unto my cause, my God and my Lord.",
      "24 — Judge me, O LORD my God, according to thy righteousness; and let them not rejoice over me.",
      "25 — Let them not say in their hearts, Ah, so would we have it: let them not say, We have swallowed him up.",
      "26 — Let them be ashamed and brought to confusion together that rejoice at mine hurt: let them be clothed with shame and dishonour that magnify themselves against me.",
      "27 — Let them shout for joy, and be glad, that favour my righteous cause: yea, let them say continually, Let the LORD be magnified, which hath pleasure in the prosperity of his servant.",
      "28 — And my tongue shall speak of thy righteousness and of thy praise all the day long.",
    ],
  },
];
