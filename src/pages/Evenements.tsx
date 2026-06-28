import { useMemo } from "react";
import { Calendar, Star, CalendarDays, Clock, ChevronRight, Info } from "lucide-react";
import { evenements2026, type Evenement } from "@/data/evenements2026";

// ── Helpers dates (en heure locale, sans décalage) ──
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MOIS_COURT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];
const JOURS_COURT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const parseLocal = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Libellé de date d'un événement (jour simple ou plage)
const dateLabel = (e: Evenement) => {
  const debut = parseLocal(e.dateDebut);
  if (!e.dateFin) {
    return `${JOURS_COURT[debut.getDay()]} ${debut.getDate()} ${MOIS_COURT[debut.getMonth()]}`;
  }
  const fin = parseLocal(e.dateFin);
  if (debut.getMonth() === fin.getMonth()) {
    return `${debut.getDate()} – ${fin.getDate()} ${MOIS_COURT[fin.getMonth()]}`;
  }
  return `${debut.getDate()} ${MOIS_COURT[debut.getMonth()]} – ${fin.getDate()} ${MOIS_COURT[fin.getMonth()]}`;
};

// Pastille date compacte (pour les cartes "prochains")
const DatePill = ({ e }: { e: Evenement }) => {
  const debut = parseLocal(e.dateDebut);
  return (
    <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl w-16 h-16 flex-shrink-0">
      <span className="text-xl font-bold leading-none">{debut.getDate()}</span>
      <span className="text-[11px] uppercase tracking-wide mt-0.5">{MOIS_COURT[debut.getMonth()]}</span>
    </div>
  );
};

const CommuneBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground flex-shrink-0">
    <Star className="w-3 h-3" />
    Commune
  </span>
);

const Evenements = () => {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  // Prochains événements (fin >= aujourd'hui)
  const prochains = useMemo(() => {
    return [...evenements2026]
      .filter((e) => parseLocal(e.dateFin ?? e.dateDebut) >= today)
      .sort((a, b) => parseLocal(a.dateDebut).getTime() - parseLocal(b.dateDebut).getTime())
      .slice(0, 4);
  }, [today]);

  // Programme groupé par mois
  const parMois = useMemo(() => {
    const groupes: { mois: number; evenements: Evenement[] }[] = [];
    const tri = [...evenements2026].sort(
      (a, b) => parseLocal(a.dateDebut).getTime() - parseLocal(b.dateDebut).getTime()
    );
    for (const e of tri) {
      const mois = parseLocal(e.dateDebut).getMonth();
      let g = groupes.find((x) => x.mois === mois);
      if (!g) { g = { mois, evenements: [] }; groupes.push(g); }
      g.evenements.push(e);
    }
    return groupes;
  }, []);

  const nbCommunes = evenements2026.filter((e) => e.commune).length;

  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-5 backdrop-blur-sm">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Année 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Programme Spirituel</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
            Le calendrier des activités spirituelles de la MIEDA pour l'année 2026.
            Vivons ensemble chaque temps fort de la mission.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
              <div className="text-3xl font-bold">{evenements2026.length}</div>
              <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Activités</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
              <div className="text-3xl font-bold">{nbCommunes}</div>
              <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Communes</p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Prochains événements */}
          {prochains.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Prochains événements</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {prochains.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 bg-card border border-primary/30 rounded-2xl p-4 shadow-sm">
                    <DatePill e={e} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{dateLabel(e)} 2026</span>
                        {e.commune && <CommuneBadge />}
                      </div>
                      <p className="font-medium text-foreground leading-snug">{e.titre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende */}
          <div className="flex items-start gap-3 bg-[var(--section-bg)] rounded-xl p-4 mb-10">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Les activités marquées <span className="inline-flex items-center gap-1 font-medium text-secondary-foreground"><Star className="w-3 h-3" />Commune</span> (***)
              sont communes à toutes les églises MIEDA et leurs dates doivent être respectées partout.
              Les présentations des bébés, jeûnes, prières et enseignements se font selon les réalités de chaque église locale.
            </p>
          </div>

          {/* Programme complet par mois */}
          <div className="flex items-center gap-2 mb-8">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Programme complet 2026</h2>
          </div>

          <div className="space-y-8">
            {parMois.map((groupe) => (
              <div key={groupe.mois}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-primary">{MOIS[groupe.mois]}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {groupe.evenements.map((e) => (
                    <div
                      key={e.id}
                      className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                        e.commune ? "border-secondary/40 bg-secondary/5" : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-sm font-semibold text-foreground bg-muted rounded-lg px-3 py-2 min-w-[110px] text-center flex-shrink-0">
                        {dateLabel(e)}
                      </div>
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                        <p className="text-foreground leading-snug pt-0.5">{e.titre}</p>
                        {e.commune && <CommuneBadge />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Note bas de page */}
          <p className="text-xs text-muted-foreground text-center mt-12">
            Programme officiel approuvé par le Rév. Dr Prophète DJEHA Kouadio — MIEDA, Yamoussoukro.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Evenements;
