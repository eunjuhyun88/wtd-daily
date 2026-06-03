<script lang="ts">
  import { walletAuth, requestWalletNonce, explainAuthError } from '$lib/api/auth';
  import { applyAuthenticatedUser } from '$lib/stores/authStore';
  import { connectWallet, disconnectWallet } from '$lib/stores/walletStore';
  import { setWalletModalStep } from '$lib/stores/walletModalStore';
  import { systemToasts } from '$lib/stores/notificationStore';
  import {
    WALLET_PROVIDER_LABEL,
    getPreferredEvmChainCode,
    getPreferredEvmChainHex,
    isWalletConnectConfigured,
    requestInjectedEvmAccount,
    resolveEvmProvider,
    signInjectedEvmMessage,
    type WalletProviderKey,
  } from '$lib/wallet/providers';
  import {
    RDNS_TO_PROVIDER,
    setSessionEip6963Provider,
    type DetectedWallet,
    type EIP1193Provider,
  } from '$lib/wallet/eip6963';
  import { requestTurnstileToken } from '$lib/wallet/privyClient';
  import { pushWalletEvent } from '$lib/gtm/walletEvents';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    detectedWallets: DetectedWallet[];
    walletConnectReady: boolean;
    onconnected: () => void;
  }
  let { detectedWallets, walletConnectReady, onconnected }: Props = $props();

  const preferredEvmChain = getPreferredEvmChainCode();
  const preferredEvmChainHex = getPreferredEvmChainHex();

  let connectingProvider = $state('');
  let actionError = $state('');

  function isStaticHidden(providerKey: WalletProviderKey): boolean {
    return detectedWallets.some(w => RDNS_TO_PROVIDER[w.rdns] === providerKey);
  }

  function isWalletProviderKey(v: string): v is WalletProviderKey {
    return v === 'metamask' || v === 'coinbase' || v === 'walletconnect' || v === 'phantom';
  }

  function extractErrMsg(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object') {
      const obj = error as Record<string, unknown>;
      if (typeof obj.message === 'string' && obj.message) return obj.message;
    }
    return fallback;
  }

  async function authenticateWalletSession(
    providerKey: string,
    walletAddress: string,
    rawProvider?: EIP1193Provider | null
  ) {
    setWalletModalStep('sign-message');
    const nonce = await requestWalletNonce({
      address: walletAddress,
      provider: providerKey,
      chain: preferredEvmChain,
    });

    // Use the raw EIP-6963 provider directly when available — avoids resolving
    // via window.ethereum which may point to the wrong wallet when multiple
    // extensions are installed (e.g., Rabby overriding MetaMask's slot).
    let walletSignature: string;
    if (rawProvider) {
      const sigRaw = await (rawProvider as any).request({
        method: 'personal_sign',
        params: [nonce.message, walletAddress],
      }) as string;
      if (typeof sigRaw !== 'string' || !sigRaw.startsWith('0x')) {
        throw new Error('Wallet returned an invalid signature.');
      }
      walletSignature = sigRaw;
    } else {
      walletSignature = await signInjectedEvmMessage(providerKey as WalletProviderKey, nonce.message, walletAddress);
    }

    const turnstileToken = await requestTurnstileToken();

    setWalletModalStep('login');
    const auth = await walletAuth({
      walletAddress,
      walletMessage: nonce.message,
      walletSignature,
      ...(turnstileToken ? { turnstileToken } : {}),
    });

    applyAuthenticatedUser(auth.user);
    return auth.user;
  }

  function isUserReject(error: unknown): boolean {
    const msg = extractErrMsg(error, '').toLowerCase();
    const code = (error as any)?.code;
    return code === 4001 || msg.includes('reject') || msg.includes('denied') || msg.includes('cancel');
  }

  async function tryChainSwitch(p: { request: (a: any) => Promise<unknown> }): Promise<void> {
    try {
      await p.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: preferredEvmChainHex }],
      });
    } catch {
      // non-blocking — user can switch manually; auth doesn't require a specific chain
    }
  }

  async function handleConnect(provider: string, eip6963Provider?: EIP1193Provider) {
    actionError = '';

    if (eip6963Provider) {
      connectingProvider = provider;
      setWalletModalStep('connecting');
      try {
        const accounts = await (eip6963Provider as any).request({ method: 'eth_requestAccounts' }) as string[];
        const walletAddress = accounts[0];
        if (!walletAddress) throw new Error('No account returned');

        await tryChainSwitch(eip6963Provider as any);

        const providerKey = RDNS_TO_PROVIDER[provider] ?? 'metamask';
        setSessionEip6963Provider(eip6963Provider as EIP1193Provider);
        connectWallet(providerKey as WalletProviderKey, walletAddress, preferredEvmChain);
        // Pass the raw EIP-6963 provider for signing so the correct wallet is used
        const user = await authenticateWalletSession(providerKey, walletAddress, eip6963Provider);
        actionError = '';
        pushWalletEvent({ event: 'wallet_connected', method: 'eip6963', rdns: provider });
        pushWalletEvent({ event: 'auth_success', method: providerKey as any, is_new_user: false });
        systemToasts.add({
          type: 'success',
          message: `Connected as ${user.nickname ?? 'Trader'}`,
          action: { label: 'Settings →', href: '/settings' },
        });
        await invalidateAll();
        onconnected();
      } catch (error) {
        const msg = extractErrMsg(error, '');
        disconnectWallet();
        actionError = isUserReject(error)
          ? 'Wallet request was cancelled.'
          : explainAuthError(msg || error);
        pushWalletEvent({ event: 'wallet_connect_failed', method: 'eip6963', error_code: actionError.slice(0, 64) });
        setSessionEip6963Provider(null);
        setWalletModalStep('wallet-select');
      } finally {
        connectingProvider = '';
      }
      return;
    }

    if (!isWalletProviderKey(provider)) { actionError = 'Unsupported wallet provider.'; return; }

    setSessionEip6963Provider(null);
    connectingProvider = WALLET_PROVIDER_LABEL[provider];
    setWalletModalStep('connecting');
    try {
      const walletAddress = await requestInjectedEvmAccount(provider as WalletProviderKey);
      if (provider !== 'walletconnect') {
        const providerClient = await resolveEvmProvider(provider as WalletProviderKey);
        if (providerClient) await tryChainSwitch(providerClient as any);
      }
      connectWallet(provider as WalletProviderKey, walletAddress, preferredEvmChain);
      const user = await authenticateWalletSession(provider, walletAddress);
      pushWalletEvent({ event: 'wallet_connected', method: provider as any });
      pushWalletEvent({ event: 'auth_success', method: provider as any, is_new_user: false });
      systemToasts.add({
        type: 'success',
        message: `Connected as ${user.nickname ?? 'Trader'}`,
        action: { label: 'Settings →', href: '/settings' },
      });
      await invalidateAll();
      onconnected();
    } catch (error) {
      const msg = extractErrMsg(error, '');
      disconnectWallet();
      if (isUserReject(error)) {
        actionError = 'Wallet request was cancelled.';
      } else if (msg.toLowerCase().includes('not detected') || msg.toLowerCase().includes('install')) {
        actionError = msg;
      } else {
        actionError = explainAuthError(msg || error);
      }
      pushWalletEvent({ event: 'wallet_connect_failed', method: provider as any, error_code: actionError.slice(0, 64) });
      setWalletModalStep('wallet-select');
    } finally {
      connectingProvider = '';
    }
  }
