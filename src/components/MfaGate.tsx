import { useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Loader2, ShieldCheck, Smartphone, KeyRound, LogOut, RefreshCw, Mail, QrCode, ArrowLeft,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════
//  PORTAIL MFA — double authentification obligatoire
//  Deux méthodes au choix :
//   • Application TOTP (QR code) — la plus sûre, session AAL2
//   • Code par email — accessible à tous (validité : session du navigateur)
//  ENFORCE_FOR_ALL = true  → tous les comptes | false → pasteurs/admins
// ════════════════════════════════════════════════════════════════
const ENFORCE_FOR_ALL = false;   // false = MFA imposé aux pasteurs/admins seulement
const SMS_ACTIF = true;          // SMS activé (Twilio requis en env vars)

type Etape = "verification" | "choix" | "enrolement" | "defi" | "email" | "ok";

const CLE_MFA = (uid: string) => `mieda-mfa-verified-${uid}`;
const JOURS_CONFIANCE = 30;
const DUREE_SESSION_MS = JOURS_CONFIANCE * 24 * 60 * 60 * 1000; // appareil approuvé 30 jours

const mfaValideRecemment = (uid: string): boolean => {
  try {
    const ts = localStorage.getItem(CLE_MFA(uid));
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < DUREE_SESSION_MS;
  } catch { return false; }
};

const enregistrerMfaValide = (uid: string) => {
  try { localStorage.setItem(CLE_MFA(uid), String(Date.now())); } catch { /* noop */ }
};

// ── Persistance de la progression (survit à un rechargement de page) ──
const CLE_PROG = (uid: string) => `mieda-mfa-progress-${uid}`;
const sauverProgression = (uid: string, data: any) => {
  try { sessionStorage.setItem(CLE_PROG(uid), JSON.stringify({ ...data, ts: Date.now() })); } catch { /* noop */ }
};
const lireProgression = (uid: string): any => {
  try {
    const raw = sessionStorage.getItem(CLE_PROG(uid));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 30 * 60 * 1000) return null; // 30 min max
    return data;
  } catch { return null; }
};
const effacerProgression = (uid: string) => {
  try { sessionStorage.removeItem(CLE_PROG(uid)); } catch { /* noop */ }
};

