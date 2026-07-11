// Liste officielle des départements MIEDA (partagée entre les pages)
// titreEn / descEn : versions anglaises pour le site bilingue
export interface Departement {
  id: string;
  titre: string;
  desc: string;
  titreEn: string;
  descEn: string;
}

export const departements: Departement[] = [
  { id: "louange", titre: "Louange", desc: "Conduire l'assemblée dans l'adoration par le chant et la musique.",
    titreEn: "Worship", descEn: "Leading the assembly in adoration through song and music." },
  { id: "intercession", titre: "Intercession", desc: "Soutenir la mission et les fidèles par une prière fervente et constante.",
    titreEn: "Intercession", descEn: "Supporting the mission and the faithful through fervent, constant prayer." },
  { id: "evangelisation", titre: "Évangélisation", desc: "Annoncer la Bonne Nouvelle de Jésus-Christ et gagner des âmes.",
    titreEn: "Evangelism", descEn: "Proclaiming the Good News of Jesus Christ and winning souls." },
  { id: "delivrance", titre: "Délivrance", desc: "Accompagner les personnes vers la liberté et la restauration en Christ.",
    titreEn: "Deliverance", descEn: "Guiding people toward freedom and restoration in Christ." },
  { id: "ecclesiastique", titre: "Ecclésiastique", desc: "Veiller au bon ordre spirituel et à la vie de l'Église.",
    titreEn: "Ecclesiastical", descEn: "Watching over the spiritual order and the life of the Church." },
  { id: "jeunesse", titre: "Jeunesse", desc: "Encadrer et affermir les jeunes dans la foi et le service.",
    titreEn: "Youth", descEn: "Mentoring and strengthening young people in faith and service." },
  { id: "hommes", titre: "Hommes", desc: "Rassembler et édifier les hommes de l'Église.",
    titreEn: "Men", descEn: "Gathering and building up the men of the Church." },
  { id: "femmes", titre: "Femmes", desc: "Rassembler et édifier les femmes de l'Église.",
    titreEn: "Women", descEn: "Gathering and building up the women of the Church." },
  { id: "ecole-de-dimanche", titre: "École de Dimanche", desc: "Enseigner la Parole de Dieu aux enfants chaque dimanche.",
    titreEn: "Sunday School", descEn: "Teaching God's Word to children every Sunday." },
  { id: "priere-hopital", titre: "Prière à l'Hôpital", desc: "Visiter, prier et réconforter les malades à l'hôpital.",
    titreEn: "Hospital Prayer", descEn: "Visiting, praying for and comforting the sick in hospital." },
  { id: "nettoyage", titre: "Nettoyage", desc: "Entretenir la maison de Dieu dans la propreté et la dignité.",
    titreEn: "Cleaning", descEn: "Keeping the house of God clean and dignified." },
  { id: "service-ordre", titre: "Service d'Ordre", desc: "Accueillir et veiller au bon déroulement des cultes.",
    titreEn: "Ushering", descEn: "Welcoming worshippers and ensuring services run smoothly." },
  { id: "securite", titre: "Sécurité", desc: "Assurer la sécurité des fidèles et des lieux de culte.",
    titreEn: "Security", descEn: "Ensuring the safety of the faithful and places of worship." },
  { id: "communication", titre: "Communication", desc: "Diffuser l'Évangile via le web, la vidéo et les réseaux sociaux.",
    titreEn: "Communication", descEn: "Spreading the Gospel through web, video and social media." },
  { id: "comptabilite", titre: "Comptabilité", desc: "Gérer avec transparence les finances de l'Église.",
    titreEn: "Accounting", descEn: "Managing the Church's finances with transparency." },
  { id: "social", titre: "Social", desc: "Servir la communauté par des actions de solidarité et d'entraide.",
    titreEn: "Social", descEn: "Serving the community through solidarity and mutual aid." },
];

// Helpers bilingues
export const titreDept = (d: Departement, lang: "fr" | "en") =>
  lang === "en" ? d.titreEn : d.titre;
export const descDept = (d: Departement, lang: "fr" | "en") =>
  lang === "en" ? d.descEn : d.desc;
