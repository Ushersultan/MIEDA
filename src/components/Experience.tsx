import { MapPin, Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import heroWorship from "@/assets/hero-worship.jpg";
import communityConnect from "@/assets/community-connect.jpg";
import papa from "@/assets/Papa.jpeg";

const Experience = () => {
  const { t } = useLang();
  const experiences = [
    {
      icon: MapPin,
      title: t("accueil.lieux.titre"),
      description: t("accueil.lieux.desc"),
      cta: t("accueil.lieux.cta"),
      to: "/lieux-de-cultes",
      image: heroWorship,
      imageAlt: "Assemblée MIEDA en adoration",
    },
    {
      icon: Monitor,
      title: t("accueil.ligne.titre"),
      description: t("accueil.ligne.desc"),
      cta: t("accueil.ligne.cta"),
      to: "/cultes#culte-en-ligne",
      image: papa,
      imageAlt: "Révérend Docteur Prophète DJEHA Kouadio",
    },
    {
      icon: Users,
      title: t("accueil.dept.titre"),
      description: t("accueil.dept.desc"),
      cta: t("accueil.dept.cta"),
      to: "/departements",
      image: communityConnect,
      imageAlt: "Communauté et départements MIEDA",
    },
  ];

  return (
    <section className="py-24 bg-[var(--section-bg)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-gradient">
            {t("accueil.experience.titre")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("accueil.experience.sous")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {experiences.map((exp, index) => (
            <Card
              key={exp.title}
              className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-scale-in bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={exp.image}
                  alt={exp.imageAlt}
                  loading="lazy"
                  className="experience-card-media h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/95 shadow-lg">
                  <exp.icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-foreground">{exp.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {exp.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground"
                  asChild
                >
                  <Link to={exp.to}>{exp.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