const MfaGate = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading, profil, signOut } = useAuth();
  const [etape, setEtape] = useState<Etape>("verification");
  const [qrCode, setQrCode] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [envoiFait, setEnvoiFait] = useState(false);
  const [canal, setCanal] = useState<"email" | "sms">("email");
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");

  const doitImposer = ENFORCE_FOR_ALL || profil?.role === "pasteur" || profil?.role === "admin";

  // ── Évaluer l'état MFA ──
  const evaluer = useCallback(async () => {
    if (!user) return;
    setErreur(""); setInfo("");

    // Déjà validé dans les 12 dernières heures ?
    if (mfaValideRecemment(user.id)) { setEtape("ok"); return; }

    // Reprendre la progression sauvegardée (survit à un rechargement)
    const progression = lireProgression(user.id);
    if (progression) {
      if (progression.etape === "enrolement" && progression.factorId) {
        setFactorId(progression.factorId);
        setQrCode(progression.qrCode || "");
        setSecret(progression.secret || "");
        setQrDataUrl(progression.qrDataUrl || "");
        setEtape("enrolement");
        return;
      }
      if (progression.etape === "email" && progression.canal) {
        setCanal(progression.canal);
        setEnvoiFait(true);
        setEtape("email");
        return;
      }
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") { setEtape("ok"); return; }

    const { data: facteurs } = await supabase.auth.mfa.listFactors();
    const verifie = facteurs?.totp?.find((f) => f.status === "verified");

    if (verifie) {
      setFactorId(verifie.id);
      setEtape("defi");
    } else if (doitImposer) {
      setEtape("choix");
    } else {
      setEtape("ok");
    }
  }, [user, doitImposer]);

  useEffect(() => {
    if (!authLoading && user && profil) evaluer();
  }, [authLoading, user, profil, evaluer]);

  // ── Méthode TOTP : enrôlement ──
  const demarrerEnrolement = async () => {
    setBusy(true); setErreur("");
    const { data: facteurs } = await supabase.auth.mfa.listFactors();
    for (const f of facteurs?.all?.filter((x) => x.status !== "verified") ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "MIEDA" });
    setBusy(false);
    if (error) { setErreur(error.message); return; }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setCode("");
    setEtape("enrolement");
    let generatedUrl = "";
    try {
      const uri = (data.totp as any).uri;
      if (uri) {
        generatedUrl = await QRCode.toDataURL(uri, {
          width: 240, margin: 1,
          color: { dark: "#1e40af", light: "#ffffff" },
        });
        setQrDataUrl(generatedUrl);
      }
    } catch (e) {
      console.error("QR generation failed:", e);
    }
    // Sauvegarder la progression au cas où la page se rechargerait
    if (user) sauverProgression(user.id, {
      etape: "enrolement", factorId: data.id, qrCode: data.totp.qr_code,
      secret: data.totp.secret, qrDataUrl: generatedUrl,
    });
  };

  const verifierTotp = async () => {
    if (code.length !== 6) return;
    setBusy(true); setErreur("");
    try {
      let chId = challengeId;
      if (!chId) {
        const { data: defi, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
        if (e1) throw e1;
        chId = defi.id;
      }
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: chId, code });
      if (error) throw error;
      setCode(""); setChallengeId("");
      enregistrerMfaValide(user!.id);
      effacerProgression(user!.id);
      setEtape("ok");
    } catch {
      setErreur("Code incorrect ou expiré. Réessayez.");
      setChallengeId("");
    }
    setBusy(false);
  };

  // ── Méthode Email ──
  const appelApi = async (body: object) => {
    const { data: { session } } = await supabase.auth.getSession();
    const rep = await fetch("/api/mfa-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    const json = await rep.json().catch(() => ({}));
    if (!rep.ok) throw new Error(json.error ?? "Erreur serveur");
    return json;
  };

  const envoyerCode = async (c: "email" | "sms") => {
    setBusy(true); setErreur(""); setInfo("");
    try {
      await appelApi({ action: "send", canal: c });
      setCanal(c);
      setEnvoiFait(true);
      setInfo(c === "sms"
        ? "Code envoyé par SMS. Il peut prendre une minute."
        : `Code envoyé à ${user?.email}. Vérifiez aussi vos spams.`);
      setEtape("email");
      setCode("");
      if (user) sauverProgression(user.id, { etape: "email", canal: c });
    } catch (e: any) {
      setErreur(e.message);
    }
    setBusy(false);
  };
  const envoyerCodeEmail = () => envoyerCode("email");

  const verifierCodeEmail = async () => {
    if (code.length !== 6) return;
    setBusy(true); setErreur("");
    try {
      await appelApi({ action: "verify", code });
      enregistrerMfaValide(user!.id);
      effacerProgression(user!.id);
      setCode("");
      setEtape("ok");
    } catch (e: any) {
      setErreur(e.message);
    }
    setBusy(false);
  };

  // ── Rendus ──
  if (authLoading || !user || !profil) return <>{children}</>;
  if (etape === "ok") return <>{children}</>;

  if (etape === "verification") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const Carte = ({ titre, sousTitre, retour, children: contenu }: {
    titre: string; sousTitre: string; retour?: boolean; children: ReactNode;
  }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--section-bg)] px-4 py-10">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        {retour && (
          <button onClick={() => { setErreur(""); setCode(""); setQrDataUrl(""); if (user) effacerProgression(user.id); setEtape("choix"); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-3 h-3" /> Autre méthode
          </button>
        )}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground text-center mb-1">{titre}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{sousTitre}</p>
        {contenu}
        <p className="text-[11px] text-muted-foreground text-center mt-4">
          🔒 Cet appareil restera approuvé pendant {JOURS_CONFIANCE} jours après vérification.
        </p>
        {info && <p className="text-sm text-green-600 text-center mt-4">{info}</p>}
        {erreur && <p className="text-sm text-destructive text-center mt-4">{erreur}</p>}
        <button onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto mt-6">
          <LogOut className="w-3 h-3" /> Se déconnecter
        </button>
      </div>
    </div>
  );

  const ChampCode = ({ onValider, auto = false }: { onValider: () => void; auto?: boolean }) => (
    <div className="flex items-center gap-2 mb-2">
      <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <input
        type="text" inputMode="numeric" maxLength={6} value={code} autoFocus={auto}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && onValider()}
        placeholder="000000"
        className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  // ── Écran de CHOIX de la méthode ──
  if (etape === "choix") {
    return (
      <Carte
        titre="Sécurisez votre compte"
        sousTitre="MIEDA protège votre espace par une vérification en deux étapes. Choisissez votre méthode :"
      >
        <div className="space-y-3">
          <button onClick={demarrerEnrolement} disabled={busy}
            className="w-full flex items-start gap-3 p-4 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-left">
            <QrCode className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Application d'authentification</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Google/Microsoft Authenticator. Le plus sûr — recommandé pour les pasteurs.
              </p>
            </div>
          </button>
          <button onClick={envoyerCodeEmail} disabled={busy}
            className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors text-left">
            <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Code par email</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recevez un code à 6 chiffres à {user.email}. Simple, sans application.
              </p>
            </div>
          </button>
          {SMS_ACTIF && profil?.phone && (
            <button onClick={() => envoyerCode("sms")} disabled={busy}
              className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors text-left">
              <Smartphone className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Code par SMS</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recevez un code au {profil.phone}.
                </p>
              </div>
            </button>
          )}
        </div>
        {busy && <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mt-4" />}
      </Carte>
    );
  }

  // ── Écran TOTP : enrôlement (QR) ──
  if (etape === "enrolement") {
    return (
      <Carte retour
        titre="Scannez le QR code"
        sousTitre="Avec Google Authenticator, Microsoft Authenticator ou toute app TOTP, puis entrez le code affiché."
      >
        <div className="bg-white rounded-xl p-4 flex justify-center mb-4">
          {qrCode && (
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
              alt="QR code MFA" className="w-44 h-44" />
          )}
        </div>
        <details className="mb-4">
          <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <KeyRound className="w-3 h-3" /> Impossible de scanner ? Clé manuelle
          </summary>
          <code className="block mt-2 p-2 bg-muted rounded text-xs break-all select-all">{secret}</code>
        </details>
        <ChampCode onValider={verifierTotp} />
        <Button onClick={verifierTotp} disabled={busy || code.length !== 6} className="w-full" size="lg">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer la protection"}
        </Button>
      </Carte>
    );
  }

  // ── Écran TOTP : défi (connexions suivantes) ──
  if (etape === "defi") {
    return (
      <Carte
        titre="Vérification en deux étapes"
        sousTitre="Entrez le code à 6 chiffres de votre application d'authentification."
      >
        <ChampCode onValider={verifierTotp} auto />
        <Button onClick={verifierTotp} disabled={busy || code.length !== 6} className="w-full" size="lg">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier"}
        </Button>
        <button onClick={envoyerCodeEmail} disabled={busy}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline mx-auto mt-4">
          <Mail className="w-3 h-3" /> Recevoir un code par email à la place
        </button>
      </Carte>
    );
  }

  // ── Écran EMAIL : saisie du code reçu ──
  return (
    <Carte retour
      titre={canal === "sms" ? "Code envoyé par SMS" : "Code envoyé par email"}
      sousTitre={canal === "sms"
        ? `Entrez le code à 6 chiffres envoyé au ${profil?.phone}.`
        : `Entrez le code à 6 chiffres envoyé à ${user.email}.`}
    >
      <ChampCode onValider={verifierCodeEmail} auto />
      <Button onClick={verifierCodeEmail} disabled={busy || code.length !== 6} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier"}
      </Button>
      <button onClick={() => envoyerCode(canal)} disabled={busy}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto mt-3">
        <RefreshCw className="w-3 h-3" /> Renvoyer un code
      </button>
    </Carte>
  );
};

export default MfaGate;
