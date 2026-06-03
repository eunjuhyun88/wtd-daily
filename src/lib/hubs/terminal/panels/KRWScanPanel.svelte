<script lang="ts">
  /**
   * KRWScanPanel — 김치 프리미엄 + KRW 거래소 신규 상장 스캐너.
   * Polls /api/terminal/agent/krw-premium and /api/terminal/agent/krw-radar every 60s.
   */
  import { onMount, onDestroy } from 'svelte';

  interface KimchiPremium {
    symbol: string;
    upbit_krw: number;
    binance_usdt: number;
    fx_usdkrw: number;
    premium_pct: number;
  }

  interface KRWListing {
    exchange: string;
    symbol: string;
    notice_title: string;
    noticed_at: string;
    status: string;
  }

  const REFRESH_MS = 60_000;

  let premiums = $state<KimchiPremium[]>([]);
  let listings = $state<KRWListing[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let lastUpdated = $state(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function fmtKrw(v: number): string {
    if (v >= 1_000_000) return `₩${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `₩${(v / 1_000).toFixed(0)}K`;
    return `₩${v.toFixed(0)}`;
  }

  function fmtPct(v: number): string {
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(2)}%`;
  }

  function premiumColor(pct: number): string {
    if (pct > 3) return '#f44336';
    if (pct > 1) return '#ff9800';
    if (pct < -1) return '#2196f3';
    return '#9e9e9e';
  }

  async function fetchAll() {
    try {
      const [premRes, radRes] = await Promise.all([
        fetch('/api/terminal/agent/krw-premium'),
        fetch('/api/terminal/agent/krw-radar'),
      ]);

      if (premRes.ok) {
        const d = await premRes.json();
        premiums = d.premiums ?? [];
      }
      if (radRes.ok) {
        const d = await radRes.json();
        listings = d.listings ?? [];
      }
      error = null;
      lastUpdated = Date.now();
    } catch (e) {
      error = e instanceof Error ? e.message : '데이터 로딩 실패';
    } finally {
      loading = false;
    }
  }

  function fmtAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  }

  onMount(() => {
    fetchAll();
    intervalId = setInterval(fetchAll, REFRESH_MS);
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<div class="krw-panel">
  <div class="panel-header">
    <span class="panel-title">🇰🇷 KRW Radar</span>
    {#if lastUpdated}
      <span class="updated">{fmtAgo(lastUpdated)}</span>
    {/if}
    <button class="refresh-btn" onclick={fetchAll} disabled={loading}>↻</button>
  </div>

  {#if error}
    <div class="error-row">{error}</div>
  {/if}

  <!-- Kimchi Premium -->
  <section class="section">
    <div class="section-label">김치 프리미엄</div>
    {#if loading && premiums.length === 0}
      <div class="loading-row">loading…</div>
    {:else if premiums.length === 0}
      <div class="empty-row">데이터 없음</div>
    {:else}
      <div class="prem-grid">
        {#each premiums as p}
          <div class="prem-card">
            <span class="sym">{p.symbol}</span>
            <span class="pct" style:color={premiumColor(p.premium_pct)}>
              {fmtPct(p.premium_pct)}
            </span>
            <span class="sub">{fmtKrw(p.upbit_krw)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Listing Radar -->
  <section class="section">
    <div class="section-label">신규 상장 공지</div>
    {#if loading && listings.length === 0}
      <div class="loading-row">loading…</div>
    {:else if listings.length === 0}
      <div class="empty-row">최근 상장 공지 없음</div>
    {:else}
      {#each listings as listing}
        <div class="listing-row">
          <span class="exchange-tag" class:upbit={listing.exchange === 'upbit'}>
            {listing.exchange}
          </span>
          <span class="notice-title">{listing.notice_title}</span>
        </div>
      {/each}
    {/if}
  </section>
</div>

<style>
  .krw-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    font-size: 12px;
    color: #ccc;
    height: 100%;
    overflow-y: auto;
  }
  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #333;
    padding-bottom: 6px;
  }
  .panel-title { font-weight: 600; font-size: 13px; color: #eee; flex: 1; }
  .updated { color: #666; font-size: 10px; }
  .refresh-btn {
    background: none; border: none; color: #888; cursor: pointer;
    font-size: 14px; padding: 2px 4px;
  }
  .refresh-btn:hover { color: #ccc; }
  .refresh-btn:disabled { opacity: 0.4; cursor: default; }
  .section { display: flex; flex-direction: column; gap: 6px; }
  .section-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    color: #666; padding-bottom: 2px;
  }
  .prem-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 6px;
  }
  .prem-card {
    display: flex; flex-direction: column; gap: 2px;
    background: #1a1a1a; border-radius: 6px; padding: 8px;
    border: 1px solid #2a2a2a;
  }
  .sym { font-weight: 600; color: #ddd; }
  .pct { font-size: 13px; font-weight: 700; }
  .sub { font-size: 10px; color: #666; }
  .listing-row {
    display: flex; align-items: flex-start; gap: 6px;
    padding: 6px; background: #1a1a1a; border-radius: 4px;
    border: 1px solid #2a2a2a;
  }
  .exchange-tag {
    flex-shrink: 0; font-size: 9px; padding: 2px 4px;
    border-radius: 3px; background: #333; color: #aaa;
    text-transform: uppercase;
  }
  .exchange-tag.upbit { background: #1a3a5c; color: #60a5fa; }
  .notice-title { color: #bbb; line-height: 1.4; }
  .error-row { color: #f44336; font-size: 11px; }
  .loading-row, .empty-row { color: #555; font-size: 11px; padding: 4px 0; }
</style>
