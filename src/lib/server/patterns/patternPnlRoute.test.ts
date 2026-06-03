import { beforeEach, describe, expect, it, vi } from 'vitest';

const engineFetchMock = vi.fn();
const readLocalPatternPnlStatsMock = vi.fn();
const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

vi.mock('$lib/server/engineTransport', () => ({
  engineFetch: engineFetchMock,
}));

vi.mock('$lib/server/patterns/localPatternRuntime', () => ({
  readLocalPatternPnlStats: readLocalPatternPnlStatsMock,
}));

function pnlBody(pattern_slug: string, n: number) {
  return {
    pattern_slug,
    n,
    mean_pnl_bps: n > 0 ? 42 : null,
    std_pnl_bps: n > 1 ? 8 : null,
    sharpe_like: n > 1 ? 5.25 : null,
    win_rate: n > 0 ? 0.5 : null,
    loss_rate: n > 0 ? 0.5 : null,
    indeterminate_rate: 0,
    ci_low: null,
    ci_high: null,
    preliminary: n < 30,
    btc_hold_return_pct: null,
    equity_curve: n > 0
      ? [
          { ts: '2026-05-10T00:00:00Z', cumulative_pnl_bps: 20 },
          { ts: '2026-05-11T00:00:00Z', cumulative_pnl_bps: 42 },
        ]
      : [],
  };
}

describe('pattern pnl route fallback', () => {
  beforeEach(() => {
    engineFetchMock.mockReset();
    readLocalPatternPnlStatsMock.mockReset();
    consoleWarnMock.mockClear();
  });

  it('returns engine pnl stats when the engine has realized data', async () => {
    const body = pnlBody('compression-breakout-reversal-v1', 12);
    engineFetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const { GET } = await import('../../../routes/api/patterns/[slug]/pnl-stats/+server');
    const res = await GET({ params: { slug: 'compression-breakout-reversal-v1' } } as never);

    expect(res.headers.get('x-pattern-source')).toBe('engine');
    await expect(res.json()).resolves.toEqual(body);
    expect(readLocalPatternPnlStatsMock).not.toHaveBeenCalled();
  });

  it('falls back to local ledger pnl stats when the engine responds empty', async () => {
    engineFetchMock.mockResolvedValue(
      new Response(JSON.stringify(pnlBody('liquidity-sweep-reversal-v1', 0)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const fallback = pnlBody('liquidity-sweep-reversal-v1', 4);
    readLocalPatternPnlStatsMock.mockReturnValue(fallback);

    const { GET } = await import('../../../routes/api/patterns/[slug]/pnl-stats/+server');
    const res = await GET({ params: { slug: 'liquidity-sweep-reversal-v1' } } as never);

    expect(res.headers.get('x-pattern-source')).toBe('local-runtime');
    await expect(res.json()).resolves.toEqual(fallback);
    expect(readLocalPatternPnlStatsMock).toHaveBeenCalledWith('liquidity-sweep-reversal-v1');
  });

  it('falls back to local ledger pnl stats when the engine times out', async () => {
    engineFetchMock.mockRejectedValue(new Error('timeout'));
    const fallback = pnlBody('mean-reversion-v1', 3);
    readLocalPatternPnlStatsMock.mockReturnValue(fallback);

    const { GET } = await import('../../../routes/api/patterns/[slug]/pnl-stats/+server');
    const res = await GET({ params: { slug: 'mean-reversion-v1' } } as never);

    expect(res.headers.get('x-pattern-source')).toBe('local-runtime');
    await expect(res.json()).resolves.toEqual(fallback);
    expect(readLocalPatternPnlStatsMock).toHaveBeenCalledWith('mean-reversion-v1');
  });
});
