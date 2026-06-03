<script lang="ts">
  import { walletStore } from '$lib/stores/walletStore';
  import { authStore } from '$lib/stores/authStore';
  import { openWalletModal } from '$lib/stores/walletModalStore';

  const wallet = $derived($walletStore);
  const auth = $derived($authStore);
</script>

<div class="hero-wallet-card">
  <span class="hwc-label">Wallet</span>
  {#if wallet.connected && wallet.address}
    <div class="hwc-body">
      <span class="dot dot--on"></span>
      <span class="hwc-value">{wallet.shortAddr ?? wallet.address.slice(0,6) + '…' + wallet.address.slice(-4)}</span>
    </div>
    <span class="hwc-meta">
      {#if wallet.balance > 0}{wallet.balance.toFixed(4)} ETH · {/if}{wallet.chain ?? 'ARB'}
    </span>
  {:else if auth.email || auth.nickname}
    <div class="hwc-body">
      <span class="dot dot--on"></span>
      <span class="hwc-value">{auth.nickname ?? auth.email}</span>
    </div>
    <span class="hwc-meta">Email · <button class="hwc-btn" onclick={() => openWalletModal()}>Link wallet</button></span>
  {:else}
    <div class="hwc-body">
      <span class="dot dot--off"></span>
      <button class="hwc-btn" onclick={() => openWalletModal()}>Connect</button>
    </div>
    <span class="hwc-meta">Not connected</span>
  {/if}
</div>

<style>
  .hero-wallet-card {
    background: var(--surface-1, rgba(255,255,255,0.02));
    border: 1px solid rgba(249,216,194,0.07);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .hwc-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,247,235,0.35);
  }
  .hwc-body {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }
  .hwc-value {
    font-size: 13px;
    font-weight: 700;
    color: rgba(250,247,235,0.85);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hwc-meta {
    font-size: var(--ui-text-xs);
    color: rgba(250,247,235,0.3);
    font-family: 'JetBrains Mono', monospace;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot--on  { background: #22AB94; }
  .dot--off { background: rgba(250,247,235,0.2); }
  .hwc-btn {
    background: none;
    border: 1px solid rgba(249,216,194,0.2);
    color: rgba(249,216,194,0.6);
    font-size: var(--ui-text-xs);
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .hwc-btn:hover {
    border-color: rgba(249,216,194,0.5);
    color: rgba(249,216,194,0.9);
  }
</style>
