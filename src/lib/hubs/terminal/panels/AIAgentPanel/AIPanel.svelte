<script lang="ts">
  /**
   * AIPanel — agent chat surface.
   *
   * Streams from /api/terminal/agent/chat (SSE) using the litellm multi-provider
   * tool-use loop on the engine. Named SSE events:
   *   event: chunk       data: {"text": "..."}
   *   event: tool_call   data: {"name": "...", "input": {...}}
   *   event: tool_result data: {"name": "...", "data": {...}}  or  {"preview": "..."}
   *   event: done        data: {"latency_ms": N, "tokens": N}
   */
  import { onDestroy, tick } from 'svelte';
  import { shellStore } from '$lib/hubs/terminal/shell.store';
  import { chartSaveMode } from '$lib/stores/chartSaveMode';
  import { setAIOverlay, type AIPriceLine } from '$lib/stores/chartAIOverlay';

  // ── Types ──────────────────────────────────────────────────────────────────
  interface SetupToken { kind: 'asset' | 'trigger' | 'filter'; label: string; }
  interface SetupResult { tokens: SetupToken[]; matches: number; past: number; text: string; }
  interface Message { role: 'user' | 'assistant'; text: string; setup?: SetupResult; }
  interface ModelInfo { id: string; label: string; badge: string; }
  interface ToolCall { name: string; input?: Record<string, any>; }
  interface ToolResult { name: string; data?: any; preview?: string; }
  interface Directive { type: string; payload: Record<string, any>; }

  interface ChatMsg {
    role: 'user' | 'assistant';
    text: string;
    streaming: boolean;
    toolCalls: ToolCall[];
    toolResults: ToolResult[];
    directives: Directive[];
    latency_ms?: number;
    tokens?: number;
    ts: number;
  }

  interface Props {
    messages?: Message[];
    onSend?: (text: string, newMessages: Message[]) => void;
    onApplySetup?: (setup: SetupResult) => void;
    onClose?: () => void;
    symbol?: string;
    timeframe?: string;
    onSelectSymbol?: (symbol: string) => void;
  }

  let {
    messages: _messages = [],
    onSend,
    onApplySetup: _onApplySetup,
    onClose,
    symbol = 'BTCUSDT',
    timeframe = '4h',
    onSelectSymbol,
  }: Props = $props();

  // ── State ──────────────────────────────────────────────────────────────────
  let chatMsgs = $state<ChatMsg[]>([]);
  let inputValue = $state('');
  let streaming = $state(false);
  let scrollEl: HTMLDivElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let models = $state<ModelInfo[]>([]);
  let selectedModel = $state('');
  let abortCtrl: AbortController | null = null;

  const canSend = $derived(inputValue.trim().length > 0 && !streaming);

  const quicks: readonly string[] = [
    'BTC 분석해줘',
    'OI surge 스캔',
    'ETH long 판단해줘',
    'BTC market trend',
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function selectSymbol(sym: string): void {
    shellStore.setSymbol(sym);
    onSelectSymbol?.(sym);
  }

  function scrollToBottom(): void {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  $effect(() => {
    chatMsgs;
    scrollToBottom();
  });

  // ── Model fetch (lazy on first send) ───────────────────────────────────────
  async function fetchModels(): Promise<void> {
    if (models.length > 0) return;
    try {
      const r = await fetch('/api/terminal/agent/models');
      if (r.ok) {
        const d = (await r.json()) as { models: ModelInfo[] };
        models = d.models ?? [];
      }
    } catch {}
  }

  // ── Directive parsing ──────────────────────────────────────────────────────
  function parseDirectives(text: string): Directive[] {
    const re = /<directive\s+type="([^"]+)"\s+payload=(\{[^}]+\})\s*\/>/g;
    const out: Directive[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      try { out.push({ type: m[1], payload: JSON.parse(m[2]) as Record<string, any> }); } catch {}
    }
    return out;
  }

  function stripDirectives(text: string): string {
    return text.replace(/<directive[^>]*\/>/g, '').trim();
  }

  // ── SSE stream ─────────────────────────────────────────────────────────────
  async function send(): Promise<void> {
    const t = inputValue.trim();
    if (!t || streaming) return;

    await fetchModels();
    inputValue = '';

    const userMsg: ChatMsg = {
      role: 'user', text: t, streaming: false,
      toolCalls: [], toolResults: [], directives: [],
      ts: Date.now(),
    };
    chatMsgs = [...chatMsgs, userMsg];
    onSend?.(t, [{ role: 'user', text: t }]);

    const assistantMsg: ChatMsg = {
      role: 'assistant', text: '', streaming: true,
      toolCalls: [], toolResults: [], directives: [],
      ts: Date.now() + 1,
    };
    chatMsgs = [...chatMsgs, assistantMsg];
    const aidx = chatMsgs.length - 1;

    streaming = true;
    abortCtrl = new AbortController();

    // Pass last 40 msgs (20 pairs) as history for multi-turn
    const history = chatMsgs.slice(0, -2).slice(-40).map(m => ({
      role: m.role,
      content: m.text,
    }));

    await tick();
    scrollToBottom();

    try {
      const res = await fetch('/api/terminal/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: t,
          symbol,
          timeframe,
          ...(selectedModel ? { model: selectedModel } : {}),
          history,
        }),
        signal: abortCtrl.signal,
      });

      if (!res.ok || !res.body) {
        let errMsg = `Error ${res.status}`;
        try {
          const errJson = (await res.json()) as Record<string, unknown>;
          if (errJson.error === 'quota_exceeded') {
            errMsg = `일일 한도 초과 (${errJson.used}/${errJson.limit})`;
          }
        } catch {}
        chatMsgs = chatMsgs.map((m, i) =>
          i === aidx ? { ...m, text: errMsg, streaming: false } : m,
        );
        streaming = false;
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        const blocks = buf.split('\n\n');
        buf = blocks.pop() ?? '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          let evType = 'chunk';
          let dataStr = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) evType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;

          let data: Record<string, any>;
          try { data = JSON.parse(dataStr) as Record<string, any>; } catch { continue; }

          chatMsgs = chatMsgs.map((m, i) => {
            if (i !== aidx) return m;
            if (evType === 'chunk' && typeof data.text === 'string') {
              return { ...m, text: m.text + data.text };
            }
            if (evType === 'tool_call') {
              return { ...m, toolCalls: [...m.toolCalls, { name: String(data.name), input: data.input as Record<string, any> }] };
            }
            if (evType === 'tool_result') {
              return { ...m, toolResults: [...m.toolResults, { name: String(data.name), data: data.data, preview: data.preview as string }] };
            }
            if (evType === 'done') {
              return {
                ...m,
                streaming: false,
                directives: parseDirectives(m.text),
                latency_ms: data.latency_ms as number,
                tokens: data.tokens as number,
              };
            }
            return m;
          });

          if (evType === 'done') {
            streaming = false;
            break outer;
          }
          scrollToBottom();
        }
      }
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError';
      chatMsgs = chatMsgs.map((m, i) =>
        i === aidx
          ? { ...m, text: isAbort ? m.text : m.text + (m.text ? '\n' : '') + '[연결 오류]', streaming: false }
          : m,
      );
      streaming = false;
    } finally {
      abortCtrl = null;
    }
  }

  function stopStream(): void {
    abortCtrl?.abort();
    streaming = false;
  }

  function retry(): void {
    // Find last user message and re-send it
    const lastUser = [...chatMsgs].reverse().find(m => m.role === 'user');
    if (!lastUser || streaming) return;
    // Remove all messages from that user msg onward, then re-send
    const idx = chatMsgs.lastIndexOf(lastUser);
    chatMsgs = chatMsgs.slice(0, idx);
    inputValue = lastUser.text;
    void send();
  }

  function isErrorMsg(msg: ChatMsg): boolean {
    return !msg.streaming && (
      msg.text.includes('[연결 오류]') ||
      /^Error \d+/.test(msg.text) ||
      msg.text.includes('일일 한도 초과')
    );
  }

  function quickPick(q: string): void {
    inputValue = q;
    void send();
  }

  function handleInput(e: Event): void {
    inputValue = (e.currentTarget as HTMLTextAreaElement).value;
  }

  // ── B,B range auto-analyze (chart interaction — calls analyze directly) ───
  async function handleAnalyzeRange(from: number, to: number): Promise<void> {
    const fromDate = new Date(from * 1000).toISOString().slice(0, 10);
    const toDate = new Date(to * 1000).toISOString().slice(0, 10);
    try {
      const r = await fetch(`/api/cogochi/analyze?symbol=${symbol}&tf=${timeframe}&from=${from}&to=${to}`);
      if (!r.ok) return;
      const d = (await r.json()) as Record<string, any>;
      const a = (d.analyze ?? d) as Record<string, any>;
      const entry: number | null = a.entryPlan?.entry ?? null;
      const stop: number | null = a.entryPlan?.stop ?? null;
      chatMsgs = [...chatMsgs, {
        role: 'assistant', streaming: false,
        text: `Range ${fromDate}~${toDate}`,
        toolCalls: [],
        toolResults: [{
          name: '_range_analyze',
          data: {
            symbol, tf: `${timeframe} · ${fromDate}~${toDate}`,
            direction: String(a.direction ?? a.bias ?? '—'),
            pWin: typeof a.p_win === 'number' ? a.p_win : null,
            evidence: Array.isArray(a.evidence) ? a.evidence.map(String) : [],
            entry, stop,
          },
        }],
        directives: [],
        ts: Date.now(),
      }];
      const lines: AIPriceLine[] = [];
      if (entry != null) lines.push({ price: entry, color: '#22AB94', label: 'Entry', style: 'solid' });
      if (stop != null) lines.push({ price: stop, color: '#F23645', label: 'Stop', style: 'dashed' });
      if (lines.length > 0) setAIOverlay(symbol, lines);
    } catch {}
  }

  let _rangeTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const anchorA = $chartSaveMode.anchorA;
    const anchorB = $chartSaveMode.anchorB;
    if (anchorA == null || anchorB == null) return;
    const from = Math.min(anchorA, anchorB);
    const to = Math.max(anchorA, anchorB);
    if (_rangeTimer != null) clearTimeout(_rangeTimer);
    _rangeTimer = setTimeout(() => { _rangeTimer = null; void handleAnalyzeRange(from, to); }, 300);
  });

  // ── /focus_ai_input shortcut ──────────────────────────────────────────────
  const onFocusCmd = (e: Event) => {
    if ((e as CustomEvent).detail?.id === 'focus_ai_input') textareaEl?.focus();
  };
  if (typeof window !== 'undefined') window.addEventListener('cogochi:cmd', onFocusCmd);
  onDestroy(() => {
    if (typeof window !== 'undefined') window.removeEventListener('cogochi:cmd', onFocusCmd);
    abortCtrl?.abort();
  });
