import { z } from 'zod';

// ── Shared primitives ─────────────────────────────────────────────────────────

const WalletMethod = z.enum([
  'passkey', 'privy_email',
  'eip6963', 'metamask', 'coinbase', 'walletconnect', 'phantom', 'base',
]);

const DismissReason = z.enum(['x_button', 'overlay', 'esc']);

const ReasonCode = z.enum([
  'user_cancelled', 'nonce_expired', 'rate_limited',
  'provider_error', 'server_error', 'unknown',
]);

// ── Event schemas ─────────────────────────────────────────────────────────────

const ModalOpenSchema = z.object({
  event: z.literal('wallet_modal_open'),
  entry_step: z.string().max(64),
});

const Eip6963DetectedSchema = z.object({
  event: z.literal('eip6963_detected'),
  count: z.number().int().nonnegative(),
  rdns_list: z.array(z.string().max(128)),
});

const WalletConnectedSchema = z.object({
  event: z.literal('wallet_connected'),
  method: WalletMethod,
  rdns: z.string().max(128).optional(),
});

const WalletConnectFailedSchema = z.object({
  event: z.literal('wallet_connect_failed'),
  method: WalletMethod,
  error_code: z.string().max(64).optional(),
});

const AuthSuccessSchema = z.object({
  event: z.literal('auth_success'),
  method: WalletMethod,
  is_new_user: z.boolean().optional(),
});

const AuthFailureSchema = z.object({
  event: z.literal('auth_failure'),
  method: WalletMethod,
  stage: z.string().max(64).optional(),
  reason_code: ReasonCode.optional(),
  retryable: z.boolean().optional(),
});

const ModalDismissSchema = z.object({
  event: z.literal('modal_dismiss'),
  stage: z.string().max(64),
  reason: DismissReason,
});

// ── Union ─────────────────────────────────────────────────────────────────────

export const WalletEventSchema = z.discriminatedUnion('event', [
  ModalOpenSchema,
  Eip6963DetectedSchema,
  WalletConnectedSchema,
  WalletConnectFailedSchema,
  AuthSuccessSchema,
  AuthFailureSchema,
  ModalDismissSchema,
]);

export type WalletEvent = z.infer<typeof WalletEventSchema>;

// ── PII guard ─────────────────────────────────────────────────────────────────

const PII_PATTERNS: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  /\b0x[0-9a-fA-F]{40}\b/g,
];

function piiGuard<T>(obj: T): T {
  let s = JSON.stringify(obj);
  for (const re of PII_PATTERNS) s = s.replace(re, '[REDACTED]');
  return JSON.parse(s) as T;
}

// ── Push helper ───────────────────────────────────────────────────────────────

interface GTMWindow extends Window { dataLayer?: Array<Record<string, unknown>>; }

export function pushWalletEvent(raw: WalletEvent, extra: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as GTMWindow;
  if (!Array.isArray(w.dataLayer)) return;
  const parsed = WalletEventSchema.safeParse(raw);
  if (!parsed.success) return;
  w.dataLayer.push(piiGuard({ ...parsed.data, area: 'wallet_modal', ...extra }));
}
