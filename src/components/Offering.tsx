import { useState } from "react";
import {
  Heart, ExternalLink, Landmark, Smartphone, QrCode, Copy, Check, Globe2, HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import paypalQr from "@/assets/paypal-qr.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang } from "@/contexts/LanguageContext";

// ── Textes bilingues — 100 % « don » ──
const TXT = {
  fr: {
    badge: "Faire un don",
    titre: "Soutenez la Mission de Dieu",
    para: "Vos dons permettent à la MIEDA de poursuivre son œuvre d'évangélisation, d'enseignement et de délivrance à travers le monde.",

    citation: "« Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie. »",
    citationRef: "— 2 Corinthiens 9:7",

    secur: "Paiement sécurisé avec PayPal",
    securSous: "Vos informations bancaires ne nous sont jamais transmises.",

    enLigne: "Faire un don en ligne",
    rapide: "Choisissez un montant",
    ou: "Ou saisissez un autre montant",
    designation: "Affecter mon don à… (facultatif)",
    designationPh: "Ex. : Construction, missions, jeunesse…",

    donner: "Donner",
    via: "avec PayPal",

    scan: "Scannez le code",
    scanSous: "Scannez ce code avec l'appareil photo de votre téléphone pour faire un don directement avec PayPal.",
    redirect: "Vous serez redirigé vers PayPal afin de finaliser votre don en toute sécurité.",

    autres: "Autres moyens de faire un don",

    virement: "Virement bancaire",
    usa: "États-Unis 🇺🇸",

    waveSous: "Mobile Money · Côte d'Ivoire 🇨🇮",
    waveNote: "Envoyez votre don directement à l'aide de l'application Wave.",

    iban: "Virement bancaire par IBAN",
    france: "France / International 🇫🇷",
    ibanNote: "Veuillez préciser « Don MIEDA » dans le libellé de votre virement.",

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

    merci: "Chaque don, quel que soit son montant, fait avancer l'œuvre de Dieu.",
    benediction: "Que Dieu vous bénisse 🙏",
  },

  en: {
    badge: "Donate",
    titre: "Support God's Mission",
    para: "Your donations enable MIEDA to continue its work of evangelism, teaching, and deliverance throughout the world.",

    citation: "\u201cEach of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.\u201d",
    citationRef: "— 2 Corinthians 9:7",

    secur: "Secure payment with PayPal",
    securSous: "Your banking information is never shared with us.",

    enLigne: "Make an online donation",
    rapide: "Choose an amount",
    ou: "Or enter another amount",
    designation: "Designate my gift to… (optional)",
    designationPh: "E.g.: Construction, missions, youth…",

    donner: "Donate",
    via: "with PayPal",

    scan: "Scan the code",
    scanSous: "Scan this code with your phone's camera to make a donation directly through PayPal.",
    redirect: "You will be redirected to PayPal to complete your donation securely.",

    autres: "Other ways to donate",

    virement: "Bank transfer",
    usa: "United States 🇺🇸",

    waveSous: "Mobile Money · Côte d'Ivoire 🇨🇮",
    waveNote: "Send your donation directly using the Wave app.",

    iban: "Bank transfer via IBAN",
    france: "France / International 🇫🇷",
    ibanNote: "Please enter \u201cDonation MIEDA\u201d as the payment reference.",

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

    merci: "Every gift, whatever the amount, moves God's work forward.",
    benediction: "May God bless you 🙏",
  },
};

// ══════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════
const PAYPAL_EMAIL = "mieda.diaspora@gmail.com";
const CURRENCY = "USD";

// ── Coordonnées officielles des dons — MIEDA Diaspora ──
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
//  FORMULAIRE PAYPAL — Don
// ══════════════════════════════════════════════
const PayPalForm = ({ L }: { L: typeof TXT.fr }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const presets = ["5", "10", "25", "50", "100"];

  const handleGive = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    const desc = note ? `Don MIEDA — ${note}` : "Don MIEDA — Mission Internationale";
    window.open(buildPayPalUrl(val.toFixed(2), desc), "_blank");
  };

  return (
    <div className="space-y-6">
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

      {/* Affectation optionnelle */}
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
  const [montant, setMontant] = useState("");
  const [affectation, setAffectation] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const MONTANTS = ["5", "10", "25", "50", "100"];

  const donnerPaypal = () => {
    const somme = montant && Number(montant) > 0 ? montant : "";
    const desc = affectation ? `Don MIEDA — ${affectation}` : "Don MIEDA";
    window.open(buildPayPalUrl(somme, desc), "_blank");
  };

  return (
    <section id="offrandes" className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-3xl text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full mb-6">
          <HandHeart className="w-4 h-4 text-secondary-foreground" />
          <span className="text-sm font-semibold text-secondary-foreground">{L.badge}</span>
        </div>

        {/* Titre + texte */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">{L.titre}</h2>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">{L.para}</p>

        <blockquote className="italic text-muted-foreground mb-10 max-w-2xl mx-auto">
          {L.citation}
          <span className="text-sm not-italic font-medium text-foreground mt-2 block">{L.citationRef}</span>
        </blockquote>

        {/* ── GRAND BOUTON PRINCIPAL ── */}
        <button
          onClick={() => setOuvert(true)}
          className="group inline-flex items-center gap-3 px-10 py-6 rounded-full bg-gradient-to-r from-secondary to-highlight text-primary-foreground text-xl md:text-2xl font-bold shadow-glow hover:scale-105 transition-all"
          style={{ color: "#3a2a00" }}
        >
          <Heart className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
          {lang === "en" ? "DONATE NOW" : "FAIRE UN DON MAINTENANT"}
        </button>
        <p className="text-sm text-muted-foreground mt-4">
          {lang === "en"
            ? "Choose the payment method that suits you."
            : "Choisissez le moyen de paiement qui vous convient."}
        </p>

        <p className="text-xs text-muted-foreground mt-10 max-w-md mx-auto">{L.merci}</p>
      </div>

      {/* ── FENÊTRE MODALE — moyens de paiement ── */}
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Heart className="w-6 h-6 text-highlight fill-highlight" />
              {L.enLigne}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="paypal" className="mt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="usa">🇺🇸 USA</TabsTrigger>
              <TabsTrigger value="wave">Wave</TabsTrigger>
              <TabsTrigger value="iban">IBAN</TabsTrigger>
            </TabsList>

            {/* ── PayPal (en premier) ── */}
            <TabsContent value="paypal" className="space-y-4 pt-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{L.rapide}</p>
                <div className="grid grid-cols-5 gap-2">
                  {MONTANTS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMontant(m)}
                      className={`py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        montant === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:border-primary"
                      }`}
                    >
                      ${m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{L.ou}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number" min="0" placeholder="0.00" value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{L.designation}</p>
                <input
                  type="text" placeholder={L.designationPh} value={affectation}
                  onChange={(e) => setAffectation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button onClick={donnerPaypal} className="w-full py-6 text-base rounded-xl" size="lg">
                <Heart className="w-5 h-5 mr-1 fill-current" />
                {L.donner} {montant && Number(montant) > 0 ? `$${montant} ` : ""}{L.via}
              </Button>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                <img src={paypalQr} alt="QR PayPal" className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{L.scan}</p>
                  <p className="text-xs text-muted-foreground">{L.scanSous}</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">{L.redirect}</p>
            </TabsContent>

            {/* ── Virement USA ── */}
            <TabsContent value="usa" className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-5 h-5 text-primary" />
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
            </TabsContent>

            {/* ── Wave ── */}
            <TabsContent value="wave" className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Wave</p>
                  <p className="text-xs text-muted-foreground">{L.waveSous}</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                <CopyRow label={L.lNom} value={WAVE.nom} />
                <CopyRow label={L.lNumero} value={WAVE.tel} copyValue={WAVE.tel.replace(/\s/g, "")} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">{L.waveNote}</p>
            </TabsContent>

            {/* ── IBAN ── */}
            <TabsContent value="iban" className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-5 h-5 text-primary" />
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
              <p className="text-xs text-muted-foreground mt-3">{L.ibanNote}</p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Offering;
