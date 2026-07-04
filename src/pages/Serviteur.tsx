import { useParams, Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, ArrowLeft, Church, Users, Youtube, Facebook, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trouverServiteur, lienServiteur } from "@/lib/serviteurs";

const getInitials = (nom: string) => {
  const clean = nom.replace(/^(Révérend|Rév\.|Docteur|Dr\.?|Pasteure?|Prophète|Évangéliste|Evangéliste|Apôtre|Mme|M\.)\s*/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
};

const Serviteur = () => {
  const { egliseId = "", slug = "" } = useParams();
  const res = trouverServiteur(egliseId, slug);

  if (!res) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p className="text-muted-foreground mb-6">Serviteur introuvable.</p>
        <Link to="/lieux-de-cultes">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux lieux de cultes
          </Button>
        </Link>
      </div>
    );
  }

  const { pasteur, eglise, estPrincipal } = res;

  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-14 md:py-16" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/lieux-de-cultes"
            className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium mb-8">
            <ArrowLeft className="w-4 h-4" /> Nos Lieux de Cultes
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {pasteur.photo ? (
              <img src={pasteur.photo} alt={pasteur.nom}
                className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-white/15 backdrop-blur-sm ring-4 ring-white/30 flex items-center justify-center text-4xl font-bold shadow-xl">
                {getInitials(pasteur.nom)}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{pasteur.nom}</h1>
              {pasteur.titre && <p className="text-white/85 text-lg">{pasteur.titre}</p>}
              {estPrincipal && (
                <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  Responsable de l'église
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-[1fr_320px] gap-8">

          {/* Colonne principale */}
          <div className="space-y-6">
            {/* Coordonnées */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Coordonnées</h2>
              <div className="space-y-3">
                {pasteur.telephone && (
                  <a href={`tel:${pasteur.telephone.replace(/[^+\d]/g, "")}`}
                     className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    {pasteur.telephone}
                  </a>
                )}
                {pasteur.email && (
                  <a href={`mailto:${pasteur.email}`}
                     className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    {pasteur.email}
                  </a>
                )}
                {!pasteur.telephone && !pasteur.email && (
                  <p className="text-sm text-muted-foreground">
                    Contactez ce serviteur via son église.
                  </p>
                )}
              </div>
            </div>

            {/* Médias de l'église */}
            {(eglise.media?.youtubeChannel || eglise.reseaux) && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Suivre les cultes</h2>
                <div className="flex flex-wrap gap-3">
                  {eglise.media?.youtubeChannel && (
                    <a href={eglise.media.youtubeChannel} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-2" /> Chaîne YouTube
                      </Button>
                    </a>
                  )}
                  {eglise.reseaux?.facebook && (
                    <a href={eglise.reseaux.facebook} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Facebook className="w-4 h-4 mr-2" /> Facebook
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne église */}
          <aside className="space-y-4">
            <div className="bg-[var(--section-bg)] border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Church className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Église</p>
              </div>
              <p className="font-semibold text-foreground mb-1">{eglise.nom}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
                <span>{eglise.drapeau}</span>
                {eglise.ville !== eglise.pays ? `${eglise.ville}, ${eglise.pays}` : eglise.pays}
              </p>
              {eglise.region && (
                <p className="text-xs text-muted-foreground mb-4">Région {eglise.region}</p>
              )}
              <Link to="/lieux-de-cultes">
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" /> Voir sur la page des églises
                </Button>
              </Link>
            </div>

            {/* Équipe */}
            {(eglise.equipe?.length || !estPrincipal) && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Équipe pastorale
                  </p>
                </div>
                <div className="space-y-1">
                  {[eglise.pasteur, ...(eglise.equipe ?? [])].map((p) => (
                    <Link key={p.nom} to={lienServiteur(eglise, p)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        p.nom === pasteur.nom
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}>
                      {p.nom}
                      {p.titre && <span className="block text-xs text-muted-foreground">{p.titre}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Serviteur;
