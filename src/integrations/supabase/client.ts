import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ════════════════════════════════════════════════════════════════
//  Connexion Supabase — fonctionne partout :
//  • Sur Vercel (variables d'environnement)
//  • Dans l'application mobile Capacitor (valeurs en dur)
//
//  Ces valeurs sont PUBLIQUES par conception : la clé « anon »
//  est visible par quiconque inspecte le site. La vraie sécurité
//  repose sur les politiques RLS définies dans Supabase.
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL = "https://rvgkwixuocukyvgkupoi.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2t3aXh1b2N1a3l2Z2t1cG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDY3NTAsImV4cCI6MjA5NjAyMjc1MH0" +
  ".ZbVjAkuBwS-IHwoM9tzyipN7SuI8hlByL07-z4xNpYQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
