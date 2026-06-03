let liqZonesEndpointState: 'unknown' | 'available' | 'missing' = 'unknown';

export async function fetchLiqZones(symbol: string, limit = 30): Promise<Array<Record<string, unknown>>> {
  if (liqZonesEndpointState === 'missing') return [];
  const res = await fetch(`/api/liq-zones/${encodeURIComponent(symbol)}?limit=${limit}`);
  if (!res.ok) {
    if (res.status === 404) liqZonesEndpointState = 'missing';
    return [];
  }
  liqZonesEndpointState = 'available';
  const json = await res.json();
  const rows = Array.isArray(json) ? json : ((json as { zones?: unknown[] } | null)?.zones ?? []);
  return rows as Array<Record<string, unknown>>;
}
