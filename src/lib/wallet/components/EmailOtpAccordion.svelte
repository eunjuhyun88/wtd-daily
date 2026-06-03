<script lang="ts">
  import { applyAuthenticatedUser } from '$lib/stores/authStore';
  import { closeWalletModal } from '$lib/stores/walletModalStore';
  import { systemToasts } from '$lib/stores/notificationStore';
  import { exchangePrivySession, explainAuthError } from '$lib/api/auth';
  import { privySendCode, privyLoginWithCode } from '$lib/wallet/privyClient';
  import { pushWalletEvent } from '$lib/gtm/walletEvents';

  interface Props {
    privyReady: boolean;
  }
  let { privyReady }: Props = $props();

  let open = $state(false);
  let step = $state<'email' | 'otp'>('email');
  let email = $state('');
  let code = $state('');
  let sending = $state(false);
  let verifying = $state(false);
  let error = $state('');

  function toggle() {
    open = !open;
    if (!open) { step = 'email'; email = ''; code = ''; error = ''; }
  }

  async function sendCode() {
    sending = true;
    error = '';
    try {
      await privySendCode(email.trim());
      step = 'otp';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send code.';
    } finally {
      sending = false;
    }
  }

  async function verify() {
    verifying = true;
    error = '';
    try {
      const emailForServer = email.trim();
      const { address, accessToken } = await privyLoginWithCode(emailForServer, code.trim());
      const data = await exchangePrivySession({ accessToken, email: emailForServer });
      if (!data.user) throw new Error('Authentication failed — please try again.');
      applyAuthenticatedUser(data.user);
      const nickname = data.user.nickname ?? `Trader_${(address || '').slice(-6).toUpperCase()}`;
      pushWalletEvent({ event: 'auth_success', method: 'privy_email', is_new_user: false });
      closeWalletModal();
      systemToasts.add({
        type: 'success',
        message: `Connected as ${nickname}`,
        action: { label: 'Settings →', href: '/settings' },
      });
    } catch (err) {
      error = explainAuthError(err);
      code = '';
    } finally {
      verifying = false;
    }
  }
</script>

{#if privyReady}
<div class="acc">
  <button class="acc-toggle" type="button" onclick={toggle} aria-expanded={open}>
    <span class="acc-icon">{open ? '▾' : '▸'}</span>
    <span class="acc-label">이메일로 로그인</span>
  </button>

  {#if open}
  <div class="acc-body">
    {#if error}
      <div class="acc-error" role="alert">{error}</div>
    {/if}

    {#if step === 'email'}
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="privy-input"
        type="email"
        placeholder="you@example.com"
        bind:value={email}
        autofocus
        onkeydown={(e) => e.key === 'Enter' && email.trim() && sendCode()}
      />
      <button class="btn-primary" type="button" onclick={sendCode} disabled={sending || !email.trim()}>
        {sending ? 'SENDING...' : 'SEND CODE'}
      </button>
      <button class="btn-ghost" type="button" onclick={toggle}>CANCEL</button>

    {:else}
      <p class="otp-hint">Code sent to <strong>{email}</strong></p>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="privy-input privy-otp"
        type="text"
        inputmode="numeric"
        placeholder="000000"
        maxlength="6"
        bind:value={code}
        autofocus
        onkeydown={(e) => e.key === 'Enter' && code.trim().length >= 6 && verify()}
      />
      <button class="btn-primary" type="button" onclick={verify} disabled={verifying || code.trim().length < 6}>
        {verifying ? 'VERIFYING...' : 'VERIFY'}
      </button>
      <button class="btn-ghost" type="button" onclick={() => { step = 'email'; code = ''; error = ''; }}>← CHANGE EMAIL</button>
    {/if}
  </div>
  {/if}
</div>
{/if}

<style>
  .acc {
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 14px;
    overflow: hidden;
  }

  .acc-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.02);
    border: none;
    color: rgba(250, 247, 235, 0.55);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
  }

  .acc-toggle:hover { background: rgba(255, 255, 255, 0.05); color: rgba(250, 247, 235, 0.8); }

  .acc-icon { font-size: 11px; flex-shrink: 0; }

  .acc-label {
    font-family: var(--sc-font-body);
    font-size: 13px;
    font-weight: 500;
  }

  .acc-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 14px 14px;
    border-top: 1px solid rgba(249, 216, 194, 0.06);
  }

  .acc-error {
    padding: 8px 10px;
    border: 1px solid rgba(255, 89, 89, 0.4);
    border-radius: 10px;
    background: rgba(255, 89, 89, 0.07);
    color: #ff9b9b;
    font-family: var(--sc-font-body);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 10px;
  }

  .otp-hint {
    font-family: var(--sc-font-body);
    font-size: 12px;
    color: rgba(250, 247, 235, 0.48);
    margin: 10px 0 0;
    line-height: 1.5;
  }

  .privy-input {
    width: 100%;
    padding: 12px 13px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(249, 216, 194, 0.12);
    border-radius: 12px;
    color: rgba(250, 247, 235, 0.9);
    font-family: var(--sc-font-body);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .privy-input:focus { border-color: rgba(219, 154, 159, 0.4); }
  .privy-input::placeholder { color: rgba(250, 247, 235, 0.28); }

  .privy-otp {
    font-size: 20px;
    letter-spacing: 0.3em;
    text-align: center;
  }

  .btn-primary,
  .btn-ghost {
    width: 100%;
    border-radius: 999px;
    font-family: var(--sc-font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 11px 14px;
    cursor: pointer;
    text-align: center;
    transition: transform 0.12s, opacity 0.12s;
  }

  .btn-primary {
    border: 1px solid rgba(219, 154, 159, 0.24);
    background: linear-gradient(180deg, rgba(250, 247, 235, 0.98), rgba(249, 246, 241, 0.96));
    color: #0f0f12;
    box-shadow: 0 4px 12px rgba(219, 154, 159, 0.1);
  }

  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-ghost {
    border: 1px solid rgba(249, 216, 194, 0.08);
    background: transparent;
    color: rgba(250, 247, 235, 0.55);
  }

  .btn-ghost:hover { color: rgba(250, 247, 235, 0.85); border-color: rgba(219, 154, 159, 0.18); }
</style>
