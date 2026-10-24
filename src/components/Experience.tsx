import { ArrowUpRight, MapPin, Monitor, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import heroWorship from "@/assets/hero-worship.jpg";
import communityConnect from "@/assets/community-connect.jpg";
import papa from "@/assets/Papa.jpeg";

const Experience = () => {
  const { t, lang } = useLang();
  const en = lang === "en";
  const experiences = [
    { icon: MapPin, title: t("accueil.lieux.titre"), description: t("accueil.lieux.desc"), cta: t("accueil.lieux.cta"), to: "/lieux-de-cultes", image: heroWorship, alt: en ? "Worship gathering" : "Assemblée en adoration" },
    { icon: Monitor, title: t("accueil.ligne.titre"), description: t("accueil.ligne.desc"), cta: t("accueil.ligne.cta"), to: "/cultes#culte-en-ligne", image: papa, alt: "Révérend Docteur Prophète DJEHA Kouadio" },
    { icon: Users, title: t("accueil.dept.titre"), description: t("accueil.dept.desc"), cta: t("accueil.dept.cta"), to: "/departements", image: communityConnect, alt: en ? "Life in our community" : "Vie de notre communauté" },
  ];
  return (
    <section id="decouvrir" className="scroll-mt-24 bg-white py-20 text-[#142c43] sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="home-eyebrow mb-4">{en ? "Together, in faith" : "Ensemble, dans la foi"}</p><h2 className="home-editorial-title max-w-xl text-4xl leading-[1.12] sm:text-5xl">{en ? "Find your place.\nLive your faith." : "Trouvez votre place.\nVivez votre foi."}</h2></div>
          <p className="max-w-sm text-sm leading-7 text-[#657580]">{t("accueil.experience.sous")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {experiences.map((exp, index) => (
            <Link key={exp.to} to={exp.to} className="group flex flex-col overflow-hidden rounded-[1.6rem] border border-[#e4e7e3] bg-[#fafbf8] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35756c]">
              <div className="relative aspect-[4/3] overflow-hidden"><img src={exp.image} alt={exp.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold tracking-widest">0{index + 1}</span></div>
              <div className="flex flex-1 flex-col p-6 sm:p-7"><exp.icon className="mb-5 h-6 w-6 text-[#35756c]" /><h3 className="text-xl font-semibold tracking-tight">{exp.title}</h3><p className="mb-7 mt-3 text-sm leading-7 text-[#657580]">{exp.description}</p><span className="mt-auto flex items-center justify-between border-t border-[#142c43]/10 pt-5 text-sm font-semibold">{exp.cta}<ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Experience;
