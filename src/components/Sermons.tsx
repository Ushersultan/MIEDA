import { useEffect, useState, useMemo } from "react";
import {
  Play, Radio, Youtube, MapPin, Baby, Globe, Clock, Video,
  ExternalLink, Calendar, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ══════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════
const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? "";
const CHANNEL_HANDLE = "VsdCommunicationMIEDA";
const MAX_VIDEOS = 9;

// ── Liens des cultes ──
const YOUTUBE_LIVE_URL = "https://www.youtube.com/@VsdCommunicationMIEDA/live";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@VsdCommunicationMIEDA";
const ZOOM_URL =
  "https://us06web.zoom.us/j/83515225605?pwd=dWJFK0hjalJsbFljV3lNb0pLOFM1dz09";
const ZOOM_MEETING_ID = "835 1522 5605";

// ── Lieu Culte Yamoussoukro (Google Maps) ──
// Pour une localisation exacte : Google Maps → Partager → Intégrer une carte,
// puis remplacez la valeur de MAPS_QUERY ci-dessous par votre adresse précise.
const MAPS_QUERY = "2062, Yamoussoukro, Côte d'Ivoire";
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  MAPS_QUERY
)}&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/${encodeURIComponent(
  MAPS_QUERY
)}`;

// ── Heure du culte en ligne : Dimanche 08h00 (Eastern Time) ──
const CULTE_HOUR_ET = 8;
const CULTE_MINUTE_ET = 0;

// ══════════════════════════════════════════════
//  HELPERS FUSEAUX HORAIRES (gère l'heure d'été automatiquement)
// ══════════════════════════════════════════════
function zonedTimeToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number, timeZone: string
): Date {
  const utcGuess = new Date(Date.UTC(year, month, day, hour, minute, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(utcGuess);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const asUtc = Date.UTC(
    +m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second
  );
  const diff = asUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - diff);
}

// Prochain dimanche 08h00 ET (instant UTC précis)
function getNextCulteInstant(): Date {
  const now = Date.now();
  const nyDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const [y, mo, d] = nyDate.split("-").map(Number);
  for (let i = 0; i < 8; i++) {
    const instant = zonedTimeToUtc(y, mo - 1, d + i, CULTE_HOUR_ET, CULTE_MINUTE_ET, "America/New_York");
    const wd = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short",
    }).format(instant);
    if (wd === "Sun" && instant.getTime() >= now) return instant;
  }
  return zonedTimeToUtc(y, mo - 1, d, CULTE_HOUR_ET, CULTE_MINUTE_ET, "America/New_York");
}

const fmtTime = (instant: Date, tz: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(instant);

const fmtFullDay = (instant: Date, tz: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: tz, weekday: "long", day: "numeric", month: "long",
  }).format(instant);

// Villes affichées dans l'horloge mondiale
const WORLD_TZ = [
  { city: "New York", tz: "America/New_York", note: "Heure de référence", flag: "🇺🇸" },
  { city: "Yamoussoukro", tz: "Africa/Abidjan", note: "Côte d'Ivoire", flag: "🇨🇮" },
  { city: "Paris", tz: "Europe/Paris", note: "France", flag: "🇫🇷" },
  { city: "Londres", tz: "Europe/London", note: "Royaume-Uni", flag: "🇬🇧" },
  { city: "Kinshasa", tz: "Africa/Kinshasa", note: "RD Congo", flag: "🇨🇩" },
  { city: "Montréal", tz: "America/Toronto", note: "Canada", flag: "🇨🇦" },
  { city: "Chicago", tz: "America/Chicago", note: "Centre US / Texas", flag: "🇺🇸" },
  { city: "Los Angeles", tz: "America/Los_Angeles", note: "Ouest US", flag: "🇺🇸" },
];

// ── Types ──
interface YTVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
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
    part: "snippet", type: "channel", q: CHANNEL_HANDLE, maxResults: "1",
  });
  if (!data.items?.length) throw new Error("Chaîne introuvable");
  return data.items[0].snippet.channelId;
}

// ══════════════════════════════════════════════
//  MODAL VIDÉO
// ══════════════════════════════════════════════
const VideoModal = ({
  videoId, title, onClose,
}: { videoId: string; title: string; onClose: () => void }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
          <span className="text-sm font-medium text-foreground line-clamp-1 pr-4">{title}</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none flex-shrink-0"
            aria-label="Fermer"
          >✕</button>
        </div>
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen allow="autoplay; encrypted-media" title={title}
          />
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  SECTION CULTE EN LIGNE (Zoom + horloge mondiale)
// ══════════════════════════════════════════════
const CulteEnLigne = () => {
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextCulte = useMemo(() => getNextCulteInstant(), [Math.floor(now / 60000)]);
  const userTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Compte à rebours
  const diff = nextCulte.getTime() - now;
  const isLive = diff <= 0 && diff > -2 * 3600 * 1000; // fenêtre 2h
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(ZOOM_MEETING_ID.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div id="culte-en-ligne" className="scroll-mt-24 mb-20">
      <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
        {/* En-tête bleu */}
        <div className="p-8 md:p-10 text-white" style={{ background: "var(--hero-gradient)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              MIEDA Diaspora
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-2">Culte en Ligne</h3>
          <p className="text-white/85 max-w-2xl">
            Chaque dimanche, où que vous soyez dans le monde, connectez-vous au
            même instant pour vivre le culte ensemble en direct sur Zoom.
          </p>

          {/* Compte à rebours / Live */}
          <div className="mt-8">
            {isLive ? (
              <div className="inline-flex items-center gap-3 bg-red-600 px-5 py-3 rounded-2xl">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span className="font-bold text-lg">Le culte est en cours — rejoignez maintenant !</span>
              </div>
            ) : (
              <div>
                <p className="text-white/70 text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Prochain culte : {fmtFullDay(nextCulte, userTz)} à {fmtTime(nextCulte, userTz)} (votre heure locale)
                </p>
                <div className="flex gap-3">
                  {[
                    { v: days, l: "Jours" },
                    { v: hours, l: "Heures" },
                    { v: mins, l: "Min" },
                    { v: secs, l: "Sec" },
                  ].map((u) => (
                    <div key={u.l} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[68px]">
                      <div className="text-2xl md:text-3xl font-bold tabular-nums">
                        {String(u.v).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/70 mt-1">{u.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Zoom */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href={ZOOM_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 font-semibold w-full sm:w-auto">
                <Video className="w-5 h-5 mr-2" />
                Rejoindre sur Zoom
              </Button>
            </a>
            <button
              onClick={copyMeetingId}
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-lg px-5 py-2.5 text-sm font-medium backdrop-blur-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              ID : {ZOOM_MEETING_ID}
            </button>
          </div>
        </div>

        {/* Horloge mondiale */}
        <div className="bg-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">
              Heure du culte près de chez vous
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WORLD_TZ.map((z) => {
              const isUser = z.tz === userTz;
              return (
                <div
                  key={z.city}
                  className={`rounded-xl p-4 border transition-colors ${
                    isUser
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base leading-none">{z.flag}</span>
                    <span className="text-sm font-medium text-foreground truncate">{z.city}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {fmtTime(nextCulte, z.tz)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{z.note}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            ⏱️ Les horaires s'ajustent automatiquement à l'heure d'été. Tout le monde
            se connecte au même moment, peu importe le fuseau.
          </p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  SECTION CULTE YAMOUSSOUKRO (Maps + YouTube Live)
// ══════════════════════════════════════════════
const CulteYamoussoukro = () => (
  <div id="culte-yamoussoukro" className="scroll-mt-24 mb-20">
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
      {/* Carte Google Maps */}
      <div className="rounded-3xl overflow-hidden border border-border shadow-lg min-h-[320px] bg-muted">
        <iframe
          src={MAPS_EMBED_URL}
          className="w-full h-full min-h-[320px]"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Lieu du culte MIEDA Yamoussoukro"
        />
      </div>

      {/* Infos */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Siège principal
          </span>
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Culte Yamoussoukro
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Le culte principal de MIEDA, au cœur de Yamoussoukro en Côte d'Ivoire,
          sous la direction du Révérend Docteur Prophète Djeha Kouadio. Rejoignez-nous
          sur place chaque dimanche, ou suivez la retransmission en direct sur YouTube.
        </p>

        <div className="space-y-3 mb-8">
          {/* Dimanche */}
          <div className="flex items-start gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Dimanche — Louange &amp; Adoration</p>
              <p className="text-sm text-muted-foreground">1er culte 06h00–08h20 · 2e culte 08h30–11h00</p>
            </div>
          </div>
          {/* Mercredi */}
          <div className="flex items-start gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Mercredi — Culte de délivrance</p>
              <p className="text-sm text-muted-foreground">09h00–13h00 · dernier mercredi 18h00–21h00</p>
            </div>
          </div>
          {/* Ouverture quotidienne */}
          <div className="flex items-start gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Tous les jours 9h00–11h00</p>
              <p className="text-sm text-muted-foreground">Église ouverte pour assistance et prière</p>
            </div>
          </div>
          {/* Lieu */}
          <div className="flex items-start gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">MIEDA Abla Pokou — Yamoussoukro au Millionaire</p>
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
                 className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Voir l'itinéraire <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a href={YOUTUBE_LIVE_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              <Youtube className="w-5 h-5 mr-2" />
              Direct YouTube du dimanche
            </Button>
          </a>
          <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <MapPin className="w-5 h-5 mr-2" />
              Ouvrir dans Maps
            </Button>
          </a>
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════
//  SECTION CULTE ENFANTS
// ══════════════════════════════════════════════
const CulteEnfants = () => (
  <div id="culte-enfants" className="scroll-mt-24 mb-20">
    <div className="rounded-3xl border border-border bg-accent/5 p-8 md:p-10">
      <div className="flex items-center gap-2 mb-3">
        <Baby className="w-5 h-5 text-accent" />
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">
          Pour les 4 – 12 ans
        </span>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        Culte Enfants
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-2xl mb-6">
        Un espace dédié aux plus jeunes pour découvrir la foi dans la joie :
        enseignements adaptés, chants et activités bibliques pour que chaque
        enfant grandisse dans la connaissance de Dieu.
      </p>
      <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
        <Clock className="w-5 h-5 text-accent" />
        <span className="text-sm font-medium text-foreground">
          Dimanche à 09h00 · Inscription bientôt disponible
        </span>
      </div>
    </div>
  </div>
);

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
    if (!YT_API_KEY) { setLoading(false); return; }

    const load = async () => {
      try {
        const channelId = await resolveChannelId();
        const [liveData, videosData] = await Promise.all([
          ytFetch("search", {
            part: "snippet", channelId, eventType: "live",
            type: "video", maxResults: "1",
          }),
          ytFetch("search", {
            part: "snippet", channelId, order: "date",
            type: "video", maxResults: String(MAX_VIDEOS + 1),
          }),
        ]);

        const toVideo = (item: any): YTVideo => ({
          id: item.id.videoId,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url || "",
        });

        if (liveData.items?.length) setLiveVideo(toVideo(liveData.items[0]));
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

  const summaryCards = [
    { id: "culte-yamoussoukro", icon: MapPin, title: "Culte Yamoussoukro",
      sub: "Siège principal", badge: "Dim. dès 06h",
      badgeC: "bg-primary/10 text-primary", iconBg: "bg-primary/10", iconC: "text-primary" },
    { id: "culte-enfants", icon: Baby, title: "Culte Enfants",
      sub: "Pour les 4–12 ans", badge: "Dim. 09h00",
      badgeC: "bg-accent/10 text-accent", iconBg: "bg-accent/10", iconC: "text-accent" },
    { id: "culte-en-ligne", icon: Globe, title: "Culte en Ligne",
      sub: "MIEDA Diaspora · Zoom", badge: "Dim. 08h00 ET",
      badgeC: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      iconBg: "bg-red-50 dark:bg-red-900/20", iconC: "text-red-600 dark:text-red-400" },
  ];

  return (
    <section id="cultes" className="py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* ── En-tête ── */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Youtube className="w-4 h-4" /> Nos Cultes
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Rejoignez le Culte
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Révérend Docteur Prophète Djeha Kouadio — Sur place, en direct YouTube
            ou en ligne sur Zoom : adorons ensemble, où que vous soyez.
          </p>
        </div>

        {/* ── Cartes résumé ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {summaryCards.map((c) => (
            <a key={c.id} href={`#${c.id}`}
               className="group block bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <c.icon className={`w-6 h-6 ${c.iconC}`} />
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-lg">{c.title}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${c.badgeC}`}>
                  {c.badge}
                </span>
              </div>
              <p className="text-sm text-primary font-medium">{c.sub}</p>
            </a>
          ))}
        </div>

        {/* ── Sections détaillées ── */}
        <CulteYamoussoukro />
        <CulteEnLigne />
        <CulteEnfants />

        {/* ── Médias / Vidéos ── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-border" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Revoir les cultes
          </h3>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Bandeau LIVE */}
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
                allowFullScreen allow="autoplay; encrypted-media" title={liveVideo.title}
              />
            </div>
            <p className="mt-3 font-medium text-foreground">{liveVideo.title}</p>
          </div>
        )}

        {/* Onglets */}
        {!noApiKey && (
          <div className="flex gap-2 mb-8 border-b border-border">
            <button onClick={() => setActiveTab("latest")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "latest" ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Dernier culte
            </button>
            <button onClick={() => setActiveTab("grid")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "grid" ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Tous les cultes
            </button>
          </div>
        )}

        {/* Mode sans clé API */}
        {noApiKey && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                <iframe className="w-full h-full"
                  src="https://www.youtube.com/embed?listType=user_uploads&list=VsdCommunicationMIEDA"
                  title="MIEDA Cultes" allow="autoplay; encrypted-media" allowFullScreen />
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
                Suivez nos cultes en direct et retrouvez tous nos messages sur notre
                chaîne YouTube. Ajoutez votre clé API YouTube pour activer le
                chargement automatique des vidéos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`${YOUTUBE_CHANNEL_URL}/streams`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="text-lg px-8">
                    <Play className="w-5 h-5 mr-2" /> Regarder le Message
                  </Button>
                </a>
                <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Voir Tous les Messages
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Chargement */}
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

        {/* Erreur */}
        {error && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">Impossible de charger les vidéos YouTube.</p>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Youtube className="w-4 h-4 mr-2" /> Voir la chaîne directement
              </Button>
            </a>
          </div>
        )}

        {/* Dernier culte */}
        {!loading && !error && !noApiKey && activeTab === "latest" && latestVideo && (
          <div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe src={`https://www.youtube.com/embed/${latestVideo.id}`}
                className="w-full h-full" allowFullScreen
                allow="autoplay; encrypted-media" title={latestVideo.title} />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{latestVideo.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(latestVideo.publishedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grille */}
        {!loading && !error && !noApiKey && activeTab === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {videos.map((v) => (
              <button key={v.id} onClick={() => setModal({ id: v.id, title: v.title })}
                className="group text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{formatDate(v.publishedAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lien chaîne */}
        {!noApiKey && !loading && (
          <div className="text-center mt-10">
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                <Youtube className="w-5 h-5 mr-2" /> Voir toute la chaîne MIEDA
              </Button>
            </a>
          </div>
        )}
      </div>

      {modal && (
        <VideoModal videoId={modal.id} title={modal.title} onClose={() => setModal(null)} />
      )}
    </section>
  );
};

export default Sermons;
