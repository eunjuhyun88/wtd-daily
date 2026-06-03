import { describe, expect, it } from 'vitest';

import type { ChartSeriesPayload } from '$lib/api/terminalBackend';

import {
  clearSharedChartLoad,
  getSharedChartLoad,
  readSharedChartPayload,
  resetSharedChartFeedCache,
  setSharedChartLoad,
  SHARED_CHART_PAYLOAD_TTL_MS,
  writeSharedChartPayload,
} from './chartFeedSharedCache';

function samplePayload(symbol = 'BTCUSDT', tf = '4h'): ChartSeriesPayload {
  return {
    symbol,
    tf,
    klines: [{ time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 }],
    oiBars: [],
    fundingBars: [],
    cvdBars: [],
    liqBars: [],
    indicators: {},
  };
}

describe('chartFeedSharedCache', () => {
  it('returns cached payload before ttl expires and evicts it afterwards', () => {
    resetSharedChartFeedCache();
    const key = 'BTCUSDT:4h';
    const now = 1_000;
    const payload = samplePayload();

    writeSharedChartPayload(key, payload, SHARED_CHART_PAYLOAD_TTL_MS, now);

    expect(readSharedChartPayload(key, now + 100)).toBe(payload);
    expect(readSharedChartPayload(key, now + SHARED_CHART_PAYLOAD_TTL_MS + 1)).toBeNull();
  });

  it('keeps only the active inflight promise for a key', async () => {
    resetSharedChartFeedCache();
    const key = 'ETHUSDT:1h';
    const first = Promise.resolve(samplePayload('ETHUSDT', '1h'));
    const second = Promise.resolve(samplePayload('ETHUSDT', '1h'));

    setSharedChartLoad(key, first);
    expect(getSharedChartLoad(key)).toBe(first);

    clearSharedChartLoad(key, second);
    expect(getSharedChartLoad(key)).toBe(first);

    clearSharedChartLoad(key, first);
    expect(getSharedChartLoad(key)).toBeNull();
  });
});
