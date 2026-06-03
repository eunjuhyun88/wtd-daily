// Browser WebAuthn serialization helpers for Privy passkey integration.
// Privy SDK returns snake_case options; WebAuthn browser API expects camelCase.
// @simplewebauthn/browser is not installed — we handle serialization manually.

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlToBuf(s: string): ArrayBuffer {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Convert Privy snake_case signup options → WebAuthn RegistrationResponseJSON.
export async function webAuthnCreate(opts: any): Promise<any> {
  const creationOpts: PublicKeyCredentialCreationOptions = {
    challenge: b64urlToBuf(opts.challenge),
    rp: opts.rp,
    user: {
      id: b64urlToBuf(opts.user.id),
      name: opts.user.name,
      displayName: opts.user.display_name,
    },
    pubKeyCredParams: (opts.pub_key_cred_params ?? []).map((p: any) => ({
      alg: p.alg,
      type: p.type,
    })),
    timeout: 60000,
    attestation: opts.attestation,
    authenticatorSelection: opts.authenticator_selection
      ? {
          authenticatorAttachment: opts.authenticator_selection.authenticator_attachment,
          requireResidentKey: opts.authenticator_selection.require_resident_key,
          residentKey: opts.authenticator_selection.resident_key,
          userVerification: opts.authenticator_selection.user_verification,
        }
      : undefined,
    excludeCredentials: opts.exclude_credentials?.map((c: any) => ({
      id: b64urlToBuf(c.id),
      type: c.type,
      transports: c.transports,
    })),
  };

  const cred = (await navigator.credentials.create({ publicKey: creationOpts })) as PublicKeyCredential | null;
  if (!cred) throw new Error('WebAuthn returned no credential');

  const resp = cred.response as AuthenticatorAttestationResponse;
  return {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: bufToB64url(resp.clientDataJSON),
      attestationObject: bufToB64url(resp.attestationObject),
      ...(typeof resp.getAuthenticatorData === 'function'
        ? { authenticatorData: bufToB64url(resp.getAuthenticatorData()) }
        : {}),
      transports: typeof (resp as any).getTransports === 'function'
        ? (resp as any).getTransports()
        : undefined,
    },
    authenticatorAttachment: (cred as any).authenticatorAttachment,
    clientExtensionResults: cred.getClientExtensionResults(),
  };
}

// Convert Privy snake_case auth options → WebAuthn AuthenticationResponseJSON + raw challenge.
export async function webAuthnGet(opts: any): Promise<{ response: any; challenge: string }> {
  const requestOpts: PublicKeyCredentialRequestOptions = {
    challenge: b64urlToBuf(opts.challenge),
    allowCredentials: opts.allow_credentials?.map((c: any) => ({
      id: b64urlToBuf(c.id),
      type: c.type,
      transports: c.transports,
    })),
    userVerification: opts.user_verification,
    timeout: 60000,
  };

  const cred = (await navigator.credentials.get({ publicKey: requestOpts })) as PublicKeyCredential | null;
  if (!cred) throw new Error('WebAuthn returned no credential');

  const resp = cred.response as AuthenticatorAssertionResponse;
  return {
    challenge: opts.challenge,
    response: {
      id: cred.id,
      rawId: bufToB64url(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: bufToB64url(resp.clientDataJSON),
        authenticatorData: bufToB64url(resp.authenticatorData),
        signature: bufToB64url(resp.signature),
        userHandle: resp.userHandle ? bufToB64url(resp.userHandle) : undefined,
      },
      authenticatorAttachment: (cred as any).authenticatorAttachment,
      clientExtensionResults: cred.getClientExtensionResults(),
    },
  };
}
