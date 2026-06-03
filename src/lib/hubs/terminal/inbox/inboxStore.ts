// W-0478 alert inbox store
// 5s polling against /api/cogochi/alerts. SSR-safe. Cleanup via returned stop fn.

import { writable, derived, type Readable } from 'svelte/store';
import type { AlertRow, AlertsResponse } from '$lib/types/inbox';

export const alerts = writable<AlertRow[]>([]);
export const alertCount: Readable<number> = derived(alerts, ($a) => $a.length);

export async function loadAlerts(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/cogochi/alerts?limit=20');
    if (!res.ok) return;
    const data = (await res.json()) as AlertsResponse;
    alerts.set(data.alerts ?? []);
  } catch {
    /* swallow — non-critical, keep last good list */
  }
}

export function startAlertPolling(intervalMs = 5000): () => void {
  if (typeof window === 'undefined') return () => {};
  loadAlerts();
  const timer = setInterval(loadAlerts, intervalMs);
  return () => clearInterval(timer);
}
