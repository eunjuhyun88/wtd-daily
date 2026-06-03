import type { CommunitySocialPayload } from '$lib/types/social';

export async function fetchSocialSenti(
  token: string,
  signal?: AbortSignal
): Promise<CommunitySocialPayload | null> {
  try {
    const res = await fetch(`/api/senti/social?token=${encodeURIComponent(token)}`, { signal });
    if (!res.ok) return null;
    return await res.json() as CommunitySocialPayload;
  } catch {
    return null;
  }
}
