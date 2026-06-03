import type { SmcEvent } from '$lib/shared/chart/primitives/SmcOverlayPrimitive';

let smcEndpointState: 'unknown' | 'available' | 'missing' = 'unknown';

export async function fetchSmcEvents(symbol: string, tf: string): Promise<SmcEvent[]> {
  if (smcEndpointState === 'missing') return [];
  const qs = new URLSearchParams({ tf, active_only: 'true' }).toString();
  const res = await fetch(`/api/smc/${encodeURIComponent(symbol)}?${qs}`);
  if (!res.ok) {
    if (res.status === 404) smcEndpointState = 'missing';
    return [];
  }
  smcEndpointState = 'available';
  const json = await res.json();
  // Engine returns { events: SmcEvent[] } or array directly
  const raw: unknown[] = Array.isArray(json) ? json : (json?.events ?? []);
  return raw as SmcEvent[];
}
