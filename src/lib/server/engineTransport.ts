import { env } from '$env/dynamic/private';
import * as Sentry from '@sentry/sveltekit';
import { engineCache } from './engineCache';

export const ENGINE_URL = (env.ENGINE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

function buildEngineUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || path.includes('#')) {
    throw new Error(`Unsafe engine path: ${path}`);
  }
  const pathname = path.split('?', 1)[0] ?? '';
  if (/%(?:2e|2f|5c)/i.test(pathname)) {
    throw new Error(`Unsafe engine path: ${path}`);
  }
  const segments = pathname.split('/').slice(1);
  if (!segments.length || !segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..')) {
    throw new Error(`Unsafe engine path: ${path}`);
  }
  return new URL(path, `${ENGINE_URL}/`).toString();
}

function engineInternalSecret(): string {
  return env.ENGINE_INTERNAL_SECRET?.trim() ?? '';
}

export function buildEngineHeaders(headers?: HeadersInit): Headers {
  const next = new Headers(headers);
  const secret = engineInternalSecret();
  if (secret) next.set('x-engine-internal-secret', secret);

  // Distributed tracing: app → engine
  const traceId = Sentry.getActiveSpan()?.spanContext()?.traceId;
  if (traceId) next.set('traceparent', traceId);

  return next;
}

export async function engineFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = buildEngineUrl(path);
  const method = init.method?.toUpperCase() ?? 'GET';
  const cacheKey = `engine:${method}:${path}`;

  if (method === 'GET') {
    const cached = await engineCache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'content-type': 'application/json', 'x-cache': 'HIT' },
      });
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: buildEngineHeaders(init.headers),
  });

  if (method === 'GET' && res.ok) {
    try {
      const text = await res.clone().text();
      const json = JSON.parse(text) as unknown;
      await engineCache.set(cacheKey, json);
      return new Response(text, {
        status: res.status,
        headers: { ...Object.fromEntries(res.headers), 'x-cache': 'MISS' },
      });
    } catch (err) {
      console.error('[engineFetch] cache error:', err);
      return res;
    }
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await engineCache.invalidate(path.split('/')[0] ?? '');
  }

  return res;
}
