// Liste officielle des départements MIEDA (partagée entre les pages)
export interface Departement {
  id: string;
  titre: string;
  desc: string;
}

export const departements: Departement[] = [
  { id: "louange", titre: "Louange", desc: "Conduire l'assemblée dans l'adoration par le chant et la musique." },
  { id: "intercession", titre: "Intercession", desc: "Soutenir la mission et les fidèles par une prière fervente et constante." },
  { id: "evangelisation", titre: "Évangélisation", desc: "Annoncer la Bonne Nouvelle de Jésus-Christ et gagner des âmes." },
  { id: "delivrance", titre: "Délivrance", desc: "Accompagner les personnes vers la liberté et la restauration en Christ." },
  { id: "ecclesiastique", titre: "Ecclésiastique", desc: "Veiller au bon ordre spirituel et à la vie de l'Église." },
  { id: "jeunesse", titre: "Jeunesse", desc: "Encadrer et affermir les jeunes dans la foi et le service." },
  { id: "hommes", titre: "Hommes", desc: "Rassembler et édifier les hommes de l'Église." },
  { id: "femmes", titre: "Femmes", desc: "Rassembler et édifier les femmes de l'Église." },
  { id: "ecole-de-dimanche", titre: "École de Dimanche", desc: "Enseigner la Parole de Dieu aux enfants chaque dimanche." },
  { id: "priere-hopital", titre: "Prière à l'Hôpital", desc: "Visiter, prier et réconforter les malades à l'hôpital." },
  { id: "nettoyage", titre: "Nettoyage", desc: "Entretenir la maison de Dieu dans la propreté et la dignité." },
  { id: "service-ordre", titre: "Service d'Ordre", desc: "Accueillir et veiller au bon déroulement des cultes." },
  { id: "securite", titre: "Sécurité", desc: "Assurer la sécurité des fidèles et des lieux de culte." },
  { id: "communication", titre: "Communication", desc: "Diffuser l'Évangile via le web, la vidéo et les réseaux sociaux." },
  { id: "comptabilite", titre: "Comptabilité", desc: "Gérer avec transparence les finances de l'Église." },
  { id: "social", titre: "Social", desc: "Servir la communauté par des actions de solidarité et d'entraide." },
];
