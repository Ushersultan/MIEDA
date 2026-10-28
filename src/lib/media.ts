export function youtubeId(value: string): string | null {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
      id = u.pathname === '/watch' ? u.searchParams.get('v') : /^\/(?:live|shorts|embed)\/([^/]+)$/.exec(u.pathname)?.[1] || null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
export function validMediaUrl(value: string, kind: string): boolean {
  if (kind === 'youtube') return !!youtubeId(value);
  try { const u = new URL(value); return kind === 'mp4' && u.protocol === 'https:' && /\.mp4$/i.test(u.pathname); }
  catch { return false; }
}
export interface ChurchMedia {
  id: string; title: string; description: string; url: string;
  kind: 'youtube' | 'mp4'; is_live: boolean; published: boolean; created_at: string;
}
