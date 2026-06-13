import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { name, email, phone, message } = req.body;

  try {
    await resend.emails.send({
      from: "MIEDA Website <onboarding@resend.dev>",
      to: "com@eglisesmieda.org",
      subject: `Nouveau message depuis le site MIEDA`,
      replyTo: email,
      text: `
Nom: ${name}
Email: ${email}
Téléphone: ${phone}

Message:
${message}
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erreur lors de l'envoi",
    });
  }
}
