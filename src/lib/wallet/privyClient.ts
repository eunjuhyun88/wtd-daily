import { env } from '$env/dynamic/public';

let _privy: any = null;

export function isPrivyConfigured(): boolean {
  return !!env.PUBLIC_PRIVY_APP_ID;
}

async function getPrivy(): Promise<any> {
  if (_privy) return _privy;
  const { default: Privy, LocalStorage } = await import('@privy-io/js-sdk-core');
  _privy = new Privy({
    appId: env.PUBLIC_PRIVY_APP_ID!,
    storage: new LocalStorage(),
  });
  return _privy;
}

declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, opts: Record<string, unknown>): string;
      reset(widgetId: string): void;
    };
  }
}

async function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.turnstile) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile]');
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.dataset.turnstile = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(s);
  });
}

async function getTurnstileToken(siteKey: string): Promise<string> {
  await loadTurnstileScript();
  return new Promise<string>((resolve, reject) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;bottom:0;right:0;z-index:99999;';
    document.body.appendChild(container);

    const cleanup = () => { try { document.body.removeChild(container); } catch { /* ignore */ } };

    window.turnstile!.render(container, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (token: string) => { cleanup(); resolve(token); },
      'error-callback': () => { cleanup(); reject(new Error('Bot verification failed. Please try again.')); },
      'expired-callback': () => { cleanup(); reject(new Error('Verification expired. Please try again.')); },
    });
  });
}

export async function requestTurnstileToken(): Promise<string | undefined> {
  try {
    const privy = await getPrivy();
    const siteKey: string | undefined =
      privy.config?.captcha?.siteKey ??
      privy.config?.bot_protection?.siteKey ??
      privy._config?.captcha?.siteKey;
    if (!siteKey) return undefined;
    return await getTurnstileToken(siteKey);
  } catch {
    return undefined;
  }
}

export async function privySendCode(email: string): Promise<void> {
  const privy = await getPrivy();
  try {
    await privy.auth.email.sendCode(email);
  } catch (err: any) {
    const msg: string = err?.message ?? '';
    if (msg.toLowerCase().includes('bot') || msg.toLowerCase().includes('captcha') || msg.toLowerCase().includes('verification')) {
      const token = await requestTurnstileToken();
      await privy.auth.email.sendCode(email, token);
    } else {
      throw err;
    }
  }
}

export async function passkeyLogin(): Promise<{ accessToken: string }> {
  const privy = await getPrivy();
  const authOpts = await privy.auth.passkey.generateAuthenticationOptions();
  const { webAuthnGet } = await import('./passkeyWebAuthn');
  const { response, challenge } = await webAuthnGet(authOpts);
  const result = await privy.auth.passkey.loginWithPasskey(response, challenge);
  const r = result as any;
  const accessToken: string = r.identity_token ?? r.token ?? '';
  if (!accessToken) throw new Error('Privy did not return a verifiable token');
  return { accessToken };
}

export async function passkeySignup(): Promise<{ accessToken: string }> {
  const privy = await getPrivy();
  const signupOpts = await privy.auth.passkey.generateSignupOptions();
  const { webAuthnCreate } = await import('./passkeyWebAuthn');
  const regResponse = await webAuthnCreate(signupOpts);
  const result = await privy.auth.passkey.signupWithPasskey(regResponse);
  const r = result as any;
  const accessToken: string = r.identity_token ?? r.token ?? '';
  if (!accessToken) throw new Error('Privy did not return a verifiable token');
  return { accessToken };
}

export async function privyLoginWithCode(
  email: string,
  code: string
): Promise<{ address: string; accessToken: string }> {
  const privy = await getPrivy();
  const result = await privy.auth.email.loginWithCode(email, code, 'login-or-sign-up');
  const r = result as any;
  const wallets: any[] = r.user?.linked_accounts?.filter(
    (a: any) => a.type === 'wallet' && /^0x[0-9a-fA-F]{40}$/.test(a.address)
  ) ?? [];
  const address = wallets[0]?.address ?? '';
  // identity_token is the server-verifiable JWT (contains linked_accounts claims).
  // token is the client-side access token. Fall back in order.
  const accessToken: string = r.identity_token ?? r.token ?? '';
  if (!accessToken) throw new Error('Privy did not return a verifiable token');
  return { address, accessToken };
}

export async function privyOAuthGetURL(
  provider: string,
  redirectURI: string
): Promise<string> {
  const privy = await getPrivy();
  const result = await privy.auth.oauth.generateURL(provider, redirectURI) as any;
  const url: string = result?.redirect_url ?? result?.url ?? '';
  if (!url) throw new Error('Privy did not return an OAuth URL');
  return url;
}

export async function privyOAuthLoginWithCode(
  code: string,
  state: string,
  provider: string
): Promise<{ accessToken: string; email?: string }> {
  const privy = await getPrivy();
  const result = await privy.auth.oauth.loginWithCode(code, state, provider, 'raw', 'login-or-sign-up') as any;
  const accessToken: string = result?.identity_token ?? result?.token ?? '';
  if (!accessToken) throw new Error('Privy did not return a verifiable token');

  // Privy 0.61 identity_token may omit linked_accounts — extract email from SDK user object
  const linked: any[] = Array.isArray(result?.user?.linked_accounts) ? result.user.linked_accounts : [];
  const emailEntry = linked.find((a: any) =>
    (a.type === 'email' && typeof a.address === 'string' && a.address.includes('@')) ||
    (typeof a.type === 'string' && a.type.endsWith('_oauth') && typeof a.email === 'string' && a.email.includes('@'))
  );
  const email: string | undefined = emailEntry
    ? ((emailEntry.address as string | undefined) ?? (emailEntry.email as string | undefined))
    : undefined;

  return { accessToken, email };
}
