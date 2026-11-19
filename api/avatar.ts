import { createClient } from "@supabase/supabase-js";
import { encodeAvatar, MAX_AVATAR_BYTES } from "../server/avatar.mjs";

// Read bounded binary data instead of trusting file extensions or client MIME metadata.
export const config = { api: { bodyParser: false } };
export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();
  const token = /^Bearer (\S+)$/i.exec(req.headers.authorization ?? "")?.[1];
  if (!token) return res.status(401).end();
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Service indisponible." });
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return res.status(401).end();
  if (!["image/jpeg", "image/png", "image/webp"].includes(String(req.headers["content-type"] ?? "").split(";")[0])) {
    return res.status(415).json({ error: "Formats acceptés : JPEG, PNG, WebP." });
  }
  if (Number(req.headers["content-length"]) > MAX_AVATAR_BYTES) return res.status(413).end();
  let image: Buffer;
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > MAX_AVATAR_BYTES) return res.status(413).end();
      chunks.push(bytes);
    }
    image = await encodeAvatar(Buffer.concat(chunks));
  } catch {
    return res.status(400).json({ error: "Image invalide. Maximum 4 Mo ; JPEG, PNG ou WebP." });
  }
  const path = `${data.user.id}/avatar.webp`;
  const result = await admin.storage.from("avatars").upload(path, image, {
    contentType: "image/webp", upsert: true, cacheControl: "0",
  });
  if (result.error) return res.status(502).json({ error: "Envoi impossible. Réessayez." });
  const { data: publicFile } = admin.storage.from("avatars").getPublicUrl(path);
  return res.status(200).json({ url: `${publicFile.publicUrl}?t=${Date.now()}` });
}
