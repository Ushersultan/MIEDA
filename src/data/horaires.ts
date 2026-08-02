// ════════════════════════════════════════════════════════════════
//  MIEDA — Horaires des services (source unique)
//
//  Modifiez UNIQUEMENT ce fichier pour changer les horaires :
//  ils se mettent à jour automatiquement partout sur le site
//  (page Contact, page Cultes, etc.). Fini les incohérences.
// ════════════════════════════════════════════════════════════════

export interface CreneauHoraire {
  jour: string;
  jourEn: string;
  horaire: string;
  horaireEn: string;
  icone: "calendar" | "clock";
}

export const horairesServices: CreneauHoraire[] = [
  {
    jour: "Dimanche — Louange & Adoration",
    jourEn: "Sunday — Praise & Worship",
    horaire: "1er culte 06h00–08h20 · 2e culte 08h30–11h00",
    horaireEn: "1st service 6:00–8:20 AM · 2nd service 8:30–11:00 AM",
    icone: "calendar",
  },
  {
    jour: "Mercredi — Culte de délivrance",
    jourEn: "Wednesday — Deliverance Service",
    horaire: "09h00–13h00 · dernier mercredi 18h00–21h00",
    horaireEn: "9:00 AM–1:00 PM · last Wednesday 6:00–9:00 PM",
    icone: "calendar",
  },
  {
    jour: "Tous les jours 9h00–11h00",
    jourEn: "Every day 9:00–11:00 AM",
    horaire: "Église ouverte pour assistance et prière",
    horaireEn: "Church open for assistance and prayer",
    icone: "clock",
  },
];
