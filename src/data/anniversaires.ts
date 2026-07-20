import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════
//  MIEDA — VŒUX D'ANNIVERSAIRE AUTOMATIQUES
//
//  Déclenché chaque matin par la tâche planifiée Vercel (vercel.json).
//  Peut aussi être lancé manuellement depuis l'Espace Admin.
//
//  Variables d'environnement requises (Vercel) :
//    VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
//    CRON_SECRET (généré par Vercel, sert à authentifier la tâche)
// ════════════════════════════════════════════════════════════════

const resend = new Resend(process.env.RESEND_API_KEY);

const messageHtml = (prenom: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:0">
    <div style="background:linear-gradient(135deg,#1e40af,#1e3a8a);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
      <p style="color:#bfdbfe;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">
        Mission Internationale d'Évangélisation et de Délivrance des Âmes
      </p>
      <h1 style="color:#ffffff;font-size:26px;margin:0">Joyeux anniversaire, ${prenom} !</h1>
    </div>

    <div style="background:#ffffff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 18px">
        Toute la famille MIEDA se joint à nous pour célébrer avec vous ce jour
        que le Seigneur a fait. Nous rendons grâce à Dieu pour votre vie et
        pour tout ce qu'Il accomplit à travers vous.
      </p>

      <blockquote style="border-left:4px solid #1e40af;padding:12px 16px;margin:0 0 18px;background:#eff6ff;color:#1e3a8a;font-style:italic;font-size:15px;line-height:1.6">
        « L'Éternel te bénisse et te garde ! L'Éternel fasse luire sa face sur toi
        et t'accorde sa grâce ! »
        <br />
        <span style="font-style:normal;font-size:13px;font-weight:bold">— Nombres 6:24-25</span>
      </blockquote>

      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">
        Que cette nouvelle année de votre vie soit remplie de paix, de santé
        et de la présence du Seigneur.
      </p>

      <div style="text-align:center;margin:0 0 24px">
        <a href="https://www.eglisesmieda.org"
           style="display:inline-block;background:#1e40af;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px">
          Visiter le site MIEDA
        </a>
      </div>

      <p style="color:#6b7280;font-size:13px;text-align:center;margin:0">
        Avec toute notre affection fraternelle,<br />
        <strong style="color:#1e40af">L'équipe MIEDA</strong> 🙏
      </p>
    </div>

    <p style="color:#9ca3af;font-size:11px;text-align:center;margin:16px 0 0">
      eglisesmieda.org
    </p>
  </div>
`;

export default async function handler(req: any, res: any) {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || !process.env.RESEND_API_KEY) {
    console.error("anniversaires: variables d'environnement manquantes");
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Authentification : tâche planifiée OU administrateur connecté ──
  const auth = req.headers?.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const secret = process.env.CRON_SECRET ?? "";

  let autorise = false;
  let manuel = false;

  if (secret && token === secret) {
    autorise = true; // déclenchement par la tâche planifiée Vercel
  } else if (token) {
    const { data: userData } = await admin.auth.getUser(token);
    if (userData?.user) {
      const { data: profil } = await admin
        .from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
      if (profil?.role === "admin") {
        autorise = true;
        manuel = true;
      }
    }
  }

  if (!autorise) return res.status(401).json({ error: "Non autorisé" });

  try {
    const { data: personnes, error } = await admin.rpc("anniversaires_du_jour");
    if (error) throw error;

    const liste = (personnes ?? []) as {
      id: string; full_name: string; email: string; eglise_id: string | null;
      phone: string | null; age: number | null;
    }[];

    if (liste.length === 0) {
      return res.status(200).json({ ok: true, envoyes: 0, message: "Aucun anniversaire aujourd'hui." });
    }

    // Ne pas réexpédier si déjà envoyé aujourd'hui
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const { data: dejaEnvoyes } = await admin
      .from("journal_anniversaires")
      .select("user_id")
      .eq("envoye_le", aujourdhui);
    const deja = new Set((dejaEnvoyes ?? []).map((d: any) => d.user_id));

    let envoyes = 0;
    const echecs: string[] = [];

    for (const p of liste) {
      if (deja.has(p.id)) continue;
      const prenom = (p.full_name || "").trim().split(/\s+/)[0] || "cher(e) membre";
      try {
        await resend.emails.send({
          from: "MIEDA <noreply@eglisesmieda.org>",
          to: [p.email],
          subject: `Joyeux anniversaire, ${prenom} ! 🎂`,
          html: messageHtml(prenom),
        });
        await admin.from("journal_anniversaires").upsert({
          user_id: p.id,
          envoye_le: aujourdhui,
          canal: "email",
        });
        envoyes++;
      } catch (e: any) {
        console.error("anniversaires:", p.id, e?.message ?? e);
        echecs.push(p.full_name || p.id);
      }
    }

    return res.status(200).json({
      ok: true,
      total: liste.length,
      envoyes,
      deja_envoyes: liste.length - envoyes - echecs.length,
      echecs,
      declenchement: manuel ? "manuel" : "planifie",
    });
  } catch (e: any) {
    console.error("anniversaires:", e?.message ?? e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
