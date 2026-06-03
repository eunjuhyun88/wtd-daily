<script lang="ts">
  interface Props {
    supported: boolean;
    isReturning?: boolean;
    onpasskey: () => void;
  }
  let { supported, isReturning = false, onpasskey }: Props = $props();
</script>

{#if supported}
<div class="passkey-hero">
  <div class="pk-badge">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="13.5" r="1.25" fill="currentColor"/>
    </svg>
    <span>생체인식으로 보호됨</span>
  </div>
  <p class="pk-label">{isReturning ? '패스키로 다시 로그인' : '패스키로 1초만에 시작'}</p>
  <p class="pk-sub">Face ID · Touch ID · PIN — 비밀번호 없음</p>
  <button class="pk-cta" type="button" onclick={onpasskey}>
    패스키 시작
  </button>
</div>
{/if}

<style>
  .passkey-hero {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px;
    border: 1px solid rgba(0, 82, 255, 0.22);
    border-radius: 18px;
    background: rgba(0, 82, 255, 0.05);
  }

  .pk-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--sc-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #60a5fa;
  }

  .pk-label {
    font-family: var(--sc-font-body);
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #faf7eb;
    margin: 0;
    line-height: 1.15;
  }

  .pk-sub {
    font-family: var(--sc-font-body);
    font-size: 13px;
    color: rgba(250, 247, 235, 0.55);
    margin: 0;
  }

  .pk-cta {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid rgba(0, 82, 255, 0.35);
    background: linear-gradient(180deg, rgba(250, 247, 235, 0.98), rgba(249, 246, 241, 0.96));
    color: #0f0f12;
    font-family: var(--sc-font-body);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.12s, opacity 0.12s;
    box-shadow: 0 8px 20px rgba(0, 82, 255, 0.14);
  }

  .pk-cta:hover { transform: translateY(-1px); }
  .pk-cta:active { transform: translateY(0); opacity: 0.85; }
</style>
