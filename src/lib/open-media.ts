import { safeExternalUrl } from "./content-safety";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
export async function openMedia(url: string) {
  const safeUrl = safeExternalUrl(url);
  if (!safeUrl) return;
  if (Capacitor.isNativePlatform()) {
    try { await Browser.open({ url: safeUrl }); return; } catch { /* Browser fallback */ }
  }
  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}
