import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomInt } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const VALIDITE_MIN = 10;      // le code expire après 10 minutes
const COOLDOWN_SEC = 60;      // 1 minute entre deux envois
const MAX_TENTATIVES = 5;     // 5 essais max par code

const hacher = (code: string, userId: string) =>
  createHash("sha256")
    .update(`${code}:${userId}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    .digest("hex");

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !process.env.RESEND_API_KEY) {
    console.error("Variables d'environnement manquantes (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY)");
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  // Client admin (service role) — ne JAMAIS exposer cette clé côté navigateur
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Authentifier l'appelant via son jeton de session ──
  const auth = req.headers?.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user?.email) {
    return res.status(401).json({ error: "Session invalide" });
  }

  const { action, code } = req.body ?? {};

  try {
    // ══════════ ENVOI DU CODE ══════════
    if (action === "send") {
      // Anti-spam : cooldown entre deux envois
      const { data: existant } = await admin
        .from("codes_mfa_email")
        .select("dernier_envoi")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existant?.dernier_envoi) {
        const ecart = (Date.now() - new Date(existant.dernier_envoi).getTime()) / 1000;
        if (ecart < COOLDOWN_SEC) {
          return res.status(429).json({
            error: `Patientez ${Math.ceil(COOLDOWN_SEC - ecart)}s avant un nouvel envoi.`,
          });
        }
      }

      const nouveauCode = String(randomInt(100000, 1000000)); // 6 chiffres
      const expire = new Date(Date.now() + VALIDITE_MIN * 60 * 1000).toISOString();

      const { error: upErr } = await admin.from("codes_mfa_email").upsert({
        user_id: user.id,
        code_hash: hacher(nouveauCode, user.id),
        expire_at: expire,
        tentatives: 0,
        dernier_envoi: new Date().toISOString(),
      });
      if (upErr) throw upErr;

      await resend.emails.send({
        from: "MIEDA Sécurité <noreply@eglisesmieda.org>",
        to: [user.email],
        subject: `${nouveauCode} — votre code de vérification MIEDA`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#1e40af;margin-bottom:8px">Vérification en deux étapes</h2>
            <p style="color:#374151">Voici votre code de connexion au site MIEDA :</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;
                        background:#eff6ff;color:#1e40af;padding:16px;border-radius:12px;margin:16px 0">
              ${nouveauCode}
            </div>
            <p style="color:#6b7280;font-size:13px">
              Ce code expire dans ${VALIDITE_MIN} minutes. Si vous n'êtes pas à l'origine
              de cette demande, ignorez cet email et changez votre mot de passe.
            </p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">MIEDA — eglisesmieda.org 🙏</p>
          </div>
        `,
      });

      return res.status(200).json({ ok: true });
    }

    // ══════════ VÉRIFICATION DU CODE ══════════
    if (action === "verify") {
      if (!/^\d{6}$/.test(code ?? "")) {
        return res.status(400).json({ error: "Code invalide." });
      }

      const { data: ligne } = await admin
        .from("codes_mfa_email")
        .select("code_hash, expire_at, tentatives")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!ligne) return res.status(400).json({ error: "Aucun code en attente. Demandez un nouvel envoi." });
      if (new Date(ligne.expire_at) < new Date()) {
        await admin.from("codes_mfa_email").delete().eq("user_id", user.id);
        return res.status(400).json({ error: "Code expiré. Demandez un nouvel envoi." });
      }
      if (ligne.tentatives >= MAX_TENTATIVES) {
        await admin.from("codes_mfa_email").delete().eq("user_id", user.id);
        return res.status(429).json({ error: "Trop de tentatives. Demandez un nouvel envoi." });
      }

      if (ligne.code_hash !== hacher(code, user.id)) {
        await admin.from("codes_mfa_email")
          .update({ tentatives: ligne.tentatives + 1 })
          .eq("user_id", user.id);
        return res.status(400).json({ error: "Code incorrect." });
      }

      // Succès → code à usage unique
      await admin.from("codes_mfa_email").delete().eq("user_id", user.id);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Action inconnue." });
  } catch (e: any) {
    console.error("mfa-email:", e?.message ?? e);
    return res.status(500).json({ error: "Erreur serveur. Réessayez." });
  }
}
