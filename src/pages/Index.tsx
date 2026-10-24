import { Link } from "react-router-dom";
import { Calendar, Building2, Lightbulb, Radio, ArrowRight } from "lucide-react";
import MessageProphetique from "@/components/MessageProphetique";
import Hero from "@/components/Hero";
import { useLang } from "@/contexts/LanguageContext";
import Experience from "@/components/Experience";
import Offering from "@/components/Offering";
import Reveal from "@/components/Reveal";
import FeaturedClip from "@/components/FeaturedClip";

const buildExplorer = (t: (k: string) => string) => [
  { icon: Radio, title: t("accueil.explorer.cultes"), desc: t("accueil.explorer.cultes.desc"), to: "/cultes", color: "text-primary", bg: "bg-primary/10" },
  { icon: Calendar, title: t("accueil.explorer.event"), desc: t("accueil.explorer.event.desc"), to: "/evenements", color: "text-accent", bg: "bg-accent/10" },
  { icon: Building2, title: t("accueil.explorer.dept"), desc: t("accueil.explorer.dept.desc"), to: "/departements", color: "text-primary", bg: "bg-primary/10" },
  { icon: Lightbulb, title: t("accueil.explorer.projets"), desc: t("accueil.explorer.projets.desc"), to: "/projets", color: "text-accent", bg: "bg-accent/10" },
];

const Index = () => {
  const { t, lang } = useLang();
  const explorer = buildExplorer(t);
  return (
    <div className="mieda-home">
      <Hero />
      <MessageProphetique embedded />
      <Reveal>
        <Experience />
      </Reveal>

      <Reveal>
        <FeaturedClip />
      </Reveal>

      {/* Explorer le site */}
      <section className="bg-[#f8f6f0] py-20 text-[#142c43] sm:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="mb-12">
            <h2 className="home-editorial-title mb-4 text-4xl sm:text-5xl">
              {t("accueil.explorer.titre")}
            </h2>
            <p className="max-w-xl text-base leading-7 text-[#657580]">
              {t("accueil.explorer.sous")}
            </p>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#dde3da] bg-[#dde3da] sm:grid-cols-2">
            {explorer.map((item, i) => (
              <Reveal key={item.title} direction="up" delay={i * 90}>
              <Link
                to={item.to}
                className="group flex h-full items-start gap-5 bg-[#f8f6f0] p-7 transition-colors hover:bg-white sm:p-9"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-[#142c43]">{item.title}</h3>
                  <p className="text-sm leading-7 text-[#657580]">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf0e8] py-16 text-[#142c43]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
          <div><p className="home-eyebrow mb-3">{lang === "en" ? "Every gesture matters" : "Chaque geste compte"}</p><h2 className="home-editorial-title text-3xl sm:text-4xl">{lang === "en" ? "Together, let us share hope." : "Ensemble, faisons grandir l’espérance."}</h2></div>
          <a href="#offrandes" className="home-primary-link shrink-0">{lang === "en" ? "Make a donation" : "Faire un don"}<ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
      {/* Dons / Offrandes */}
      <Reveal>
        <Offering />
      </Reveal>
    </div>
  );
};

export default Index;
