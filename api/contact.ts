export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  // Pour l'instant, on retourne succès.
  // Ensuite on connectera un service email comme Resend, SendGrid ou Microsoft Graph.
  return res.status(200).json({
    success: true,
    message: "Message reçu avec succès",
  });
}
