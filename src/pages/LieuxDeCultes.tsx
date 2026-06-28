import { useState } from "react";
import {
  MapPin, Phone, Mail, Youtube, Facebook, Instagram, Video,
  ChevronDown, ExternalLink, Globe2, Users, Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { eglises, ordreContinents, type Eglise } from "@/data/eglises";

// ── Icône TikTok (SVG sur mesure, absente de lucide) ──
const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5.6 20.87a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.64-.27z" />
  </svg>
);

// ── Avatar : photo ou initiales ──
const getInitials = (nom: string) => {
  const clean = nom.replace(/^(Rév\.|Dr\.|Pasteur|Prophète|Mme|M\.)\s*/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
};

const Avatar = ({ nom, photo, large = false }: { nom: string; photo?: string; large?: boolean }) => {
  const size = large ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg";
  if (photo) {
    return (
      <img src={photo} alt={nom}
        className={`${size} rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20`} />
    );
  }
  return (
    <div className={`${size} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20`}>
      {getInitials(nom)}
    </div>
  );
};

// ── Liens réseaux d'une église ──
const SocialLinks = ({ eglise }: { eglise: Eglise }) => {
  const r = eglise.reseaux;
  if (!r) return null;
  const links = [
    { url: r.facebook, icon: Facebook, label: "Facebook", color: "hover:bg-blue-600" },
    { url: r.youtube, icon: Youtube, label: "YouTube", color: "hover:bg-red-600" },
    { url: r.tiktok, icon: TikTokIcon, label: "TikTok", color: "hover:bg-black" },
    { url: r.instagram, icon: Instagram, label: "Instagram", color: "hover:bg-pink-600" },
  ].filter((l) => l.url);

  if (!links.length) return null;

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center transition-colors hover:text-white ${l.color}`}
          aria-label={l.label}
        >
          <l.icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
};

// ── Carte d'une église (dépliable) ──
const EgliseCard = ({ eglise }: { eglise: Eglise }) => {
  const [open, setOpen] = useState(false);
  const hasDetails =
    eglise.adresse || eglise.pasteur.telephone || eglise.pasteur.email ||
    eglise.media?.youtubeVideoId || eglise.media?.youtubeChannel;

  const mapsLink = eglise.adresse
    ? `https://www.google.com/maps/search/${encodeURIComponent(eglise.adresse)}`
    : undefined;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        eglise.estSiege ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      {/* En-tête cliquable */}
      <button
        onClick={() => hasDetails && setOpen(!open)}
        className={`w-full text-left p-5 flex items-start gap-4 ${hasDetails ? "cursor-pointer hover:bg-muted/40" : "cursor-default"} transition-colors`}
      >
        <Avatar nom={eglise.pasteur.nom} photo={eglise.pasteur.photo} />

        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">{eglise.nom}</h3>
            {eglise.estSiege && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                Siège
              </span>
            )}
            {eglise.exemple && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/40 text-secondary-foreground">
                Exemple
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
            <span className="text-base leading-none">{eglise.drapeau}</span>
            {eglise.ville}, {eglise.pays}
          </p>

          <p className="text-sm font-medium text-foreground">{eglise.pasteur.nom}</p>
          {eglise.pasteur.titre && (
            <p className="text-xs text-muted-foreground">{eglise.pasteur.titre}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <SocialLinks eglise={eglise} />
            {hasDetails && (
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
              />
            )}
          </div>
        </div>
      </button>

      {/* Détails dépliés */}
      {open && hasDetails && (
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">
          {/* Coordonnées */}
          <div className="space-y-2 pt-3">
            {eglise.adresse && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                 className="flex items-start gap-2 text-sm text-foreground hover:text-primary transition-colors group">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{eglise.adresse}
                  <span className="inline-flex items-center gap-1 text-primary ml-1 group-hover:underline">
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </span>
              </a>
            )}
            {eglise.pasteur.telephone && (
              <a href={`tel:${eglise.pasteur.telephone}`}
                 className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                {eglise.pasteur.telephone}
              </a>
            )}
            {eglise.pasteur.email && (
              <a href={`mailto:${eglise.pasteur.email}`}
                 className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                {eglise.pasteur.email}
              </a>
            )}
          </div>

          {/* Espace audiovisuel */}
          {eglise.media?.youtubeVideoId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${eglise.media.youtubeVideoId}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={`Vidéo ${eglise.nom}`}
              />
            </div>
          )}

          {eglise.media?.youtubeChannel && (
            <a href={eglise.media.youtubeChannel} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                Voir les cultes en direct / la chaîne
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page principale ──
const LieuxDeCultes = () => {
  const nbPays = new Set(eglises.map((e) => e.pays)).size;
  const nbEglises = eglises.length;

  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-5 backdrop-blur-sm">
            <Globe2 className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Présence mondiale</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Lieux de Cultes</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
            La mission MIEDA rassemble des fidèles à travers le monde. Trouvez
            l'église la plus proche, son pasteur et ses moyens de communication.
          </p>

          {/* Statistiques */}
          <div className="flex justify-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Church className="w-5 h-5" />
                <span className="text-3xl font-bold">{nbEglises}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70">Églises</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Globe2 className="w-5 h-5" />
                <span className="text-3xl font-bold">{nbPays}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70">Pays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Églises par continent */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {ordreContinents.map((continent) => {
            const liste = eglises.filter((e) => e.continent === continent);
            if (!liste.length) return null;

            return (
              <div key={continent} className="mb-14 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{continent}</h2>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {liste.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {liste.map((eglise) => (
                    <EgliseCard key={eglise.id} eglise={eglise} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Appel à rejoindre */}
          <div className="mt-16 text-center bg-[var(--section-bg)] rounded-2xl p-8 md:p-10">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Vous souhaitez implanter une église MIEDA ?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Contactez-nous pour rejoindre la mission et ouvrir un lieu de culte
              dans votre ville.
            </p>
            <a href="/contact">
              <Button size="lg">Nous contacter</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LieuxDeCultes;
