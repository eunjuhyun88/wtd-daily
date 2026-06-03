/** W-0500 PR1 — tvUrlDetect unit tests. */
import { describe, it, expect } from 'vitest';
import { tvUrlDetect } from './tvUrlDetect';

describe('tvUrlDetect', () => {
  it('matches an idea URL pasted alone', () => {
    const m = tvUrlDetect('https://www.tradingview.com/i/abc123/');
    expect(m).toEqual({ url: 'https://www.tradingview.com/i/abc123', kind: 'idea' });
  });

  it('matches an idea URL inside a sentence', () => {
    const m = tvUrlDetect('see this https://tradingview.com/i/Abc_d12 thoughts?');
    expect(m?.kind).toBe('idea');
    expect(m?.url).toBe('https://tradingview.com/i/Abc_d12');
  });

  it('matches /x/ idea variant', () => {
    const m = tvUrlDetect('check https://www.tradingview.com/x/ZkE9Tg');
    expect(m).toEqual({ url: 'https://www.tradingview.com/x/ZkE9Tg', kind: 'idea' });
  });

  it('matches a chart URL with query string', () => {
    const m = tvUrlDetect('https://www.tradingview.com/chart/abc?symbol=BTCUSDT');
    expect(m?.kind).toBe('chart');
  });

  it('returns null for plain text', () => {
    expect(tvUrlDetect('비슷한 패턴 찾아줘')).toBeNull();
    expect(tvUrlDetect('')).toBeNull();
    expect(tvUrlDetect('https://example.com')).toBeNull();
  });

  it('prefers idea match over chart match when both present', () => {
    const m = tvUrlDetect('chart https://tradingview.com/chart/x?s=1 and idea https://tradingview.com/i/abc');
    expect(m?.kind).toBe('idea');
  });
});
