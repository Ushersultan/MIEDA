import { Link } from "react-router-dom";
import { Calendar, Building2, Lightbulb, Radio, ArrowRight } from "lucide-react";
import Hero from "@/components/Hero";
import { useLang } from "@/contexts/LanguageContext";
import Experience from "@/components/Experience";
import Offering from "@/components/Offering";

const buildExplorer = (t: (k: string) => string) => [
  { icon: Radio, title: t("accueil.explorer.cultes"), desc: t("accueil.explorer.cultes.desc"), to: "/cultes", color: "text-primary", bg: "bg-primary/10" },
  { icon: Calendar, title: t("accueil.explorer.event"), desc: t("accueil.explorer.event.desc"), to: "/evenements", color: "text-accent", bg: "bg-accent/10" },
  { icon: Building2, title: t("accueil.explorer.dept"), desc: t("accueil.explorer.dept.desc"), to: "/departements", color: "text-primary", bg: "bg-primary/10" },
  { icon: Lightbulb, title: t("accueil.explorer.projets"), desc: t("accueil.explorer.projets.desc"), to: "/projets", color: "text-accent", bg: "bg-accent/10" },
];

const Index = () => {
  const { t } = useLang();
  const explorer = buildExplorer(t);
  return (
    <>
      <Hero />
      <Experience />

      {/* Explorer le site */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("accueil.explorer.titre")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("accueil.explorer.sous")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {explorer.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group flex items-center gap-5 bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dons / Offrandes */}
      <Offering />
    </>
  );
};

export default Index;
