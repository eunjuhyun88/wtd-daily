import { writable, derived } from 'svelte/store';
import { resolveLifecyclePhase } from './progressionRules';
import { fetchAuthSession, type AuthUserPayload } from '$lib/api/auth';

export type UserTier = 'guest' | 'registered' | 'connected' | 'verified';

export interface AuthState {
  hydrated: boolean;
  authenticated: boolean;
  tier: UserTier;
  email: string | null;
  nickname: string | null;
  phase: number;
  userId: string | null;
  hasSeenDemo: boolean;
  hasCompletedOnboarding: boolean;
  matchesPlayed: number;
  totalLP: number;
}

const defaultAuth: AuthState = {
  hydrated: false,
  authenticated: false,
  tier: 'guest',
  email: null,
  nickname: null,
  phase: 0,
  userId: null,
  hasSeenDemo: false,
  hasCompletedOnboarding: false,
  matchesPlayed: 0,
  totalLP: 0,
};

// No autoSave — auth state is server session based, never localStorage.
export const authStore = writable<AuthState>(defaultAuth);

export const userTier = derived(authStore, $a => $a.tier);
export const userPhase = derived(authStore, $a => $a.phase);

function normalizeTier(value: unknown, fallback: UserTier): UserTier {
  const tier = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (tier === 'verified' || tier === 'connected' || tier === 'registered' || tier === 'guest') {
    return tier as UserTier;
  }
  return fallback;
}

export function applyAuthenticatedUser(user: AuthUserPayload) {
  authStore.update(a => {
    const phase = Number.isFinite(Number(user.phase)) ? Math.max(1, Number(user.phase)) : Math.max(1, a.phase);
    const walletAddress = typeof user.walletAddress === 'string' ? user.walletAddress
      : typeof user.wallet === 'string' ? user.wallet : null;
    return {
      ...a,
      authenticated: true,
      hydrated: true,
      email: user.email || a.email,
      nickname: user.nickname || a.nickname,
      userId: (user as any).userId || (user as any).id || a.userId || null,
      tier: normalizeTier(user.tier, walletAddress ? 'connected' : 'registered'),
      phase,
      hasCompletedOnboarding: true,
    };
  });

  // Also sync wallet address/connected into walletStore from server session
  const walletAddress = typeof user.walletAddress === 'string' ? user.walletAddress
    : typeof user.wallet === 'string' ? user.wallet : null;
  if (walletAddress) {
    // Lazy import avoids circular dependency at module load time
    import('./walletStore').then(({ walletStore: wStore, setSessionAddress }) => {
      setSessionAddress(walletAddress);
    }).catch(() => {});
  }
}

export function clearAuthenticatedUser() {
  authStore.set({ ...defaultAuth, hydrated: true });
}

let _authHydrated = false;
let _authHydrationPromise: Promise<void> | null = null;

export async function hydrateAuthSession(force = false): Promise<void> {
  if (typeof window === 'undefined') return;
  if (_authHydrated && !force) return;
  if (_authHydrationPromise) return _authHydrationPromise;

  _authHydrationPromise = (async () => {
    try {
      const res = await fetchAuthSession();
      if (res.authenticated && res.user) {
        applyAuthenticatedUser(res.user);
      } else {
        clearAuthenticatedUser();
      }
      _authHydrated = true;
    } catch (error) {
      console.warn('[authStore] session hydrate failed', error);
    }
  })();

  try {
    await _authHydrationPromise;
  } finally {
    _authHydrationPromise = null;
  }
}

export function registerUser(email: string, nickname: string) {
  authStore.update(a => ({
    ...a,
    tier: a.tier === 'guest' ? 'registered' : a.tier,
    email,
    nickname,
    phase: Math.max(resolveLifecyclePhase(a.matchesPlayed, a.totalLP), 1),
    hasCompletedOnboarding: true,
  }));
}

export function completeDemoView() {
  authStore.update(a => ({
    ...a,
    hasSeenDemo: true,
    phase: Math.max(resolveLifecyclePhase(a.matchesPlayed, a.totalLP), 1),
  }));
}

// Ping GET /api/auth/session every 5 min + on tab re-focus to keep the
// server-side sliding window alive. Returns a cleanup function.
export function startSessionRefresh(): () => void {
  if (typeof window === 'undefined') return () => {};

  const INTERVAL_MS = 5 * 60 * 1000;
  const timerId = window.setInterval(() => hydrateAuthSession(true), INTERVAL_MS);

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') hydrateAuthSession(true);
  };
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    window.clearInterval(timerId);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

export function recordMatch(_won: boolean, lpDelta: number) {
  authStore.update(a => {
    const matches = a.matchesPlayed + 1;
    const lp = a.totalLP + lpDelta;
    const phase = resolveLifecyclePhase(matches, lp);
    return { ...a, matchesPlayed: matches, totalLP: lp, phase };
  });
}
