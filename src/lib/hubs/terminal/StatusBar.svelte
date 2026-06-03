<script lang="ts">
  import StatusBarExpand from './StatusBarExpand.svelte';
  import HoldTimeStrip from '$lib/components/shared/HoldTimeStrip.svelte';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/authStore';
  import { isVex, type MissionPhase, type TrustZone } from '$lib/vex';

  const vexMode = isVex();

  interface PropFirmMiniData {
    status: string;
    tradingDays: number;
    maxTradingDays: number;
    pnlPct: number;
    maxDrawdownPct: number;
    currentDrawdownPct: number;
  }

  interface Props {
    verdicts: number;
    modelDelta: number;
    sidebarVisible: boolean;
    /** D-10: latest verdict label, e.g. "LONG" / "SHORT" / "WAIT" / null. */
    lastVerdictKind?: 'LONG' | 'SHORT' | 'WAIT' | null;
    /** D-10: epoch ms of latest data tick (chart price). null = unknown. */
    lastUpdatedAt?: number | null;
    /** W-0395: hold time p50 in hours for unresolved watch patterns. null = no data. */
    holdP50?: number | null;
    /** W-0395: hold time p90 in hours for unresolved watch patterns. null = no data. */
    holdP90?: number | null;
  }

  const {
    verdicts, modelDelta, sidebarVisible,
    lastVerdictKind = null, lastUpdatedAt = null,
    holdP50 = null, holdP90 = null,
  }: Props = $props();

  // W-T13: PropFirm mini — poll for active evaluation
  let pfData = $state<PropFirmMiniData | null>(null);
  let propFirmUnauthorized = $state(false);

  async function fetchPropFirmMini() {
    if (!$authStore.hydrated || !$authStore.authenticated) return;
    if (propFirmUnauthorized) return;
    try {
      const res = await fetch('/api/propfirm/evaluation');
      if (!res.ok) {
        if (res.status === 401) propFirmUnauthorized = true;
        return;
      }
      const d = await res.json() as {
        evaluation: {
          status: string;
          trading_days: number;
          equity_start: number;
          equity_current: number;
        };
        tier?: { max_trading_days?: number; max_daily_drawdown_pct?: number } | null;
      };
      if (!d?.evaluation || d.evaluation.status !== 'ACTIVE') return;
      const eq = d.evaluation;
      const pnlPct = eq.equity_start > 0
        ? ((eq.equity_current - eq.equity_start) / eq.equity_start) * 100
        : 0;
      pfData = {
        status: eq.status,
        tradingDays: eq.trading_days,
        maxTradingDays: d.tier?.max_trading_days ?? 30,
        pnlPct: Math.round(pnlPct * 100) / 100,
        maxDrawdownPct: d.tier?.max_daily_drawdown_pct ?? 5,
        currentDrawdownPct: pnlPct < 0 ? Math.abs(pnlPct) : 0,
      };
    } catch { /* silent */ }
  }

  onMount(() => {
    fetchPropFirmMini();
    const t = setInterval(fetchPropFirmMini, 120_000);
    return () => clearInterval(t);
  });

  const pfDaysPct = $derived(
    pfData ? Math.min(100, (pfData.tradingDays / pfData.maxTradingDays) * 100) : 0
  );
  const pfDrawdownOk = $derived(
    pfData ? pfData.currentDrawdownPct < pfData.maxDrawdownPct * 0.7 : true
  );

  function getTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  let currentTime = $state(getTime());
  let nowMs = $state(Date.now());
  $effect(() => {
    const interval = setInterval(() => {
      currentTime = getTime();
      nowMs = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });

  // BTC FR + Kimchi live data (30s poll)
  let btcFR      = $state<number | null>(null);
  let kimchiPct  = $state<number | null>(null);

  const frClass     = $derived(btcFR === null ? '' : btcFR > 0 ? 'fr-long' : 'fr-short');
  const kimchiClass = $derived(kimchiPct === null ? '' : kimchiPct > 1.5 ? 'kim-hot' : kimchiPct < -0.5 ? 'kim-cold' : '');

  async function fetchMarketData() {
    try {
      const [frRes, kimRes] = await Promise.allSettled([
        fetch('/api/market/funding?symbol=BTCUSDT&limit=2'),
        fetch('/api/market/kimchi-premium'),
      ]);
      if (frRes.status === 'fulfilled' && frRes.value.ok) {
        const d = await frRes.value.json() as { bars: { delta: number }[] };
        const bars = d.bars ?? [];
        if (bars.length > 0) btcFR = bars[bars.length - 1].delta;
      }
      if (kimRes.status === 'fulfilled' && kimRes.value.ok) {
        const d = await kimRes.value.json() as { ok: boolean; data: { premium_pct: number } };
        if (d.ok) kimchiPct = d.data.premium_pct;
      }
    } catch { /* silent */ }
  }

  $effect(() => {
    fetchMarketData();
    const t = setInterval(fetchMarketData, 30_000);
    return () => clearInterval(t);
  });

  const freshnessSec = $derived(
    lastUpdatedAt == null ? null : Math.max(0, Math.floor((nowMs - lastUpdatedAt) / 1000)),
  );
  const freshnessClass = $derived(
    freshnessSec == null ? '' :
    freshnessSec < 15 ? 'fresh-good' :
    freshnessSec < 60 ? 'fresh-warn' : 'fresh-stale',
  );

  // F60 mini gate: verdicts >= 60 is the threshold for "enough data"
  const f60Gate = $derived(verdicts >= 60);
  const f60Class = $derived(f60Gate ? 'gate-pass' : 'gate-fail');

  // W-0582: Calibration chip — poll advisor calibration state every 5 min
  let calData = $state<{ threshold: number; win_rate: number | null; sample_count: number } | null>(null);

  async function fetchCalibration() {
    try {
      const res = await fetch('/api/advisor/calibration');
      if (!res.ok) return;
      const d = await res.json() as { threshold: number; win_rate: number | null; sample_count: number };
      calData = d;
    } catch { /* silent */ }
  }

  onMount(() => {
    fetchCalibration();
    const t = setInterval(fetchCalibration, 300_000);
    return () => clearInterval(t);
  });

  // Tier-2 hover-expand state
  let expanded = $state(false);

  function onMouseEnter() { expanded = true; }
  function onMouseLeave() { expanded = false; }
  function toggleExpand() { expanded = !expanded; }

  // ── VEX 슬롯 상태 ────────────────────────────────────────────────────────
  let vexMission = $state<MissionPhase>('IDLE');
  let vexTrust   = $state<TrustZone>('HUMAN');

  onMount(() => {
    if (!vexMode) return;
    // 초기 상태 로드
    window.vex!.getMissionState().then(s => {
      vexMission = s.phase;
      vexTrust   = s.trust_zone;
    });
    // 실시간 구독
    const unsub = window.vex!.onMissionStateChange(s => {
      vexMission = s.phase;
      vexTrust   = s.trust_zone;
    });
    return unsub;
  });

  async function handleKill() {
    if (!vexMode) return;
    await window.vex!.kill();
  }
</script>

<!--
  StatusBar — 32px base (Tier-1).
  When [data-statusbar-expanded=true], StatusBarExpand slides in below as a 28px row.

  Tier-1 (always visible): F60 mini gate · Freshness · mini Verdict · Drift · Time
  Tier-2 (hover-expand): FR · Kimchi · HoldTime · scanner detail · sys health
-->
<div
  class="status-bar-wrapper"
  data-statusbar-expanded={expanded}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  role="status"
  aria-label="Terminal status bar"
>
  <!-- Tier-1: always visible 32px strip -->
  <div class="status-bar">

    <!-- F60 mini gate -->
    <span class="status-item" title="F60 gate: {f60Gate ? 'sufficient data (≥60 verdicts)' : 'insufficient data (<60 verdicts)'}">
      <span class="gate-dot {f60Class}"></span>
      <span class="item-label">F60</span>
      <strong class={f60Class}>{verdicts}</strong>
    </span>

    <span class="divider">│</span>

    <!-- Freshness ↻ -->
    {#if freshnessSec !== null}
      <span class="status-item" title="Time since last data refresh">
        <span class="refresh-icon" aria-hidden="true">↻</span>
        <strong class={freshnessClass}>{freshnessSec}s</strong>
      </span>
    {:else}
      <span class="status-item" title="Data freshness unknown">
        <span class="refresh-icon" aria-hidden="true">↻</span>
        <span class="item-muted">—</span>
      </span>
    {/if}

    <span class="divider">│</span>

    <!-- mini Verdict -->
    <span class="status-item" title="Latest verdict">
      {#if lastVerdictKind}
        <span
          class="verdict-dot"
          class:vd-long={lastVerdictKind === 'LONG'}
          class:vd-short={lastVerdictKind === 'SHORT'}
          class:vd-wait={lastVerdictKind === 'WAIT'}
        ></span>
        <span
          class="verdict-label"
          class:vl-long={lastVerdictKind === 'LONG'}
          class:vl-short={lastVerdictKind === 'SHORT'}
          class:vl-wait={lastVerdictKind === 'WAIT'}
        >{lastVerdictKind}</span>
      {:else}
        <span class="verdict-dot vd-none"></span>
        <span class="item-muted">—</span>
      {/if}
    </span>

    <span class="divider">│</span>

    <!-- Drift indicator -->
    <span class="status-item" title="Actual profit deviation vs. model prediction">
      <span class="item-label">drift</span>
      <strong class:positive={modelDelta >= 0} class:negative={modelDelta < 0}>
        {modelDelta >= 0 ? '+' : ''}{modelDelta.toFixed(3)}
      </strong>
    </span>

    <!-- W-0582: Calibration chip -->
    {#if calData && calData.sample_count > 0}
      <span class="divider">│</span>
      <span
        class="status-item cal-chip"
        title="Advisor calibration: threshold {calData.threshold.toFixed(2)}, {calData.sample_count} samples, win-rate {calData.win_rate != null ? (calData.win_rate * 100).toFixed(0) + '%' : '—'}"
      >
        <span class="item-label">cal</span>
        <strong
          class:cal-good={calData.win_rate != null && calData.win_rate > 0.65}
          class:cal-warn={calData.win_rate != null && calData.win_rate >= 0.50 && calData.win_rate <= 0.65}
          class:cal-bad={calData.win_rate != null && calData.win_rate < 0.50}
        >{calData.threshold.toFixed(2)} · WR {calData.win_rate != null ? (calData.win_rate * 100).toFixed(0) + '%' : '—'}</strong>
      </span>
    {/if}

    <span class="spacer"></span>

    <!-- W-T13: PropFirm mini progress (only when active evaluation) -->
    {#if pfData}
      <span class="pf-mini" title="PropFirm evaluation: Day {pfData.tradingDays}/{pfData.maxTradingDays} · P&L {pfData.pnlPct >= 0 ? '+' : ''}{pfData.pnlPct.toFixed(1)}%">
        <span class="pf-label">PF</span>
        <span class="pf-bar-wrap" aria-hidden="true">
          <span class="pf-bar-fill days" style:width="{pfDaysPct}%"></span>
        </span>
        <span class="pf-pnl" class:pf-pos={pfData.pnlPct >= 0} class:pf-neg={pfData.pnlPct < 0}>
          {pfData.pnlPct >= 0 ? '+' : ''}{pfData.pnlPct.toFixed(1)}%
        </span>
        {#if !pfDrawdownOk}
          <span class="pf-warn" aria-label="Drawdown warning">⚠</span>
        {/if}
      </span>
      <span class="divider">│</span>
    {/if}

    <!-- W-T13: Connection health dot -->
    <span
      class="conn-dot"
      class:conn-good={freshnessClass === 'fresh-good'}
      class:conn-warn={freshnessClass === 'fresh-warn'}
      class:conn-bad={freshnessClass === 'fresh-stale' || freshnessSec === null}
      title="Connection: {freshnessClass === 'fresh-good' ? 'Live' : freshnessClass === 'fresh-warn' ? 'Delayed' : 'Disconnected'}"
      role="status"
      aria-label="Connection status"
    ></span>

    <!-- Expand chevron (click to pin Tier-2 open; hover also works) -->
    <button
      class="expand-btn"
      class:expanded
      onclick={toggleExpand}
      title="{expanded ? 'Collapse' : 'Expand'} status detail"
      aria-expanded={expanded}
      aria-controls="statusbar-tier2"
    >
      <span class="chevron" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
    </button>

    <span class="divider">│</span>

    <!-- Time -->
    <span class="time" title="Current time (HH:MM:SS)">{currentTime}</span>

    <!-- VEX 슬롯: MISSION · TRUST · KILL — isVex() 시만 렌더 -->
    {#if vexMode}
      <span class="divider">│</span>

      <span
        class="vex-mission"
        class:vex-idle={vexMission === 'IDLE'}
        class:vex-watch={vexMission === 'WATCHING'}
        class:vex-prop={vexMission === 'PROPOSED'}
        class:vex-live={vexMission === 'LIVE'}
        class:vex-killed={vexMission === 'KILLED'}
        title="Mission: {vexMission}"
        role="status"
        aria-label="VEX mission phase {vexMission}"
      >
        {#if vexMission === 'IDLE'}◆
        {:else if vexMission === 'WATCHING'}◈
        {:else if vexMission === 'PROPOSED'}◉
        {:else if vexMission === 'LIVE'}●
        {:else}■{/if}
        {vexMission}
      </span>

      <span
        class="vex-trust"
        class:vex-trust-human={vexTrust === 'HUMAN'}
        class:vex-trust-co={vexTrust === 'CO-PILOT'}
        class:vex-trust-agent={vexTrust === 'AGENT'}
        title="Trust zone: {vexTrust}"
      >{vexTrust}</span>

      <button
        class="vex-kill"
        onclick={handleKill}
        title="Kill switch — 즉시 발동"
        aria-label="VEX kill switch"
      >■</button>
    {/if}
  </div>

  <!-- Tier-2: hover-expand or click-expand strip -->
  {#if expanded}
    <div id="statusbar-tier2">
      <HoldTimeStrip p50={holdP50} p90={holdP90} label="hold" />
      <StatusBarExpand
        {btcFR}
        {kimchiPct}
        {holdP50}
        {holdP90}
        {frClass}
        {kimchiClass}
      />
    </div>
  {/if}
</div>

<style>
  /* ── Wrapper ──────────────────────────────────────────── */
  .status-bar-wrapper {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--sc-bg-1);
    border-top: 1px solid var(--sc-line-soft);
    /* Tier-2 slides up: wrapper grows from 32px to 60px */
    transition: height 120ms ease;
  }

  /* ── Tier-1 strip ─────────────────────────────────────── */
  .status-bar {
    min-height: 32px;
    display: flex;
    align-items: center;
    gap: var(--sc-sp-2);
    padding: 0 var(--sc-sp-2);
    font-family: var(--sc-font-mono);
    font-size: var(--sc-fs-2xs);
    color: var(--sc-text-1);
    letter-spacing: 0.04em;
  }

  /* ── Shared atoms ─────────────────────────────────────── */
  .divider {
    color: var(--sc-line-soft);
    flex-shrink: 0;
  }

  .status-item {
    display: inline-flex;
    align-items: center;
    gap: var(--sc-sp-1);
    white-space: nowrap;
  }

  .status-item strong {
    color: var(--sc-text-0);
  }

  .item-label {
    color: var(--sc-text-2);
  }

  .item-muted {
    color: var(--sc-text-2);
  }

  /* ── F60 gate dot ─────────────────────────────────────── */
  .gate-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }
  .gate-pass { color: var(--accent-pos); }
  .gate-pass.gate-dot { background: var(--accent-pos); }
  .gate-fail { color: var(--accent-neg); }
  .gate-fail.gate-dot { background: var(--accent-neg); }

  /* ── Freshness ↻ ──────────────────────────────────────── */
  .refresh-icon {
    color: var(--sc-text-2);
    font-size: var(--sc-fs-2xs);
  }
  .fresh-good  { color: var(--accent-pos); }
  .fresh-warn  { color: var(--accent-amb); }
  .fresh-stale { color: var(--accent-neg); }

  /* ── mini Verdict dot + label ─────────────────────────── */
  .verdict-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    background: var(--sc-text-2);
  }
  .vd-long  { background: var(--accent-pos); }
  .vd-short { background: var(--accent-neg); }
  .vd-wait  { background: var(--accent-amb); }
  .vd-none  { background: var(--sc-text-2); }

  .verdict-label {
    font-size: var(--sc-fs-2xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--sc-text-2);
  }
  .vl-long  { color: var(--accent-pos); }
  .vl-short { color: var(--accent-neg); }
  .vl-wait  { color: var(--accent-amb); }

  /* ── Drift ────────────────────────────────────────────── */
  .positive { color: var(--accent-pos); }
  .negative { color: var(--accent-neg); }

  /* ── Spacer ───────────────────────────────────────────── */
  .spacer {
    flex: 1;
  }

  /* ── Expand button ────────────────────────────────────── */
  .expand-btn {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    color: var(--sc-text-2);
    transition: color 80ms, background 80ms;
  }
  .expand-btn:hover,
  .expand-btn.expanded {
    color: var(--sc-text-1);
    background: var(--sc-bg-2);
  }
  .chevron {
    font-size: var(--ui-text-xs);
    line-height: 1;
  }

  /* ── Time ─────────────────────────────────────────────── */
  .time {
    color: var(--sc-text-1);
    white-space: nowrap;
  }

  /* ── W-T13: PropFirm mini ─────────────────────────────── */
  .pf-mini {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .pf-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(var(--brand-rgb, 219, 154, 159), 0.6);
  }

  .pf-bar-wrap {
    width: 36px;
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .pf-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }

  .pf-bar-fill.days {
    background: rgba(var(--brand-rgb, 219, 154, 159), 0.55);
  }

  .pf-pnl {
    font-size: var(--sc-fs-2xs);
    font-weight: 600;
  }

  .pf-pos { color: var(--accent-pos); }
  .pf-neg { color: var(--accent-neg); }

  .pf-warn {
    font-size: var(--ui-text-xs);
    color: var(--accent-amb);
  }

  /* ── W-0582: Calibration chip ────────────────────────── */
  .cal-good { color: var(--accent-pos); }
  .cal-warn { color: var(--accent-amb); }
  .cal-bad  { color: var(--accent-neg); }

  /* ── W-T13: Connection health dot ─────────────────────── */
  .conn-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--sc-text-2);
    transition: background 0.3s;
  }

  .conn-dot.conn-good { background: var(--accent-pos); box-shadow: 0 0 4px rgba(38, 208, 122, 0.4); }
  .conn-dot.conn-warn { background: var(--accent-amb); }
  .conn-dot.conn-bad  { background: var(--accent-neg); }

  /* PR14: StatusBar hidden on mobile — critical items absorbed into MobileBottomNav */
  @media (max-width: 768px) {
    .status-bar {
      display: none;
    }
  }

  /* ── VEX 슬롯 ────────────────────────────────────────────── */
  .vex-mission {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: var(--sc-font-mono);
    font-size: var(--sc-fs-2xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    white-space: nowrap;
    color: var(--sc-text-2);
  }

  /* Mission phase 색상 */
  .vex-idle   { color: var(--sc-text-2); }
  .vex-watch  { color: var(--amb); animation: vex-pulse 1.8s ease-in-out infinite; }
  .vex-prop   { color: var(--amb); animation: vex-pulse 0.9s ease-in-out infinite; }
  .vex-live   { color: var(--bull); }
  .vex-killed { color: var(--bear); }

  @keyframes vex-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  .vex-trust {
    font-family: var(--sc-font-mono);
    font-size: var(--sc-fs-2xs);
    font-weight: 500;
    letter-spacing: 0.06em;
    white-space: nowrap;
    padding: 0 4px;
    border-radius: 2px;
  }

  /* Trust zone 색상 */
  .vex-trust-human   { color: var(--sc-text-2); }
  .vex-trust-co      { color: var(--amb);    background: rgba(242, 209, 147, 0.08); }
  .vex-trust-agent   { color: var(--brand);  background: rgba(219, 154, 159, 0.08); }

  .vex-kill {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    font-size: 10px;
    color: var(--sc-text-2);
    background: var(--sc-bg-2);
    transition: color 80ms, background 80ms;
    flex-shrink: 0;
  }

  .vex-kill:hover {
    color: var(--g9);
    background: var(--bear);
  }

  .vex-kill:active {
    background: color-mix(in srgb, var(--bear) 70%, black);
  }
</style>
