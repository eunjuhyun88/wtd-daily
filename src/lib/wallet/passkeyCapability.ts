let _cached: boolean | null = null;

export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.PUBLIC_PASSKEY_ENABLED !== 'true') return false;
  if (_cached !== null) return _cached;
  try {
    _cached = !!(
      window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    _cached = false;
  }
  return _cached;
}
