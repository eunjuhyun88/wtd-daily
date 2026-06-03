<script lang="ts">
  export interface ScanHit {
    symbol: string;
    direction: 'long' | 'short';
    score: number;
    signals: string[];
    key_levels: { entry_low: number; entry_high: number; sl: number };
    scanned_at_ms: number;
  }

  interface Props {
    hits: ScanHit[];
    loading: boolean;
    error?: string;
  }

  let { hits, loading, error }: Props = $props();

  const SIGNAL_LABELS: Record<string, string> = {
    cvd_bear_reversal: 'CVD 반전',
    long_short_reversal: '숏 청산',
    oi_divergence_bullish: 'OI 다이버전스',
    vwap_reclaim: 'VWAP 회복',
  };

  function signalLabel(key: string): string {
    return SIGNAL_LABELS[key] ?? key;
  }

  function formatPrice(n: number): string {
    return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : n.toFixed(4);
  }
</script>

<div class="scan-panel">
  <div class="scan-header">
    <span class="scan-title">Market Scan</span>
    {#if loading}
      <span class="scan-badge scan-badge--loading">스캔 중…</span>
    {:else if hits.length > 0}
      <span class="scan-badge">{hits.length}개 기회</span>
    {/if}
  </div>

  {#if error}
    <div class="scan-error">{error}</div>
  {/if}

  {#if loading}
    <div class="skeleton-list">
      {#each [0, 1, 2] as _}
        <div class="skeleton-card"></div>
      {/each}
    </div>
  {:else if hits.length > 0}
    <div class="hit-list">
      {#each hits as hit}
        <div class="hit-card">
          <div class="hit-top">
            <span class="hit-symbol">{hit.symbol}</span>
            <span
              class="hit-dir"
              class:hit-dir--long={hit.direction === 'long'}
              class:hit-dir--short={hit.direction === 'short'}
            >
              {hit.direction === 'long' ? 'LONG' : 'SHORT'}
            </span>
            <div class="score-bar-wrap" title={`Score: ${hit.score.toFixed(2)}`}>
              <div class="score-bar" style="width: {Math.min(hit.score * 100, 100)}%"></div>
            </div>
            <span class="score-label">{(hit.score * 100).toFixed(0)}</span>
          </div>

          {#if hit.signals.length > 0}
            <div class="signal-tags">
              {#each hit.signals as sig}
                <span class="signal-tag">{signalLabel(sig)}</span>
              {/each}
            </div>
          {/if}

          <div class="key-levels">
            <span class="level-item">
              <span class="level-label">진입</span>
              <span class="level-val">{formatPrice(hit.key_levels.entry_low)} – {formatPrice(hit.key_levels.entry_high)}</span>
            </span>
            <span class="level-item">
              <span class="level-label">SL</span>
              <span class="level-val level-val--sl">{formatPrice(hit.key_levels.sl)}</span>
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .scan-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(0, 0, 0, 0.18);
  }

  .scan-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .scan-title {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }

  .scan-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.55);
  }

  .scan-badge--loading {
    color: rgba(245, 166, 35, 0.75);
    border-color: rgba(245, 166, 35, 0.2);
  }

  .scan-error {
    font-size: 0.72rem;
    color: rgba(255, 80, 80, 0.82);
  }

  /* Skeleton */
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-card {
    height: 68px;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04) 25%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.04) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Hit cards */
  .hit-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hit-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
  }

  .hit-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hit-symbol {
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    min-width: 90px;
  }

  .hit-dir {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    border-radius: 4px;
  }

  .hit-dir--long {
    background: rgba(52, 199, 89, 0.15);
    color: rgba(52, 199, 89, 0.9);
    border: 1px solid rgba(52, 199, 89, 0.25);
  }

  .hit-dir--short {
    background: rgba(255, 59, 48, 0.15);
    color: rgba(255, 59, 48, 0.9);
    border: 1px solid rgba(255, 59, 48, 0.25);
  }

  .score-bar-wrap {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
    overflow: hidden;
  }

  .score-bar {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(245, 166, 35, 0.7), rgba(245, 166, 35, 1));
  }

  .score-label {
    font-size: 0.68rem;
    color: rgba(245, 166, 35, 0.8);
    min-width: 24px;
    text-align: right;
  }

  /* Signal tags */
  .signal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .signal-tag {
    font-size: 0.62rem;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.03);
  }

  /* Key levels */
  .key-levels {
    display: flex;
    gap: 16px;
  }

  .level-item {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .level-label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.3);
  }

  .level-val {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.72);
  }

  .level-val--sl {
    color: rgba(255, 59, 48, 0.75);
  }
</style>
