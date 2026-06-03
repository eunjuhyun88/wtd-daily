<script lang="ts">
  import { shellStore } from '$lib/hubs/terminal/shell.store';

  interface Props {
    symbol?: string;
    currentPrice?: number | null;
    entryPrice?: number | null;
    stopPrice?: number | null;
    tpPrice?: number | null;
    riskReward?: number | null;
  }

  const {
    symbol = 'BTCUSDT',
    currentPrice = null,
    entryPrice = null,
    stopPrice = null,
    tpPrice = null,
    riskReward = null,
  }: Props = $props();

  type Side = 'LONG' | 'SHORT';
  let side = $state<Side>('LONG');
  let sizeLabel = $state<'0.5%' | '1%' | '2%' | '5%'>('1%');
  let submitting = $state(false);
  let lastResult = $state<'ok' | 'err' | null>(null);

  const sizeOptions: Array<'0.5%' | '1%' | '2%' | '5%'> = ['0.5%', '1%', '2%', '5%'];

  const entryDisplay = $derived(
    entryPrice != null ? entryPrice.toLocaleString('en-US', { maximumFractionDigits: 1 }) :
    currentPrice != null ? currentPrice.toLocaleString('en-US', { maximumFractionDigits: 1 }) :
    '—'
  );

  const stopDisplay = $derived(
    stopPrice != null ? stopPrice.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—'
  );

  const tpDisplay = $derived(
    tpPrice != null ? tpPrice.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—'
  );

  async function submitPaperOrder() {
    if (submitting) return;
    submitting = true;
    lastResult = null;
    try {
      const res = await fetch('/api/cogochi/paper-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side: side === 'LONG' ? 'buy' : 'sell',
          sizeLabel,
          entryPrice: entryPrice ?? currentPrice,
          stopPrice,
          tpPrice,
        }),
      });
      lastResult = res.ok ? 'ok' : 'err';
    } catch {
      lastResult = 'err';
    } finally {
      submitting = false;
      setTimeout(() => { lastResult = null; }, 3000);
    }
  }
</script>

<div class="quick-order-panel" role="complementary" aria-label="Quick order — paper mode">
  <div class="qop-header">
    <span class="qop-label">QUICK ORDER</span>
    <span class="qop-paper">PAPER</span>
  </div>

  <div class="qop-side-row">
    <button
      class="qop-side-btn long"
      class:active={side === 'LONG'}
      onclick={() => side = 'LONG'}
      type="button"
      aria-pressed={side === 'LONG'}
    >LONG</button>
    <button
      class="qop-side-btn short"
      class:active={side === 'SHORT'}
      onclick={() => side = 'SHORT'}
      type="button"
      aria-pressed={side === 'SHORT'}
    >SHORT</button>
  </div>

  <div class="qop-levels">
    <div class="qop-level-row">
      <span class="ql-key">ENTRY</span>
      <span class="ql-val">{entryDisplay}</span>
    </div>
    <div class="qop-level-row">
      <span class="ql-key">STOP</span>
      <span class="ql-val neg">{stopDisplay}</span>
    </div>
    <div class="qop-level-row">
      <span class="ql-key">TP</span>
      <span class="ql-val pos">{tpDisplay}</span>
    </div>
    {#if riskReward != null}
      <div class="qop-level-row">
        <span class="ql-key">R:R</span>
        <span class="ql-val">{riskReward.toFixed(1)}×</span>
      </div>
    {/if}
  </div>

  <div class="qop-size-row" role="group" aria-label="Position size">
    {#each sizeOptions as opt}
      <button
        class="qop-size-btn"
        class:active={sizeLabel === opt}
        onclick={() => sizeLabel = opt}
        type="button"
        aria-pressed={sizeLabel === opt}
      >{opt}</button>
    {/each}
  </div>

  <button
    class="qop-submit"
    class:long={side === 'LONG'}
    class:short={side === 'SHORT'}
    class:ok={lastResult === 'ok'}
    class:err={lastResult === 'err'}
    onclick={submitPaperOrder}
    disabled={submitting}
    type="button"
  >
    {#if submitting}
      …
    {:else if lastResult === 'ok'}
      ✓ PLACED
    {:else if lastResult === 'err'}
      ✗ FAILED
    {:else}
      {side} {sizeLabel}
    {/if}
  </button>
</div>

<style>
  .quick-order-panel {
    position: absolute;
    right: 12px;
    bottom: 60px;
    z-index: 20;
    width: 148px;
    background: rgba(8, 8, 10, 0.95);
    border: 1px solid rgba(var(--brand-rgb, 219, 154, 159), 0.18);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
  }

  .qop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .qop-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(250, 247, 235, 0.55);
  }

  .qop-paper {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: rgba(var(--brand-rgb, 219, 154, 159), 0.6);
    background: rgba(var(--brand-rgb, 219, 154, 159), 0.06);
    border: 0.5px solid rgba(var(--brand-rgb, 219, 154, 159), 0.2);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .qop-side-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .qop-side-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    letter-spacing: 0.06em;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 5px;
    padding: 5px 0;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    color: rgba(250, 247, 235, 0.4);
  }

  .qop-side-btn.long.active  {
    background: rgba(91, 191, 138, 0.12);
    border-color: rgba(91, 191, 138, 0.4);
    color: #5bbf8a;
  }
  .qop-side-btn.short.active {
    background: rgba(224, 112, 110, 0.12);
    border-color: rgba(224, 112, 110, 0.4);
    color: #e0706e;
  }
  .qop-side-btn.long:hover:not(.active)  { color: #5bbf8a; }
  .qop-side-btn.short:hover:not(.active) { color: #e0706e; }

  .qop-levels {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .qop-level-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
  }

  .ql-key {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.28);
    letter-spacing: 0.08em;
  }

  .ql-val {
    color: rgba(250, 247, 235, 0.62);
    font-weight: 500;
  }
  .ql-val.pos { color: #5bbf8a; }
  .ql-val.neg { color: #e0706e; }

  .qop-size-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
  }

  .qop-size-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.03);
    border: 0.5px solid rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    padding: 3px 0;
    cursor: pointer;
    color: rgba(250, 247, 235, 0.3);
    transition: all 0.1s;
  }

  .qop-size-btn.active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.14);
    color: rgba(250, 247, 235, 0.8);
  }

  .qop-submit {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    letter-spacing: 0.08em;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 7px 0;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(250, 247, 235, 0.6);
  }

  .qop-submit.long {
    background: rgba(91, 191, 138, 0.1);
    border-color: rgba(91, 191, 138, 0.3);
    color: #5bbf8a;
  }

  .qop-submit.short {
    background: rgba(224, 112, 110, 0.1);
    border-color: rgba(224, 112, 110, 0.3);
    color: #e0706e;
  }

  .qop-submit.ok {
    background: rgba(91, 191, 138, 0.18);
    border-color: rgba(91, 191, 138, 0.5);
    color: #5bbf8a;
  }

  .qop-submit.err {
    background: rgba(224, 112, 110, 0.1);
    border-color: rgba(224, 112, 110, 0.3);
    color: #e0706e;
  }

  .qop-submit:disabled { opacity: 0.7; cursor: not-allowed; }
  .qop-submit:not(:disabled):hover { filter: brightness(1.12); }
</style>
