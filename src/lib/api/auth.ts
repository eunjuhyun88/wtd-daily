export interface RegisterAuthPayload {
  email: string;
  nickname: string;
  walletAddress?: string;
  walletMessage?: string;
  walletSignature?: string;
}

export interface LoginAuthPayload {
  email: string;
  nickname?: string;
  walletAddress: string;
  walletMessage: string;
  walletSignature: string;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  nickname: string;
  tier: 'guest' | 'registered' | 'connected' | 'verified' | string;
  phase: number;
  walletAddress?: string | null;
  wallet?: string | null;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: AuthUserPayload | null;
}

export interface WalletNoncePayload {
  address: string;
  provider?: string;
  chain?: string;
}

export interface VerifyWalletPayload {
  address: string;
  message: string;
  signature: string;
  provider?: string;
  chain?: string;
}

interface ApiErrorPayload {
  error?: string;
}

export interface PrivySessionPayload {
  accessToken: string;
  email?: string;
}

function normalizeAuthErrorMessage(message: string): string {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes('origin not allowed')) {
    return '현재 접속 중인 도메인이 로그인 허용 목록에 없습니다. 승인된 앱 도메인에서 다시 시도해 주세요.';
  }
  if (lower.includes('cross-origin mutating api request blocked')) {
    return '브라우저 origin 검증에 막혀 로그인 요청이 차단됐습니다. 앱 도메인 설정을 확인해 주세요.';
  }
  if (lower.includes('missing origin metadata for session mutation')) {
    return '브라우저가 로그인 요청의 origin 정보를 보내지 않아 세션 발급이 차단됐습니다. 새로고침 후 다시 시도해 주세요.';
  }
  if (lower.includes('privy not configured')) {
    return '로그인 서비스가 아직 설정되지 않았습니다.';
  }
  if (lower.includes('invalid or expired privy token')) {
    return '로그인 토큰이 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.';
  }
  if (lower.includes('authentication failed')) {
    return '로그인 세션을 만드는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (lower.includes('bot verification failed') || lower.includes('verification expired')) {
    return '봇 검증에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (lower.includes('failed to send code')) {
    return '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  return normalized;
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as ApiErrorPayload;
    if (payload?.error) return normalizeAuthErrorMessage(payload.error);
  } catch {
    // ignore parse error
  }
  return `Request failed (${res.status})`;
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return (await res.json()) as TResponse;
}

async function getJson<TResponse>(url: string): Promise<TResponse> {
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return (await res.json()) as TResponse;
}

export function registerAuth(payload: RegisterAuthPayload) {
  return postJson<{ success: boolean; user: AuthUserPayload }>('/api/auth/register', payload);
}

export function loginAuth(payload: LoginAuthPayload) {
  return postJson<{ success: boolean; user: AuthUserPayload }>('/api/auth/login', payload);
}

export function fetchAuthSession() {
  return getJson<AuthSessionResponse>('/api/auth/session');
}

export function exchangePrivySession(payload: PrivySessionPayload) {
  return postJson<{ success: boolean; user: AuthUserPayload }>('/api/auth/privy', payload);
}

export function requestWalletNonce(payload: WalletNoncePayload) {
  return postJson<{
    success: boolean;
    address: string;
    chain?: string;
    nonce: string;
    message: string;
    expiresAt: string;
  }>('/api/auth/nonce', payload);
}

export function verifyWalletSignature(payload: VerifyWalletPayload) {
  return postJson<{
    success: boolean;
    verified: boolean;
    linkedToUser: boolean;
    wallet: {
      address: string;
      shortAddr: string;
      chain: string;
      provider: string;
      verified: boolean;
    };
  }>('/api/auth/verify-wallet', payload);
}

export function logoutAuth() {
  return postJson<{ success: boolean }>('/api/auth/logout', {});
}

export interface WalletAuthPayload {
  walletAddress: string;
  walletMessage: string;
  walletSignature: string;
  turnstileToken?: string;
}

export interface WalletAuthResponse {
  success: boolean;
  action: 'login' | 'register';
  user: AuthUserPayload;
}

export function walletAuth(payload: WalletAuthPayload) {
  return postJson<WalletAuthResponse>('/api/auth/wallet-auth', payload);
}

export function explainAuthError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return normalizeAuthErrorMessage(error.message);
  }
  if (typeof error === 'string' && error.trim()) {
    return normalizeAuthErrorMessage(error);
  }
  return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
