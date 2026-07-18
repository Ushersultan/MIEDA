import { useMemo, useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Youtube, Facebook, Instagram, Video,
  ChevronDown, ExternalLink, Globe2, Users, Church, Search, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { eglises, ordreRegions, type Eglise, type Pasteur } from "@/data/eglises";
import { lienServiteur } from "@/lib/serviteurs";
import { useLang } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// ── Textes bilingues de la page ──
const TXT = {
  fr: {
    presence: "Présence mondiale",
    titre: "Nos Lieux de Cultes",
    sous: "La MIEDA rassemble des fidèles à travers le monde. Trouvez l'église la plus proche, son pasteur et ses moyens de communication.",
    eglises: "Églises", serviteurs: "Serviteurs", pays: "Pays",
    recherche: "Rechercher une église, une ville, un pasteur...",
    aucune: "Aucune église trouvée pour",
    region: "Région",
    internationale: "MIEDA Internationale",
    fiche: "Voir la fiche de",
    equipe: "Équipe pastorale",
    chaine: "Voir les cultes en direct / la chaîne",
    implanter: "Vous souhaitez implanter une église MIEDA ?",
    implanterSous: "Contactez-nous pour rejoindre la mission et ouvrir un lieu de culte dans votre ville.",
    contacter: "Nous contacter",
    siege: "Siège",
  },
  en: {
    presence: "Worldwide presence",
    titre: "Our Places of Worship",
    sous: "The MIEDA mission gathers believers across the world. Find the nearest church, its pastor and how to reach them.",
    eglises: "Churches", serviteurs: "Servants", pays: "Countries",
    recherche: "Search for a church, a city, a pastor...",
    aucune: "No church found for",
    region: "Region",
    internationale: "MIEDA International",
    fiche: "View the profile of",
    equipe: "Pastoral team",
    chaine: "Watch live services / the channel",
    implanter: "Would you like to plant a MIEDA church?",
    implanterSous: "Contact us to join the mission and open a place of worship in your city.",
    contacter: "Contact us",
    siege: "HQ",
  },
};

// ── Afficher les numéros de téléphone des serviteurs ? ──
// Passez à false pour masquer tous les contacts sur le site public.
const AFFICHER_CONTACTS = true;

// ── Icône TikTok (SVG sur mesure, absente de lucide) ──
const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5.6 20.87a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.64-.27z" />
  </svg>
);

