import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Vérifie que la clé API est bien configurée côté serveur
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY manquante dans les variables d'environnement");
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  const { name, email, phone, message } = req.body ?? {};

  // Validation des champs obligatoires
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Les champs Nom, Email et Message sont obligatoires.",
    });
  }

  // Validation basique du format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  try {
    await resend.emails.send({
      from: "MIEDA Website <noreply@eglisesmieda.org>",
      to: ["ushersultan@gmail.com", "com@eglisesmieda.org"],
      subject: "Nouveau message depuis le site MIEDA",
      replyTo: email,
      text: `
Nom: ${name}
Email: ${email}
Téléphone: ${phone || "Non renseigné"}

Message:
${message}
      `.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur Resend:", error);

    return res.status(500).json({
      error: "Erreur lors de l'envoi du message. Veuillez réessayer.",
    });
  }
}
