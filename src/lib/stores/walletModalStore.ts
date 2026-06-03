import { writable } from 'svelte/store';
import { walletStore } from './walletStore';

export type WalletModalStep =
  | 'wallet-select'
  | 'connecting'
  | 'sign-message'
  | 'connected'
  | 'signup'
  | 'login'
  | 'passkey-progress';

export interface WalletModalState {
  open: boolean;
  step: WalletModalStep;
  signature: string | null;
}

const defaultModal: WalletModalState = {
  open: false,
  step: 'wallet-select',
  signature: null,
};

export const walletModalStore = writable<WalletModalState>(defaultModal);

export function openWalletModal() {
  let connected = false;
  const unsub = walletStore.subscribe(w => { connected = w.connected; });
  unsub();
  walletModalStore.update(m => ({
    ...m,
    open: true,
    step: connected ? 'connected' : 'wallet-select',
  }));
}

export function closeWalletModal() {
  walletModalStore.update(m => ({ ...m, open: false }));
}

export function setWalletModalStep(step: WalletModalStep) {
  walletModalStore.update(m => ({ ...m, step }));
}

export function signMessage(signature: string) {
  walletModalStore.update(m => ({ ...m, signature, step: 'connected' }));
  // Upgrade auth tier from guest→connected on wallet sign
  import('./authStore').then(({ authStore: aStore }) => {
    aStore.update(a => ({
      ...a,
      tier: a.tier === 'guest' ? 'connected' : a.tier,
    }));
  }).catch(() => {});
}
