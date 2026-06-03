import type { ChartSeriesPayload } from '$lib/api/terminalBackend';

export const SHARED_CHART_PAYLOAD_TTL_MS = 15_000;

type SharedPayloadEntry = {
  payload: ChartSeriesPayload;
  expiresAt: number;
};

const sharedPayloadCache = new Map<string, SharedPayloadEntry>();
const sharedInflightLoads = new Map<string, Promise<ChartSeriesPayload | null>>();

export function readSharedChartPayload(
  key: string,
  now = Date.now(),
): ChartSeriesPayload | null {
  const cached = sharedPayloadCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    sharedPayloadCache.delete(key);
    return null;
  }
  return cached.payload;
}

export function writeSharedChartPayload(
  key: string,
  payload: ChartSeriesPayload,
  ttlMs = SHARED_CHART_PAYLOAD_TTL_MS,
  now = Date.now(),
): void {
  sharedPayloadCache.set(key, {
    payload,
    expiresAt: now + ttlMs,
  });
}

export function getSharedChartLoad(
  key: string,
): Promise<ChartSeriesPayload | null> | null {
  return sharedInflightLoads.get(key) ?? null;
}

export function setSharedChartLoad(
  key: string,
  promise: Promise<ChartSeriesPayload | null>,
): void {
  sharedInflightLoads.set(key, promise);
}

export function clearSharedChartLoad(
  key: string,
  promise?: Promise<ChartSeriesPayload | null>,
): void {
  if (!promise) {
    sharedInflightLoads.delete(key);
    return;
  }
  if (sharedInflightLoads.get(key) === promise) {
    sharedInflightLoads.delete(key);
  }
}

export function resetSharedChartFeedCache(): void {
  sharedPayloadCache.clear();
  sharedInflightLoads.clear();
}
