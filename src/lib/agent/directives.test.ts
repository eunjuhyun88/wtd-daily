/** W-0500 PR1 — parseDirectives nested-payload regression tests. */
import { describe, it, expect } from 'vitest';
import { parseDirectives } from './directives';

describe('parseDirectives', () => {
  it('parses a simple verdict_card payload (no nesting)', () => {
    const raw = '<directive type="verdict_card" payload={"symbol":"BTC","direction":"LONG","p_win":0.62}/>';
    const segs = parseDirectives(raw);
    expect(segs).toHaveLength(1);
    expect(segs[0].kind).toBe('directive');
    if (segs[0].kind !== 'directive') throw new Error('unreachable');
    expect(segs[0].directive.type).toBe('verdict_card');
  });

  it('parses a tv_fit_card with nested array + nested object', () => {
    const payload = {
      asset: 'BTCUSDT',
      timeframe: '4h',
      author_handle: 'alice',
      author_display_name: 'Alice',
      idea_excerpt: 'breakout setup',
      fits: [
        { pattern_slug: 'alpha_confluence', pattern_name: 'Alpha Confluence', similarity: 0.74, direction_match: true },
      ],
      author_score: { hit_rate_24h: 0.55, brier: 0.21, n_ideas_30d: 18, tier: 'A' as const },
      source_url: 'https://www.tradingview.com/i/abc',
    };
    const raw = `<directive type="tv_fit_card" payload=${JSON.stringify(payload)}/>`;
    const segs = parseDirectives(raw);
    expect(segs).toHaveLength(1);
    if (segs[0].kind !== 'directive') throw new Error('unreachable');
    expect(segs[0].directive.type).toBe('tv_fit_card');
    expect(segs[0].directive.payload).toEqual(payload);
  });

  it('preserves text around a directive token', () => {
    const raw = 'analysis: <directive type="verdict_card" payload={"symbol":"BTC","direction":"LONG","p_win":0.5}/> done';
    const segs = parseDirectives(raw);
    expect(segs).toHaveLength(3);
    expect(segs[0].kind).toBe('text');
    expect(segs[1].kind).toBe('directive');
    expect(segs[2].kind).toBe('text');
  });

  it('falls back to raw text on malformed payload JSON', () => {
    const raw = '<directive type="tv_fit_card" payload={not valid json}/>';
    const segs = parseDirectives(raw);
    expect(segs[0].kind).toBe('text');
  });

  it('handles a string containing braces inside a JSON value', () => {
    const payload = { asset: 'BTC', note: 'has {brace} in value', fits: [], author_score: null, source_url: 'x', author_handle: '', author_display_name: null, idea_excerpt: '', timeframe: '' };
    const raw = `<directive type="tv_fit_card" payload=${JSON.stringify(payload)}/>`;
    const segs = parseDirectives(raw);
    if (segs[0].kind !== 'directive') throw new Error('expected directive');
    expect((segs[0].directive.payload as typeof payload).note).toBe('has {brace} in value');
  });
});