</script>

{#if actionError}
  <div class="list-error" role="alert">{actionError}</div>
{/if}

<div class="wallet-list">
  <!-- EIP-6963 detected wallets -->
  {#each detectedWallets as wallet (wallet.rdns)}
    <button
      class="wopt"
      class:wopt-connecting={connectingProvider === wallet.rdns}
      type="button"
      onclick={() => handleConnect(wallet.rdns, wallet.provider)}
    >
      {#if wallet.icon}
        <img class="wo-img" src={wallet.icon} alt={wallet.name} width="20" height="20" />
      {:else}
        <span class="wo-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="6" fill="rgba(255,255,255,0.1)"/>
            <circle cx="10" cy="10" r="5" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          </svg>
        </span>
      {/if}
      <span class="wo-name">{wallet.name}</span>
      {#if connectingProvider === wallet.rdns}
        <span class="wo-spinner"></span>
      {:else}
        <span class="wo-chain wo-detected">DETECTED</span>
      {/if}
    </button>
  {/each}

  <!-- Static: MetaMask -->
  {#if !isStaticHidden('metamask')}
    <button class="wopt" class:wopt-connecting={connectingProvider === 'MetaMask'} type="button" onclick={() => handleConnect('metamask')}>
      <span class="wo-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="6" fill="#F6851B"/>
          <path d="M14.5 5L10.9 7.9l.65-1.54L14.5 5Z" fill="#E17726"/>
          <path d="M5.5 5l3.56 2.93-.62-1.56L5.5 5Z" fill="#E27625"/>
          <path d="M13.2 13.2l-.96 1.47 2.06.57.59-2L13.2 13.2ZM5.1 13.24l.58 2 2.06-.57-.96-1.47-1.68.04Z" fill="#E27625"/>
          <path d="M7.6 9.97l-.56 1.56 2 .09-.07-2.16-1.37.51Z" fill="#E27625"/>
          <path d="M12.4 9.97l-1.38-.53-.07 2.18 2-.09-.55-1.56Z" fill="#E27625"/>
        </svg>
      </span>
      <span class="wo-name">MetaMask</span>
      {#if connectingProvider === 'MetaMask'}
        <span class="wo-spinner"></span>
      {:else}
        <span class="wo-chain">EVM</span>
      {/if}
    </button>
  {/if}

  <!-- WalletConnect -->
  {#if walletConnectReady}
    <button class="wopt" class:wopt-connecting={connectingProvider === 'WalletConnect'} type="button" onclick={() => handleConnect('walletconnect')}>
      <span class="wo-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="6" fill="#3B99FC"/>
          <path d="M6.8 8.6a4.6 4.6 0 0 1 6.4 0l.2.2-.8.8-.2-.2a3.4 3.4 0 0 0-4.8 0l-.2.2-.8-.8.2-.2Z" fill="white"/>
          <path d="M14 9.8l.8.8-4.8 4.8L5.2 10.6l.8-.8 4 4 4-4Z" fill="white"/>
        </svg>
      </span>
      <span class="wo-name">WalletConnect</span>
      {#if connectingProvider === 'WalletConnect'}
        <span class="wo-spinner"></span>
      {:else}
        <span class="wo-chain">QR</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .list-error {
    padding: 10px 12px;
    border: 1px solid rgba(255, 89, 89, 0.4);
    border-radius: 12px;
    background: rgba(255, 89, 89, 0.07);
    color: #ff9b9b;
    font-family: var(--sc-font-body);
    font-size: 13px;
    line-height: 1.5;
  }

  .wallet-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wopt {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(250, 247, 235, 0.9);
    padding: 13px 14px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
  }

  .wopt:hover { border-color: rgba(219, 154, 159, 0.2); background: rgba(255, 255, 255, 0.06); }
  .wopt:disabled { opacity: 0.5; cursor: not-allowed; }

  .wopt-connecting {
    border-color: rgba(219, 154, 159, 0.25);
    background: rgba(255, 255, 255, 0.06);
  }

  .wo-icon { flex-shrink: 0; line-height: 0; border-radius: 6px; overflow: hidden; }
  .wo-img { flex-shrink: 0; border-radius: 6px; display: block; }

  .wo-name {
    font-family: var(--sc-font-body);
    font-size: 14px;
    font-weight: 600;
    flex: 1;
  }

  .wo-chain {
    font-family: var(--sc-font-mono);
    font-size: var(--ui-text-xs, 11px);
    letter-spacing: 0.12em;
    border: 1px solid rgba(249, 216, 194, 0.1);
    border-radius: 999px;
    padding: 3px 7px;
    color: rgba(219, 154, 159, 0.88);
    flex-shrink: 0;
  }

  .wo-detected { color: #4ade80; border-color: rgba(52, 196, 112, 0.25); }

  .wo-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(219, 154, 159, 0.2);
    border-top-color: rgba(219, 154, 159, 0.88);
    border-radius: 50%;
    animation: wo-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes wo-spin { to { transform: rotate(360deg); } }
</style>