// ── Avatar : photo ou initiales ──
const getInitials = (nom: string) => {
  const clean = nom.replace(/^(Révérend|Rév\.|Docteur|Dr\.?|Pasteure?|Prophète|Évangéliste|Evangéliste|Apôtre|Mme|M\.)\s*/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
};

const Avatar = ({ nom, photo }: { nom: string; photo?: string }) => {
  if (photo) {
    return (
      <img src={photo} alt={nom}
        className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20" />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
      {getInitials(nom)}
    </div>
  );
};

// ── Liens réseaux ──
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
        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center transition-colors hover:text-white ${l.color}`}
          aria-label={l.label}>
          <l.icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
};

// ── Ligne serviteur (équipe) ──
const ServiteurRow = ({ p, eglise }: { p: Pasteur; eglise: Eglise }) => (
  <div className="flex items-center gap-3 py-2">
    <Link to={lienServiteur(eglise, p)} className="flex items-center gap-3 min-w-0 flex-1 group">
      <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground font-semibold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {getInitials(p.nom)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">{p.nom}</p>
        {p.titre && <p className="text-xs text-muted-foreground">{p.titre}</p>}
      </div>
    </Link>
    {AFFICHER_CONTACTS && p.telephone && (
      <a href={`tel:${p.telephone.replace(/[^+\d]/g, "")}`}
         className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0">
        <Phone className="w-3 h-3" />
        {p.telephone}
      </a>
    )}
  </div>
);

// ── Carte d'une église (dépliable) ──
const EgliseCard = ({ eglise, L, photo }: { eglise: Eglise; L: typeof TXT.fr; photo?: string }) => {
  const [open, setOpen] = useState(false);
  const hasDetails = Boolean(
    eglise.adresse || (AFFICHER_CONTACTS && (eglise.pasteur.telephone || eglise.pasteur.email)) ||
    eglise.media?.youtubeVideoId || eglise.media?.youtubeChannel ||
    (eglise.equipe && eglise.equipe.length > 0)
  );
  const mapsLink = eglise.adresse
    ? `https://www.google.com/maps/search/${encodeURIComponent(eglise.adresse)}`
    : undefined;

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden transition-all ${
      eglise.estSiege ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
    }`}>
      <button
        onClick={() => hasDetails && setOpen(!open)}
        className={`w-full text-left p-5 flex items-start gap-4 ${hasDetails ? "cursor-pointer hover:bg-muted/40" : "cursor-default"} transition-colors`}
      >
        <Avatar nom={eglise.pasteur.nom} photo={eglise.pasteur.photo ?? photo} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-base leading-tight">{eglise.nom}</h3>
            {eglise.estSiege && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {L.siege}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
            <span className="text-base leading-none">{eglise.drapeau}</span>
            {eglise.ville !== eglise.pays ? `${eglise.ville}, ${eglise.pays}` : eglise.pays}
          </p>
          <p className="text-sm font-medium text-foreground">{eglise.pasteur.nom}</p>
          {eglise.pasteur.titre && (
            <p className="text-xs text-muted-foreground">{eglise.pasteur.titre}</p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SocialLinks eglise={eglise} />
              {eglise.equipe && eglise.equipe.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  +{eglise.equipe.length}
                </span>
              )}
            </div>
            {hasDetails && (
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            )}
          </div>
        </div>
      </button>

      {open && hasDetails && (
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">
          {/* Lien vers la fiche du serviteur principal */}
          <div className="pt-3">
            <Link to={lienServiteur(eglise, eglise.pasteur)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {L.fiche} {eglise.pasteur.nom}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Coordonnées du principal */}
          <div className="space-y-2">
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
            {AFFICHER_CONTACTS && eglise.pasteur.telephone && (
              <a href={`tel:${eglise.pasteur.telephone.replace(/[^+\d]/g, "")}`}
                 className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                {eglise.pasteur.telephone}
              </a>
            )}
            {AFFICHER_CONTACTS && eglise.pasteur.email && (
              <a href={`mailto:${eglise.pasteur.email}`}
                 className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                {eglise.pasteur.email}
              </a>
            )}
          </div>

          {/* Équipe pastorale */}
          {eglise.equipe && eglise.equipe.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {L.equipe}
              </p>
              <div className="divide-y divide-border">
                {eglise.equipe.map((p) => (
                  <ServiteurRow key={p.nom} p={p} eglise={eglise} />
                ))}
              </div>
            </div>
          )}

          {/* Espace audiovisuel */}
          {eglise.media?.youtubeVideoId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${eglise.media.youtubeVideoId}`}
                className="w-full h-full" allowFullScreen
                allow="autoplay; encrypted-media" title={`Vidéo ${eglise.nom}`} />
            </div>
          )}
          {eglise.media?.youtubeChannel && (
            <a href={eglise.media.youtubeChannel} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                {L.chaine}
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
  const { lang } = useLang();
  const L = TXT[lang];
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    supabase.rpc("photos_pasteurs").then(({ data }) => {
      if (data) setPhotos(new Map(data.map((r: any) => [r.eglise_id, r.photo_url])));
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eglises;
    return eglises.filter((e) =>
      [e.nom, e.ville, e.pays, e.region ?? "", e.pasteur.nom,
       ...(e.equipe?.map((p) => p.nom) ?? [])]
        .join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const nbPays = new Set(eglises.map((e) => e.pays)).size;
  const nbServiteurs = eglises.reduce((n, e) => n + 1 + (e.equipe?.length ?? 0), 0);

  // Côte d'Ivoire par région
  const civParRegion = useMemo(() => {
    const civ = filtered.filter((e) => e.pays === "Côte d'Ivoire");
    return ordreRegions
      .map((r) => ({ region: r, liste: civ.filter((e) => e.region === r) }))
      .filter((g) => g.liste.length > 0);
  }, [filtered]);

  // International (hors Côte d'Ivoire)
  const international = useMemo(
    () => filtered.filter((e) => e.pays !== "Côte d'Ivoire"),
    [filtered]
  );

  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-5 backdrop-blur-sm">
            <Globe2 className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">{L.presence}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{L.titre}</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
            {L.sous}
          </p>

          {/* Statistiques */}
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[110px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Church className="w-5 h-5" />
                <span className="text-3xl font-bold">{eglises.length}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70">{L.eglises}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[110px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-3xl font-bold">{nbServiteurs}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70">{L.serviteurs}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[110px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Globe2 className="w-5 h-5" />
                <span className="text-3xl font-bold">{nbPays}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70">{L.pays}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-14 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Recherche */}
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L.recherche}
              className="w-full pl-12 pr-11 py-3.5 rounded-2xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Effacer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-10">
              {L.aucune} « {query} ».
            </p>
          )}

          {/* Côte d'Ivoire */}
          {civParRegion.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🇨🇮</span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Côte d'Ivoire</h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              {civParRegion.map(({ region, liste }) => (
                <div key={region} className="mb-10 last:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-primary">{L.region} {region}</h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {liste.length}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {liste.map((eglise) => (
                      <EgliseCard key={eglise.id} eglise={eglise} L={L} photo={photos.get(eglise.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* International */}
          {international.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <Globe2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{L.internationale}</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {international.map((eglise) => (
                  <EgliseCard key={eglise.id} eglise={eglise} L={L} photo={photos.get(eglise.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Appel à rejoindre */}
          <div className="mt-4 text-center bg-[var(--section-bg)] rounded-2xl p-8 md:p-10">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {L.implanter}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              {L.implanterSous}
            </p>
            <a href="/contact">
              <Button size="lg">{L.contacter}</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LieuxDeCultes;
