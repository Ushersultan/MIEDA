import { useEffect, useState } from "react";
import { Play, Radio, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

// ══════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════
const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? "";
const CHANNEL_HANDLE = "VsdCommunicationMIEDA";
const MAX_VIDEOS = 9;

// ── Types ──
interface YTVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

// ── Utilitaires ──
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

async function ytFetch(endpoint: string, params: Record<string, string>) {
  const url = new URL("https://www.googleapis.com/youtube/v3/" + endpoint);
  url.search = new URLSearchParams({ key: YT_API_KEY, ...params }).toString();
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("YouTube API error: " + r.status);
  return r.json();
}

async function resolveChannelId(): Promise<string> {
  const data = await ytFetch("search", {
    part: "snippet",
    type: "channel",
    q: CHANNEL_HANDLE,
    maxResults: "1",
  });
  if (!data.items?.length) throw new Error("Chaîne introuvable");
  return data.items[0].snippet.channelId;
}

// ══════════════════════════════════════════════
//  COMPOSANT MODAL
// ══════════════════════════════════════════════
const VideoModal = ({
  videoId,
  title,
  onClose,
}: {
  videoId: string;
  title: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground line-clamp-1 pr-4">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none flex-shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════
const Sermons = () => {
  const [liveVideo, setLiveVideo] = useState<YTVideo | null>(null);
  const [latestVideo, setLatestVideo] = useState<YTVideo | null>(null);
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"latest" | "grid">("latest");

  useEffect(() => {
    if (YT_API_KEY === "VOTRE_CLE_API") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const channelId = await resolveChannelId();

        const [liveData, videosData] = await Promise.all([
          ytFetch("search", {
            part: "snippet",
            channelId,
            eventType: "live",
            type: "video",
            maxResults: "1",
          }),
          ytFetch("search", {
            part: "snippet",
            channelId,
            order: "date",
            type: "video",
            maxResults: String(MAX_VIDEOS + 1),
          }),
        ]);

        const toVideo = (item: any): YTVideo => ({
          id: item.id.videoId,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
        });

        if (liveData.items?.length) {
          setLiveVideo(toVideo(liveData.items[0]));
        }

        if (videosData.items?.length) {
          const all: YTVideo[] = videosData.items.map(toVideo);
          setLatestVideo(all[0]);
          setVideos(all.slice(1, MAX_VIDEOS));
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const noApiKey = !YT_API_KEY;

  return (
    <section id="sermons" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* ── En-tête de section ── */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              Médias &amp; Cultes
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            La Parole Transforme les Vies
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Révérend Docteur Prophète Djeha Kouadio — Rejoignez-nous chaque
            semaine pour des enseignements inspirants et puissants.
          </p>
        </div>

        {/* ── Bandeau LIVE ── */}
        {liveVideo && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                En direct maintenant
              </span>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-red-600/60">
              <iframe
                src={`https://www.youtube.com/embed/${liveVideo.id}?autoplay=0`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={liveVideo.title}
              />
            </div>
            <p className="mt-3 font-medium text-foreground">{liveVideo.title}</p>
          </div>
        )}

        {/* ── Onglets ── */}
        {!noApiKey && (
          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("latest")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "latest"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Dernier sermon
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "grid"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Tous les cultes
            </button>
          </div>
        )}

        {/* ── Mode sans clé API ── */}
        {noApiKey && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed?listType=user_uploads&list=VsdCommunicationMIEDA"
                  title="MIEDA Cultes"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-50" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent rounded-full blur-3xl opacity-50" />
            </div>
            <div>
              <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-6">
                <span className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Culte en direct
                </span>
              </div>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Suivez nos cultes en direct et retrouvez tous nos sermons sur
                notre chaîne YouTube. Ajoutez votre clé API YouTube pour activer
                le chargement automatique des vidéos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.youtube.com/@VsdCommunicationMIEDA/streams"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="text-lg px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Regarder le Message
                  </Button>
                </a>
                <a
                  href="https://www.youtube.com/@VsdCommunicationMIEDA"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Voir Tous les Messages
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Chargement ── */}
        {loading && !noApiKey && (
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl bg-muted animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-muted animate-pulse aspect-video" />
              ))}
            </div>
          </div>
        )}

        {/* ── Erreur ── */}
        {error && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">Impossible de charger les vidéos YouTube.</p>
            <a
              href="https://www.youtube.com/@VsdCommunicationMIEDA"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Youtube className="w-4 h-4 mr-2" />
                Voir la chaîne directement
              </Button>
            </a>
          </div>
        )}

        {/* ── Dernier sermon ── */}
        {!loading && !error && !noApiKey && activeTab === "latest" && latestVideo && (
          <div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${latestVideo.id}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={latestVideo.title}
              />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{latestVideo.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(latestVideo.publishedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Grille ── */}
        {!loading && !error && !noApiKey && activeTab === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setModal({ id: v.id, title: v.title })}
                className="group text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {v.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {formatDate(v.publishedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Lien chaîne ── */}
        {!noApiKey && !loading && (
          <div className="text-center mt-10">
            <a
              href="https://www.youtube.com/@VsdCommunicationMIEDA"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                <Youtube className="w-5 h-5 mr-2" />
                Voir toute la chaîne MIEDA
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <VideoModal
          videoId={modal.id}
          title={modal.title}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
};

export default Sermons;
