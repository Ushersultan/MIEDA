import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
export async function openMedia(url: string) {
  if (Capacitor.isNativePlatform()) {
    try { await Browser.open({ url }); return; } catch { /* Browser fallback */ }
  }
  window.open(url, '_blank', 'noopener');
}
