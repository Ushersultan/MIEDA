import { MapPin, Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";

const Experience = () => {
  const { t } = useLang();
  const experiences = [
    {
      icon: MapPin,
      title: t("accueil.lieux.titre"),
      description: t("accueil.lieux.desc"),
      cta: t("accueil.lieux.cta"),
      to: "/lieux-de-cultes",
    },
    {
      icon: Monitor,
      title: t("accueil.ligne.titre"),
      description: t("accueil.ligne.desc"),
      cta: t("accueil.ligne.cta"),
      to: "/cultes#culte-en-ligne",
    },
    {
      icon: Users,
      title: t("accueil.dept.titre"),
      description: t("accueil.dept.desc"),
      cta: t("accueil.dept.cta"),
      to: "/departements",
    },
  ];

  return (
    <section className="py-24 bg-[var(--section-bg)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
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
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-scale-in bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <exp.icon className="w-8 h-8 text-primary" />
                </div>
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
