import { writable, derived } from 'svelte/store';
import { STORAGE_KEYS } from './storageKeys';
import { loadFromStorage, autoSave } from '$lib/utils/storage';

export interface WalletState {
  connected: boolean;
  address: string | null;
  shortAddr: string | null;
  balance: number;
  chain: string;
  provider: string | null;
}

const KNOWN_PROVIDERS = new Set([
  'metamask', 'coinbase', 'walletconnect', 'phantom', 'base',
  'rabby', 'zerion', 'rainbow', // EIP-6963 detected wallets
]);

function normalizeProvider(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim().toLowerCase();
  if (KNOWN_PROVIDERS.has(value)) return value;
  if (value === 'meta mask' || value === 'metamask wallet') return 'metamask';
  if (value === 'coinbase wallet') return 'coinbase';
  if (value === 'wallet connect') return 'walletconnect';
  return null;
}

export function toShortAddr(address: string | null): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const defaultWallet: WalletState = {
  connected: false,
  address: null,
  shortAddr: null,
  balance: 0,
  chain: 'ARB',
  provider: null,
};

function loadWallet(): WalletState {
  const saved = loadFromStorage<Partial<WalletState>>(STORAGE_KEYS.wallet, null as unknown as Partial<WalletState>);
  if (!saved) return defaultWallet;
  return {
    ...defaultWallet,
    chain: typeof saved.chain === 'string' && saved.chain.trim() ? saved.chain.toUpperCase() : defaultWallet.chain,
    provider: normalizeProvider(saved.provider),
  };
}

export const walletStore = writable<WalletState>(loadWallet());

// Persist only reconnect hints — no auth state in localStorage
autoSave(walletStore, STORAGE_KEYS.wallet, (w) => ({
  chain: w.chain,
  provider: w.provider,
}), 300);

export const isWalletConnected = derived(walletStore, $w => $w.connected);

/** Called from authStore when a server session restores a wallet address. */
export function setSessionAddress(address: string) {
  walletStore.update(w => {
    if (w.connected && w.address) return w; // live browser connection takes priority
    return {
      ...w,
      address,
      shortAddr: toShortAddr(address),
      connected: true,
    };
  });
}

export function connectWallet(provider: string = 'metamask', address?: string, chain: string = 'ARB') {
  const resolvedAddr = address && address.trim() ? address.trim() : null;
  walletStore.update(w => ({
    ...w,
    connected: true,
    address: resolvedAddr,
    shortAddr: toShortAddr(resolvedAddr),
    chain: chain.toUpperCase(),
    provider,
  }));
}

export function disconnectWallet() {
  walletStore.update(() => ({ ...defaultWallet }));
}

let _walletListenerCleanup: (() => void) | null = null;

export function initWalletListeners(): () => void {
  import('$lib/wallet/providers').then(({ setupMetaMaskListeners }) => {
    _walletListenerCleanup?.();
    _walletListenerCleanup = setupMetaMaskListeners({
      onAccountsChanged: (accounts) => {
        const address = accounts[0] ?? null;
        if (!address) {
          disconnectWallet();
        } else {
          walletStore.update(w => ({
            ...w,
            address,
            shortAddr: toShortAddr(address),
          }));
        }
      },
      onChainChanged: (chainId) => {
        const num = parseInt(chainId, 16);
        const chainMap: Record<number, string> = { 1: 'ETH', 10: 'OP', 137: 'POL', 8453: 'BASE', 42161: 'ARB' };
        const chain = chainMap[num] ?? `EVM:${num}`;
        walletStore.update(w => ({ ...w, chain }));
      },
      onDisconnect: () => { disconnectWallet(); },
    });
  });
  return () => { _walletListenerCleanup?.(); _walletListenerCleanup = null; };
}

export async function trySilentReconnect(): Promise<void> {
  if (typeof window === 'undefined') return;

  let storeState: WalletState = defaultWallet;
  const unsub = walletStore.subscribe(w => { storeState = w; });
  unsub();

  if (!storeState.address) return;

  const { tryGetConnectedAccount, getPreferredEvmChainCode } = await import('$lib/wallet/providers');

  const storedKey = storeState.provider;
  const providerKey = (
    storedKey === 'metamask' || storedKey === 'coinbase' || storedKey === 'phantom'
      ? storedKey
      : 'metamask'
  ) as 'metamask' | 'coinbase' | 'phantom';

  const browserAddress = await tryGetConnectedAccount(providerKey);
  if (!browserAddress) return;
  if (browserAddress.toLowerCase() !== storeState.address.toLowerCase()) return;

  walletStore.update(w => {
    if (!w.address) return w;
    return {
      ...w,
      connected: true,
      provider: w.provider || providerKey,
      chain: w.chain || getPreferredEvmChainCode(),
    };
  });
}
