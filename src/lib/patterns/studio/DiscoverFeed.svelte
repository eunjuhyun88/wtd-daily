<script lang="ts">
  import { onMount } from 'svelte';
  import { studioStore, type AutoresearchSignal } from './studioStore.svelte';

  function fmtBucket(iso: string): string {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const h = Math.floor(diff / 3600000);
      if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    } catch { return iso; }
  }

  onMount(async () => {
    if (studioStore.feedSignals.length > 0) return;
    studioStore.setFeedLoading(true);
    try {
      const res = await fetch('/api/research/autoresearch/signals?min_sharpe=0.3&timeframe=1h&limit=50');
      if (res.ok) {
        const data = await res.json() as { signals: AutoresearchSignal[] };
        studioStore.setFeedSignals(data.signals ?? []);
      }
    } catch {
      // silent — empty state handles it
    } finally {
      studioStore.setFeedLoading(false);
    }
  });
</script>

<div class="feed-wrap">
  {#if studioStore.feedLoading}
    <div class="feed-loading">
      <div class="skel-list">
        {#each [0, 1, 2] as _}
          <div class="skel-card"></div>
        {/each}
      </div>
    </div>
  {:else if studioStore.feedSignals.length === 0}
    <div class="feed-empty">
      autoresearch 결과 없음 — 배치가 완료되면 자동으로 표시됩니다
    </div>
  {:else}
    <div class="feed-list">
      {#each studioStore.feedSignals as sig (sig.symbol + sig.pattern)}
        <div class="sig-card">
          <div class="sig-header">
            <span class="sym-badge">{sig.symbol}</span>
            <span class="pat-name">{sig.pattern}</span>
            <span class="bucket-time">{fmtBucket(sig.run_bucket)}</span>
          </div>
          <div class="sig-stats">
            {#if sig.sharpe != null}
              <span class="stat">
                <span class="stat-lbl">Sharpe</span>
                <span class="stat-val sharpe-val">{sig.sharpe.toFixed(2)}</span>
              </span>
            {/if}
            {#if sig.hit_rate != null}
              <span class="stat">
                <span class="stat-lbl">WR</span>
                <span class="stat-val" class:wr-hi={sig.hit_rate >= 0.55}>{(sig.hit_rate * 100).toFixed(0)}%</span>
              </span>
            {/if}
            {#if sig.n_trades != null}
              <span class="stat">
                <span class="stat-lbl">n</span>
                <span class="stat-val">{sig.n_trades}</span>
              </span>
            {/if}
          </div>
          <a
            class="view-btn"
            href="/patterns?slug={sig.pattern}"
            aria-label="패턴 상세 보기"
          >보기</a>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .feed-wrap {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }

  .feed-loading {
    padding: 4px 0;
  }

  .skel-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skel-card {
    height: 64px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .feed-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.2);
    text-align: center;
  }

  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sig-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .sig-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .sym-badge {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 3px;
    padding: 2px 7px;
    flex-shrink: 0;
  }

  .pat-name {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.8);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bucket-time {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.25);
    flex-shrink: 0;
    margin-left: auto;
  }

  .sig-stats {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .stat-lbl {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stat-val {
    font-size: 13px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.7);
  }

  .sharpe-val { color: #fbbf24; }
  .wr-hi { color: #4ade80; }

  .view-btn {
    flex-shrink: 0;
    padding: 6px 14px;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    background: rgba(74, 222, 128, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.25);
    border-radius: 4px;
    color: #4ade80;
    text-decoration: none;
    transition: background 0.12s;
  }
  .view-btn:hover { background: rgba(74, 222, 128, 0.16); }
</style>
