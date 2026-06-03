// Audit-005 (R4 Items A/B): admin gate for privileged API surfaces.
//
// hooks.server.ts already 401s any unauthenticated request to non-public
// `/api/` routes, but it does not distinguish between regular beta users
// and operators. Two existing endpoints — /api/admin/agent-stats and
// /api/jobs/[job]/run — must only be reachable by operators:
//
//   • agent-stats reads agent_telemetry rows (including user_message bodies)
//     and would leak other users' chat content to any authenticated peer.
//   • jobs/[job]/run forwards to engine /jobs/{job}/run with the
//     SCHEDULER_SECRET bearer; lets any authenticated user trigger expensive
//     pipeline runs / circuit-break the throttle (DoS / cost amplification).
//
// Operator allowlist lives in the ADMIN_EMAILS env var as a comma-separated,
// case-insensitive list — the lightest mechanism that does not require a
// schema change. Empty / missing var → no admin (fail-closed).
//
// Email is sourced from event.locals.user.email which is populated by
// hooks.server.ts → getAuthUserFromCookies → AuthUserRow (always non-null
// for authenticated requests). The hooks gate runs first, so by the time
// any handler calls requireAdmin() the user is guaranteed authenticated.

import type { AuthUserRow } from './authRepository';

let _cachedAllowlist: Set<string> | null = null;
let _cachedRaw: string | undefined;

function getAdminEmails(): Set<string> {
  // Re-read env once per process. Vercel/Cloud Run rotate envs only on
  // redeploy, so caching by raw string is safe.
  const raw = process.env.ADMIN_EMAILS;
  if (raw === _cachedRaw && _cachedAllowlist) return _cachedAllowlist;
  _cachedRaw = raw;
  const set = new Set<string>();
  if (raw) {
    for (const piece of raw.split(',')) {
      const trimmed = piece.trim().toLowerCase();
      if (trimmed) set.add(trimmed);
    }
  }
  _cachedAllowlist = set;
  return set;
}

export function isAdmin(user: AuthUserRow | null | undefined): boolean {
  if (!user?.email) return false;
  return getAdminEmails().has(user.email.toLowerCase().trim());
}

/**
 * Returns null if the user is an admin, otherwise a 403 Response ready to
 * return from a SvelteKit endpoint. Callers must `return` the result when
 * non-null.
 *
 *   const block = requireAdmin(locals.user);
 *   if (block) return block;
 */
export function requireAdmin(user: AuthUserRow | null | undefined): Response | null {
  if (isAdmin(user)) return null;
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}
