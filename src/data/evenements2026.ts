// ════════════════════════════════════════════════════════════════
//  PROGRAMME DES ACTIVITÉS SPIRITUELLES MIEDA — ANNÉE 2026
//  Source : document officiel signé (Rév. Dr Prophète DJEHA Kouadio)
//  "commune: true" = activité commune (***) dont la date doit être
//  respectée par toutes les églises MIEDA.
//  ⚠️ Dates extraites d'un scan : vérifiez-les avec le PDF officiel.
// ════════════════════════════════════════════════════════════════

export interface Evenement {
  id: number;
  titre: string;
  dateDebut: string;   // format AAAA-MM-JJ
  dateFin?: string;    // si l'activité dure plusieurs jours
  commune: boolean;    // activité commune (***)
}

export const evenements2026: Evenement[] = [
  { id: 1,  titre: "Jeûne et prière relatif au thème de l'année", dateDebut: "2026-01-11", commune: true },
  { id: 2,  titre: "1er culte d'action de grâce de l'année 2026", dateDebut: "2026-01-11", commune: true },
  { id: 3,  titre: "Rencontre du Conseil Supérieur", dateDebut: "2026-02-07", commune: false },
  { id: 4,  titre: "Offrandes de soutien aux Districts par les églises des districts", dateDebut: "2026-02-08", commune: false },
  { id: 5,  titre: "Rallye spirituel", dateDebut: "2026-02-17", dateFin: "2026-02-19", commune: false },
  { id: 6,  titre: "Pastorale nationale et internationale", dateDebut: "2026-02-20", commune: true },
  { id: 7,  titre: "Présentation des vœux des Pasteurs de la MIEDA au Rév. Dr Prophète DJEHA Kouadio", dateDebut: "2026-02-21", commune: true },
  { id: 8,  titre: "Jeûne et prière des élèves et étudiants", dateDebut: "2026-02-22", commune: false },
  { id: 9,  titre: "Moment d'ordination et de consécration des Pasteurs et des responsables", dateDebut: "2026-03-06", dateFin: "2026-03-28", commune: true },
  { id: 10, titre: "Offrandes de soutien à l'inspectorat de la MIEDA", dateDebut: "2026-03-08", commune: true },
  { id: 11, titre: "Célébration de la pâque", dateDebut: "2026-04-05", commune: true },
  { id: 12, titre: "Semaine de vie et de miracles", dateDebut: "2026-04-15", dateFin: "2026-04-19", commune: false },
  { id: 13, titre: "Offrandes de soutien au département des affaires sociales", dateDebut: "2026-05-03", commune: true },
  { id: 14, titre: "Jeûne et prière en faveur des personnes en quête d'emploi, porteurs de projets et candidats aux différents concours et examens", dateDebut: "2026-05-24", commune: false },
  { id: 15, titre: "Semaine de grâce", dateDebut: "2026-06-03", dateFin: "2026-06-07", commune: true },
  { id: 16, titre: "Offrandes de soutien à la communication", dateDebut: "2026-06-07", commune: true },
  { id: 17, titre: "Cri de détresse du juste et du malheureux", dateDebut: "2026-07-01", dateFin: "2026-07-05", commune: false },
  // ⚠️ #18 : date lue "17–19/03" sur le scan, mais semble être en juillet selon l'ordre du programme. À vérifier.
  { id: 18, titre: "Rencontre des Pasteurs régionaux", dateDebut: "2026-03-17", dateFin: "2026-03-19", commune: false },
  { id: 19, titre: "Retraite spirituelle éclatée des Hommes", dateDebut: "2026-07-31", dateFin: "2026-08-02", commune: true },
  { id: 20, titre: "Offrandes de soutien à l'administration", dateDebut: "2026-08-09", commune: true },
  { id: 21, titre: "Journée de consommation amère", dateDebut: "2026-08-10", dateFin: "2026-08-12", commune: true },
  { id: 22, titre: "Mini veillée pour le mariage et l'enfantement", dateDebut: "2026-08-28", commune: false },
  { id: 23, titre: "Offrandes de soutien à l'évangélisation et l'implantation", dateDebut: "2026-09-06", commune: true },
  { id: 24, titre: "Journée des cantiques nouveaux", dateDebut: "2026-09-27", commune: true },
  { id: 25, titre: "Jeûne et prière des élèves et étudiants", dateDebut: "2026-10-11", commune: false },
  { id: 26, titre: "Célébration des 29 années de la MIEDA", dateDebut: "2026-10-29", dateFin: "2026-11-02", commune: true },
  { id: 27, titre: "Campagne d'évangélisation « Arrache-cannes »", dateDebut: "2026-11-12", dateFin: "2026-11-15", commune: true },
  { id: 28, titre: "2e culte d'action de grâce de l'année 2026", dateDebut: "2026-12-06", commune: true },
  { id: 29, titre: "Jeûne d'humiliation", dateDebut: "2026-12-07", dateFin: "2026-12-09", commune: true },
  { id: 30, titre: "Nuit prophétique", dateDebut: "2026-12-11", commune: true },
  { id: 31, titre: "Fête des enfants", dateDebut: "2026-12-24", commune: false },
  { id: 32, titre: "Mini veillée de fin d'année", dateDebut: "2026-12-31", commune: false },
];
