<!--
  W-0497 PR3 (Issue #1769): Live paper-broker positions panel.

  Polls /api/paper/positions every 5s + /api/paper/mids in parallel.
  Computes unrealized P&L = (mid - entry) / entry × side_mult.

  Props:
    slug?: string  — when set, filter to one pattern (used in /patterns/[slug])
    showHeader?: boolean = true  — hide on tiny embeds
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Position {
    position_id: string;
    symbol: string;
    slug: string | null;
    side: 'long' | 'short';
    entry_ts_ms: number;
    entry_price: number;
    stop_price: number;
    target_price: number;
    timeout_ts_ms: number;
    qty_usd: number;
    matched_mean: number;
    status: 'open' | 'closed';
    exit_ts_ms: number | null;
    exit_price: number | null;
    exit_reason: 'stop' | 'target' | 'timeout' | null;
    pnl_pct: number | null;
    created_at: string;
    updated_at: string;
  }

  interface Props { slug?: string | null; showHeader?: boolean; }
  const { slug = null, showHeader = true }: Props = $props();

  let positions = $state<Position[]>([]);
  let mids = $state<Record<string, number>>({});
  let lastErr = $state<string | null>(null);
  let loaded = $state(false);

  // Poll cadence — see PR3 user decision (Polling 5s).
  const POLL_MS = 5_000;
  let timer: ReturnType<typeof setInterval> | null = null;

  async function fetchOnce() {
    const qs = new URLSearchParams({ status: 'open', limit: '20' });
    if (slug) qs.set('slug', slug);

    try {
      const [posRes, midsRes] = await Promise.all([
        fetch(`/api/paper/positions?${qs.toString()}`),
        fetch('/api/paper/mids'),
      ]);
      const posBody = await posRes.json();
      const midsBody = await midsRes.json();
      if (posBody?.ok) {
        positions = posBody.positions ?? [];
        lastErr = null;
      } else if (posBody?.error === 'supabase_unconfigured') {
        // Local dev with no SUPABASE_SERVICE_KEY — render empty state silently.
        positions = [];
        lastErr = null;
      } else {
        lastErr = posBody?.error ?? 'positions fetch failed';
      }
      if (midsBody?.ok) {
        mids = midsBody.mids ?? {};
      }
    } catch (e) {
      lastErr = (e as Error).message;
    } finally {
      loaded = true;
    }
  }

  onMount(() => {
    fetchOnce();
    timer = setInterval(fetchOnce, POLL_MS);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  function unrealized(p: Position): number | null {
    const mid = mids[p.symbol];
    if (!mid || !p.entry_price) return null;
    const raw = (mid - p.entry_price) / p.entry_price;
    return p.side === 'long' ? raw : -raw;
  }

  function fmtPct(x: number | null): string {
    if (x == null) return '—';
    const sign = x >= 0 ? '+' : '';
    return `${sign}${(x * 100).toFixed(2)}%`;
  }

  function fmtPrice(x: number): string {
    if (x >= 1000) return x.toFixed(0);
    if (x >= 1) return x.toFixed(2);
    return x.toFixed(4);
  }
</script>

<section class="live-paper" class:embedded={!showHeader}>
  {#if showHeader}
    <header>
      <h3>Live Paper</h3>
      <span class="count">{positions.length} open</span>
    </header>
  {/if}

  {#if !loaded}
    <div class="empty">Loading…</div>
  {:else if positions.length === 0}
    <div class="empty">
      {#if slug}No open paper positions for this pattern.{:else}No open paper positions.{/if}
    </div>
  {:else}
    <ul class="cards">
      {#each positions as p (p.position_id)}
        {@const u = unrealized(p)}
        <li class="card" class:up={u != null && u > 0} class:down={u != null && u < 0}>
          <div class="row1">
            <span class="sym">{p.symbol}</span>
            <span class="side side-{p.side}">{p.side.toUpperCase()}</span>
            <span class="pnl">{fmtPct(u)}</span>
          </div>
          <div class="row2">
            <span class="entry">@ ${fmtPrice(p.entry_price)}</span>
            {#if p.slug && !slug}<span class="slug">{p.slug}</span>{/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if lastErr}
    <div class="err">⚠ {lastErr}</div>
  {/if}
</section>

<style>
  .live-paper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    color: var(--g8, #d4d4d4);
    font-size: 12px;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .embedded {
    padding: 0;
    height: auto;
    overflow: visible;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid var(--g3, #2a2a2a);
    padding-bottom: 4px;
  }
  h3 { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--g7, #a8a8a8); }
  .count { font-size: 11px; color: var(--g6, #888); }

  .empty { padding: 12px 4px; color: var(--g6, #888); font-style: italic; }

  .cards { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
  .card {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    background: var(--g2, #1a1a1a);
    border: 1px solid var(--g3, #2a2a2a);
    border-radius: 4px;
    border-left-width: 2px;
  }
  .card.up { border-left-color: var(--green, #4ade80); }
  .card.down { border-left-color: var(--red, #f87171); }

  .row1 { display: flex; gap: 8px; align-items: baseline; }
  .row2 { display: flex; gap: 8px; align-items: baseline; color: var(--g6, #888); font-size: 11px; }

  .sym { font-weight: 600; color: var(--g9, #f0f0f0); }
  .side { font-size: 11px; padding: 1px 4px; border-radius: 2px; font-weight: 600; }
  .side-long { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
  .side-short { background: rgba(248, 113, 113, 0.15); color: #f87171; }
  .pnl { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 600; }
  .card.up .pnl { color: #4ade80; }
  .card.down .pnl { color: #f87171; }

  .entry { font-variant-numeric: tabular-nums; }
  .slug { color: var(--g7, #a8a8a8); }

  .err { color: var(--red, #f87171); font-size: 11px; padding: 4px; }
</style>
