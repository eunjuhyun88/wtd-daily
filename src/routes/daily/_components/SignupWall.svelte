<script lang="ts">
  import { dispatchLever, type LeverId } from '$lib/analytics/lever-events';

  let {
    lever,
    title,
    blurb,
    cta = 'Send me the brief',
    inline = true
  }: {
    lever: LeverId;
    title: string;
    blurb: string;
    cta?: string;
    inline?: boolean;
  } = $props();

  let email = $state('');
  let status = $state<'idle' | 'loading' | 'ok' | 'err'>('idle');
  let message = $state('');

  async function submit(e: Event) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      status = 'err';
      message = '유효한 이메일을 입력해주세요.';
      return;
    }
    status = 'loading';
    dispatchLever(lever, { surface: 'signup_wall', trigger: 'submit' });
    try {
      const res = await fetch('/api/auth/email-only', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, lever })
      });
      if (res.ok) {
        status = 'ok';
        message = '확인 — 곧 받아보실 거예요.';
        email = '';
      } else {
        status = 'err';
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        message = j.error ?? '제출에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }
    } catch {
      status = 'err';
      message = '네트워크 오류 — 다시 시도해주세요.';
    }
  }
</script>

<aside class="wall" class:wall-inline={inline} aria-label={title}>
  <div class="wall-h">
    <span class="wall-title">{title}</span>
    <span class="wall-blurb">{blurb}</span>
  </div>
  <form class="wall-form" onsubmit={submit}>
    <input
      type="email"
      bind:value={email}
      placeholder="you@email.com"
      autocomplete="email"
      required
      disabled={status === 'loading' || status === 'ok'}
      aria-label="Email"
    />
    <button type="submit" disabled={status === 'loading' || status === 'ok'}>
      {status === 'loading' ? '...' : status === 'ok' ? '✓' : cta}
    </button>
  </form>
  {#if message}
    <p class="wall-msg" class:ok={status === 'ok'} class:err={status === 'err'}>{message}</p>
  {/if}
</aside>

<style>
  .wall {
    margin: 0 clamp(12px, 3vw, 24px);
    padding: 14px 16px;
    border: 1px solid var(--g3, #1c1918);
    border-radius: 8px;
    background: rgba(15, 13, 12, 0.85);
  }
  .wall-h {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }
  .wall-title {
    color: var(--g9, #eceae8);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .wall-blurb {
    color: var(--g7, #9d9690);
    font-size: 13px;
    line-height: 1.4;
  }
  .wall-form {
    display: flex;
    gap: 8px;
  }
  input[type="email"] {
    flex: 1;
    height: 36px;
    padding: 0 10px;
    background: var(--g0, #0b0a09);
    border: 1px solid var(--g3, #1c1918);
    border-radius: 6px;
    color: var(--g9, #eceae8);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }
  input[type="email"]:focus {
    outline: none;
    border-color: rgba(249, 216, 194, 0.5);
  }
  button {
    height: 36px;
    padding: 0 14px;
    background: rgba(249, 216, 194, 0.9);
    border: none;
    border-radius: 6px;
    color: #0b0a09;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .wall-msg { margin: 8px 0 0; font-size: 12px; }
  .wall-msg.ok { color: #5fc97a; }
  .wall-msg.err { color: #ff6b6b; }
</style>
