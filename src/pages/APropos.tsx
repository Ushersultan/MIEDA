import { Target, Eye, Heart, BookOpen, Globe2, Users } from "lucide-react";
import logo from "@/assets/mieda-logo.png";

const valeurs = [
  { icon: BookOpen, title: "La Parole de Dieu", desc: "Un enseignement biblique solide qui transforme les vies et édifie la foi." },
  { icon: Globe2, title: "L'Évangélisation", desc: "Annoncer la Bonne Nouvelle de Jésus-Christ en Afrique et au-delà." },
  { icon: Heart, title: "La Délivrance", desc: "Conduire les âmes à la liberté et à la restauration en Christ." },
  { icon: Users, title: "La Communauté", desc: "Une famille spirituelle unie, locale et internationale." },
];

const APropos = () => {
  return (
    <div className="pt-20">
      {/* Bandeau d'en-tête */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <img src={logo} alt="MIEDA" className="h-20 w-auto mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">À Propos de MIEDA</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Mission Internationale d'Évangélisation et de Délivrance des Âmes —
            au service de Dieu et du développement de l'Afrique.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Notre Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Proclamer l'Évangile de Jésus-Christ, conduire les âmes à la
                délivrance et à la restauration, et contribuer au développement
                spirituel, humain et social de l'Afrique par la puissance de la
                Parole de Dieu.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Notre Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                Voir des vies transformées par l'amour de Christ, des familles
                restaurées et des nations impactées par l'Évangile, en formant des
                disciples affermis dans la foi et engagés au service de Dieu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Le Fondateur */}
      <section className="py-20 bg-[var(--section-bg)]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Le Fondateur
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Révérend Docteur Prophète Djeha Kouadio
            </h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Serviteur de Dieu et fondateur de MIEDA, le Révérend Docteur Prophète
              Djeha Kouadio consacre sa vie à l'annonce de l'Évangile, à
              l'enseignement de la Parole et à la délivrance des âmes. Sous sa
              direction, la mission s'étend depuis Yamoussoukro, en Côte d'Ivoire,
              vers de nombreuses nations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {/* ✏️ MIEDA : remplacez ce paragraphe par la biographie officielle du fondateur. */}
              Son ministère est marqué par un profond attachement à la vérité
              biblique, à la prière et à l'accompagnement des fidèles dans leur
              marche avec Dieu.
            </p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Nos Valeurs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Les fondements qui guident notre mission au quotidien.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valeurs.map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default APropos;
