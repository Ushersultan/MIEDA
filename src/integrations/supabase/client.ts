import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ════════════════════════════════════════════════════════════════
//  Connexion Supabase — fonctionne sur le site (Vercel) ET dans
//  l'application mobile (build local, sans variables Vercel).
//
//  ⚠️ POUR L'APPLICATION MOBILE : collez votre clé publique
//  ci-dessous (Supabase → Settings → API → « anon public »).
//  Cette clé est PUBLIQUE par conception (elle est déjà visible
//  dans le site déployé) : la sécurité repose sur les règles RLS.
// ════════════════════════════════════════════════════════════════

const FALLBACK_URL = "https://rvgkwixuocukyvgkupoi.supabase.co";
const FALLBACK_KEY = "COLLEZ_ICI_VOTRE_CLE_ANON_PUBLIC"; // ← à remplacer une seule fois

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? FALLBACK_KEY;

// Garde-fou : un message clair à l'écran plutôt qu'un écran blanc
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.startsWith("COLLEZ_ICI")) {
  const msg =
    "Configuration Supabase manquante : collez la clé « anon public » " +
    "dans src/integrations/supabase/client.ts (FALLBACK_KEY) puis reconstruisez.";
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.innerHTML =
        '<div style="font-family:sans-serif;padding:24px;color:#991b1b;background:#fef2f2;min-height:100vh">' +
        "<h2>⚠️ Configuration incomplète</h2><p>" + msg + "</p></div>";
    });
  }
  throw new Error(msg);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