</script>

<div class="panel">
  <!-- Header -->
  <div class="hdr">
    <span class="ai-dot"></span>
    <span class="ai-title">AI · {symbol} · {timeframe}</span>
    <span class="spacer"></span>
    {#if models.length > 0}
      <select class="model-sel" bind:value={selectedModel} title="model">
        <option value="">auto</option>
        {#each models as m (m.id)}
          <option value={m.id}>{m.label}{m.badge ? ' · ' + m.badge : ''}</option>
        {/each}
      </select>
    {/if}
    {#if streaming}
      <button class="stop-btn" type="button" onclick={stopStream} title="stop">■</button>
    {/if}
    <button class="close" onclick={onClose} aria-label="close">×</button>
  </div>

  <!-- Chat thread -->
  <div class="thread" bind:this={scrollEl}>
    {#if chatMsgs.length === 0}
      <div class="welcome">
        <div class="wl-hero">
          <div class="wl-hero-label">AI MARKET ANALYST</div>
          <div class="wl-hero-desc">실시간 시장 데이터 · 멀티턴 대화 · 패턴 분석</div>
          <button class="wl-demo-btn" type="button" onclick={() => quickPick(`${symbol} 지금 분석해줘`)}>
            <span class="wl-demo-icon">⚡</span>
            <span class="wl-demo-text">{symbol} 지금 분석해줘</span>
            <span class="wl-demo-hint">1-click demo</span>
          </button>
        </div>
        <div class="wl-divider"></div>
        <div class="wl-section">QUICK START</div>
        <div class="wl-picks">
          {#each quicks as q (q)}
            <button class="wl-pick" type="button" onclick={() => quickPick(q)}>
              <span class="pick-slash">/</span>{q}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      {#each chatMsgs as msg (msg.ts)}
        {#if msg.role === 'user'}
          <div class="msg msg--user">
            <div class="bubble bubble--user">{msg.text}</div>
          </div>
        {:else}
          <div class="msg msg--assistant">
            <!-- Tool call badges -->
            {#if msg.toolCalls.length > 0}
              <div class="tool-trace">
                {#each msg.toolCalls as tc, i (i)}
                  <span class="tool-badge">{tc.name}</span>
                {/each}
              </div>
            {/if}

            <!-- Tool result cards -->
            {#each msg.toolResults as tr, i (i)}
              {#if tr.name === 'scan' || tr.name === 'alpha_scan' || tr.name === 'screener'}
                {@const cands = (tr.data?.candidates ?? tr.data?.highlights ?? []) as any[]}
                <div class="card card--scan">
                  <div class="card-header">
                    <span class="card-label">SCAN · {cands.length} candidates</span>
                  </div>
                  <ul class="scan-list">
                    {#each cands.slice(0, 8) as c, j (j)}
                      <li>
                        <button type="button" class="scan-row" class:active={c.symbol === symbol}
                          onclick={() => selectSymbol(String(c.symbol ?? ''))}>
                          <span class="scan-sym">{String(c.symbol ?? '').replace(/USDT$/, '')}</span>
                          <span class="scan-sig">{String(c.signal ?? c.label ?? '—')}</span>
                          {#if c.confidence != null}
                            <span class="scan-conf">{Math.round(Number(c.confidence) * 100)}%</span>
                          {/if}
                        </button>
                      </li>
                    {/each}
                  </ul>
                </div>
              {:else if tr.name === 'get_market_context'}
                {@const d = (tr.data ?? {}) as Record<string, any>}
                <div class="card card--market-ctx">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol ?? symbol}</span>
                    <span class="card-label">MARKET CTX</span>
                  </div>
                  <div class="ctx-grid">
                    {#if d.market_trend != null}
                      <span class="ctx-key">trend</span>
                      <span class="ctx-val" class:up={d.market_trend === 'up'} class:dn={d.market_trend === 'down'}>{String(d.market_trend).toUpperCase()}</span>
                    {/if}
                    {#if d.momentum_score != null}
                      <span class="ctx-key">momentum</span>
                      <span class="ctx-val" class:up={Number(d.momentum_score) > 0} class:dn={Number(d.momentum_score) < 0}>{Number(d.momentum_score).toFixed(2)}</span>
                    {/if}
                    {#if d.scan_phase != null}
                      <span class="ctx-key">phase</span>
                      <span class="ctx-val ctx-phase" data-phase={d.scan_phase}>{(['WAIT', 'SETUP', 'TRIGGER'] as string[])[Number(d.scan_phase)] ?? d.scan_phase}</span>
                    {/if}
                    {#if d.futures_premium_pct != null}
                      <span class="ctx-key">premium</span>
                      <span class="ctx-val" class:up={Number(d.futures_premium_pct) > 0} class:dn={Number(d.futures_premium_pct) < 0}>{Number(d.futures_premium_pct).toFixed(4)}%</span>
                    {/if}
                  </div>
                </div>
              {:else if tr.name === '_range_analyze' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                <div class="card card--analyze">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol} · {d.tf}</span>
                    <span class="card-badge"
                      class:up={String(d.direction).toUpperCase() === 'LONG'}
                      class:dn={String(d.direction).toUpperCase() === 'SHORT'}>
                      {d.direction}{d.pWin != null ? ` ${Math.round(Number(d.pWin) * 100)}%` : ''}
                    </span>
                  </div>
                  {#if Array.isArray(d.evidence) && d.evidence.length > 0}
                    <ul class="card-evidence">
                      {#each (d.evidence as string[]).slice(0, 4) as e, j (j)}<li>{e}</li>{/each}
                    </ul>
                  {/if}
                  {#if d.entry != null || d.stop != null}
                    <div class="card-levels">
                      {#if d.entry != null}<span class="level-entry">Entry {d.entry}</span>{/if}
                      {#if d.stop != null}<span class="level-stop">Stop {d.stop}</span>{/if}
                    </div>
                  {/if}
                </div>
              {:else if tr.name === 'judge' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                <div class="card card--judge">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol ?? symbol} · {d.timeframe ?? timeframe}</span>
                    <span class="card-badge"
                      class:up={String(d.direction).toUpperCase() === 'LONG'}
                      class:dn={String(d.direction).toUpperCase() === 'SHORT'}>
                      {d.direction ?? '—'}
                    </span>
                  </div>
                  <div class="ctx-grid">
                    {#if d.confidence != null}
                      <span class="ctx-key">conf</span>
                      <span class="ctx-val">{Math.round(Number(d.confidence) * 100)}%</span>
                    {/if}
                    {#if d.entry != null}
                      <span class="ctx-key">entry</span>
                      <span class="ctx-val level-entry">{d.entry}</span>
                    {/if}
                    {#if d.stop != null}
                      <span class="ctx-key">stop</span>
                      <span class="ctx-val level-stop">{d.stop}</span>
                    {/if}
                    {#if d.target != null}
                      <span class="ctx-key">target</span>
                      <span class="ctx-val" style="color:#22AB94">{d.target}</span>
                    {/if}
                    {#if d.rr != null}
                      <span class="ctx-key">R:R</span>
                      <span class="ctx-val">{Number(d.rr).toFixed(2)}</span>
                    {/if}
                  </div>
                </div>
              {:else if tr.name === 'live_snapshot' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                <div class="card card--snapshot">
                  <div class="card-header">
                    <span class="card-symbol">{symbol} · {timeframe}</span>
                    <span class="card-label">SNAPSHOT</span>
                  </div>
                  <div class="ctx-grid">
                    {#if d.price != null}
                      <span class="ctx-key">price</span>
                      <span class="ctx-val">{Number(d.price).toLocaleString()}</span>
                    {/if}
                    {#if d.rsi != null}
                      <span class="ctx-key">RSI</span>
                      <span class="ctx-val"
                        class:up={Number(d.rsi) < 35}
                        class:dn={Number(d.rsi) > 70}>{Number(d.rsi).toFixed(1)}</span>
                    {/if}
                    {#if d.macd_hist != null}
                      <span class="ctx-key">MACD H</span>
                      <span class="ctx-val"
                        class:up={Number(d.macd_hist) > 0}
                        class:dn={Number(d.macd_hist) < 0}>{Number(d.macd_hist).toFixed(2)}</span>
                    {/if}
                    {#if d.bb_pct_b != null}
                      <span class="ctx-key">BB%B</span>
                      <span class="ctx-val"
                        class:dn={Number(d.bb_pct_b) > 1}
                        class:up={Number(d.bb_pct_b) < 0}>{Number(d.bb_pct_b).toFixed(3)}</span>
                    {/if}
                  </div>
                </div>
              {:else if tr.name === 'get_funding_rate' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                <div class="card card--funding">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol ?? symbol}</span>
                    <span class="card-label">FUNDING</span>
                  </div>
                  <div class="ctx-grid">
                    <span class="ctx-key">rate</span>
                    <span class="ctx-val"
                      class:up={Number(d.current_rate) < 0}
                      class:dn={Number(d.current_rate) > 0.001}>
                      {(Number(d.current_rate) * 100).toFixed(4)}%
                    </span>
                    {#if d.next_funding_time}
                      <span class="ctx-key">next</span>
                      <span class="ctx-val">{new Date(Number(d.next_funding_time)).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {/if}
                  </div>
                  {#if Array.isArray(d.history) && d.history.length > 0}
                    <div class="funding-hist">
                      {#each (d.history as {rate: number}[]).slice(-3) as h, j (j)}
                        <span class="fh-item" class:pos={h.rate < 0} class:neg={h.rate > 0.001}>{(h.rate * 100).toFixed(4)}%</span>
                      {/each}
                    </div>
                  {/if}
                </div>
              {:else if tr.name === 'get_open_interest' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                <div class="card card--oi">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol ?? symbol}</span>
                    <span class="card-label">OPEN INTEREST</span>
                  </div>
                  <div class="ctx-grid">
                    <span class="ctx-key">OI</span>
                    <span class="ctx-val">${(Number(d.open_interest_usdt) / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              {:else if tr.name === 'similar' && tr.data}
                {@const d = (tr.data) as Record<string, any>}
                {@const cands = (d.candidates ?? []) as any[]}
                <div class="card card--similar">
                  <div class="card-header">
                    <span class="card-symbol">{d.symbol ?? symbol}</span>
                    <span class="card-label">SIMILAR · {d.similar_count ?? cands.length}</span>
                  </div>
                  <ul class="scan-list">
                    {#each cands.slice(0, 5) as c, j (j)}
                      <li>
                        <button type="button" class="scan-row" onclick={() => selectSymbol(String(c.symbol ?? ''))}>
                          <span class="scan-sym">{String(c.symbol ?? '').replace(/USDT$/, '')}</span>
                          <span class="scan-sig">{c.timeframe ?? '—'}</span>
                          <span class="scan-conf">{(Number(c.similarity) * 100).toFixed(0)}%</span>
                        </button>
                      </li>
                    {/each}
                  </ul>
                </div>
              {:else if tr.preview}
                <div class="tool-preview">{tr.preview}</div>
              {/if}
            {/each}

            <!-- Text bubble -->
            {#if msg.text || msg.streaming}
              <div class="bubble bubble--assistant" class:streaming={msg.streaming}>
                {stripDirectives(msg.text)}{#if msg.streaming}<span class="cursor">▋</span>{/if}
              </div>
            {/if}

            <!-- Directives (verdict, similarity, passport cards) -->
            {#if !msg.streaming}
              {#each msg.directives as dir, i (i)}
                {#if dir.type === 'verdict_card'}
                  <div class="card card--analyze">
                    <div class="card-header">
                      <span class="card-symbol">{dir.payload.symbol ?? symbol}</span>
                      <span class="card-badge"
                        class:up={dir.payload.direction === 'LONG'}
                        class:dn={dir.payload.direction === 'SHORT'}>
                        {dir.payload.direction ?? '—'}{dir.payload.p_win != null ? ` ${Math.round(Number(dir.payload.p_win) * 100)}%` : ''}
                      </span>
                    </div>
                    {#if dir.payload.timeframe}
                      <div class="card-tf">{dir.payload.timeframe}</div>
                    {/if}
                  </div>
                {:else if dir.type === 'signal_card'}
                  <div class="card card--analyze">
                    <div class="card-header">
                      <span class="card-symbol">{dir.payload.symbol ?? symbol}</span>
                      <span class="card-badge up">{dir.payload.score_100 ?? 0}/100</span>
                    </div>
                    {#if dir.payload.scenario}
                      <div class="card-tf">{dir.payload.scenario}</div>
                    {/if}
                  </div>
                {:else if dir.type === 'dex_card'}
                  <div class="card card--analyze">
                    <div class="card-header">
                      <span class="card-symbol">{dir.payload.symbol ?? ''} <span style="font-size:var(--ui-text-xs);opacity:0.6">{dir.payload.chain ?? ''}</span></span>
                      <span class="card-badge" class:up={!dir.payload.is_honeypot} class:dn={dir.payload.is_honeypot}>{dir.payload.is_honeypot ? '허니팟 ⚠' : '안전'}</span>
                    </div>
                    <div class="card-tf">매도세 {((Number(dir.payload.sell_tax) || 0) * 100).toFixed(1)}% · 1h매수 {dir.payload.buy_ratio_h1 != null ? (Number(dir.payload.buy_ratio_h1) * 100).toFixed(0) + '%' : '—'}</div>
                  </div>
                {:else if dir.type === 'passport_card'}
                  <div class="card card--info">
                    {dir.payload.username} · acc {Math.round((Number(dir.payload.accuracy) || 0) * 100)}% · streak {dir.payload.streak ?? 0}
                  </div>
                {/if}
              {/each}
            {/if}

            <!-- Perf meta + retry -->
            {#if !msg.streaming}
              <div class="msg-footer">
                {#if msg.latency_ms != null}
                  <span class="msg-meta">{msg.latency_ms}ms · {msg.tokens ?? 0}tok</span>
                {/if}
                {#if isErrorMsg(msg)}
                  <button class="retry-btn" type="button" onclick={retry} disabled={streaming}>↺ retry</button>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <!-- Input area -->
  <div class="input-area">
    <div class="input-box">
      <textarea
        bind:this={textareaEl}
        value={inputValue}
        placeholder="BTC 분석해줘 / scan / ETH judge ↵"
        rows={2}
        oninput={handleInput}
        onkeydown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
        }}
      ></textarea>
      <div class="input-footer">
        <span class="context-hint">{symbol} · {timeframe}</span>
        <span class="spacer"></span>
        <span class="enter-hint">↵ send</span>
        <button type="button" class="send-btn" class:active={canSend} onclick={() => void send()} disabled={!canSend}>
          SEND
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    background: var(--g1);
    border-left: 1px solid var(--g5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Header */
  .hdr {
    height: 34px;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px;
    border-bottom: 1px solid var(--g5);
    background: var(--g0);
    flex-shrink: 0;
  }
  .ai-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--brand);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .ai-title { font-size: var(--ui-text-xs); color: var(--g7); letter-spacing: 0.12em; }
  .spacer { flex: 1; }

  .model-sel {
    background: var(--g2);
    border: 0.5px solid var(--g4);
    border-radius: 3px;
    color: var(--g6);
    font-size: var(--ui-text-xs);
    font-family: 'JetBrains Mono', monospace;
    padding: 2px 4px;
    max-width: 120px;
    cursor: pointer;
  }
  .model-sel:focus { outline: none; border-color: var(--brand-d); }

  .stop-btn {
    font-size: var(--ui-text-xs);
    color: var(--brand);
    background: var(--brand-dd);
    border: 1px solid var(--brand-d);
    border-radius: 3px;
    padding: 1px 6px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
  }
  .stop-btn:hover { background: var(--brand-d); }

  .close { color: var(--g5); font-size: 16px; padding: 0 3px; background: none; border: none; cursor: pointer; }
  .close:hover { color: var(--g7); }

  /* Thread */
  .thread {
    flex: 1;
    overflow-y: auto;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Welcome */
  .welcome { display: flex; flex-direction: column; gap: 8px; }
  .wl-section { font-size: var(--ui-text-xs); color: var(--g5); letter-spacing: 0.2em; margin-top: 8px; }
  .wl-divider { height: 1px; background: var(--g3); margin: 4px 0; }

  .wl-hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: var(--brand-dd, rgba(219,154,159,0.12));
    border: 1px solid var(--brand-d, rgba(219,154,159,0.38));
    border-radius: 4px;
  }
  .wl-hero-label {
    font-family: var(--fm);
    font-size: 11px;
    color: var(--brand);
    letter-spacing: 0.2em;
    font-weight: 700;
  }
  .wl-hero-desc {
    font-family: var(--fb);
    font-size: 11px;
    color: var(--g6);
    line-height: 1.4;
  }
  .wl-demo-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--brand);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    color: #000;
    transition: background 0.1s;
    margin-top: 2px;
  }
  .wl-demo-btn:hover { background: var(--sc-accent-hover, #e6a9ad); }
  .wl-demo-icon { font-size: 13px; flex-shrink: 0; }
  .wl-demo-text { font-family: var(--fm); font-size: 11px; font-weight: 700; flex: 1; text-align: left; }
  .wl-demo-hint { font-family: var(--fb); font-size: 11px; color: rgba(0,0,0,0.5); flex-shrink: 0; }

  .wl-picks { display: flex; flex-direction: column; gap: 3px; }
  .wl-pick {
    text-align: left; padding: 6px 9px;
    background: var(--g2); border: 1px solid var(--g5); border-radius: 3px;
    font-size: var(--ui-text-xs); color: var(--g7); line-height: 1.4; cursor: pointer;
    font-family: var(--fb); transition: background 0.1s;
  }
  .wl-pick:hover { background: var(--g3); }
  .pick-slash { color: var(--brand); margin-right: 5px; font-family: var(--fm); }

  /* Messages */
  .msg { display: flex; flex-direction: column; max-width: 100%; }
  .msg--user { align-items: flex-end; }
  .msg--assistant { align-items: flex-start; gap: 4px; }

  .bubble {
    border-radius: 4px;
    padding: 7px 10px;
    font-size: 11px;
    line-height: 1.6;
    font-family: var(--fb);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .bubble--user {
    background: var(--brand-dd);
    border: 0.5px solid var(--brand-d);
    color: var(--g9);
    max-width: 90%;
  }
  .bubble--assistant {
    background: var(--g2);
    border: 0.5px solid var(--g4);
    color: var(--g8);
    max-width: 100%;
  }
  .bubble--assistant.streaming { border-color: var(--brand-d); }

  .cursor {
    display: inline-block;
    color: var(--brand);
    animation: blink 0.8s infinite;
    font-family: 'JetBrains Mono', monospace;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  /* Tool trace */
  .tool-trace { display: flex; flex-wrap: wrap; gap: 4px; }
  .tool-badge {
    font-size: var(--ui-text-xs);
    color: var(--brand);
    background: var(--brand-dd);
    border: 0.5px solid var(--brand-d);
    border-radius: 2px;
    padding: 1px 6px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
  }
  .tool-preview {
    font-size: var(--ui-text-xs);
    color: var(--g5);
    font-family: 'JetBrains Mono', monospace;
    padding: 3px 0;
  }

  /* Perf meta + retry */
  .msg-footer { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
  .msg-meta { font-size: var(--ui-text-xs); color: var(--g4); letter-spacing: 0.04em; }
  .retry-btn {
    font-size: var(--ui-text-xs); color: var(--g6);
    background: var(--g2); border: 0.5px solid var(--g5);
    border-radius: 3px; padding: 1px 7px; cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.1s;
  }
  .retry-btn:hover:not(:disabled) { color: var(--brand); border-color: var(--brand-d); }
  .retry-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Cards */
  .card {
    background: var(--g2);
    border: 1px solid var(--g5);
    border-radius: 4px;
    padding: 8px;
    color: var(--g8);
    width: 100%;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    font-size: var(--ui-text-xs); color: var(--g6);
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;
  }
  .card-symbol { font-weight: 600; color: var(--g9); }
  .card-label { font-weight: 600; color: var(--g8); }
  .card-tf { font-size: var(--ui-text-xs); color: var(--g5); margin-top: -4px; margin-bottom: 4px; }

  .card-badge {
    font-size: var(--ui-text-xs); padding: 2px 6px; border-radius: 2px;
    background: var(--g3); color: var(--g8); border: 0.5px solid var(--g5);
  }
  .card-badge.up { color: #22AB94; border-color: #22AB9466; background: #22AB9410; }
  .card-badge.dn { color: #F23645; border-color: #F2364566; background: #F2364510; }

  .card-evidence {
    list-style: disc; margin: 0 0 6px; padding-left: 16px;
    font-size: var(--ui-text-xs); color: var(--g7);
    font-family: var(--fb); line-height: 1.5;
  }
  .card-levels { display: flex; gap: 8px; font-size: var(--ui-text-xs); letter-spacing: 0.04em; }
  .level-entry { color: #22AB94; }
  .level-stop { color: #F23645; }

  /* Scan card */
  .scan-list { list-style: none; margin: 0; padding: 0; }
  .scan-row {
    width: 100%; display: grid; grid-template-columns: 60px 1fr auto;
    gap: 6px; align-items: center; padding: 5px 4px;
    background: transparent; border: none;
    border-bottom: 0.5px solid var(--g4);
    color: var(--g8); font-family: inherit; font-size: var(--ui-text-xs);
    text-align: left; cursor: pointer; transition: background 0.1s;
  }
  .scan-row:hover { background: var(--g3); }
  .scan-row.active { background: var(--brand-dd); border-left: 2px solid var(--brand); }
  .scan-sym { font-weight: 600; color: var(--g9); }
  .scan-sig { font-size: var(--ui-text-xs); color: var(--g6); }
  .scan-conf { font-size: var(--ui-text-xs); color: var(--brand); }

  /* Market ctx card */
  .card--market-ctx .ctx-grid {
    display: grid; grid-template-columns: auto 1fr; gap: 3px 10px;
    font-size: var(--ui-text-xs);
  }
  .ctx-key { color: var(--g5); letter-spacing: 0.08em; text-transform: uppercase; }
  .ctx-val { color: var(--g8); font-family: 'JetBrains Mono', monospace; }
  .ctx-val.up { color: #22AB94; }
  .ctx-val.dn { color: #F23645; }
  .ctx-phase[data-phase="2"] { color: var(--brand); }

  /* Info card */
  .card--info { font-size: var(--ui-text-xs); color: var(--g7); font-family: var(--fb); }

  /* Funding rate history */
  .funding-hist {
    display: flex; gap: 6px; margin-top: 5px;
    font-size: var(--ui-text-xs); font-family: 'JetBrains Mono', monospace;
  }
  .fh-item { color: var(--g5); }
  .fh-item.pos { color: #22AB94; }
  .fh-item.neg { color: #F23645; }

  /* Input */
  .input-area {
    border-top: 1px solid var(--g5); padding: 9px; background: var(--g0);
    flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;
  }
  .input-box {
    background: var(--g2); border: 0.5px solid var(--g4); border-radius: 5px;
    padding: 7px 9px; display: flex; flex-direction: column; gap: 5px;
  }
  textarea {
    background: transparent; color: var(--g9); font-size: 11px;
    font-family: var(--fb); resize: none; width: 100%;
    line-height: 1.5; border: none; outline: none;
  }
  textarea::placeholder { color: var(--g5); }
  .input-footer { display: flex; align-items: center; gap: 5px; }
  .context-hint { font-size: var(--ui-text-xs); color: var(--g5); letter-spacing: 0.08em; }
  .enter-hint { font-size: var(--ui-text-xs); color: var(--g5); }
  .send-btn {
    padding: 3px 9px; border-radius: 3px;
    background: var(--g3); color: var(--g5); border: 1px solid var(--g5);
    font-family: 'JetBrains Mono', monospace; font-size: var(--ui-text-xs);
    font-weight: 600; letter-spacing: 0.08em; cursor: pointer; transition: all 0.12s;
  }
  .send-btn.active { background: var(--brand-dd); color: var(--brand); border-color: var(--brand-d); }
  .send-btn.active:hover { background: var(--brand-d); }
  .send-btn:disabled { cursor: not-allowed; opacity: 0.7; }
</style>
