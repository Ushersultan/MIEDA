import { createClient } from "@supabase/supabase-js";

interface Request {
  method?: string;
  headers: { authorization?: string };
}
interface Response {
  setHeader(name: string, value: string): void;
  status(code: number): Response;
  json(body: unknown): void;
  end(): void;
}

export default async function handler(req: Request, res: Response) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).end();

  const token = /^Bearer (\S+)$/i.exec(req.headers.authorization ?? "")?.[1];
  if (!token) return res.status(401).end();
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).end();

  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) return res.status(401).end();
    const directory = process.env.PASTOR_CONTACTS_JSON;
    if (!directory) return res.status(503).end();
    const contacts: unknown = JSON.parse(directory);
    if (!contacts || typeof contacts !== "object" || Array.isArray(contacts)) {
      return res.status(503).end();
    }
    return res.status(200).json(contacts);
  } catch {
    return res.status(503).end();
  }
}
