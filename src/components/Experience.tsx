import { MapPin, Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Experience = () => {
  const experiences = [
    {
      icon: MapPin,
      title: "Nos Lieux de Cultes",
      description: "Découvrez les églises MIEDA à travers le monde, leurs pasteurs et leurs coordonnées.",
      cta: "Voir nos églises",
      to: "/lieux-de-cultes",
    },
    {
      icon: Monitor,
      title: "Culte en Ligne",
      description: "Rejoignez la communauté MIEDA Diaspora en direct sur Zoom, partout dans le monde.",
      cta: "Voir les horaires",
      to: "/cultes#culte-en-ligne",
    },
    {
      icon: Users,
      title: "Nos Départements",
      description: "Engagez-vous dans l'un de nos ministères et grandissez au service de Dieu.",
      cta: "Découvrir",
      to: "/departements",
    },
  ];

  return (
    <section className="py-24 bg-[var(--section-bg)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trouvez l'expérience qui vous convient
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Peu importe où vous êtes, en ligne ou en personne, faites partie de tout ce que Dieu fait.
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
