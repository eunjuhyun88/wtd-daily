// Module-level singletons for Supabase clients.
// Each route handler that calls `createClient(...)` per request was forcing a
// fresh HTTP connection pool every time — a measurable hit on cold paths.
// Use `getSupabaseAdmin()` or `getSupabaseAnon()` instead.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let _adminClient: SupabaseClient | null = null;
let _anonClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;
  // $env/dynamic/public only exposes vars declared in .env at build time.
  // Read PUBLIC_ vars from process.env directly for Cloud Run runtime compat.
  const url = process.env.PUBLIC_SUPABASE_URL ?? '';
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) {
    throw new Error('Supabase env vars not set (PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }
  _adminClient = createClient(url, key);
  return _adminClient;
}

// Anon client — use for routes where data is safe to expose publicly.
// service_role is forbidden in the app-web runtime (security guard in hooks.server.ts).
export function getSupabaseAnon(): SupabaseClient {
  if (_anonClient) return _anonClient;
  const url = process.env.PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) {
    throw new Error('Supabase anon env vars not set (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)');
  }
  _anonClient = createClient(url, key);
  return _anonClient;
}
