import { Building, Radio, BookOpen, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const projets = [
  { icon: Building, title: "Construction du Temple", desc: "Bâtir un lieu de culte digne pour accueillir l'assemblée grandissante de MIEDA.", statut: "En cours" },
  { icon: Radio, title: "Média & Diffusion", desc: "Étendre la portée de l'Évangile par la radio, la télévision et le numérique.", statut: "En développement" },
  { icon: BookOpen, title: "Centre de Formation", desc: "Créer un centre pour former et équiper les serviteurs de Dieu.", statut: "À venir" },
  { icon: HeartHandshake, title: "Action Humanitaire", desc: "Venir en aide aux plus démunis à travers des projets sociaux concrets.", statut: "Permanent" },
];

const statutColor: Record<string, string> = {
  "En cours": "bg-primary/10 text-primary",
  "En développement": "bg-accent/10 text-accent",
  "À venir": "bg-secondary/30 text-secondary-foreground",
  "Permanent": "bg-muted text-muted-foreground",
};

const Projets = () => {
  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Projets</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Ensemble, bâtissons l'avenir de la mission et impactons des vies pour Christ.
          </p>
        </div>
      </div>

      {/* Liste des projets */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {projets.map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <p.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statutColor[p.statut]}`}>
                    {p.statut}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-xl mb-2">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Appel à soutien */}
          <div className="mt-12 rounded-2xl p-8 md:p-10 text-center text-white" style={{ background: "var(--hero-gradient)" }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Soutenez nos projets</h2>
            <p className="text-white/85 max-w-xl mx-auto mb-6">
              Votre contribution permet de faire avancer l'œuvre de Dieu et de
              concrétiser ces projets au service de la communauté.
            </p>
            <Link to="/contact#offrandes">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Faire un don / Contribuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projets;
