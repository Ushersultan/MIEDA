import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ChurchMedia, validMediaUrl, youtubeId } from '@/lib/media';
import { Button } from './ui/button';
import MediaPlayer from './MediaPlayer';
const initial = { title: '', description: '', url: '', kind: 'youtube' as 'youtube' | 'mp4', is_live: false, published: false };
export default function AdminChurchMedia() {
  const [items, setItems] = useState<ChurchMedia[]>([]);
  const [form, setForm] = useState(initial);
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    const result = await supabase.from('church_media').select('*').order('created_at', { ascending: false }).limit(100);
    if (result.error) setMessage('Catalogue indisponible. Vérifiez que la migration vidéos est installée dans Supabase.');
    else setItems(result.data || []);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const reset = () => { setId(null); setForm(initial); };
  const save = async () => {
    if (!form.title.trim() || !validMediaUrl(form.url.trim(), form.kind) || (form.is_live && form.kind !== 'youtube')) {
      setMessage('Saisissez un titre et un lien YouTube valide (watch, live, shorts ou youtu.be), ou un lien HTTPS vers un fichier MP4. Le direct doit être un lien vidéo YouTube.'); return;
    }
    setBusy(true); setMessage('');
    try {
      const payload = { ...form, title: form.title.trim(), url: form.kind === 'youtube' ? `https://www.youtube.com/watch?v=${youtubeId(form.url.trim())}` : form.url.trim() };
      const result = id ? await supabase.from('church_media').update(payload).eq('id', id).select('id').single()
        : await supabase.from('church_media').insert(payload).select('id').single();
      if (result.error) throw result.error;
      reset(); await load(); setMessage('Enregistré. Les contenus publiés apparaissent sur le site et dans l’application sans nouvelle version.');
    } catch { setMessage('Enregistrement refusé. Vérifiez votre session MFA, la migration et qu’un autre direct n’est pas déjà publié.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-7">
    <div><h2 className="text-2xl font-bold">Vidéos et direct YouTube</h2><p className="text-muted-foreground mt-2">Collez un lien vidéo YouTube ou un lien MP4 hébergé. Une vidéo publiée est actualisée automatiquement, y compris dans l’application mise à jour.</p></div>
    <form className="rounded-2xl border bg-card p-5 space-y-4" onSubmit={e => { e.preventDefault(); void save(); }}>
      <h3 className="font-bold">{id ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h3>
      <label className="block">Titre<input required maxLength={160} className="block w-full border rounded-lg p-3 mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label>
      <label className="block">Format<select className="block w-full border rounded-lg p-3 mt-1" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as 'youtube' | 'mp4', is_live: false })}><option value="youtube">YouTube</option><option value="mp4">Fichier MP4 hébergé</option></select></label>
      <label className="block">Lien de la vidéo<input required type="url" maxLength={2048} className="block w-full border rounded-lg p-3 mt-1" placeholder="https://www.youtube.com/watch?v=…" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}/></label>
      <p className="text-sm text-muted-foreground">Pour le direct, utilisez le lien de la diffusion elle-même, pas le lien général de la chaîne. Pour un fichier personnel, hébergez-le d’abord sur YouTube ou votre stockage vidéo.</p>
      <label className="block">Description<textarea maxLength={3000} className="block w-full border rounded-lg p-3 mt-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>
      <label className="flex gap-2"><input type="checkbox" disabled={form.kind !== 'youtube'} checked={form.is_live} onChange={e => setForm({ ...form, is_live: e.target.checked })}/>Afficher comme direct (un seul direct publié)</label>
      <label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}/>Publier sur le site et dans l’application</label>
      {validMediaUrl(form.url, form.kind) && <details><summary className="cursor-pointer">Aperçu avant publication</summary><div className="mt-3"><MediaPlayer url={form.url} title={form.title || 'Aperçu'} kind={form.kind}/></div></details>}
      <div className="flex gap-3"><Button disabled={busy} type="submit">{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>{id && <Button variant="outline" type="button" disabled={busy} onClick={reset}>Annuler</Button>}</div>
    </form>
    {message && <p role="status" className="rounded-xl bg-muted p-4">{message}</p>}
    <div className="space-y-3">{items.map(item => <article key={item.id} className="border rounded-xl p-4 flex flex-wrap justify-between items-center gap-4"><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.published ? 'Publié' : 'Brouillon'}{item.is_live ? ' · Direct' : ''}</p></div><Button disabled={busy} variant="outline" onClick={() => { setId(item.id); setForm({ title: item.title, description: item.description, url: item.url, kind: item.kind, published: item.published, is_live: item.is_live }); }}>Modifier / masquer</Button></article>)}</div>
  </section>;
}
