// ════════════════════════════════════════════════════════════════
//  Préfixe les appels API pour qu'ils fonctionnent partout :
//  • Sur le site web (Vercel) : /api/contact → /api/contact
//  • Dans l'app mobile (Capacitor) : /api/contact →
//    https://www.eglisesmieda.org/api/contact
//
//  Sans ce préfixe, l'app mobile appelle localhost (qui n'existe pas)
//  → les fonctions serveur (MFA, contact, Bible, anniversaires)
//  échouent silencieusement.
// ════════════════════════════════════════════════════════════════

const SITE_URL = "https://www.eglisesmieda.org";

function estCapacitor(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform?.() === true
    );
  } catch {
    return false;
  }
}

/**
 * Transforme un chemin d'API relatif en URL complète si on est dans l'app.
 * Usage : `fetch(apiUrl("/api/mfa-email"), { ... })`
 */
export function apiUrl(chemin: string): string {
  if (estCapacitor() && chemin.startsWith("/")) {
    return SITE_URL + chemin;
  }
  return chemin;
}
