import { youtubeId } from '@/lib/media';
import { Button } from '@/components/ui/button';
import { openMedia } from '@/lib/open-media';
export default function MediaPlayer({ url, title, kind = 'youtube' }: { url: string; title: string; kind?: 'youtube' | 'mp4' }) {
  const id = youtubeId(url);
  const watch = id ? `https://www.youtube.com/watch?v=${id}` : url;
  const embed = id ? `https://www.youtube.com/embed/${id}?playsinline=1&origin=${encodeURIComponent(window.location.origin)}` : '';
  return <div className="space-y-3">
    <div className="aspect-video min-h-[200px] rounded-2xl overflow-hidden bg-black">
      {kind === 'mp4' ? <video key={url} src={url} controls playsInline preload="metadata" className="w-full h-full" aria-label={title}/>
        : id ? <iframe key={embed} src={embed} title={title} className="w-full h-full" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
        : <p className="text-white p-5">Le lecteur est indisponible.</p>}
    </div>
    <Button variant="outline" onClick={() => void openMedia(watch)}>{kind === 'youtube' ? 'Ouvrir sur YouTube' : 'Ouvrir la vidéo'}</Button>
  </div>;
}
