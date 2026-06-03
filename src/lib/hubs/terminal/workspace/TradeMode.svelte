<script lang="ts">
  import type { Component } from 'svelte';
  import ChartWorkspace from './ChartWorkspace.svelte';
  import IndicatorQuickRail from './IndicatorQuickRail.svelte';
  import MarketActionBar from './MarketActionBar.svelte';

  // ChartBoard pulls lightweight-charts (~196KB) + a 200KB primitive bundle.
  // Defer it so /cogochi route entry can paint without parsing the chart engine.
  let ChartBoardComp = $state<Component | null>(null);
  $effect.pre(() => {
    if (ChartBoardComp) return;
    void import('./ChartBoard.svelte').then((m) => { ChartBoardComp = m.default as unknown as Component; });
  });
  import ExecuteDrawer from './ExecuteDrawer.svelte';
  import QuickOrderPanel from './QuickOrderPanel.svelte';
  import Splitter from '../Splitter.svelte';
  import AIAgentPanel from '../panels/AIAgentPanel/AIAgentPanel.svelte';
  import { shellStore } from '../shell.store';
  import { fetchAnalyzeAndChart, fetchAnalyze, fetchSubPanelBars, submitTradeOutcome } from '$lib/api/terminalBackend';
  import type { ChartSeriesPayload } from '$lib/api/terminalBackend';
  import type { AnalyzeEnvelope } from '$lib/contracts/terminalBackend';
  import { cogochiDataStore } from '$lib/hubs/terminal/cogochi.data.store';
  import type { ShellWorkMode, TabState } from '$lib/hubs/terminal/shell.store';
  import { useMicrostructureSocket } from '$lib/trade/useMicrostructureSocket.svelte';
  import type { GammaPinData } from '../../../shared/chart/primitives/GammaPinPrimitive';

  type PanelType = 'fr' | 'oi' | 'cvd' | 'liq';

  interface Props {
    tabState: TabState;
    updateTabState: (updater: (ts: TabState) => TabState) => void;
    symbol?: string;
    timeframe?: string;
    tabId?: string;
    workMode?: ShellWorkMode;
    mobileView?: 'chart' | 'verdict' | 'research' | 'judge';
    setMobileView?: (v: 'chart' | 'verdict' | 'research' | 'judge') => void;
    setMobileSymbol?: (sym: string) => void;
    onSymbolTap?: () => void;
    onTFChange?: (tf: string) => void;
    isPaneFocused?: boolean;
    mode?: 'trade' | 'train' | 'flywheel';
    activePanels?: PanelType[];
    onActivePanelsChange?: (panels: PanelType[]) => void;
    /** Mobile-only — chart height as % of viewport (30–80). */
    mobileChartPct?: number;
    onResizeMobileChart?: (deltaPct: number) => void;
    onResetMobileChart?: () => void;
  }

  let {
    tabState, updateTabState,
    symbol = 'BTCUSDT', timeframe = '4h',
    tabId, workMode = 'analyze', mobileView,
    setMobileView, setMobileSymbol, onTFChange, isPaneFocused = true,
    mode = 'trade',
    activePanels = ['fr', 'oi', 'cvd', 'liq'],
    onActivePanelsChange,
    mobileChartPct = 50,
    onResizeMobileChart,
    onResetMobileChart,
  }: Props = $props();

  // ── Analyze data ──────────────────────────────────────────────
  let analyzeData  = $state<AnalyzeEnvelope | null>(null);
  let chartPayload = $state<ChartSeriesPayload | null>(null);
  let chartLoading = $state(false);
  const verdictLevels = $derived(analyzeData?.entryPlan ? {
    entry:  analyzeData.entryPlan.entry,
    stop:   analyzeData.entryPlan.stop,
    target: analyzeData.entryPlan.targets?.[0]?.price,
  } : undefined);

  const currentPrice = $derived(analyzeData?.price ?? 0);

  // ── Analyze fetch ─────────────────────────────────────────────
  $effect(() => {
    const sym = symbol;
    const tf  = timeframe;
    void (async () => {
      chartLoading = true;
      try {
        const result = await fetchAnalyzeAndChart({ symbol: sym, tf });
        chartPayload = result.chartPayload ?? null;
        analyzeData  = result.analyze ?? null;
        if (analyzeData) dispatchContext(analyzeData);
      } finally {
        chartLoading = false;
      }
    })();
  });

  function mergeSubPanelBars<T extends { time: number }>(existing: T[], fresh: T[]): T[] {
    if (!fresh.length) return existing;
    const cutoff = fresh[0].time;
    return [...existing.filter(b => b.time < cutoff), ...fresh];
  }

  function handleCandleClose() {
    void fetchAnalyze(symbol, timeframe).then(next => {
      if (next) { analyzeData = next; dispatchContext(next); }
    });
    void fetchSubPanelBars({ symbol, tf: timeframe, limit: 20 }).then(sp => {
      if (!sp || !chartPayload) return;
      chartPayload = {
        ...chartPayload,
        cvdBars:     mergeSubPanelBars(chartPayload.cvdBars     ?? [], sp.cvdBars),
        fundingBars: mergeSubPanelBars(chartPayload.fundingBars ?? [], sp.fundingBars),
        oiBars:      mergeSubPanelBars(chartPayload.oiBars      ?? [], sp.oiBars),
        liqBars:     mergeSubPanelBars(chartPayload.liqBars     ?? [], sp.liqBars),
      };
    });
  }

  function dispatchContext(data: AnalyzeEnvelope) {
    if (typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent('cogochi:analyze-context', { detail: data }));
  }

  // Sync to global store (used by other components)
  $effect(() => { cogochiDataStore.setAnalyzeData(analyzeData); });

  // ── Microstructure ────────────────────────────────────────────
  const micro = useMicrostructureSocket(() => symbol, () => null);
  const microWsState = $derived((micro as any)?.microWsState ?? 'idle');
  const microPayload = $derived((micro as any)?.liveOrderbook ?? null);
  const activeOrderbook = $derived(microPayload ?? null);
  const activeTrades    = $derived((micro as any)?.liveTrades ?? []);

  // Gamma pin (options, optional future extension)
  let gammaPin = $state<GammaPinData | null>(null);

  function toVerdictDirection(
    value: string | null | undefined,
  ): 'LONG' | 'SHORT' | 'WAIT' | null {
    const normalized = value?.toUpperCase();
    if (normalized === 'LONG' || normalized === 'SHORT' || normalized === 'WAIT') return normalized;
    if (normalized === 'NEUTRAL' || normalized === 'FLAT' || normalized === 'NO_TRADE') return 'WAIT';
    return null;
  }

