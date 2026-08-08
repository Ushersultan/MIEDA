import { useLang } from "@/contexts/LanguageContext";

// ════════════════════════════════════════════════════════════════
//  Les Noms de Dieu — page dévotionnelle permanente
//  URL : /noms-de-dieu
// ════════════════════════════════════════════════════════════════

interface NomDeDieu {
  nom: string;
  sensFr: string;
  sensEn: string;
  refFr: string;
  refEn: string;
}

const NOMS: NomDeDieu[] = [
  { nom: "YHWH · Yahweh", sensFr: "« Je suis » — le Dieu éternel qui existe par lui-même", sensEn: "\u201cI AM\u201d — the eternal, self-existent God", refFr: "Exode 3:14-15", refEn: "Exodus 3:14-15" },
  { nom: "Elohim", sensFr: "Dieu puissant, Créateur", sensEn: "The mighty God, Creator", refFr: "Genèse 1:1", refEn: "Genesis 1:1" },
  { nom: "Adonaï", sensFr: "Seigneur, Maître, Souverain", sensEn: "Lord, Master, Sovereign", refFr: "Psaume 8:2", refEn: "Psalm 8:1" },
  { nom: "El Shaddaï", sensFr: "Dieu Tout-Puissant", sensEn: "God Almighty", refFr: "Genèse 17:1", refEn: "Genesis 17:1" },
  { nom: "El Elyon", sensFr: "Dieu Très-Haut, au-dessus de toute autorité", sensEn: "God Most High, above all authority", refFr: "Genèse 14:18-20", refEn: "Genesis 14:18-20" },
  { nom: "El Olam", sensFr: "Dieu éternel, sans commencement ni fin", sensEn: "Everlasting God, without beginning or end", refFr: "Genèse 21:33", refEn: "Genesis 21:33" },
  { nom: "El Roï", sensFr: "Le Dieu qui me voit", sensEn: "The God who sees me", refFr: "Genèse 16:13", refEn: "Genesis 16:13" },
  { nom: "Yahweh Jireh", sensFr: "L'Éternel pourvoira", sensEn: "The LORD will provide", refFr: "Genèse 22:14", refEn: "Genesis 22:14" },
  { nom: "Yahweh Rapha", sensFr: "L'Éternel qui guérit", sensEn: "The LORD who heals", refFr: "Exode 15:26", refEn: "Exodus 15:26" },
  { nom: "Yahweh Nissi", sensFr: "L'Éternel, ma bannière — celui qui donne la victoire", sensEn: "The LORD my banner — who gives the victory", refFr: "Exode 17:15", refEn: "Exodus 17:15" },
  { nom: "Yahweh Shalom", sensFr: "L'Éternel est paix", sensEn: "The LORD is peace", refFr: "Juges 6:24", refEn: "Judges 6:24" },
  { nom: "Yahweh Rohi · Raah", sensFr: "L'Éternel est mon berger", sensEn: "The LORD is my shepherd", refFr: "Psaume 23:1", refEn: "Psalm 23:1" },
  { nom: "Yahweh Tsidkenu", sensFr: "L'Éternel notre justice", sensEn: "The LORD our righteousness", refFr: "Jérémie 23:6", refEn: "Jeremiah 23:6" },
  { nom: "Yahweh Mekaddishkem", sensFr: "L'Éternel qui sanctifie", sensEn: "The LORD who sanctifies", refFr: "Exode 31:13", refEn: "Exodus 31:13" },
  { nom: "Yahweh Sabaoth", sensFr: "L'Éternel des armées", sensEn: "The LORD of Hosts", refFr: "1 Samuel 1:3", refEn: "1 Samuel 1:3" },
  { nom: "Yahweh Shammah", sensFr: "L'Éternel est ici, présent", sensEn: "The LORD is there, present", refFr: "Ézéchiel 48:35", refEn: "Ezekiel 48:35" },
  { nom: "El Qanna", sensFr: "Dieu jaloux — qui réclame une fidélité exclusive", sensEn: "Jealous God — who claims exclusive faithfulness", refFr: "Exode 34:14", refEn: "Exodus 34:14" },
  { nom: "Abba", sensFr: "Père — une relation proche et intime avec Dieu", sensEn: "Father — a close, intimate relationship with God", refFr: "Marc 14:36 · Romains 8:15", refEn: "Mark 14:36 · Romans 8:15" },
  { nom: "Père céleste", sensFr: "Dieu comme Père aimant et protecteur", sensEn: "God as loving and protecting Father", refFr: "Matthieu 6:9", refEn: "Matthew 6:9" },
  { nom: "Emmanuel", sensFr: "Dieu avec nous — titre donné à Jésus-Christ", sensEn: "God with us — title given to Jesus Christ", refFr: "Matthieu 1:23", refEn: "Matthew 1:23" },
];

const NomsDeDieu = () => {
  const { lang } = useLang();
  const fr = lang !== "en";

  return (
    <div className="min-h-screen bg-background">
      {/* ── En-tête ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-primary-foreground">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative container mx-auto px-4 max-w-4xl py-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-4">
            {fr ? "Méditation" : "Meditation"}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {fr ? "Les Noms de Dieu" : "The Names of God"}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {fr
              ? "Chaque nom révèle une facette de son caractère et de sa fidélité envers nous. Prenez le temps de méditer et de connaître celui qui se révèle."
              : "Each name reveals a facet of His character and His faithfulness toward us. Take time to meditate and know the One who reveals Himself."}
          </p>
          <div className="mt-8 inline-block border-t border-primary-foreground/20 pt-6">
            <p className="italic text-primary-foreground/70">
              {fr
                ? "« Ceux qui connaissent ton nom se confient en toi. »"
                : "\u201cThose who know your name trust in you.\u201d"}
            </p>
            <p className="text-sm text-primary-foreground/50 mt-1">
              {fr ? "Psaume 9:11" : "Psalm 9:10"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Liste des noms ── */}
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="grid md:grid-cols-2 gap-5">
          {NOMS.map((n, i) => (
            <div key={n.nom}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all">
              {/* Numéro discret */}
              <span className="absolute top-5 right-6 text-5xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors select-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative">
                <h2 className="text-2xl font-bold text-primary mb-2">{n.nom}</h2>
                <p className="text-foreground leading-relaxed mb-4">
                  {fr ? n.sensFr : n.sensEn}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  {fr ? n.refFr : n.refEn}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Clôture ── */}
        <div className="mt-16 text-center">
          <p className="text-2xl font-bold text-primary mb-2">
            {fr ? "Que son nom soit glorifié 🙏" : "May His name be glorified 🙏"}
          </p>
          <p className="text-muted-foreground">
            {fr
              ? "« Le nom de l'Éternel est une tour forte ; le juste s'y réfugie, et se trouve en sûreté. »"
              : "\u201cThe name of the LORD is a strong tower; the righteous run to it and are safe.\u201d"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Proverbes 18:10" : "Proverbs 18:10"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NomsDeDieu;
