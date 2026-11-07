import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";

export type PastorContact = { telephone?: string; email?: string };
type Directory = Record<string, PastorContact>;

export function usePastorContacts() {
  const { session } = useAuth();
  const token = session?.user.is_anonymous ? undefined : session?.access_token;
  const [result, setResult] = useState<{ token: string; directory?: Directory }>();

  useEffect(() => {
    setResult(undefined);
    if (!token) return;
    const controller = new AbortController();
    fetch(apiUrl("/api/pastor-contacts"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error("Contacts unavailable");
      return await response.json() as Directory;
    }).then((directory) => {
      if (!controller.signal.aborted) setResult({ token, directory });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ token });
    });
    return () => controller.abort();
  }, [token]);

  const current = result?.token === token ? result : undefined;
  return {
    signedIn: Boolean(token),
    loading: Boolean(token && !current),
    failed: Boolean(current && !current.directory),
    contactFor: (church: string, name: string): PastorContact | undefined =>
      current?.directory?.[JSON.stringify([church, name])],
  };
}
