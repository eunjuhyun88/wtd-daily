<script lang="ts">
  /**
   * BucketFilters — filter bar for /research/buckets (W-0414 PR8B).
   *
   * Two-way binds via querystring (form GET). Lets the SSR loader re-fetch
   * by changing window.location, so no client-side state machine.
   */
  interface Props {
    filters: {
      symbol: string;
      tf: string;
      status: string;
      mode: string;
      minN: number;
      limit: number;
    };
  }
  const { filters }: Props = $props();

  const symbols = ['', 'BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  const timeframes = ['', '1m', '5m', '15m', '1h', '4h', '1d'];
  const statuses = ['', 'cold_start', 'accept', 'watch', 'block', 'force_block'];
  const modes = ['standard', 'conservative', 'aggressive'];

  // Local form state — initialized from filters prop. We use $state with
  // wrapper var refs so changes don't depend on the prop reactively (form
  // submit is a full GET round-trip, so re-mount is fine).
  let symbol = $state('');
  let tf = $state('');
  let status = $state('');
  let mode = $state('standard');
  let minN = $state(20);
  $effect(() => {
    symbol = filters.symbol;
    tf = filters.tf;
    status = filters.status;
    mode = filters.mode;
    minN = filters.minN;
  });
</script>

<form method="get" class="filter-bar" data-testid="bucket-filters">
  <label class="field">
    <span class="lbl">Symbol</span>
    <select name="symbol" bind:value={symbol}>
      {#each symbols as s}
        <option value={s}>{s || 'all'}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span class="lbl">TF</span>
    <select name="tf" bind:value={tf}>
      {#each timeframes as t}
        <option value={t}>{t || 'all'}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span class="lbl">Status</span>
    <select name="status" bind:value={status}>
      {#each statuses as s}
        <option value={s}>{s || 'all'}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span class="lbl">Mode</span>
    <select name="mode" bind:value={mode}>
      {#each modes as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span class="lbl">min n</span>
    <input type="number" name="min_n" min="0" max="10000" step="1" bind:value={minN} />
  </label>

  <button type="submit" class="apply" data-testid="apply-filters">Apply</button>
</form>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    align-items: end;
    padding: 10px 14px;
    background: rgba(12, 14, 20, 0.5);
    border-bottom: 1px solid rgba(249, 216, 194, 0.07);
    font-family: var(--ui-font-mono);
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 90px;
  }
  .lbl {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.45);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  select, input[type="number"] {
    padding: 5px 8px;
    background: rgba(20, 22, 28, 0.85);
    color: rgba(250, 247, 235, 0.92);
    border: 1px solid rgba(249, 216, 194, 0.12);
    border-radius: 3px;
    font-family: inherit;
    font-size: var(--ui-text-sm);
  }
  select:focus, input:focus {
    outline: none;
    border-color: rgba(219, 154, 159, 0.5);
  }
  .apply {
    padding: 6px 14px;
    background: rgba(219, 154, 159, 0.18);
    color: rgba(250, 247, 235, 0.95);
    border: 1px solid rgba(219, 154, 159, 0.4);
    border-radius: 3px;
    font-family: inherit;
    font-size: var(--ui-text-sm);
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.04em;
  }
  .apply:hover { background: rgba(219, 154, 159, 0.28); }

  @media (max-width: 768px) {
    .filter-bar { padding: 8px 10px; gap: 8px; }
    .field { min-width: 72px; }
  }
</style>
