import { writable } from 'svelte/store';
import type { ChartViewportSnapshot } from '$lib/contracts/terminalPersistence';

export type RangeContextPayload = {
  symbol: string;
  tf: string;
  viewport: ChartViewportSnapshot;
  triggeredAt: number;
};

export const rangeContext = writable<RangeContextPayload | null>(null);
