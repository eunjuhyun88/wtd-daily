<script lang="ts">
  import { onMount } from 'svelte';
  import { setAIOverlayShapes, clearAIOverlay, type AIOverlayShape } from '$lib/stores/chartAIOverlay';
  import {
    buildResearchSummary,
    type DiscoveryPayload,
    type ResearchSummaryItem,
  } from './researchSummary';

  // ─── Types ────────────────────────────────────────────────────────────────────
  interface ModelOption { id: string; label: string; badge: string; }

  interface MetricItem {
    label: string; value: string; sub?: string;
    trend: 'pos' | 'neg' | 'warn' | 'neutral';
  }

  interface SimilarCandidate {
    symbol: string; timeframe: string; similarity: number;
    layer_scores: { feature: number; sequence: number; ml: number };
  }

  interface ScanItem {
    symbol: string; phase: string; direction: string; timeframe: string;
    phase_fidelity: number; ranking_score: number; setup?: string; reason?: string; action?: string;
  }

  interface AlphaScanItem {
    symbol: string; alpha_score: number; verdict: string; signal_count: number; setup?: string; action?: string; reason?: string;
  }

  type Widget =
    | { type: 'tool_trace'; name: string; done: boolean }
    | { type: 'verdict'; symbol: string; tf: string; direction: string; entry?: number; stop?: number; target?: number; rr?: number }
    | { type: 'metrics'; items: MetricItem[] }
    | { type: 'similar'; symbol: string; tf: string; candidates: SimilarCandidate[] }
    | { type: 'draw_result'; shapes: AIOverlayShape[] }
    | { type: 'scan_result'; results: ScanItem[]; timeframe: string }
    | { type: 'alpha_scan_result'; results: AlphaScanItem[]; min_alpha: number }
    | { type: 'screener_result'; grade_counts: Record<string, number>; symbols_scored: number; completed_at: string | null }
    | { type: 'research_summary'; items: ResearchSummaryItem[]; personaId?: string; tools: string[] }
    | { type: 'save_result'; symbol: string; tf: string; verdict: string }
    | { type: 'submit_verdict_result'; outcome_id: string; verdict: string }
    | { type: 'watch_result'; symbol: string; pattern_slug?: string }
    | { type: 'feedback_result'; status: string }
    | { type: 'explain'; text: string };

  interface Message {
    role: 'user' | 'assistant';
    text: string;
    widgets?: Widget[];
    streaming?: boolean;
    personaId?: string;
    latency_ms?: number;
    tokens?: number;
    /** Surface fetch / SSE failure separately from the message body so the
     *  user can retry without losing partial streamed text. */
    error?: string;
  }

  interface Props {
    symbol?: string;
    timeframe?: string;
    onSelectSymbol?: (s: string) => void;
  }

  let { symbol = 'BTCUSDT', timeframe = '4h', onSelectSymbol }: Props = $props();

  // ─── Model list ───────────────────────────────────────────────────────────────
  const DEFAULT_MODELS: ModelOption[] = [
    { id: 'groq/llama-3.3-70b-versatile', label: 'Groq Llama-3.3 70B', badge: 'fast' },
    { id: 'groq/llama-3.1-8b-instant',    label: 'Groq Llama-3.1 8B',  badge: 'fastest' },
    { id: 'anthropic/claude-sonnet-4-5',  label: 'Claude Sonnet 4.5',  badge: 'smart' },
    { id: 'anthropic/claude-haiku-3-5',   label: 'Claude Haiku 3.5',   badge: '' },
    { id: 'gemini/gemini-2.0-flash',      label: 'Gemini 2.0 Flash',   badge: '' },
    { id: 'deepseek/deepseek-chat',       label: 'DeepSeek Chat',       badge: 'cheap' },
    { id: 'cerebras/llama-3.3-70b',       label: 'Cerebras Llama-3.3', badge: 'fast' },
    { id: 'ollama/qwen3.5:latest',        label: 'Ollama Qwen3.5 (local)', badge: 'local' },
  ];

  let models       = $state<ModelOption[]>(DEFAULT_MODELS);
  let selectedModel = $state('groq/llama-3.3-70b-versatile');
  let messages     = $state<Message[]>([]);
  let input        = $state('');
  let busy         = $state(false);
  let bottomEl     = $state<HTMLDivElement | null>(null);
  let copiedIdx    = $state<number | null>(null);

  // Lazy-load marked so the chat panel doesn't pay the parse cost until the
  // first answer renders. Same XSS pattern as PatternWikiSection: pre-escape
  // angle brackets in source before parsing — marked v15 has no built-in
  // sanitizer and assistant text can contain arbitrary tokens.
  type MarkedModule = typeof import('marked');
  let markedMod = $state<MarkedModule | null>(null);

  onMount(() => {
    let cancelled = false;
    void import('marked').then((m) => {
      if (!cancelled) markedMod = m;
    });
    void (async () => {
      try {
        const res = await fetch('/api/terminal/agent/models');
        if (res.ok) {
          const data = await res.json() as { models?: ModelOption[] };
          if (!cancelled && data.models?.length) models = data.models;
        }
      } catch { /* use defaults */ }
    })();
    return () => { cancelled = true; };
  });

  function renderAssistantMd(text: string): string {
    if (!markedMod) return escapeHtml(text);
    const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return markedMod.marked.parse(safe, { async: false }) as string;
  }

  function escapeHtml(s: string): string {
    return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function copyMessage(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedIdx = idx;
      setTimeout(() => { if (copiedIdx === idx) copiedIdx = null; }, 1400);
    } catch { /* clipboard may be unavailable (insecure context) */ }
  }

  function findPriorUserText(idx: number): string | null {
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') return messages[i].text;
    }
    return null;
  }

  /** Retry: drop the failed assistant message + the prior user message and
   *  feed the same input back through `send()` so the SSE stream is exactly
   *  what it would have been on the first try. */
  function retryFrom(idx: number) {
    const prior = findPriorUserText(idx);
    if (prior == null || busy) return;
    messages = messages.slice(0, Math.max(0, idx - 1));
    input = prior;
    void send();
  }

  // ─── Scroll ───────────────────────────────────────────────────────────────────
  function scrollBottom() { bottomEl?.scrollIntoView({ behavior: 'smooth' }); }

  // ─── Widget helpers ───────────────────────────────────────────────────────────
  function appendToLast(updater: (m: Message) => Message) {
    messages = messages.map((m, i) => i === messages.length - 1 ? updater(m) : m);
  }

  function addWidget(w: Widget) {
    appendToLast(m => ({ ...m, widgets: [...(m.widgets ?? []), w] }));
  }

  function replaceOrAddWidget(toolName: string, w: Widget) {
    appendToLast(m => {
      const ws = m.widgets ?? [];
      const idx = ws.findLastIndex(x => x.type === 'tool_trace' && x.name === toolName);
      if (idx >= 0) {
        const next = [...ws]; next[idx] = w; return { ...m, widgets: next };
      }
      return { ...m, widgets: [...ws, w] };
    });
  }

  function collectDiscoveryPayloads(msg: Message): DiscoveryPayload[] {
    const payloads: DiscoveryPayload[] = [];
    for (const widget of msg.widgets ?? []) {
      if (widget.type === 'scan_result') {
        payloads.push({ tool: 'scan', data: { results: widget.results } });
      } else if (widget.type === 'alpha_scan_result') {
        payloads.push({ tool: 'alpha_scan', data: { results: widget.results } });
      } else if (widget.type === 'screener_result') {
        const results = (widget as Widget & { rawResults?: unknown[] }).rawResults;
        payloads.push({ tool: 'screener', data: { results: Array.isArray(results) ? results : [] } });
      }
    }
    return payloads;
  }

  function buildResearchSummaryWidget(msg: Message): Widget | null {
    const payloads = collectDiscoveryPayloads(msg);
    if (!payloads.length) return null;
    const ranked = buildResearchSummary(payloads);

    if (!ranked.length) return null;
    const toolOrder = payloads.map((payload) => payload.tool).filter((tool, index, arr) => arr.indexOf(tool) === index);
    return { type: 'research_summary', items: ranked, personaId: msg.personaId, tools: toolOrder };
  }

  function upsertResearchSummary() {
    appendToLast((m) => {
      const summary = buildResearchSummaryWidget(m);
      if (!summary) return m;
      const widgets = (m.widgets ?? []).filter((widget) => widget.type !== 'research_summary');
      return { ...m, widgets: [summary, ...widgets] };
    });
  }

  function finishTrace(toolName: string) {
    appendToLast(m => ({
      ...m,
      widgets: (m.widgets ?? []).map(w =>
        w.type === 'tool_trace' && w.name === toolName ? { ...w, done: true } : w
      ),
    }));
  }

  // ─── Tool result → widget ─────────────────────────────────────────────────────
  function toolResultWidget(name: string, data: Record<string, unknown>): Widget | null {
    switch (name) {
      case 'judge': {
        const dir = (data.direction as string | undefined) ?? '—';
        return {
          type: 'verdict', symbol: (data.symbol as string) ?? symbol,
          tf: (data.timeframe as string) ?? timeframe,
          direction: dir,
          entry:  data.entry  != null ? Number(data.entry)  : undefined,
          stop:   data.stop   != null ? Number(data.stop)   : undefined,
          target: data.target != null ? Number(data.target) : undefined,
          rr:     data.rr     != null ? Number(data.rr)     : undefined,
        };
      }
      case 'live_snapshot': {
        const items: MetricItem[] = [];
        const rsi = data.rsi as number | undefined;
        if (rsi != null) items.push({
          label: 'RSI', value: rsi.toFixed(1),
          sub: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
          trend: rsi > 70 ? 'warn' : rsi < 30 ? 'pos' : 'neutral',
        });
        const macd = data.macd_hist as number | undefined;
        if (macd != null) items.push({
          label: 'MACD', value: macd.toFixed(3),
          sub: macd > 0 ? 'Bull crossover' : 'Bear crossover',
          trend: macd > 0 ? 'pos' : 'neg',
        });
        const bb = data.bb_pct_b as number | undefined;
        if (bb != null) items.push({
          label: 'BB%', value: `${(bb * 100).toFixed(0)}%`,
          sub: bb > 0.8 ? 'Near upper' : bb < 0.2 ? 'Near lower' : 'Mid-band',
          trend: bb > 0.8 ? 'warn' : bb < 0.2 ? 'pos' : 'neutral',
        });
        const atrPct = data.atr_pct as number | undefined;
        if (atrPct != null) items.push({ label: 'ATR', value: `${atrPct.toFixed(2)}%`, sub: 'Volatility', trend: 'neutral' });
        return items.length > 0 ? { type: 'metrics', items } : null;
      }
      case 'similar': {
        const cands = data.candidates as SimilarCandidate[] | undefined;
        if (!cands?.length) return null;
        return { type: 'similar', symbol: (data.symbol as string) ?? symbol, tf: (data.timeframe as string) ?? timeframe, candidates: cands.slice(0, 5) };
      }
      case 'get_funding_rate': {
        const items: MetricItem[] = [];
        const rate = data.current_rate as number | undefined;
        if (rate != null) {
          const hot = Math.abs(rate) > 0.0005;
          items.push({ label: 'Funding', value: `${(rate * 100).toFixed(4)}%`, sub: hot ? (rate > 0 ? 'Long heavy' : 'Short heavy') : 'Balanced', trend: hot ? 'warn' : 'neutral' });
        }
        const nextTime = data.next_funding_time as string | number | undefined;
        if (nextTime != null) {
          const ms = new Date(nextTime).getTime() - Date.now();
          items.push({ label: 'Next FR', value: `${(ms / 3600000).toFixed(1)}h`, sub: 'Until settle', trend: 'neutral' });
        }
        return items.length > 0 ? { type: 'metrics', items } : null;
      }
      case 'get_open_interest': {
        const oi = data.current_oi as number | undefined;
        if (oi == null) return null;
        const fmt = oi >= 1e9 ? `${(oi / 1e9).toFixed(1)}B` : oi >= 1e6 ? `${(oi / 1e6).toFixed(0)}M` : `${(oi / 1e3).toFixed(0)}K`;
        return { type: 'metrics', items: [{ label: 'OI', value: fmt, sub: 'Open Interest', trend: 'neutral' }] };
      }
      case 'scan': {
        const results = data.results as ScanItem[] | undefined;
        if (!results?.length) return null;
        return { type: 'scan_result', results, timeframe: (data.timeframe as string) ?? '1h' };
      }
      case 'alpha_scan': {
        const results = data.results as AlphaScanItem[] | undefined;
        if (!results?.length) return null;
        return { type: 'alpha_scan_result', results, min_alpha: (data.min_alpha as number) ?? 70 };
      }
      case 'screener': {
        if (data.error) return null;
        return {
          type: 'screener_result',
          grade_counts: (data.grade_counts as Record<string, number>) ?? {},
          symbols_scored: (data.symbols_scored as number) ?? 0,
          completed_at: (data.completed_at as string | null) ?? null,
          rawResults: (data.results as unknown[] | undefined) ?? [],
        } as Widget & { rawResults: unknown[] };
      }
      case 'draw_command': {
        const rawShapes = data.shapes as Array<Record<string, unknown>> | undefined;
        if (!rawShapes?.length) return null;
        const now = Math.floor(Date.now() / 1000);
        const parseTs = (v: unknown) => {
          if (!v) return now;
          if (typeof v === 'string' && v.startsWith('now-')) return now - parseInt(v.slice(4)) * 3600;
          return Math.floor(new Date(v as string).getTime() / 1000) || now;
        };
        const shapes: AIOverlayShape[] = rawShapes.map((s): AIOverlayShape => {
          if (s.kind === 'box') {
            return {
              kind: 'range',
              fromPrice: s.priceLow as number,
              toPrice: s.priceHigh as number,
              fromTime: parseTs(s.timeStart),
              toTime: parseTs(s.timeEnd) || now,
              color: (s.color as string) ?? 'rgba(250,204,21,0.15)',
              label: s.label as string | undefined,
            };
          }
          if (s.kind === 'annotation') {
            return {
              kind: 'annotation',
              price: s.price as number,
              time: now,
              text: s.text as string,
              color: (s.color as string) ?? '#94a3b8',
            };
          }
          return {
            price: s.price as number,
            label: (s.label as string) ?? '',
            color: (s.color as string) ?? '#facc15',
            style: ((s.style as string) ?? 'dashed') as 'solid' | 'dashed',
          };
        });
        setAIOverlayShapes(symbol, shapes);
        return { type: 'draw_result', shapes };
      }
      case 'save': {
        const sym = (data.symbol as string) ?? symbol;
        const tf  = (data.timeframe as string) ?? timeframe;
        const ver = (data.verdict as string) ?? '—';
        return { type: 'save_result', symbol: sym, tf, verdict: ver };
      }
      case 'submit_verdict': {
        return {
          type: 'submit_verdict_result',
          outcome_id: (data.outcome_id as string) ?? '—',
          verdict: (data.verdict as string) ?? '—',
        };
      }
      case 'watch_pattern': {
        return {
          type: 'watch_result',
          symbol: (data.symbol as string) ?? symbol,
          pattern_slug: data.pattern_slug as string | undefined,
        };
      }
      case 'memory_feedback': {
        return { type: 'feedback_result', status: (data.status as string) ?? 'recorded' };
      }
      case 'explain': {
        const text = data.text as string | undefined;
        if (!text) return null;
        return { type: 'explain', text };
      }
      default: return null;
    }
  }

  // ─── SSE handling ─────────────────────────────────────────────────────────────
  function handleSSE(eventType: string, d: Record<string, unknown>) {
    if (eventType === 'chunk' && typeof d.text === 'string') {
      appendToLast(m => ({ ...m, text: m.text + d.text }));
      scrollBottom();
    } else if (eventType === 'tool_call' && typeof d.name === 'string') {
      addWidget({ type: 'tool_trace', name: d.name, done: false });
      scrollBottom();
    } else if (eventType === 'tool_result') {
      const name = d.name as string;
      if (d.data && typeof d.data === 'object') {
        const w = toolResultWidget(name, d.data as Record<string, unknown>);
        if (w) {
          replaceOrAddWidget(name, w);
          if (name === 'scan' || name === 'alpha_scan' || name === 'screener') {
            upsertResearchSummary();
          }
        } else finishTrace(name);
      } else {
        finishTrace(name);
      }
    } else if (eventType === 'done') {
      appendToLast(m => ({
        ...m,
        personaId: typeof d.persona_id === 'string' ? d.persona_id : m.personaId,
        latency_ms: typeof d.latency_ms === 'number' ? d.latency_ms : m.latency_ms,
        tokens: typeof d.tokens === 'number' ? d.tokens : m.tokens,
      }));
      upsertResearchSummary();
    }
  }

  // ─── Send ─────────────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    input = '';
    busy = true;
    messages = [...messages, { role: 'user', text }];
    messages = [...messages, { role: 'assistant', text: '', streaming: true }];
    scrollBottom();

    try {
      const res = await fetch('/api/terminal/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, symbol, timeframe, model: selectedModel }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let lastEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            lastEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6)) as Record<string, unknown>;
              handleSSE(lastEvent, d);
            } catch { /* skip malformed */ }
            lastEvent = '';
          }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      appendToLast(m => ({ ...m, error: errMsg }));
    } finally {
      appendToLast(m => ({ ...m, streaming: false }));
      busy = false;
      scrollBottom();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  // ─── Formatting helpers ───────────────────────────────────────────────────────
  const fmt = (n?: number) => n != null ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
  const simPct = (s: number) => `${(s * 100).toFixed(0)}%`;
</script>

<div class="chat-thread">
  <!-- Model selector -->
  <div class="model-bar">
    <span class="model-label">Model</span>
    <select class="model-select" bind:value={selectedModel} disabled={busy}>
      {#each models as m}
        <option value={m.id}>{m.label}{m.badge ? ` · ${m.badge}` : ''}</option>
      {/each}
    </select>
  </div>

  <!-- Message feed -->
  <div class="messages">
    {#each messages as msg, i}
      <div class="msg msg--{msg.role}" class:msg--has-error={!!msg.error}>
        {#if msg.text}
          {#if msg.role === 'assistant' && !msg.streaming}
            <!-- Render markdown only after streaming finishes — partial
                 fenced blocks during streaming would mis-parse and flicker.
                 During streaming we show raw text + caret. -->
            <div class="msg-text msg-md">{@html renderAssistantMd(msg.text)}</div>
          {:else}
            <span class="msg-text">{msg.text}{#if msg.streaming}<span class="cursor">&#x2587;</span>{/if}</span>
          {/if}
        {:else if msg.streaming}
          <span class="msg-text msg-text--empty"><span class="cursor">&#x2587;</span></span>
        {/if}

        {#if msg.error}
          <div class="msg-error" role="alert">
            <span class="err-icon" aria-hidden="true">⚠</span>
            <span class="err-text">{msg.error}</span>
            <button
              class="err-retry"
              type="button"
              onclick={() => retryFrom(i)}
              disabled={busy}
            >Retry</button>
          </div>
        {/if}

        {#if msg.role === 'assistant' && msg.text && !msg.streaming && !msg.error}
          <button
            class="msg-copy"
            type="button"
            title="Copy answer"
            aria-label="Copy answer"
            onclick={() => copyMessage(i, msg.text)}
          >{copiedIdx === i ? '✓' : '⧉'}</button>
        {/if}

        {#each (msg.widgets ?? []) as widget}
          {#if widget.type === 'tool_trace'}
            <div class="widget tool-trace" class:done={widget.done}>
              <span class="trace-dot" class:spin={!widget.done}>⬤</span>
              <span class="trace-name">{widget.name}</span>
              {#if widget.done}<span class="trace-ok">done</span>{/if}
            </div>

          {:else if widget.type === 'verdict'}
            <div class="widget verdict-card">
              <div class="vc-header">
                <span class="vc-sym">{widget.symbol} · {widget.tf}</span>
                <span class="vc-dir" class:long={widget.direction === 'LONG'} class:short={widget.direction === 'SHORT'}>
                  {widget.direction}
                </span>
                {#if widget.rr != null}
                  <span class="vc-rr">R:R {widget.rr.toFixed(1)}×</span>
                {/if}
              </div>
              {#if widget.entry != null}
                <div class="vc-levels">
                  <span class="vc-lvl">entry <strong>{fmt(widget.entry)}</strong></span>
                  {#if widget.stop != null}<span class="vc-lvl neg">stop <strong>{fmt(widget.stop)}</strong></span>{/if}
                  {#if widget.target != null}<span class="vc-lvl pos">target <strong>{fmt(widget.target)}</strong></span>{/if}
                </div>
              {/if}
            </div>

          {:else if widget.type === 'metrics'}
            <div class="widget metrics-strip">
              {#each widget.items as item}
                <div class="metric-cell" class:pos={item.trend === 'pos'} class:neg={item.trend === 'neg'} class:warn={item.trend === 'warn'}>
                  <span class="mc-label">{item.label}</span>
                  <span class="mc-value">{item.value}</span>
                  {#if item.sub}<span class="mc-sub">{item.sub}</span>{/if}
                </div>
              {/each}
            </div>

          {:else if widget.type === 'similar'}
            <div class="widget similar-list">
              <div class="sl-header">
                <span class="sl-title">유사 패턴</span>
                <span class="sl-meta">{widget.symbol} · {widget.tf}</span>
              </div>
              {#each widget.candidates as c}
                <button
                  class="sl-row"
                  onclick={() => onSelectSymbol?.(c.symbol)}
                  type="button"
                >
                  <span class="sl-sym">{c.symbol.replace('USDT', '')}</span>
                  <span class="sl-tf">{c.timeframe}</span>
                  <span class="sl-sim">{simPct(c.similarity)}</span>
                  <span class="sl-scores">
                    F{Math.round(c.layer_scores.feature * 100)}
                    S{Math.round(c.layer_scores.sequence * 100)}
                    M{Math.round(c.layer_scores.ml * 100)}
                  </span>
                </button>
              {/each}
            </div>
          {:else if widget.type === 'draw_result'}
            <div class="widget draw-result">
              <span class="dr-icon">📐</span>
              <span class="dr-msg">차트에 그렸습니다</span>
              <span class="dr-count">{widget.shapes.length}개 도형</span>
              <button class="dr-clear" onclick={() => clearAIOverlay()} type="button">클리어</button>
            </div>

          {:else if widget.type === 'scan_result'}
            <div class="widget scan-card">
              <div class="sc-header">
                <span class="sc-icon">🔍</span>
                <span class="sc-title">스캔 결과</span>
                <span class="sc-count">{widget.results.length} setups · {widget.timeframe}</span>
              </div>
              {#each widget.results as r}
                <button class="sc-row" onclick={() => onSelectSymbol?.(r.symbol)} type="button">
                  <span class="sc-dir" class:long={r.direction === 'LONG'} class:watch={r.direction === 'WATCH'}>{r.direction}</span>
                  <span class="sc-sym">{r.symbol.replace('USDT', '')}</span>
                  <span class="sc-phase">{r.phase}</span>
                  <span class="sc-score">{Math.round(r.ranking_score * 100)}</span>
                </button>
              {/each}
            </div>

          {:else if widget.type === 'research_summary'}
            <div class="widget research-card">
              <div class="rc-header">
                <div class="rc-header-main">
                  <span class="rc-kicker">{widget.personaId === 'research_analyst' ? 'AI RESEARCHER' : 'AI SUMMARY'}</span>
                  <span class="rc-title">Discovery Brief</span>
                </div>
                <div class="rc-tools">{widget.tools.join(' + ')}</div>
              </div>
              <div class="rc-list">
                {#each widget.items as item}
                  <button class="rc-row" onclick={() => onSelectSymbol?.(item.symbol)} type="button">
                    <div class="rc-rank">{item.rank}</div>
                    <div class="rc-body">
                      <div class="rc-line1">
                        <span class="rc-symbol">{item.symbol.replace('USDT', '')}</span>
                        <span class="rc-setup">{item.setup}</span>
                      </div>
                      <div class="rc-line2">{item.reason}</div>
                    </div>
                    <div class="rc-side">
                      <span class="rc-action">{item.action}</span>
                      <span class="rc-score">{item.score.toFixed(1)}</span>
                    </div>
                  </button>
                {/each}
              </div>
            </div>

          {:else if widget.type === 'alpha_scan_result'}
            <div class="widget scan-card">
              <div class="sc-header">
                <span class="sc-icon">⚡</span>
                <span class="sc-title">알파 스캔</span>
                <span class="sc-count">{widget.results.length} found · α≥{widget.min_alpha}</span>
              </div>
              {#each widget.results as r}
                <button class="sc-row" onclick={() => onSelectSymbol?.(r.symbol)} type="button">
                  <span class="sc-alpha">α{Math.round(r.alpha_score)}</span>
                  <span class="sc-sym">{r.symbol.replace('USDT', '')}</span>
                  <span class="sc-phase">{r.verdict}</span>
                  <span class="sc-score">{r.signal_count}sig</span>
                </button>
              {/each}
            </div>

          {:else if widget.type === 'screener_result'}
            <div class="widget screener-card">
              <div class="sc-header">
                <span class="sc-icon">📊</span>
                <span class="sc-title">스크리너</span>
                <span class="sc-count">{widget.symbols_scored} scored</span>
              </div>
              <div class="scr-grades">
                {#each Object.entries(widget.grade_counts).sort(([,a],[,b]) => b - a) as [grade, count]}
                  <div class="scr-grade">
                    <span class="sg-label">{grade}</span>
                    <span class="sg-count">{count}</span>
                  </div>
                {/each}
              </div>
              {#if widget.completed_at}
                <div class="scr-ts">{new Date(widget.completed_at).toLocaleTimeString()}</div>
              {/if}
            </div>
          {:else if widget.type === 'save_result'}
            <div class="widget action-card">
              <span class="ac-icon">💾</span>
              <div class="ac-body">
                <span class="ac-title">패턴 저장됨</span>
                <span class="ac-sub">{widget.symbol} · {widget.tf} · {widget.verdict}</span>
              </div>
            </div>
          {:else if widget.type === 'submit_verdict_result'}
            <div class="widget action-card">
              <span class="ac-icon">✅</span>
              <div class="ac-body">
                <span class="ac-title">Verdict 제출됨</span>
                <span class="ac-sub">{widget.verdict}</span>
              </div>
            </div>
          {:else if widget.type === 'watch_result'}
            <div class="widget action-card">
              <span class="ac-icon">👁</span>
              <div class="ac-body">
                <span class="ac-title">Watch 등록됨</span>
                <span class="ac-sub">{widget.symbol}{widget.pattern_slug ? ` · ${widget.pattern_slug}` : ''}</span>
              </div>
            </div>
          {:else if widget.type === 'feedback_result'}
            <div class="widget action-card">
              <span class="ac-icon">🧠</span>
              <div class="ac-body">
                <span class="ac-title">피드백 기록됨</span>
                <span class="ac-sub">{widget.status}</span>
              </div>
            </div>
          {:else if widget.type === 'explain'}
            <div class="widget explain-card">
              <div class="ec-header">
                <span class="ec-icon">🔎</span>
                <span class="ec-title">차트 해석</span>
              </div>
              <p class="ec-text">{widget.text}</p>
            </div>
          {/if}
        {/each}
      </div>
    {/each}
    <div bind:this={bottomEl}></div>
  </div>

  <!-- Input -->
  <div class="input-row">
    <textarea
      class="chat-input"
      bind:value={input}
      onkeydown={onKeydown}
      placeholder="Ask anything about {symbol}…"
      rows={2}
      disabled={busy}
    ></textarea>
    <button class="send-btn" onclick={() => void send()} disabled={busy || !input.trim()}>
      {busy ? '…' : '↑'}
    </button>
  </div>
</div>

<style>
.chat-thread { display: flex; flex-direction: column; height: 100%; }

/* ── Model bar ── */
.model-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-bottom: 1px solid var(--g3);
  background: var(--g1); flex-shrink: 0;
}
.model-label { font-size: var(--ui-text-xs); color: var(--g5); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; }
.model-select {
  flex: 1; background: var(--g1); color: var(--g6);
  border: 1px solid var(--g3); border-radius: 3px;
  padding: 2px 4px; font-size: var(--ui-text-xs);
  cursor: pointer; outline: none; appearance: auto;
}
.model-select:focus { border-color: var(--brand); }
.model-select:disabled { opacity: 0.5; cursor: default; }

/* ── Messages ── */
.messages { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.msg { position: relative; max-width: 95%; display: flex; flex-direction: column; gap: 5px; padding: 6px 10px; border-radius: 6px; font-size: var(--ui-text-xs); line-height: 1.5; }
.msg--user { align-self: flex-end; background: color-mix(in srgb, var(--brand) 15%, transparent); color: var(--g8); max-width: 80%; border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent); }
.msg--assistant { align-self: flex-start; background: var(--g2); color: var(--g7); border: 1px solid var(--g3); }
.msg--has-error { border-color: color-mix(in srgb, var(--danger, #f23645) 40%, var(--g3)); }
.msg-text { white-space: pre-wrap; word-break: break-word; }
.msg-text--empty { min-height: 1.2em; }
.cursor { animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* Markdown rendered answer — tame default browser margins so paragraphs/
   lists/code blocks sit inside the bubble without bursting it. */
.msg-md { white-space: normal; }
.msg-md :global(p)            { margin: 0 0 6px; }
.msg-md :global(p:last-child) { margin-bottom: 0; }
.msg-md :global(ul),
.msg-md :global(ol)           { margin: 0 0 6px; padding-left: 18px; }
.msg-md :global(li)           { margin: 2px 0; }
.msg-md :global(h1),
.msg-md :global(h2),
.msg-md :global(h3),
.msg-md :global(h4)           { margin: 8px 0 4px; font-size: 13px; font-weight: 600; color: var(--g8); }
.msg-md :global(strong)       { color: var(--g8); font-weight: 600; }
.msg-md :global(em)           { color: var(--g7); font-style: italic; }
.msg-md :global(a)            { color: var(--brand); text-decoration: underline; }
.msg-md :global(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.32);
  color: color-mix(in srgb, var(--brand) 90%, var(--g8));
}
.msg-md :global(pre) {
  margin: 6px 0;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid var(--g3);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.45;
}
.msg-md :global(pre code) { background: transparent; padding: 0; color: var(--g8); }
.msg-md :global(blockquote) {
  margin: 6px 0;
  padding: 2px 10px;
  border-left: 2px solid var(--g4);
  color: var(--g6);
}
.msg-md :global(hr) { border: none; border-top: 1px solid var(--g3); margin: 8px 0; }

/* Error widget — visually separated from the body so partial streamed text
   stays readable and `Retry` is an obvious affordance. */
.msg-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--danger, #f23645) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger, #f23645) 32%, transparent);
  font-size: 11px;
  color: color-mix(in srgb, var(--danger, #f23645) 90%, var(--g8));
}
.err-icon { font-size: 12px; flex-shrink: 0; }
.err-text { flex: 1; word-break: break-word; }
.err-retry {
  flex-shrink: 0;
  padding: 3px 9px;
  background: color-mix(in srgb, var(--danger, #f23645) 18%, transparent);
  color: color-mix(in srgb, var(--danger, #f23645) 95%, var(--g8));
  border: 1px solid color-mix(in srgb, var(--danger, #f23645) 50%, transparent);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.err-retry:hover:not(:disabled) {
  background: color-mix(in srgb, var(--danger, #f23645) 32%, transparent);
}
.err-retry:disabled { opacity: 0.4; cursor: not-allowed; }

/* Copy button — appears in top-right corner of assistant bubbles, only
   shows on hover/focus so it doesn't compete with the answer. */
.msg-copy {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--g3);
  border: 1px solid var(--g4);
  border-radius: 3px;
  color: var(--g7);
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, background 0.1s, color 0.1s;
}
.msg--assistant:hover .msg-copy,
.msg-copy:focus-visible { opacity: 1; }
.msg-copy:hover {
  background: var(--g4);
  color: var(--g8);
}

/* ── Widgets ── */
.widget { border-radius: 4px; font-family: 'JetBrains Mono', monospace; }

/* Research summary */
.research-card {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--brand) 8%, var(--g1)) 0%, var(--g2) 100%);
  border: 1px solid color-mix(in srgb, var(--brand) 18%, var(--g4));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
  overflow: hidden;
}
.rc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand) 12%, var(--g3));
}
.rc-header-main { display: flex; flex-direction: column; gap: 2px; }
.rc-kicker {
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: color-mix(in srgb, var(--brand) 75%, var(--g7));
}
.rc-title { font-size: 14px; font-weight: 700; color: var(--g8); }
.rc-tools { font-size: 11px; color: var(--g5); text-align: right; }
.rc-list { display: flex; flex-direction: column; }
.rc-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-top: 1px solid var(--g3);
  text-align: left;
  cursor: pointer;
  color: inherit;
}
.rc-row:first-child { border-top: none; }
.rc-row:hover { background: color-mix(in srgb, var(--brand) 6%, transparent); }
.rc-rank {
  width: 24px; height: 24px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--brand) 22%, transparent);
  color: var(--g8); font-size: 11px; font-weight: 700;
}
.rc-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.rc-line1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-symbol { font-size: 13px; font-weight: 700; color: var(--g8); }
.rc-setup {
  font-size: 11px; color: var(--g6);
  padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,0.04);
}
.rc-line2 { font-size: 11px; color: var(--g5); line-height: 1.35; }
.rc-side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.rc-action {
  font-size: 11px; color: var(--brand); text-transform: uppercase; letter-spacing: 0.08em;
}
.rc-score { font-size: 12px; color: var(--g7); font-weight: 700; }

/* Tool trace */
.tool-trace {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 6px; background: var(--g3); border: 1px solid var(--g4);
  font-size: var(--ui-text-xs); color: var(--g5);
}
.tool-trace.done { color: var(--g4); }
.trace-dot { font-size: var(--ui-text-xs); color: var(--brand); }
.trace-dot.spin { animation: spin 1.2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.trace-name { color: var(--g6); letter-spacing: 0.05em; }
.trace-ok { color: var(--pos); font-size: var(--ui-text-xs); }

/* Verdict card */
.verdict-card {
  background: var(--g2); border: 1px solid var(--g4);
  border-left: 3px solid var(--brand); padding: 6px 8px;
  display: flex; flex-direction: column; gap: 4px;
}
.vc-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.vc-sym { font-size: var(--ui-text-xs); color: var(--g6); letter-spacing: 0.08em; }
.vc-dir { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.12em; color: var(--g7); }
.vc-dir.long { color: var(--pos); }
.vc-dir.short { color: var(--neg); }
.vc-rr { font-size: var(--ui-text-xs); color: var(--amb); }
.vc-levels { display: flex; gap: 8px; flex-wrap: wrap; }
.vc-lvl { font-size: var(--ui-text-xs); color: var(--g6); }
.vc-lvl strong { color: var(--g8); }
.vc-lvl.pos strong { color: var(--pos); }
.vc-lvl.neg strong { color: var(--neg); }

/* Metrics strip */
.metrics-strip { display: flex; gap: 4px; flex-wrap: wrap; }
.metric-cell {
  min-width: 56px; flex: 1;
  background: var(--g3); border: 1px solid var(--g4); border-radius: 3px;
  padding: 4px 6px; display: flex; flex-direction: column; gap: 1px;
}
.metric-cell.pos { border-left: 2px solid var(--pos); }
.metric-cell.neg { border-left: 2px solid var(--neg); }
.metric-cell.warn { border-left: 2px solid var(--amb); }
.mc-label { font-size: var(--ui-text-xs); color: var(--g5); letter-spacing: 0.08em; text-transform: uppercase; }
.mc-value { font-size: var(--ui-text-xs); font-weight: 700; color: var(--g8); }
.mc-sub { font-size: var(--ui-text-xs); color: var(--g5); }

/* Similar list */
.similar-list { background: var(--g2); border: 1px solid var(--g4); border-radius: 4px; overflow: hidden; }
.sl-header { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-bottom: 1px solid var(--g3); background: var(--g1); }
.sl-title { font-size: var(--ui-text-xs); color: var(--g6); letter-spacing: 0.08em; }
.sl-meta { font-size: var(--ui-text-xs); color: var(--g5); }
.sl-row {
  display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--g3);
  cursor: pointer; color: var(--g7); font-size: var(--ui-text-xs); font-family: 'JetBrains Mono', monospace;
  transition: background 0.1s;
}
.sl-row:last-child { border-bottom: none; }
.sl-row:hover { background: var(--g3); }
.sl-sym { font-weight: 700; color: var(--brand); min-width: 44px; }
.sl-tf { color: var(--g5); min-width: 28px; }
.sl-sim { color: var(--pos); font-weight: 700; min-width: 36px; }
.sl-scores { color: var(--g5); font-size: var(--ui-text-xs); letter-spacing: 0.04em; }

/* ── Input ── */
.input-row { display: flex; gap: 6px; padding: 8px; border-top: 1px solid var(--g3); flex-shrink: 0; }
.chat-input { flex: 1; background: var(--g1); color: var(--g7); border: 1px solid var(--g3); border-radius: 5px; padding: 6px 8px; font-size: var(--ui-text-xs); resize: none; font-family: inherit; }
.chat-input:focus { outline: none; border-color: var(--brand); }
.send-btn { background: color-mix(in srgb, var(--brand) 20%, transparent); color: var(--brand); border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent); border-radius: 5px; width: 32px; cursor: pointer; font-size: 14px; transition: background 0.1s; }
.send-btn:hover { background: color-mix(in srgb, var(--brand) 35%, transparent); }
.send-btn:disabled { opacity: 0.4; cursor: default; }

/* ── Draw result widget ── */
.draw-result { display: flex; align-items: center; gap: 8px; padding: 6px 10px; }
.dr-icon { font-size: 13px; }
.dr-msg { font-size: var(--ui-text-xs); color: var(--g7); flex: 1; }
.dr-count { font-size: var(--ui-text-xs); color: var(--g5); }
.dr-clear { font-size: var(--ui-text-xs); color: var(--neg); background: transparent; border: 1px solid color-mix(in srgb, var(--neg) 30%, transparent); border-radius: 3px; padding: 1px 7px; cursor: pointer; }
.dr-clear:hover { background: color-mix(in srgb, var(--neg) 15%, transparent); }

/* ── Scan / Alpha / Screener cards ── */
.scan-card, .screener-card { background: var(--g2); border: 1px solid var(--g4); border-radius: 4px; overflow: hidden; }
.sc-header {
  display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  border-bottom: 1px solid var(--g3); background: var(--g1);
}
.sc-icon { font-size: 11px; }
.sc-title { font-size: var(--ui-text-xs); color: var(--g6); letter-spacing: 0.08em; font-weight: 700; }
.sc-count { font-size: var(--ui-text-xs); color: var(--g5); margin-left: auto; }
.sc-row {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px;
  width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--g3);
  cursor: pointer; color: var(--g7); font-size: var(--ui-text-xs);
  font-family: 'JetBrains Mono', monospace; transition: background 0.1s;
}
.sc-row:last-child { border-bottom: none; }
.sc-row:hover { background: var(--g3); }
.sc-dir { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.1em; min-width: 40px; color: var(--g6); }
.sc-dir.long { color: var(--pos); }
.sc-dir.watch { color: var(--amb); }
.sc-alpha { font-size: var(--ui-text-xs); font-weight: 700; color: var(--brand); min-width: 32px; }
.sc-sym { font-weight: 700; color: var(--g8); min-width: 40px; }
.sc-phase { font-size: var(--ui-text-xs); color: var(--g5); flex: 1; text-align: left; }
.sc-score { font-size: var(--ui-text-xs); color: var(--g5); }
.scr-grades { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; }
.scr-grade { display: flex; gap: 4px; align-items: center; background: var(--g3); border-radius: 3px; padding: 2px 6px; }
.sg-label { font-size: var(--ui-text-xs); color: var(--g6); letter-spacing: 0.06em; }
.sg-count { font-size: var(--ui-text-xs); font-weight: 700; color: var(--g8); }
.scr-ts { font-size: var(--ui-text-xs); color: var(--g4); padding: 2px 8px 5px; }

/* ── action-card (save / verdict / watch / feedback) ── */
.action-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--g1);
  border-left: 3px solid var(--brand);
}
.ac-icon { font-size: 14px; line-height: 1; flex-shrink: 0; }
.ac-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ac-title { font-size: var(--ui-text-xs); font-weight: 600; color: var(--g9); }
.ac-sub { font-size: var(--ui-text-xs); color: var(--g5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Explain card ── */
.explain-card { padding: 8px 10px; background: var(--g1); border-left: 3px solid var(--brand); display: flex; flex-direction: column; gap: 5px; }
.ec-header { display: flex; align-items: center; gap: 5px; }
.ec-icon { font-size: 12px; }
.ec-title { font-size: var(--ui-text-xs); font-weight: 600; color: var(--g7); text-transform: uppercase; letter-spacing: 0.06em; }
.ec-text { font-size: var(--ui-text-xs); color: var(--g6); line-height: 1.55; margin: 0; }
</style>
