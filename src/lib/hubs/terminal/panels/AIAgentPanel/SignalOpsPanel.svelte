<script lang="ts">
  import { onMount } from 'svelte';
  import {
    buildPositionFeedback,
    buildSignalOpsCards,
    bundleOutcomeHistory,
    bundleOutcomeSummary,
    inferPositionDraft,
    inferTrackedSignal,
    type PositionDraft,
    type PositionFeedback,
    type PositionSide,
    type SignalOpsCard,
    type SignalOpsOutcomeRecord,
    type SignalOpsServerBundle,
    type SignalOpsTrackedSignal,
  } from './signalOps';

  interface Props {
    symbol: string;
    timeframe: string;
  }

  let { symbol, timeframe }: Props = $props();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let cards = $state<SignalOpsCard[]>([]);
  let selectedId = $state<string | null>(null);
  let positionSide = $state<PositionSide>('long');
  let entryText = $state('');
  let markText = $state('');
  let leverageText = $state('12');
  let feedback = $state<PositionFeedback | null>(null);
  let outcomes = $state<Record<string, string>>({});
  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  let bundle = $state<SignalOpsServerBundle | null>(null);
  let persistStatus = $state<string | null>(null);

  const selected = $derived(cards.find((card) => card.id === selectedId) ?? cards[0] ?? null);
  const trackedSignal = $derived(bundle && selected ? inferTrackedSignal(bundle, selected.symbol) : null);
  const outcomeSummary = $derived(bundle ? bundleOutcomeSummary(bundle) : null);
  const outcomeHistory = $derived(
    bundle && selected ? bundleOutcomeHistory(bundle, selected.symbol).slice(0, 4) : [],
  );

  async function loadCards() {
    loading = true;
    error = null;
    persistStatus = null;
    try {
      const res = await fetch(`/api/terminal/agent/signal-ops?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      bundle = payload as SignalOpsServerBundle;
      cards = buildSignalOpsCards(payload, symbol, timeframe);
      selectedId = cards[0]?.id ?? null;
      const inferred = inferPositionDraft(payload as SignalOpsServerBundle, symbol);
      if (inferred) {
        positionSide = inferred.side;
        entryText = inferred.entry == null ? '' : String(inferred.entry);
        leverageText = String(inferred.leverage);
      }
      const tracked = inferTrackedSignal(payload as SignalOpsServerBundle, symbol);
      const markFromBundle =
        tracked?.currentPrice ??
        (payload as SignalOpsServerBundle).matchedPosition?.currentPrice ??
        null;
      if (markFromBundle != null && Number.isFinite(markFromBundle)) {
        markText = String(markFromBundle);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      bundle = null;
      cards = [];
      selectedId = null;
    } finally {
      loading = false;
    }
  }

  function numeric(value: string): number | null {
    const n = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function analyzePosition() {
    if (!selected) return;
    const position: PositionDraft = {
      side: positionSide,
      entry: numeric(entryText),
      leverage: numeric(leverageText) ?? 1,
    };
    feedback = buildPositionFeedback(selected, position, numeric(markText));
  }

  function recordOutcome(kind: 'watch' | 'hit' | 'miss') {
    if (!selected) return;
    const next = { ...outcomes, [selected.traceId]: kind };
    outcomes = next;
    try {
      localStorage.setItem('wtd.signalOps.outcomes', JSON.stringify(next));
    } catch {}
    void persistOutcome(kind);
  }

  async function persistOutcome(kind: 'watch' | 'hit' | 'miss') {
    if (!selected) return;
    persistStatus = 'saving outcome...';
    try {
      const verdict = kind === 'hit' ? 'valid' : kind === 'miss' ? 'invalid' : 'late';
      const outcome = kind === 'hit' ? 1 : kind === 'miss' ? 0 : -1;
      const snapshot = {
        symbol: selected.symbol,
        timeframe: selected.timeframe,
        patternSlug: selected.patternSlug,
        phase: selected.phase,
        scenario: selected.scenario,
        score: selected.score,
        confidence: selected.confidence,
        alignmentScore: selected.alignmentScore,
        action: selected.action,
        traceId: selected.traceId,
      };

      const [verdictResult, outcomeResult] = await Promise.all([
        fetch('/api/live-signals/verdict', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            signal_id: selected.traceId,
            symbol: selected.symbol,
            phase: selected.phase,
            verdict,
            note: `signal-ops:${kind}`,
          }),
        }),
        fetch('/api/cogochi/outcome', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            snapshot,
            outcome,
            symbol: selected.symbol,
            timeframe: selected.timeframe,
          }),
        }),
      ]);
      if (!verdictResult.ok) throw new Error(`verdict HTTP ${verdictResult.status}`);
      if (!outcomeResult.ok) throw new Error(`outcome HTTP ${outcomeResult.status}`);
      persistStatus = `saved: ${kind}`;
    } catch (err) {
      persistStatus = err instanceof Error ? err.message : 'failed to save outcome';
    }
  }

  async function trackSignal() {
    if (!selected) return;
    persistStatus = 'tracking signal...';
    try {
      const currentPrice = numeric(markText) ?? numeric(entryText) ?? 0;
      const dir = selected.scenario === 'SHORT' ? 'SHORT' : 'LONG';
      const response = await fetch('/api/signals/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          pair: selected.symbol,
          dir,
          confidence: selected.confidence,
          entryPrice: numeric(entryText) ?? currentPrice,
          currentPrice,
          source: 'signal_ops_panel',
          note: `${selected.patternSlug}:${selected.phase}`,
          ttlHours: 24,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }
      persistStatus = 'tracked on server';
      void loadCards();
    } catch (err) {
      persistStatus = err instanceof Error ? err.message : 'failed to track signal';
    }
  }

  function hydrateOutcomes() {
    try {
      const raw = localStorage.getItem('wtd.signalOps.outcomes');
      if (raw) outcomes = JSON.parse(raw) as Record<string, string>;
    } catch {}
  }

  function timeAgo(ts: number | undefined): string {
    if (!ts || !Number.isFinite(ts)) return 'n/a';
    const minutes = Math.max(0, Math.round((Date.now() - ts) / 60_000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }

  function outcomeLabel(record: SignalOpsOutcomeRecord): string {
    return record.outcome === 1 ? 'HIT' : record.outcome === 0 ? 'MISS' : 'WATCH';
  }

  $effect(() => {
    symbol;
    timeframe;
    void loadCards();
  });

  onMount(() => {
    hydrateOutcomes();
    refreshTimer = setInterval(() => {
      void loadCards();
    }, 30_000);

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  });
</script>

<section class="signal-ops">
  <div class="ops-head">
    <div>
      <span class="ops-kicker">SIGNAL OPS</span>
      <h3>Pattern fire → action card</h3>
    </div>
    <button class="ghost-btn" type="button" onclick={() => void loadCards()} disabled={loading}>
      {loading ? 'SYNC' : 'REFRESH'}
    </button>
  </div>

  {#if error}
    <div class="ops-warning">Failed to load signals · {error}</div>
  {/if}

  {#if loading && cards.length === 0}
    <div class="ops-loading">
      <span class="ops-loading-dot"></span>
      <span class="ops-loading-dot"></span>
      <span class="ops-loading-dot"></span>
    </div>
  {:else if !loading && !error && cards.length === 0}
    <div class="ops-empty">
      <span class="ops-empty-icon">◎</span>
      <span class="ops-empty-msg">No market data for {symbol}</span>
      <span class="ops-empty-hint">No active pattern state on {timeframe}</span>
    </div>
  {/if}

  <div class="card-strip">
    {#each cards as card}
      <button
        type="button"
        class="mini-card"
        class:mini-card--active={selected?.id === card.id}
        onclick={() => {
          selectedId = card.id;
          feedback = null;
        }}
      >
        <span class="mini-top">
          <strong>{card.symbol}</strong>
          <em>{card.score}/100</em>
        </span>
        <span class="mini-mid">{card.scenario} · {card.action}</span>
        <span class="mini-sub">{card.channel}</span>
      </button>
    {/each}
  </div>

  {#if selected}
    <article class="ops-card">
      <div class="score-rail" style={`--score: ${selected.score}%`}></div>
      <div class="ops-card-head">
        <div>
          <span class="channel">#{selected.channel}</span>
          <h4>{selected.symbol} — {selected.score}점 / 100</h4>
          <p>{selected.scenario} · {selected.phase}</p>
        </div>
        <div class="action-pill" data-action={selected.action}>{selected.action}</div>
      </div>

      <div class="metric-grid">
        {#each selected.metrics as metric}
          <div class="metric">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {#if metric.hint}<em>{metric.hint}</em>{/if}
          </div>
        {/each}
      </div>

      <div class="domain-grid">
        {#each selected.domainScores as domain}
          <div class="domain">
            <span>{domain.id} {domain.label}</span>
            <strong>{domain.score} / {domain.max}</strong>
            <i style={`--w: ${(domain.score / domain.max) * 100}%`}></i>
          </div>
        {/each}
      </div>

      <div class="reason-box">
        {#each selected.reasons as reason}
          <p>{reason}</p>
        {/each}
        <p class="invalid">무효화: {selected.invalidation}</p>
        {#if trackedSignal}
          <p class="tracked">server tracking 연결됨</p>
          <p class="tracked-meta">
            {trackedSignal.dir} · conf {trackedSignal.confidence} · status {trackedSignal.status}
          </p>
          <p class="tracked-meta">
            entry {trackedSignal.entryPrice} / current {trackedSignal.currentPrice} / pnl {trackedSignal.pnlPercent.toFixed(2)}%
          </p>
          <p class="tracked-meta">
            tracked {timeAgo(trackedSignal.trackedAt)} · expires {timeAgo(trackedSignal.expiresAt)}
          </p>
        {/if}
      </div>

      <div class="trace-row">
        <span>trace</span>
        <code>{selected.traceId}</code>
      </div>
    </article>

    <div class="position-box">
      <div class="position-head">
        <span class="ops-kicker">POSITION FEEDBACK</span>
        <span>{selected.urgency} · confidence {selected.confidence}</span>
      </div>
      <div class="position-grid">
        <select bind:value={positionSide} aria-label="position side">
          <option value="long">LONG</option>
          <option value="short">SHORT</option>
        </select>
        <input bind:value={entryText} placeholder="entry" inputmode="decimal" />
        <input bind:value={markText} placeholder="mark" inputmode="decimal" />
        <input bind:value={leverageText} placeholder="lev" inputmode="decimal" />
      </div>
      <button class="primary-btn" type="button" onclick={analyzePosition}>액션 판정</button>
      <button class="ghost-btn ghost-btn--track" type="button" onclick={trackSignal}>트래킹 등록</button>

      {#if feedback}
        <div class="feedback-card" data-action={feedback.action}>
          <div class="feedback-top">
            <strong>{feedback.action}</strong>
            <span>{feedback.urgency} · {feedback.confidence}/100</span>
          </div>
          {#if feedback.pnlPct != null}
            <div class="pnl" class:pnl--loss={feedback.pnlPct < 0}>
              PnL {feedback.pnlPct.toFixed(2)}%
            </div>
          {/if}
          {#each feedback.lines as line}
            <p>{line}</p>
          {/each}
        </div>
      {/if}

      <div class="outcome-row">
        <button type="button" onclick={() => recordOutcome('watch')}>WATCH</button>
        <button type="button" onclick={() => recordOutcome('hit')}>HIT</button>
        <button type="button" onclick={() => recordOutcome('miss')}>MISS</button>
        <span>{persistStatus ?? (outcomes[selected.traceId] ? `tracked: ${outcomes[selected.traceId]}` : 'outcome 대기')}</span>
      </div>

      {#if outcomeSummary}
        <div class="summary-box">
          <div class="summary-grid">
            <div><span>Total</span><strong>{outcomeSummary.total}</strong></div>
            <div><span>Wins</span><strong>{outcomeSummary.wins}</strong></div>
            <div><span>Losses</span><strong>{outcomeSummary.losses}</strong></div>
            <div><span>Timeouts</span><strong>{outcomeSummary.timeouts}</strong></div>
          </div>
          <p class="summary-note">
            {outcomeSummary.readyForTraining ? '학습 임계치 도달' : '학습 임계치 전'} · labeled {outcomeSummary.wins + outcomeSummary.losses}/20
          </p>
        </div>
      {/if}

      {#if outcomeHistory.length}
        <div class="history-box">
          <div class="history-head">
            <span class="ops-kicker">RECENT OUTCOMES</span>
            <span>{selected.symbol}</span>
          </div>
          {#each outcomeHistory as row}
            <div class="history-row">
              <strong data-outcome={outcomeLabel(row)}>{outcomeLabel(row)}</strong>
              <span>{row.timeframe} · {timeAgo(row.createdAt)}</span>
              <em>{row.snapshot?.patternSlug ?? 'manual'} · {row.snapshot?.action ?? 'n/a'}</em>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .signal-ops {
    margin: 0 8px 8px;
    border: 1px solid color-mix(in srgb, var(--brand, #f5a623) 28%, var(--term-border, #30323a));
    border-radius: 12px;
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--brand, #f5a623) 12%, transparent), transparent 38%),
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
    overflow: hidden;
  }
  .ops-head,
  .ops-card-head,
  .position-head,
  .feedback-top,
  .outcome-row,
  .trace-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ops-head {
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .tracked {
    color: color-mix(in srgb, #56d364 84%, white);
  }
  .tracked-meta,
  .summary-note,
  .history-head span:last-child,
  .history-row span,
  .history-row em {
    color: var(--term-text-2, #a1a1aa);
    font-size: 11px;
  }
  .ghost-btn--track {
    margin-top: 8px;
    width: 100%;
  }
  .ops-kicker,
  .channel {
    font-size: 11px;
    letter-spacing: 0.14em;
    color: var(--brand, #f5a623);
    text-transform: uppercase;
  }
  h3,
  h4,
  p {
    margin: 0;
  }
  h3 {
    font-family: var(--fb);
    color: var(--term-text-0, #f4f4f5);
    font-size: 13px;
  }
  h4 {
    margin-top: 3px;
    font-family: var(--fb);
    color: var(--term-text-0, #f4f4f5);
    font-size: 15px;
  }
  .ghost-btn,
  .primary-btn,
  .outcome-row button {
    border: 1px solid var(--term-border, #383a42);
    border-radius: 999px;
    background: rgba(255,255,255,0.035);
    color: var(--term-text-1, #d8d8de);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }
  .ghost-btn {
    height: 24px;
    padding: 0 8px;
  }
  .ops-warning {
    padding: 6px 10px;
    color: #fbbf24;
    background: rgba(251,191,36,0.08);
    font-size: 11px;
  }
  .ops-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 24px 16px;
  }
  .ops-loading-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--term-text-3, var(--g4));
    animation: ops-pulse 1.2s ease-in-out infinite;
  }
  .ops-loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .ops-loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes ops-pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1);   }
  }
  .ops-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 24px 16px;
    text-align: center;
  }
  .ops-empty-icon {
    font-size: 20px;
    opacity: 0.3;
    margin-bottom: 4px;
  }
  .ops-empty-msg {
    font-size: 12px;
    color: var(--term-fg-dim, #9ca3af);
    font-weight: 500;
  }
  .ops-empty-hint {
    font-size: 11px;
    color: var(--term-fg-muted, #6b7280);
  }
  .card-strip {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(128px, 1fr);
    gap: 6px;
    overflow-x: auto;
    padding: 8px;
  }
  .mini-card {
    text-align: left;
    min-height: 72px;
    padding: 8px;
    border: 1px solid var(--term-border, #383a42);
    border-radius: 10px;
    background: rgba(8,10,16,0.72);
    color: var(--term-text-1, #d8d8de);
    font: inherit;
    cursor: pointer;
  }
  .mini-card--active {
    border-color: color-mix(in srgb, var(--brand, #f5a623) 72%, white 8%);
    box-shadow: inset 0 0 0 1px rgba(245,166,35,0.2);
  }
  .mini-top,
  .mini-mid,
  .mini-sub {
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  .mini-top strong {
    color: var(--term-text-0, #fff);
  }
  .mini-top em {
    color: #61d394;
    font-style: normal;
  }
  .mini-mid,
  .mini-sub {
    margin-top: 7px;
    font-size: 11px;
    color: var(--term-text-2, #9ca3af);
  }
  .ops-card {
    position: relative;
    margin: 0 8px 8px;
    padding: 10px 10px 10px 14px;
    border-radius: 12px;
    background: rgba(15,17,24,0.86);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .score-rail {
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: linear-gradient(180deg, #46d369 var(--score), rgba(255,255,255,0.1) 0);
  }
  .ops-card-head {
    justify-content: space-between;
  }
  .ops-card-head p,
  .position-head span:last-child,
  .reason-box p,
  .trace-row,
  .outcome-row span {
    color: var(--term-text-2, #a1a1aa);
    font-size: 11px;
    line-height: 1.45;
  }
  .action-pill {
    border-radius: 999px;
    padding: 5px 8px;
    background: rgba(255,255,255,0.06);
    color: #e5e7eb;
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .action-pill[data-action='CUT_LOSS'],
  .feedback-card[data-action='CUT_LOSS'] .feedback-top strong {
    color: #ff6b6b;
  }
  .action-pill[data-action='ADD_POSITION'],
  .feedback-card[data-action='ADD_POSITION'] .feedback-top strong {
    color: #61d394;
  }
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: 10px;
  }
  .metric,
  .domain {
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 9px;
    background: rgba(255,255,255,0.025);
    padding: 7px;
  }
  .metric span,
  .domain span {
    display: block;
    color: var(--term-text-2, #a1a1aa);
    font-size: 11px;
  }
  .metric strong,
  .domain strong {
    display: block;
    margin-top: 4px;
    color: var(--term-text-0, #f9fafb);
    font-size: 12px;
  }
  .summary-box,
  .history-box {
    margin-top: 10px;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    background: rgba(255,255,255,0.02);
    padding: 8px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .summary-grid span {
    display: block;
    color: var(--term-text-2, #a1a1aa);
    font-size: 11px;
  }
  .summary-grid strong {
    display: block;
    margin-top: 4px;
    color: var(--term-text-0, #f9fafb);
    font-size: 12px;
  }
  .history-head,
  .history-row {
    display: grid;
    grid-template-columns: 56px 72px 1fr;
    gap: 8px;
    align-items: center;
  }
  .history-head {
    margin-bottom: 6px;
  }
  .history-row + .history-row {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .history-row strong {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .history-row strong[data-outcome='HIT'] {
    color: #61d394;
  }
  .history-row strong[data-outcome='MISS'] {
    color: #ff6b6b;
  }
  .history-row strong[data-outcome='WATCH'] {
    color: #fbbf24;
  }
  .metric em {
    display: block;
    margin-top: 2px;
    color: var(--term-text-3, #71717a);
    font-style: normal;
    font-size: 11px;
  }
  .domain-grid {
    display: grid;
    gap: 5px;
    margin-top: 8px;
  }
  .domain i {
    display: block;
    height: 3px;
    margin-top: 6px;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--brand, #f5a623) var(--w), rgba(255,255,255,0.08) 0);
  }
  .reason-box {
    display: grid;
    gap: 5px;
    margin-top: 9px;
  }
  .reason-box .invalid {
    color: #fbbf24;
  }
  .trace-row {
    margin-top: 8px;
  }
  .trace-row code {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--term-text-1, #d4d4d8);
  }
  .position-box {
    margin: 0 8px 8px;
    padding: 9px;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    background: rgba(0,0,0,0.18);
  }
  .position-head {
    justify-content: space-between;
  }
  .position-grid {
    display: grid;
    grid-template-columns: 0.9fr 1fr 1fr 0.7fr;
    gap: 6px;
    margin-top: 8px;
  }
  .position-grid input,
  .position-grid select {
    min-width: 0;
    height: 30px;
    border: 1px solid var(--term-border, #383a42);
    border-radius: 8px;
    background: rgba(255,255,255,0.035);
    color: var(--term-text-0, #f4f4f5);
    padding: 0 7px;
    font: inherit;
    font-size: 11px;
  }
  .primary-btn {
    width: 100%;
    height: 30px;
    margin-top: 7px;
    border-color: color-mix(in srgb, var(--brand, #f5a623) 45%, transparent);
    color: var(--brand, #f5a623);
  }
  .feedback-card {
    display: grid;
    gap: 5px;
    margin-top: 8px;
    padding: 8px;
    border-radius: 10px;
    background: rgba(255,255,255,0.035);
  }
  .feedback-top {
    justify-content: space-between;
  }
  .feedback-top span,
  .feedback-card p {
    color: var(--term-text-2, #a1a1aa);
    font-size: 11px;
  }
  .pnl {
    color: #61d394;
    font-size: 11px;
  }
  .pnl--loss {
    color: #ff6b6b;
  }
  .outcome-row {
    margin-top: 8px;
  }
  .outcome-row button {
    padding: 4px 7px;
  }
</style>
