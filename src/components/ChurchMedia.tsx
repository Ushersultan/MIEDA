import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ChurchMedia as Media } from '@/lib/media';
import MediaPlayer from './MediaPlayer';
import { openMedia } from '@/lib/open-media';
import { Button } from './ui/button';
export default function ChurchMedia() {
  const [items, setItems] = useState<Media[]>([]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('church_media').select('*').eq('published', true).order('created_at', { ascending: false }).limit(100);
    setError(!!error); if (!error) setItems(data || []); setLoading(false);
  }, []);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 60000);
    const focus = () => void load(); window.addEventListener('focus', focus);
    const visibility = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { clearInterval(timer); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', visibility); };
  }, [load]);
  const live = items.find(item => item.is_live);
  const current = selected && items.find(item => item.id === selected.id) || live || items[0];
  return <section className="mb-14 space-y-6" aria-label="Vidéos et direct MIEDA">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-primary text-sm font-semibold">MIEDA · VIDÉOS</p><h3 className="text-3xl font-bold">Nos messages et cultes</h3></div><Button variant="outline" onClick={() => void load()}>Actualiser</Button></div>
    {loading && <p role="status">Chargement des vidéos…</p>}
    {error && <p role="status">Les vidéos sont momentanément indisponibles. Réessayez avec « Actualiser ».</p>}
    {current && <article className="rounded-3xl border bg-card p-4 md:p-7 space-y-4">
      {current.is_live && <span className="inline-block rounded-full bg-red-600 text-white px-3 py-1 text-sm">Direct programmé par MIEDA</span>}
      <h4 className="text-xl font-bold">{current.title}</h4><MediaPlayer url={current.url} title={current.title} kind={current.kind}/><p className="text-muted-foreground whitespace-pre-line">{current.description}</p>
    </article>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item => <button key={item.id} onClick={() => setSelected(item)} aria-pressed={current?.id === item.id} className={`rounded-2xl border p-5 text-left hover:border-primary ${current?.id === item.id ? 'border-primary bg-primary/5' : 'bg-card'}`}><span className="text-sm text-primary">{item.is_live ? '● Direct' : item.kind === 'mp4' ? '▶ Vidéo' : '▶ YouTube'}</span><p className="font-semibold mt-2">{item.title}</p></button>)}</div>
    {!loading && !current && !error && <p>Les prochains messages seront publiés ici.</p>}
    <Button onClick={() => void openMedia('https://www.youtube.com/@VsdCommunicationMIEDA/live')}>Consulter le direct de la chaîne YouTube</Button>
  </section>;
}
