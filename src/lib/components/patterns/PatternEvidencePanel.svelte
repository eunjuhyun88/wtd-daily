<script lang="ts">
  import type { Component } from 'svelte';
  import type { PatternMatchView, PatternStateView } from '$lib/contracts';
  import type { PatternStats } from '$lib/types/patternStats';
  import PatternChartPane from './PatternChartPane.svelte';
  import Workbench   from '$lib/patterns/studio/Workbench.svelte';
  import { pendingChartTs } from '$lib/hubs/terminal';
  import Workshop    from '../../../routes/patterns/_tabs/Workshop.svelte';
  import Strategies  from '../../../routes/patterns/_tabs/Strategies.svelte';
  import Wiki        from '../../../routes/patterns/_tabs/Wiki.svelte';

  type InsightTab = 'evidence' | 'signals' | 'backtest' | 'studio' | 'workshop' | 'strategies' | 'wiki';

  interface PatternSignalRow {
    id?: string;
    symbol?: string;
    direction?: string;
    signal_type?: string;
    confidence?: number | null;
    fired_at?: string | null;
    outcome?: string | null;
    pnl_pct?: number | null;
    [key: string]: unknown;
  }

  interface EvidenceRow {
    label: string;
    value: string;
  }

  interface BlockScoreRow {
    label: string;
    score: string;
    passed: string;
  }

  interface Props {
    slug: string;
    match?: PatternMatchView | null;
    matches?: PatternMatchView[];
    summaryStats?: PatternStats | null;
    states?: PatternStateView[];
  }

  let {
    slug,
    match = null,
    matches = [],
    summaryStats = null,
    states = [],
  }: Props = $props();

  let activeTab = $state<InsightTab>('evidence');
  let signals = $state<PatternSignalRow[]>([]);
  let signalsLoading = $state(false);
  let signalsErr = $state('');
  let signalsLoadedFor = $state<string | null>(null);
  let ChartPaneComp = $state<Component | null>(null);

  $effect.pre(() => {
    if (ChartPaneComp) return;
    void import('$lib/hubs/terminal/workspace/ChartPane.svelte').then((m) => {
      ChartPaneComp = m.default as unknown as Component;
    });
  });

  const FEATURE_ORDER = [
    'entry_p_win',
    'rsi14',
    'rsi7',
    'oi_change_1h',
    'oi_change_24h',
    'funding_rate',
    'volume_percentile',
    'vol_ratio_3',
    'atr_pct',
    'bb_width',
    'price_change_1h',
    'price_change_4h',
    'price_change_24h',
    'price_vs_ema50',
    'price_vs_ema200',
    'taker_buy_ratio_1h',
    'cvd_state',
    'long_short_ratio',
    'stoch_rsi',
    'williams_r',
    'cci',
  ];

  function asNumber(value: unknown): number | null {
    const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
    return Number.isFinite(n) ? n : null;
  }

  function fmtPct(value: number | null | undefined, digits = 0): string {
    if (value == null || !Number.isFinite(value)) return '—';
    return `${(value * 100).toFixed(digits)}%`;
  }

  function fmtSignedPct(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '—';
    const pct = value * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  }

  function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function foundAtLabel(match: PatternMatchView | null | undefined): string {
    return fmtDate(match?.triggerBarTs ?? match?.lastEvalAt ?? match?.enteredAt);
  }

  function foundAtKind(match: PatternMatchView | null | undefined): string {
    if (match?.triggerBarTs) return 'trigger bar';
    if (match?.lastEvalAt) return 'last eval';
    if (match?.enteredAt) return 'phase entered';
    return 'timestamp';
  }

  function sourceLabel(match: PatternMatchView | null | undefined): string {
    return match?.source === 'candidate' ? 'pattern hit candidate' : 'runtime state only';
  }

  function toEpochSeconds(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    if (!Number.isFinite(ms)) return null;
    return Math.floor(ms / 1000);
  }

  function prettyLabel(key: string): string {
    return key.replace(/_/g, ' ');
  }

  function isPercentLike(key: string): boolean {
    return key === 'entry_p_win'
      || key.endsWith('_pct')
      || key.startsWith('price_change_')
      || key.startsWith('dist_from_')
      || key === 'funding_rate';
  }

  function fmtSnapshotValue(key: string, value: unknown): string {
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return value;
    const num = asNumber(value);
    if (num == null) return '—';
    if (isPercentLike(key)) return fmtSignedPct(num);
    if (Math.abs(num) >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (Math.abs(num) >= 100) return num.toFixed(1);
    if (Math.abs(num) >= 1) return num.toFixed(2);
    if (num === 0) return '0';
    return num.toFixed(4);
  }

  function scoreView(value: unknown): BlockScoreRow | null {
    if (value == null) return null;
    if (typeof value === 'number') {
      return { label: '', score: value.toFixed(2), passed: '—' };
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { label: '', score: String(value), passed: '—' };
    }
    const score = asNumber((value as Record<string, unknown>).score);
    const passed = (value as Record<string, unknown>).passed;
    return {
      label: '',
      score: score != null ? score.toFixed(2) : '—',
      passed: typeof passed === 'boolean' ? (passed ? 'pass' : 'fail') : '—',
    };
  }

  const mergedSnapshot = $derived((() => {
    const snapshot: Record<string, unknown> = {};
    if (match?.featureSnapshot) Object.assign(snapshot, match.featureSnapshot);
    if (match?.indicatorSnapshot) Object.assign(snapshot, match.indicatorSnapshot);
    if (match?.engine) {
      if (match.engine.entry_p_win != null) snapshot.entry_p_win = match.engine.entry_p_win;
      if (match.engine.entry_ml_state != null) snapshot.entry_ml_state = match.engine.entry_ml_state;
      if (match.engine.entry_threshold_passed != null) snapshot.entry_threshold_passed = match.engine.entry_threshold_passed;
      if (match.engine.entry_model_version != null) snapshot.entry_model_version = match.engine.entry_model_version;
      if (match.engine.data_quality != null) snapshot.data_quality = match.engine.data_quality;
    }
    return snapshot;
  })());

  const evidenceRows = $derived((() => {
    const rows: EvidenceRow[] = [];
    const used = new Set<string>();
    for (const key of FEATURE_ORDER) {
      if (!(key in mergedSnapshot)) continue;
      rows.push({ label: prettyLabel(key), value: fmtSnapshotValue(key, mergedSnapshot[key]) });
      used.add(key);
    }
    for (const [key, value] of Object.entries(mergedSnapshot)) {
      if (used.has(key) || rows.length >= 12) continue;
      rows.push({ label: prettyLabel(key), value: fmtSnapshotValue(key, value) });
    }
    return rows;
  })());

  const blockScoreRows = $derived((() => {
    if (!match) return [] as BlockScoreRow[];
    return Object.entries(match.blockScores)
      .map(([label, value]) => {
        const row = scoreView(value);
        return row ? { ...row, label: prettyLabel(label) } : null;
      })
      .filter((row): row is BlockScoreRow => row !== null)
      .slice(0, 12);
  })());

  const chartEvidenceRows = $derived((() => {
    if (!match) return [] as EvidenceRow[];
    const keys = [
      'rsi14',
      'rsi7',
      'volume_percentile',
      'vol_ratio_3',
      'price_change_1h',
      'price_change_4h',
      'price_vs_ema50',
      'price_vs_ema200',
      'funding_rate',
      'oi_change_1h',
    ];
    return keys
      .filter((key) => key in mergedSnapshot)
      .map((key) => ({ label: prettyLabel(key), value: fmtSnapshotValue(key, mergedSnapshot[key]) }))
      .slice(0, 6);
  })());

  const selectedSignals = $derived((() => {
    const symbol = match?.symbol;
    return [...signals].sort((a, b) => {
      const aSelected = symbol && a.symbol === symbol ? 1 : 0;
      const bSelected = symbol && b.symbol === symbol ? 1 : 0;
      if (aSelected !== bSelected) return bSelected - aSelected;
      return new Date(String(b.fired_at ?? 0)).getTime() - new Date(String(a.fired_at ?? 0)).getTime();
    });
  })());

  $effect(() => {
    slug;
    activeTab = 'evidence';
  });

  const chartFocusTs = $derived(toEpochSeconds(match?.triggerBarTs ?? match?.lastEvalAt ?? match?.enteredAt));

  $effect(() => {
    if (activeTab !== 'evidence') return;
    if (chartFocusTs == null) return;
    pendingChartTs.set(chartFocusTs);
  });

  $effect(() => {
    if (activeTab !== 'signals') return;
    if (signalsLoadedFor === slug) return;
    signalsLoading = true;
    signalsErr = '';
    fetch(`/api/patterns/${slug}/signals?limit=50`)
      .then((response) => {
        if (!response.ok) throw new Error(`signals ${response.status}`);
        return response.json() as Promise<{ signals?: PatternSignalRow[] } | PatternSignalRow[]>;
      })
      .then((body) => {
        signals = Array.isArray(body) ? body : (body.signals ?? []);
        signalsLoadedFor = slug;
      })
      .catch(() => {
        signals = [];
        signalsErr = 'signals unavailable';
      })
      .finally(() => {
        signalsLoading = false;
      });
  });
</script>

<div class="evidence-pane">
  <div class="ep-head">
    <div class="ep-titles">
      <span class="ep-kicker">Insight Rail</span>
      <strong class="ep-slug" title={slug}>{slug}</strong>
      {#if match}
        <span class="ep-symbol">{match.symbol} · {match.phaseLabel} · {match.timeframe}</span>
      {/if}
    </div>
    <div class="ep-summary">
      <span class="ep-stat">live {matches.length}</span>
      {#if summaryStats?.hit_rate != null}
        <span class="ep-stat">WR {fmtPct(summaryStats.hit_rate)}</span>
      {/if}
      {#if summaryStats?.expected_value != null}
        <span class="ep-stat">EV {fmtSignedPct(summaryStats.expected_value)}</span>
      {/if}
      {#if match?.confidence != null}
        <span class="ep-stat ep-stat-focus">conf {fmtPct(match.confidence)}</span>
      {/if}
    </div>
  </div>

  <div class="ep-tabs" role="tablist" aria-label="Pattern evidence tabs">
    <button class="ep-tab" class:ep-tab-active={activeTab === 'evidence'} type="button" onclick={() => (activeTab = 'evidence')}>Evidence</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'signals'} type="button" onclick={() => (activeTab = 'signals')}>Signals</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'backtest'} type="button" onclick={() => (activeTab = 'backtest')}>Backtest</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'studio'} type="button" onclick={() => (activeTab = 'studio')}>Studio</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'workshop'} type="button" onclick={() => (activeTab = 'workshop')}>Workshop</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'strategies'} type="button" onclick={() => (activeTab = 'strategies')}>Strategies</button>
    <button class="ep-tab" class:ep-tab-active={activeTab === 'wiki'} type="button" onclick={() => (activeTab = 'wiki')}>Wiki</button>
  </div>

  <div class="ep-body">
    {#if activeTab === 'backtest'}
      <PatternChartPane {summaryStats} {states} />
    {:else if activeTab === 'signals'}
      <div class="ep-scroll">
        <section class="section">
          <div class="section-head">
            <span class="section-title">Recent Signals</span>
            {#if match?.symbol}
              <span class="section-note">{match.symbol} rows are pinned first</span>
            {/if}
          </div>
          {#if signalsLoading}
            <p class="empty">Loading…</p>
          {:else if signalsErr}
            <p class="empty">{signalsErr}</p>
          {:else if selectedSignals.length === 0}
            <p class="empty">No signals for this pattern yet.</p>
          {:else}
            <table class="signal-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Dir</th>
                  <th>Outcome</th>
                  <th>PnL</th>
                  <th>Fired</th>
                </tr>
              </thead>
              <tbody>
                {#each selectedSignals as signal}
                  <tr class:signal-row-selected={match?.symbol === signal.symbol}>
                    <td>{signal.symbol ?? '—'}</td>
                    <td>{signal.signal_type ?? '—'}</td>
                    <td>{signal.direction ?? '—'}</td>
                    <td>{signal.outcome ?? 'pending'}</td>
                    <td>{signal.pnl_pct != null ? fmtSignedPct(Number(signal.pnl_pct)) : '—'}</td>
                    <td>{fmtDate(signal.fired_at)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </section>
      </div>
    {:else if activeTab === 'studio'}
      <Workbench />
    {:else if activeTab === 'workshop'}
      <Workshop />
    {:else if activeTab === 'strategies'}
      <Strategies />
    {:else if activeTab === 'wiki'}
      <Wiki />
    {:else}
      <div class="ep-scroll">
        <section class="section">
          <div class="section-head">
            <span class="section-title">Chart Proof</span>
            {#if match}
              <span class="section-note">{match.symbol} · {match.timeframe} · {foundAtKind(match)} {foundAtLabel(match)}</span>
            {/if}
          </div>
          {#if match}
            <div class="proof-shell">
              <div class="proof-chart">
                {#if ChartPaneComp}
                  <ChartPaneComp
                    symbol={match.symbol}
                    tf={match.timeframe}
                    paneId={701}
                    active={false}
                    closeable={false}
                    contextMode="chart"
                    surfaceStyle="velo"
                  />
                {:else}
                  <div class="proof-chart-loading">차트 로딩 중…</div>
                {/if}
              </div>
              <div class="proof-meta">
                <div class="proof-badges">
                  <span class="proof-badge proof-badge-focus">{sourceLabel(match)}</span>
                  <span class="proof-badge">tf {match.timeframe}</span>
                  <span class="proof-badge">{foundAtKind(match)} {foundAtLabel(match)}</span>
                  <span class="proof-badge">phase {match.phaseLabel}</span>
                  <span class="proof-badge">bars {match.barsInPhase}</span>
                  {#if match.confidence != null}
                    <span class="proof-badge proof-badge-focus">conf {fmtPct(match.confidence)}</span>
                  {/if}
                  {#if asNumber(mergedSnapshot.entry_p_win) != null}
                    <span class="proof-badge">p_win {fmtPct(asNumber(mergedSnapshot.entry_p_win), 0)}</span>
                  {/if}
                </div>
                {#if chartEvidenceRows.length > 0}
                  <div class="proof-grid">
                    {#each chartEvidenceRows as row (row.label)}
                      <div class="proof-card">
                        <span class="proof-label">{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="empty">차트 스냅샷 숫자는 아직 비어 있지만, 현재 live chart는 바로 확인할 수 있습니다.</p>
                {/if}
              </div>
            </div>
          {:else}
            <p class="empty">선택된 live match가 없습니다.</p>
          {/if}
        </section>

        <section class="section">
          <div class="section-head">
            <span class="section-title">Why This Match</span>
            {#if match?.source === 'state'}
              <span class="section-note">runtime fallback only</span>
            {/if}
          </div>
          {#if match}
            <div class="metric-grid">
              <div class="metric-card">
                <span class="metric-label">Found on</span>
                <strong>{match.timeframe}</strong>
              </div>
              <div class="metric-card">
                <span class="metric-label">Found at</span>
                <strong>{foundAtLabel(match)}</strong>
              </div>
              <div class="metric-card">
                <span class="metric-label">Phase</span>
                <strong>{match.phaseLabel}</strong>
              </div>
              <div class="metric-card">
                <span class="metric-label">Confidence</span>
                <strong>{match.confidence != null ? fmtPct(match.confidence) : '—'}</strong>
              </div>
              <div class="metric-card">
                <span class="metric-label">p_win</span>
                <strong>{fmtPct(asNumber(mergedSnapshot.entry_p_win), 0)}</strong>
              </div>
              <div class="metric-card">
                <span class="metric-label">Bars</span>
                <strong>{match.barsInPhase}</strong>
              </div>
            </div>
          {:else}
            <p class="empty">선택된 live match가 없습니다.</p>
          {/if}
        </section>

        <section class="section">
          <div class="section-head">
            <span class="section-title">Triggered Blocks</span>
            <span class="section-note">{match?.blocksTriggered.length ?? 0} items</span>
          </div>
          {#if match && match.blocksTriggered.length > 0}
            <div class="pill-wrap">
              {#each match.blocksTriggered as block (block)}
                <span class="pill" title={block}>{block.replace(/_/g, ' ')}</span>
              {/each}
            </div>
          {:else}
            <p class="empty">No block evidence returned for this row.</p>
          {/if}
        </section>

        <section class="section">
          <div class="section-head">
            <span class="section-title">Indicator Context</span>
            <span class="section-note">feature snapshot</span>
          </div>
          {#if evidenceRows.length > 0}
            <div class="evidence-grid">
              {#each evidenceRows as row (row.label)}
                <div class="evidence-card">
                  <span class="evidence-label">{row.label}</span>
                  <strong class="evidence-value">{row.value}</strong>
                </div>
              {/each}
            </div>
          {:else}
            <p class="empty">Current row has no indicator snapshot attached.</p>
          {/if}
        </section>

        <section class="section">
          <div class="section-head">
            <span class="section-title">Block Scores</span>
            <span class="section-note">engine scoring details</span>
          </div>
          {#if blockScoreRows.length > 0}
            <table class="score-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Score</th>
                  <th>Pass</th>
                </tr>
              </thead>
              <tbody>
                {#each blockScoreRows as row (row.label)}
                  <tr>
                    <td>{row.label}</td>
                    <td>{row.score}</td>
                    <td>{row.passed}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <p class="empty">No block score payload returned for this row.</p>
          {/if}
        </section>
      </div>
    {/if}
  </div>
</div>

<style>
  .evidence-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: #07070a;
  }

  .ep-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
  }

  .ep-titles {
    display: grid;
    gap: 4px;
  }

  .ep-kicker {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.34);
  }

  .ep-slug,
  .ep-symbol {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--sc-font-mono, monospace);
  }

  .ep-slug {
    font-size: 12px;
    color: rgba(250, 247, 235, 0.88);
  }

  .ep-symbol {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.44);
  }

  .ep-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ep-stat {
    padding: 4px 7px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.5);
  }

  .ep-stat-focus {
    color: #93c5fd;
    border-color: rgba(96, 165, 250, 0.24);
    background: rgba(96, 165, 250, 0.1);
  }

  .ep-tabs {
    display: flex;
    padding: 0 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
  }

  .ep-tab {
    padding: 10px 12px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: rgba(250, 247, 235, 0.36);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .ep-tab:hover {
    color: rgba(250, 247, 235, 0.62);
  }

  .ep-tab-active {
    color: #93c5fd;
    border-bottom-color: #60a5fa;
  }

  .ep-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ep-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .section {
    padding: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .section-title {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.64);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .section-note {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.28);
  }

  .metric-grid,
  .evidence-grid {
    display: grid;
    gap: 8px;
  }

  .proof-shell {
    display: grid;
    gap: 10px;
  }

  .proof-chart {
    min-height: 300px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.02);
  }

  .proof-chart :global(.chart-pane) {
    border: none;
    border-radius: 0;
    height: 100%;
  }

  .proof-chart :global(.pane-header) {
    height: 30px;
    padding: 4px 8px;
  }

  .proof-chart-loading {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.36);
  }

  .proof-meta {
    display: grid;
    gap: 10px;
  }

  .proof-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .proof-badge {
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.58);
  }

  .proof-badge-focus {
    color: #bfdbfe;
    border-color: rgba(96, 165, 250, 0.26);
    background: rgba(96, 165, 250, 0.1);
  }

  .proof-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .proof-card {
    min-width: 0;
    display: grid;
    gap: 4px;
    padding: 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .proof-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.32);
    text-transform: uppercase;
  }

  .proof-card strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.9);
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .evidence-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card,
  .evidence-card {
    min-width: 0;
    display: grid;
    gap: 4px;
    padding: 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .metric-label,
  .evidence-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.32);
    text-transform: uppercase;
  }

  .metric-card strong,
  .evidence-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.9);
  }

  .pill-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .pill {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.24);
    background: rgba(96, 165, 250, 0.08);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(191, 219, 254, 0.88);
  }

  .signal-table,
  .score-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .signal-table th,
  .score-table th,
  .signal-table td,
  .score-table td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    text-align: left;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.74);
  }

  .signal-table th,
  .score-table th {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.3);
  }

  .signal-row-selected {
    background: rgba(96, 165, 250, 0.08);
  }

  .empty {
    margin: 0;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.34);
  }

  @media (max-width: 1280px) {
    .evidence-grid,
    .metric-grid,
    .proof-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