</script>

<div class="trade-area" class:execute-mode={workMode === 'execute'}>

  {#if mobileView !== undefined}
    <!-- ── MOBILE ─────────────────────────────────────────── -->
    <div
      class="mobile-chart"
      class:fullscreen={mobileView === 'chart'}
      style:height={mobileView === 'chart' ? '100%' : `${mobileChartPct}vh`}
    >
      <MarketActionBar
        compact
        direction={toVerdictDirection(analyzeData?.ensemble?.direction)}
        reason={analyzeData?.ensemble?.reason ?? null}
        change24hPct={analyzeData?.change24h ?? null}
        {verdictLevels}
      />
      {#if ChartBoardComp}
        <ChartBoardComp
          {symbol}
          tf={timeframe}
          {tabId}
          initialData={chartPayload ?? undefined}
          {verdictLevels}
          change24hPct={analyzeData?.change24h ?? null}
          contextMode="chart"
          onCandleClose={handleCandleClose}
          {gammaPin}
        />
      {:else}
        <div class="chart-loading-skeleton" aria-busy="true" aria-label="차트 로딩 중"></div>
      {/if}
    </div>

    <IndicatorQuickRail compact />

    {#if mobileView !== 'chart'}
      <Splitter
        orientation="horizontal"
        onDrag={(dy) => onResizeMobileChart?.((dy / window.innerHeight) * 100)}
        onReset={() => onResetMobileChart?.()}
      />
    {/if}

    <div class="mobile-tabs" role="tablist">
      {#each (['chart', 'verdict', 'research', 'judge'] as const) as t}
        <button
          class="mt-tab"
          class:active={mobileView === t}
          role="tab"
          aria-selected={mobileView === t}
          onclick={() => setMobileView?.(t)}
        >{t === 'chart' ? '차트' : t === 'verdict' ? '분석' : t === 'research' ? '스캔' : 'AI'}</button>
      {/each}
    </div>

    {#if mobileView !== 'chart'}
      <div class="mobile-panel" class:full-bleed={mobileView === 'judge'}>
        {#if mobileView === 'judge'}
          <AIAgentPanel
            {symbol}
            timeframe={timeframe}
            onSelectSymbol={(s: string) => setMobileSymbol?.(s)}
          />
        {:else if analyzeData && mobileView === 'verdict'}
          <div class="mob-analysis">
            <span class="mob-dir" class:pos={analyzeData.ensemble?.direction === 'LONG'} class:neg={analyzeData.ensemble?.direction === 'SHORT'}>
              {analyzeData.ensemble?.direction ?? '—'}
            </span>
            <p class="mob-reason">{analyzeData.ensemble?.reason ?? '분석 준비 중…'}</p>
          </div>
        {/if}
      </div>
    {/if}

    {#if workMode === 'execute'}
      <ExecuteDrawer orderbook={activeOrderbook} trades={activeTrades} {symbol} />
    {/if}

  {:else}
    <!-- ── DESKTOP ─────────────────────────────────────────── -->
    <div class="chart-col">
      <ChartWorkspace
        {symbol}
        tf={timeframe}
        surfaceStyle="velo"
        direction={toVerdictDirection(analyzeData?.ensemble?.direction)}
        reason={analyzeData?.ensemble?.reason ?? null}
        change24hPct={analyzeData?.change24h ?? null}
        {verdictLevels}
      />
    </div>

    {#if workMode === 'execute'}
      <ExecuteDrawer orderbook={activeOrderbook} trades={activeTrades} {symbol} />
      <QuickOrderPanel
        {symbol}
        currentPrice={currentPrice > 0 ? currentPrice : null}
        entryPrice={analyzeData?.entryPlan?.entry ?? null}
        stopPrice={analyzeData?.entryPlan?.stop ?? null}
        tpPrice={analyzeData?.entryPlan?.targets?.[0]?.price ?? null}
        riskReward={analyzeData?.entryPlan?.riskReward ?? null}
      />
    {/if}
  {/if}

</div>

<style>
.trade-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: var(--g0);
}

/* ── Desktop chart column ── */
.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ── Execute mode layout ── */
.trade-area.execute-mode {
  display: grid;
  grid-template-rows: 1fr auto;
}

/* ── Mobile ── */
.mobile-chart { flex: 0 0 auto; min-height: 0; overflow: hidden; }
.mobile-chart.fullscreen { flex: 1; }
.chart-loading-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--g1) 0%, var(--g2) 50%, var(--g1) 100%);
  background-size: 200% 100%;
  animation: chart-skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes chart-skeleton-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.mobile-tabs {
  display: flex;
  background: var(--term-surface-1, var(--g1));
  border-bottom: 1px solid var(--term-border, var(--g3));
  flex-shrink: 0;
}
.mt-tab {
  flex: 1;
  min-height: 28px;
  padding: 5px 0;
  font-size: var(--ui-text-xs);
  font-family: 'JetBrains Mono', monospace;
  color: var(--term-text-2, var(--g5));
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: color 0.1s, background 0.1s;
}
.mt-tab:hover { background: var(--term-surface-2, var(--g2)); }
.mt-tab.active { color: var(--brand); border-bottom-color: var(--brand); }
.mobile-panel { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 8px 8px; }
.mobile-panel.full-bleed { padding: 0; overflow: hidden; }
.mob-analysis { display: flex; flex-direction: column; gap: 5px; }
.mob-dir { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.12em; color: var(--g7); }
.mob-dir.pos { color: var(--pos); }
.mob-dir.neg { color: var(--neg); }
.mob-reason { font-size: var(--ui-text-xs); color: var(--g6); line-height: 1.4; margin: 0; }
</style>
