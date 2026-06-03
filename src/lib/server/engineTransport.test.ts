import { describe, expect, it, vi } from 'vitest';
import { engineFetch } from './engineTransport';

describe('engineTransport', () => {
  it('builds engine URLs without changing safe paths', async () => {
    const upstream = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(upstream as never);

    const res = await engineFetch('/healthz?probe=1');

    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/healthz?probe=1',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it('rejects dot-segment paths before attaching engine credentials', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(engineFetch('/memory/../jobs/status')).rejects.toThrow(/Unsafe engine path/);
    await expect(engineFetch('/memory/%2e%2e/jobs/status')).rejects.toThrow(/Unsafe engine path/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
