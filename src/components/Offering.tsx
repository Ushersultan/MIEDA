import { useState } from "react";
import {
  Heart, ExternalLink, Landmark, Smartphone, QrCode, Copy, Check, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import paypalQr from "@/assets/paypal-qr.png";
import { useLang } from "@/contexts/LanguageContext";

// ── Textes bilingues ──
const TXT = {
  fr: {
  badge: "Don",
  titre: "Soutenez la mission de Dieu",
  para: "Vos dons permettent à la MIEDA de poursuivre son œuvre d’évangélisation, d’enseignement et de délivrance à travers le monde.",

  citation: "« Apportez à la maison du trésor toutes les dîmes, afin qu’il y ait de la nourriture dans ma maison. Mettez-moi ainsi à l’épreuve, dit l’Éternel des armées. »",
  citationRef: "— Malachie 3:10",

  secur: "Paiement sécurisé avec PayPal",
  securSous: "Vos informations bancaires ne nous sont jamais transmises.",

  enLigne: "Faire un don en ligne",
  designation: "Désignation du don (facultatif)",
  designationPh: "Ex. : Construction, missions, jeunesse…",
  rapide: "Choisissez un montant",
  ou: "Ou saisissez un autre montant",

  donner: "Donner",
  via: "avec PayPal",

  scan: "Scannez le code",
  scanSous: "Scannez ce code avec l’appareil photo de votre téléphone pour faire un don directement avec PayPal.",
  redirect: "Vous serez redirigé vers PayPal afin de finaliser votre don en toute sécurité.",

  autres: "Autres moyens de faire un don",

  virement: "Virement bancaire",
  usa: "États-Unis 🇺🇸",

  wave: "Wave",
  waveSous: "Mobile Money · Côte d’Ivoire 🇨🇮",
  waveNote: "Envoyez directement votre dîme ou votre offrande à l’aide de l’application Wave.",

  iban: "Virement bancaire par IBAN",
  france: "France / International 🇫🇷",
  ibanNote: "Veuillez préciser « Offrande » ou « Dîme » dans le libellé de votre virement.",

  lBanque: "Banque",
  lAdresse: "Adresse",
  lBenef: "Bénéficiaire",
  lCompte: "Numéro de compte",
  lChips: "CHIPS / ABA",
  lSwift: "Code SWIFT",
  lNom: "Nom",
  lNumero: "Numéro",
  lIban: "IBAN",
  lBic: "Code BIC",
  lTitulaire: "Titulaire du compte",

  benediction: "Que Dieu vous bénisse 🙏",
},

en: {
  badge: "online donation",
  titre: "Support God’s Mission",
  para: "Your donations enable MIEDA to continue its work of evangelism, teaching, and deliverance throughout the world.",

  citation: "“Bring the whole tithe into the storehouse, so that there may be food in my house. Test me in this,” says the LORD of hosts.",
  citationRef: "— Malachi 3:10",

  secur: "Secure payment with PayPal",
  securSous: "Your banking information is never shared with us.",

  enLigne: "Make an online donation",
  designation: "Donation designation (optional)",
  designationPh: "E.g.: Construction, missions, youth…",

  rapide: "Choose an amount",
  ou: "Or enter another amount",

  donner: "Donate",
  via: "with PayPal",

  scan: "Scan the code",
  scanSous: "Scan this code with your phone’s camera to make a donation directly through PayPal.",
  redirect: "You will be redirected to PayPal to complete your donation securely.",

  autres: "Other ways to donate",

  virement: "Bank transfer",
  usa: "United States 🇺🇸",

  wave: "Wave",
  waveSous: "Mobile Money · Côte d’Ivoire 🇨🇮",
  waveNote: "Send your tithe or offering directly using the Wave app.",

  iban: "Bank transfer via IBAN",
  france: "France / International 🇫🇷",
  ibanNote: "Please enter “Offering” or “Tithe” as the payment reference.",

  lBanque: "Bank",
  lAdresse: "Address",
  lBenef: "Beneficiary",
  lCompte: "Account number",
  lChips: "CHIPS / ABA",
  lSwift: "SWIFT code",
  lNom: "Name",
  lNumero: "Number",
  lIban: "IBAN",
  lBic: "BIC code",
  lTitulaire: "Account holder",

  benediction: "May God bless you 🙏",
},

};

// ══════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════
const PAYPAL_EMAIL = "mieda.diaspora@gmail.com";
const CURRENCY = "USD";

// ── Coordonnées officielles Dîmes & Offrandes — MIEDA Diaspora ──
const BANQUE_US = {
  banque: "Manufacturers and Traders Trust Company (M&T Bank)",
  adresse: "One M&T Plaza, Buffalo, NY 14203, USA",
  beneficiaire: "KOUADIO DJEHA",
  compte: "9886633974",
  chipsAba: "0555",
  swift: "MANTUS33",
};

const WAVE = {
  nom: "DJEHA ROSINE",
  tel: "+225 07 07 68 80 89",
};

const IBAN_FR = {
  iban: "FR17 3000 2005 3200 0000 6156 V05",
  bic: "CRLYFRPP",
  titulaire: "MIEDA",
  adresse: "40 Avenue de Sully, 93190 Livry-Gargan, France",
};

// ── Utilitaire PayPal ──
function buildPayPalUrl(amount: string, description: string): string {
  const params = new URLSearchParams({
    cmd: "_donations",
    business: PAYPAL_EMAIL,
    item_name: description,
    amount,
    currency_code: CURRENCY,
    return: window.location.href,
    cancel_return: window.location.href,
  });
  return `https://www.paypal.com/donate?${params.toString()}`;
}

// ── Ligne d'info avec bouton copier ──
const CopyRow = ({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
      <button
        onClick={doCopy}
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 flex items-center justify-center transition-colors"
        aria-label={`Copier ${label}`}
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════
//  FORMULAIRE PAYPAL — Offrande ou Dîme
// ══════════════════════════════════════════════
const PayPalForm = ({ L }: { L: typeof TXT.fr }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"offrande" | "dime">("offrande");
  const [note, setNote] = useState("");
  const presets = ["5", "10", "25", "50", "100"];

  const handleGive = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    const base = type === "dime" ? "Dîme MIEDA" : "Offrande MIEDA";
    const desc = note ? `${base} — ${note}` : `${base} — Mission Internationale`;
    window.open(buildPayPalUrl(val.toFixed(2), desc), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Type de don */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
          {L.type}
        </label>
        <div className="flex gap-2">
          {([["offrande", L.offrande], ["dime", L.dime]] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setType(val)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                type === val
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Montants rapides */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
          {L.rapide}
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                amount === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              ${p}
            </button>
          ))}
        </div>
      </div>

      {/* Montant personnalisé */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          {L.ou}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <Input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {/* Note optionnelle */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          {L.designation}
        </label>
        <Input
          type="text"
          placeholder={L.designationPh}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={60}
        />
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleGive}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <Heart className="w-4 h-4 mr-2" />
        {L.donner} ${amount || "0.00"} {L.via}
        <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
      </Button>

      {/* QR Code */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <img
          src={paypalQr}
          alt="QR code PayPal MIEDA Diaspora"
          className="w-28 h-28 rounded-lg flex-shrink-0 bg-white"
        />
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
            <QrCode className="w-4 h-4 text-primary" />
            {L.scan}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {L.scanSous}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {L.redirect}
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════
const Offering = () => {
  const { lang } = useLang();
  const L = TXT[lang];
  return (
    <section id="offrandes" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-14">

          {/* ── Côté gauche — Texte ── */}
          <div className="lg:sticky lg:top-24">
            <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-6">
              <span className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {L.badge}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {L.titre}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {L.para}
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-8">
              {L.citation}
              <br />
              <span className="text-sm not-italic font-medium text-foreground mt-2 block">
                {L.citationRef}
              </span>
            </blockquote>

            {/* Sécurité */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="currentColor">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.717a.483.483 0 0 1-.477-.558L9.416 12h1.92l-.272 1.718h.005c.17-1.044 1.062-1.818 2.123-1.818h.444c3.071 0 5.476-1.248 6.18-4.854.293-1.504.142-2.757-.749-3.568z"/>
                  <path d="M17.86 5.665c-.174-.05-.356-.096-.546-.136a6.78 6.78 0 0 0-1.353-.133H11.44a.804.804 0 0 0-.794.68L9.416 12h1.92l.395-2.5.013-.083a.804.804 0 0 1 .794-.68h1.664c3.237 0 5.773-1.314 6.514-5.12.022-.113.042-.223.059-.33a4.052 4.052 0 0 0-2.915-1.622z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{L.secur}</p>
                <p className="text-xs text-muted-foreground">{L.securSous}</p>
              </div>
            </div>
          </div>

          {/* ── Côté droit — Formulaire PayPal ── */}
          <div className="bg-background rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {L.enLigne}
              </p>
            </div>
            <div className="p-6">
              <PayPalForm L={L} />
            </div>
          </div>
        </div>

        {/* ── Autres moyens de donner ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-border" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {L.autres}
          </h3>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Virement bancaire USA */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{L.virement}</p>
                <p className="text-xs text-muted-foreground">{L.usa}</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              <CopyRow label={L.lBanque} value={BANQUE_US.banque} />
              <CopyRow label={L.lAdresse} value={BANQUE_US.adresse} />
              <CopyRow label={L.lBenef} value={BANQUE_US.beneficiaire} />
              <CopyRow label={L.lCompte} value={BANQUE_US.compte} />
              <CopyRow label={L.lChips} value={BANQUE_US.chipsAba} />
              <CopyRow label={L.lSwift} value={BANQUE_US.swift} />
            </div>
          </div>

          {/* Wave */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Wave</p>
                <p className="text-xs text-muted-foreground">{L.waveSous}</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              <CopyRow label={L.lNom} value={WAVE.nom} />
              <CopyRow label={L.lNumero} value={WAVE.tel} copyValue={WAVE.tel.replace(/\s/g, "")} />
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {L.waveNote}
            </p>
          </div>

          {/* IBAN France / International */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{L.iban}</p>
                <p className="text-xs text-muted-foreground">{L.france}</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              <CopyRow label={L.lIban} value={IBAN_FR.iban} copyValue={IBAN_FR.iban.replace(/\s/g, "")} />
              <CopyRow label={L.lBic} value={IBAN_FR.bic} />
              <CopyRow label={L.lTitulaire} value={IBAN_FR.titulaire} />
              <CopyRow label={L.lAdresse} value={IBAN_FR.adresse} />
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {L.ibanNote}
            </p>
          </div>
        </div>

        <p className="text-center text-sm font-medium text-foreground mt-10">
          {L.benediction}
        </p>
      </div>
    </section>
  );
};

export default Offering;
