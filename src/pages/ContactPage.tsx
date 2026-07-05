import Contact from "@/components/Contact";
import Offering from "@/components/Offering";
import { Video, Calendar, ExternalLink, Crown, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Rendez-vous / entretiens privés sur Zoom ──
const rendezVous = [
  {
    icon: Crown,
    nom: "Papa Prophète",
    titre: "Rév. Dr Prophète Djeha Kouadio — Président Fondateur",
    detail: "Les rendez-vous avec Papa Prophète ont lieu tous les lundis.",
    badge: "Tous les lundis",
    lien: "https://scheduler.zoom.us/mieda-usa/entretiensprives",
    cta: "Prendre rendez-vous",
    accent: true,
  },
  {
    icon: UserRound,
    nom: "Évangéliste Kouakou Marcelin",
    titre: "Entretiens privés",
    detail: "Réservez un entretien privé avec l'Évangéliste Kouakou Marcelin.",
    badge: "Sur réservation",
    lien: "https://scheduler.zoom.us/mieda-usa/entretiens-priv-s-avec-l-evangelist-kouakou-marcelin-",
    cta: "Prendre rendez-vous",
    accent: false,
  },
];

const RendezVousZoom = () => (
  <section className="py-20 bg-[var(--section-bg)]">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
          <Video className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Entretiens privés
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Rendez-vous sur Zoom
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Réservez un moment d'écoute, de prière et de conseil en tête-à-tête,
          où que vous soyez dans le monde.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {rendezVous.map((r) => (
          <div
            key={r.nom}
            className={`rounded-2xl border bg-card p-7 flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 ${
              r.accent ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                r.accent ? "bg-primary/10" : "bg-accent/10"
              }`}>
                <r.icon className={`w-6 h-6 ${r.accent ? "text-primary" : "text-accent"}`} />
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${
                r.accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Calendar className="w-3 h-3" />
                {r.badge}
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1">{r.nom}</h3>
            <p className="text-sm text-primary font-medium mb-3">{r.titre}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
              {r.detail}
            </p>

            <a href={r.lien} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full" variant={r.accent ? "default" : "outline"}>
                <Video className="w-4 h-4 mr-2" />
                {r.cta}
                <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
              </Button>
            </a>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        Les entretiens se déroulent sur Zoom. Choisissez votre créneau et vous
        recevrez le lien de connexion par email.
      </p>
    </div>
  </section>
);

const ContactPage = () => {
  return (
    <div className="pt-20">
      <RendezVousZoom />
      <Contact />
      <Offering />
    </div>
  );
};

export default ContactPage;
