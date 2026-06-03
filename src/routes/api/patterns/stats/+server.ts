// GET /api/patterns/stats
// Returns: { stats: PatternStats[] }
// Fetches library (to get all slugs), then per-slug stats in parallel.
// Field mapping: delegated to typed adapter — see $lib/types/patternStats.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { engineFetch } from '$lib/server/engineTransport';
import { scanLimiter } from '$lib/server/rateLimit';
import { adaptEngineStats, type PatternStats } from '$lib/types/patternStats';
import { buildPublicCacheHeaders } from '$lib/server/publicCacheHeaders';
import { fetchPatternStatsFromVerdicts } from '$lib/server/patterns/supabasePatternStats';
import { readLocalPatternStats } from '$lib/server/patterns/localPatternRuntime';

type SupabaseStatsResult = {
  stats: PatternStats[];
  timedOut: boolean;
};

function supabaseStatsTimeout(ms: number): Promise<SupabaseStatsResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ stats: [], timedOut: true }), ms);
  });
}

export const GET: RequestHandler = async ({ getClientAddress, url }) => {
  const t0 = performance.now();
  const supabaseStats = await Promise.race([
    fetchPatternStatsFromVerdicts()
      .then((stats) => ({ stats, timedOut: false }))
      .catch((err) => {
        console.info(`[api/patterns/stats] supabase verdict stats unavailable: ${(err as Error).message ?? String(err)}`);
        return { stats: [], timedOut: false };
      }),
    supabaseStatsTimeout(1_500),
  ]);
  if (supabaseStats.timedOut) {
    console.info('[api/patterns/stats] supabase verdict stats timeout; trying engine/local fallback');
  }
  if (supabaseStats.stats.length > 0) {
    return json({ stats: supabaseStats.stats, ok: true, source: 'supabase' }, {
      headers: buildPublicCacheHeaders({
        browserMaxAge: 0,
        sharedMaxAge: 60,
        staleWhileRevalidate: 120,
      }),
    });
  }

  const localStats = readLocalPatternStats();
  if (localStats.length > 0) {
    const totalMs = Math.round(performance.now() - t0);
    console.info(`[api/patterns/stats] using local-runtime stats ${localStats.length} patterns total=${totalMs}ms`);
    return json({ stats: localStats, ok: true, source: 'local-runtime' }, {
      headers: buildPublicCacheHeaders({
        browserMaxAge: 0,
        sharedMaxAge: 60,
        staleWhileRevalidate: 120,
      }),
    });
  }

  if (!scanLimiter.check(getClientAddress())) {
    return json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const params = new URLSearchParams();
    const definitionScope = url.searchParams.get('definition_scope');
    if (definitionScope) {
      params.set('definition_scope', definitionScope);
    }
    const query = params.toString();
    const res = await engineFetch(`/patterns/stats/all${query ? `?${query}` : ''}`, {
      signal: AbortSignal.timeout(3_000),
    });
    const engineMs = res.headers.get('x-process-time-ms');
    if (!res.ok) return json({ stats: [], ok: false });

    const body = await res.json() as {
      patterns?: Record<string, Record<string, unknown>>;
    };

    const stats = Object.entries(body.patterns ?? {})
      .filter(([, raw]) => !('error' in raw))
      .map(([slug, raw]) => adaptEngineStats(raw, slug));

    const totalMs = Math.round(performance.now() - t0);
    console.info(`[api/patterns/stats] ${stats.length} patterns total=${totalMs}ms engine=${engineMs ?? '?'}ms`);
    return json({ stats, ok: true }, {
      headers: buildPublicCacheHeaders({
        browserMaxAge: 0,
        sharedMaxAge: 60,
        staleWhileRevalidate: 120,
      }),
    });
  } catch (err) {
    const totalMs = Math.round(performance.now() - t0);
    console.info(`[api/patterns/stats] using local-runtime fallback after ${totalMs}ms: ${(err as Error).message ?? String(err)}`);
    const stats = readLocalPatternStats();
    return json({ stats, ok: stats.length > 0, source: 'local-runtime', error: 'engine unavailable' }, {
      headers: buildPublicCacheHeaders({
        browserMaxAge: 0,
        sharedMaxAge: 60,
        staleWhileRevalidate: 120,
      }),
    });
  }
};
