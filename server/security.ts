import type { SupabaseClient } from '@supabase/supabase-js';

// Decode claims only AFTER the Auth server has validated this exact token.
export async function authorizeMfa(admin: SupabaseClient, token: string, roles: string[]) {
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return false;
  try {
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (claims.sub !== data.user.id || claims.aal !== 'aal2') return false;
  } catch { return false; }
  const { data: profile, error: profileError } = await admin.from('profiles')
    .select('role').eq('id', data.user.id).maybeSingle();
  return !profileError && !!profile && roles.includes(profile.role);
}

export function validateContact(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  for (const [key, max] of Object.entries({ name: 120, email: 254, phone: 40, message: 5000 })) {
    if (key === 'phone' && value[key] == null) continue;
    if (typeof value[key] !== 'string' || (value[key] as string).length > max) return null;
  }
  const name = (value.name as string).trim();
  const email = (value.email as string).trim();
  const message = (value.message as string).trim();
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) return null;
  return { name, email, message, phone: ((value.phone as string) || '').trim() };
}

// Best-effort per-instance throttle. A durable gateway/WAF limit is also needed.
const attempts = new Map<string, { count: number; until: number }>();
export function allowContact(key: string, now = Date.now()) {
  for (const [id, entry] of attempts) if (entry.until <= now) attempts.delete(id);
  let entry = attempts.get(key);
  if (!entry) {
    if (attempts.size >= 10000) return false;
    entry = { count: 0, until: now + 15 * 60 * 1000 };
    attempts.set(key, entry);
  }
  return ++entry.count <= 5;
}
