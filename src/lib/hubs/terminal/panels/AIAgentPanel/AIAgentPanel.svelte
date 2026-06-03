<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { shellStore } from '../../shell.store';
  import { parseDirectives } from '$lib/agent/directives';
  import type { Segment, VerdictCardPayload, SimilarityCardPayload, PassportCardPayload, TvFitCardPayload, SignalCardPayload, DexCardPayload, PositionVerdictCardPayload, FlowCardPayload, AlertCardPayload } from '$lib/agent/directives';
  import { tvUrlDetect } from '$lib/agent/tvUrlDetect';
  import VerdictCard from './cards/VerdictCard.svelte';
  import SimilarityCard from './cards/SimilarityCard.svelte';
  import PassportMiniCard from './cards/PassportMiniCard.svelte';
  import TvFitCard from './cards/TvFitCard.svelte';
  import SignalCard from './cards/SignalCard.svelte';
  import DexCard from './cards/DexCard.svelte';
  import PositionVerdictCard from './cards/PositionVerdictCard.svelte';
  import FlowCard from './cards/FlowCard.svelte';
  import AlertCard from './cards/AlertCard.svelte';
  import DrawerSlide from './DrawerSlide.svelte';
  import DecideRightPanel from '../../DecideRightPanel.svelte';
  import AnalyzeContextCard from './AnalyzeContextCard.svelte';
  import ContextEnvelopeHeader from './ContextEnvelopeHeader.svelte';
  import SignalOpsPanel from './SignalOpsPanel.svelte';
  import AutoTraderPanel from './AutoTraderPanel.svelte';
  import type { AnalyzeEnvelope } from '$lib/contracts/terminalBackend';
  import {
    terminalPanelCache,
    type CachedAiContextEnvelope,
    type CachedModelCatalog,
  } from './panelCache';
  import {
    DEFAULT_MODELS,
    DEFAULT_PIPELINE_LABELS,
    DEFAULT_ROUTE_PROFILE_ID,
    DEFAULT_ROUTE_PROFILES,
    findModelOption,
    findRouteProfile,
    guessPipelineId,
    pipelineLabel,
    resolveModelForProfile,
    routeSummary,
    type ModelOption,
    type PipelineId,
    type RouteProfileOption,
  } from '$lib/hubs/agent/modelRouting';
  import { traderProfile } from '$lib/stores/traderProfile';

  type AiContextEnvelope = CachedAiContextEnvelope;
  const TIMEFRAME_OPTIONS = ['15m', '1h', '4h', '1d'] as const;
  type TimeframeOption = (typeof TIMEFRAME_OPTIONS)[number];
  const DEFAULT_TIMEFRAME: TimeframeOption = '4h';

  function normalizeTimeframe(value: string | undefined): TimeframeOption {
    return (TIMEFRAME_OPTIONS as readonly string[]).includes(value ?? '')
      ? (value as TimeframeOption)
      : DEFAULT_TIMEFRAME;
  }

  interface Props {
    symbol?: string;
    timeframe?: string;
    initialDecideId?: string | null;
    onSelectSymbol?: (s: string) => void;
    surface?: 'panel' | 'page';
    agentId?: string | null;
  }
  let {
    symbol = 'BTCUSDT',
    timeframe = '4h',
    initialDecideId = null,
    onSelectSymbol,
    surface = 'panel',
    agentId = null,
  }: Props = $props();
  let activeSymbol = $state('BTCUSDT');
  let activeTimeframe = $state<TimeframeOption>(DEFAULT_TIMEFRAME);
  let syncedFromProps = $state(false);
  const isPageSurface = $derived(surface === 'page');

  $effect(() => {
    if (!syncedFromProps) {
      activeSymbol = symbol;
      activeTimeframe = normalizeTimeframe(timeframe);
      syncedFromProps = true;
      return;
    }
    if (!isPageSurface) {
      activeSymbol = symbol;
      activeTimeframe = normalizeTimeframe(timeframe);
    }
  });

  // ── Panel state ───────────────────────────────────────────────────────────
  let folded = $state(false);
  let signalOpsOpen = $state(false);
  let autoTraderOpen = $state(false);
  let modelSettingsOpen = $state(false);

  // ── Analyze context card (auto-populated from TradeMode) ──────────────
  let contextCard = $state<AnalyzeEnvelope | null>(null);

  // ── AI context envelope (W-0528 PR12) — drives the chip strip ────────
  let aiEnvelope = $state<AiContextEnvelope | null>(null);
  let aiContextUnavailable = $state(false);

  $effect(() => {
    const sym = activeSymbol;
    const tf = activeTimeframe;
    const cacheKey = `${sym}:${tf}`;
    if (terminalPanelCache.aiContext.has(cacheKey)) {
      aiEnvelope = terminalPanelCache.aiContext.get(cacheKey) ?? null;
      return;
    }
    if (aiContextUnavailable) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/ai/context?symbol=${encodeURIComponent(sym)}&timeframe=${encodeURIComponent(tf)}`,
        );
        if (!res.ok) {
          if (!cancelled) {
            aiEnvelope = null;
            terminalPanelCache.aiContext.set(cacheKey, null);
            if (res.status === 404) aiContextUnavailable = true;
          }
          return;
        }
        if (cancelled) return;
        const env = (await res.json()) as AiContextEnvelope;
        if (!cancelled) {
          aiEnvelope = env;
          terminalPanelCache.aiContext.set(cacheKey, env);
        }
      } catch {
        if (!cancelled) aiEnvelope = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  function onAnalyzeContext(e: Event) {
    const data = (e as CustomEvent<AnalyzeEnvelope>).detail;
    if (data) contextCard = data;
  }
  onMount(() => {
    window.addEventListener('cogochi:analyze-context', onAnalyzeContext);
    return () => window.removeEventListener('cogochi:analyze-context', onAnalyzeContext);
  });
  const wide = $derived($shellStore.aiWide);
  const drawerOpen = $derived($shellStore.tabs.find(t => t.id === $shellStore.activeTabId)?.tabState.drawerOpen ?? false);

  // ── Chat state ────────────────────────────────────────────────────────────
  interface ScanItem { symbol: string; direction?: string; alpha?: number; setup?: string; }
  interface ToolWidget { name: string; items?: ScanItem[]; drawn?: number; raw?: unknown; }
  interface Message {
    role: 'user' | 'assistant';
    text: string;
    streaming?: boolean;
    widgets?: ToolWidget[];
    modelId?: string;
    pipelineId?: string;
    routeProfileId?: string;
  }
  let messages = $state<Message[]>([]);
  let input = $state('');
  let busy = $state(false);

  function sessionKey(sym: string, tf: string) {
    return `ai_session_v1_${sym}_${tf}`;
  }
  function saveSession(sym: string, tf: string, msgs: Message[]) {
    try { localStorage.setItem(sessionKey(sym, tf), JSON.stringify(msgs)); } catch { /* ignore */ }
  }
  function loadSession(sym: string, tf: string): Message[] {
    try {
      const raw = localStorage.getItem(sessionKey(sym, tf));
      return raw ? (JSON.parse(raw) as Message[]).map(m => ({ ...m, streaming: false })) : [];
    } catch { return []; }
  }
  let scrollEl = $state<HTMLDivElement | null>(null);
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  // ── Model selector ────────────────────────────────────────────────────────
  let models = $state<ModelOption[]>(DEFAULT_MODELS);
  let routeProfiles = $state<RouteProfileOption[]>(DEFAULT_ROUTE_PROFILES);
  let selectedRouteProfileId = $state(DEFAULT_ROUTE_PROFILE_ID);
  let selectedModel = $state(DEFAULT_MODELS[0]?.id ?? 'openai/gpt-oss-120b');
  let manualModelOverride = $state(false);
  let pipelineLabels = $state<Record<string, string>>(DEFAULT_PIPELINE_LABELS);
  const predictedPipelineId = $derived(guessPipelineId(input) as PipelineId);
  const activeRouteProfile = $derived(findRouteProfile(routeProfiles, selectedRouteProfileId));
  const resolvedModelId = $derived(
    manualModelOverride
      ? selectedModel
      : resolveModelForProfile(activeRouteProfile, predictedPipelineId, selectedModel),
  );
  const resolvedModelOption = $derived(findModelOption(models, resolvedModelId));
  const activeRouteSummary = $derived(routeSummary(activeRouteProfile, models));

  onMount(async () => {
    if (terminalPanelCache.aiCatalog) {
      const cached = terminalPanelCache.aiCatalog;
      models = cached.models as ModelOption[];
      routeProfiles = cached.route_profiles as RouteProfileOption[];
      selectedRouteProfileId = cached.default_route_profile_id ?? DEFAULT_ROUTE_PROFILE_ID;
      pipelineLabels = cached.pipeline_labels ?? DEFAULT_PIPELINE_LABELS;
      return;
    }
    if (!terminalPanelCache.aiCatalogPromise) {
      terminalPanelCache.aiCatalogPromise = (async () => {
        try {
          const res = await fetch('/api/terminal/agent/models');
          if (!res.ok) return null;
          const data = await res.json() as Partial<CachedModelCatalog>;
          if (!data.models?.length) return null;
          const nextCatalog: CachedModelCatalog = {
            models: data.models,
            route_profiles: data.route_profiles ?? [],
            default_route_profile_id: data.default_route_profile_id,
            pipeline_labels: data.pipeline_labels,
          };
          terminalPanelCache.aiCatalog = nextCatalog;
          return nextCatalog;
        } catch {
          return null;
        }
      })();
    }
    try {
      const nextCatalog = await terminalPanelCache.aiCatalogPromise;
      if (nextCatalog?.models?.length) {
        models = nextCatalog.models as ModelOption[];
        routeProfiles = (nextCatalog.route_profiles?.length ? nextCatalog.route_profiles : DEFAULT_ROUTE_PROFILES) as RouteProfileOption[];
        selectedRouteProfileId = nextCatalog.default_route_profile_id ?? DEFAULT_ROUTE_PROFILE_ID;
        pipelineLabels = nextCatalog.pipeline_labels ?? DEFAULT_PIPELINE_LABELS;
      }
    } catch { /* use defaults */ }
    messages = loadSession(activeSymbol, activeTimeframe);
  });

  // Swap session when symbol or timeframe changes after initial sync
  let _prevSessionKey = $state('');
  $effect(() => {
    const key = sessionKey(activeSymbol, activeTimeframe);
    if (_prevSessionKey && _prevSessionKey !== key) {
      messages = loadSession(activeSymbol, activeTimeframe);
    }
    _prevSessionKey = key;
  });

  // ── Send ─────────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    input = '';
    busy = true;
    messages = [...messages, { role: 'user', text }];
    messages = [...messages, { role: 'assistant', text: '', streaming: true }];
    scrollToBottom();

    // ── W-0500: TV link detection — short-circuits LLM ───────────────────
    const tvHit = tvUrlDetect(text);
    if (tvHit) {
      try {
        const r = await fetch('/api/agent/tv-fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tvHit.url }),
        });
        const j = await r.json();
        let assistantText: string;
        if (r.ok) {
          assistantText = `<directive type="tv_fit_card" payload=${JSON.stringify(j)}/>`;
        } else if (r.status === 429) {
          assistantText = j?.error ?? '오늘 한도 3회를 모두 사용했어요.';
        } else if (r.status === 503) {
          assistantText = 'TV 링크 분석 기능이 잠시 비활성화되어 있습니다.';
        } else if (r.status === 400) {
          assistantText = `이 TV 링크는 분석할 수 없어요: ${j?.detail ?? '잘못된 URL'}`;
        } else {
          assistantText = `TV 링크 분석 실패 (HTTP ${r.status}). 잠시 후 다시 시도해 주세요.`;
        }
        messages = messages.map((m, i) =>
          i === messages.length - 1 ? { ...m, text: assistantText, streaming: false } : m
        );
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        messages = messages.map((m, i) =>
          i === messages.length - 1 ? { ...m, text: `TV 링크 처리 중 오류: ${err}`, streaming: false } : m
        );
      } finally {
        busy = false;
        scrollToBottom();
      }
      return;
    }

    try {
      const res = await fetch('/api/terminal/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          symbol: activeSymbol,
          timeframe: activeTimeframe,
          model: resolvedModelId,
          history: messages
            .slice(0, -2)
            .filter(m => !m.streaming && m.text)
            .slice(-40)
            .map(m => ({ role: m.role, content: m.text })),
        }),
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
              const d = JSON.parse(line.slice(6)) as {
                text?: string;
                name?: string;
                data?: unknown;
                preview?: string;
                model_id?: string;
                pipeline_id?: string;
              };

              if (lastEvent === 'chunk' && d.text) {
                messages = messages.map((m, i) =>
                  i === messages.length - 1 ? { ...m, text: m.text + d.text } : m
                );
                scrollToBottom();

              } else if (lastEvent === 'tool_call' && d.name) {
                messages = messages.map((m, i) =>
                  i === messages.length - 1
                    ? { ...m, text: m.text + `\n[⟳ ${d.name}]` }
                    : m
                );

              } else if (lastEvent === 'tool_result' && d.name) {
                const toolName = d.name;

                if (toolName === 'draw_command' && d.data) {
                  const payload = d.data as { shapes?: unknown[] };
                  const count = payload.shapes?.length ?? 0;
                  window.dispatchEvent(new CustomEvent('wtd:ai:draw', { detail: payload }));
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    const text = m.text.replace(`[⟳ ${toolName}]`, `[✓ 차트 ${count}개]`);
                    return { ...m, text };
                  });

                } else if ((toolName === 'scan' || toolName === 'alpha_scan' || toolName === 'screener') && d.data) {
                  const raw = d.data as { results?: unknown[] };
                  const items: ScanItem[] = (raw.results ?? []).slice(0, 12).map((r: unknown) => {
                    const x = r as Record<string, unknown>;
                    return {
                      symbol:    String(x['symbol'] ?? x['ticker'] ?? ''),
                      direction: x['direction'] != null ? String(x['direction']) : undefined,
                      alpha:     typeof x['alpha'] === 'number' ? x['alpha'] : typeof x['alpha_score'] === 'number' ? x['alpha_score'] : undefined,
                      setup:     x['setup'] != null ? String(x['setup']) : undefined,
                    };
                  });
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    const text = m.text.replace(`[⟳ ${toolName}]`, `[✓ ${items.length}개]`);
                    const widgets: ToolWidget[] = [...(m.widgets ?? []), { name: toolName, items }];
                    return { ...m, text, widgets };
                  });

                } else if (toolName === 'save' && d.data) {
                  const result = d.data as { ok?: boolean; card_id?: string; error?: string };
                  const label = result.error ? `저장 실패: ${result.error}` : `패턴 저장됨${result.card_id ? ` · ${String(result.card_id).slice(0, 8)}` : ''}`;
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    return { ...m, text: m.text.replace(`[⟳ ${toolName}]`, `[✓ ${label}]`) };
                  });
                } else if (toolName === 'submit_verdict' && d.data) {
                  const result = d.data as { ok?: boolean; verdict?: string; error?: string };
                  const label = result.error ? `버딕트 실패` : `버딕트 기록됨 · ${result.verdict ?? ''}`;
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    return { ...m, text: m.text.replace(`[⟳ ${toolName}]`, `[✓ ${label}]`) };
                  });
                } else if (toolName === 'watch_pattern' && d.data) {
                  const result = d.data as { ok?: boolean; symbol?: string; pattern_slug?: string; error?: string };
                  const label = result.error ? `워치 실패` : `워치 추가됨 · ${result.symbol ?? ''}`;
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    return { ...m, text: m.text.replace(`[⟳ ${toolName}]`, `[✓ ${label}]`) };
                  });
                } else if (toolName === 'memory_feedback' && d.data) {
                  const result = d.data as { recorded?: boolean; verdict?: string };
                  const label = result.recorded ? `피드백 기록됨 · ${result.verdict ?? ''}` : `피드백 실패`;
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    return { ...m, text: m.text.replace(`[⟳ ${toolName}]`, `[✓ ${label}]`) };
                  });
                } else {
                  const preview = d.preview ? String(d.preview).slice(0, 80) : '완료';
                  messages = messages.map((m, i) => {
                    if (i !== messages.length - 1) return m;
                    const text = m.text.replace(`[⟳ ${toolName}]`, `[✓ ${preview}]`);
                    return { ...m, text };
                  });
                }
                scrollToBottom();
              } else if (lastEvent === 'done') {
                messages = messages.map((m, i) =>
                  i === messages.length - 1
                    ? {
                        ...m,
                        modelId: typeof d.model_id === 'string' ? d.model_id : resolvedModelId,
                        pipelineId: typeof d.pipeline_id === 'string' ? d.pipeline_id : predictedPipelineId,
                        routeProfileId: selectedRouteProfileId,
                      }
                    : m
                );
              }
            } catch { /* skip malformed */ }
            lastEvent = '';
          }
        }
      }
    } catch (err) {
      messages = messages.map((m, i) =>
        i === messages.length - 1 ? { ...m, text: `⚠ ${String(err)}`, streaming: false } : m
      );
    } finally {
      messages = messages.map((m, i) =>
        i === messages.length - 1 ? { ...m, streaming: false } : m
      );
      busy = false;
      scrollToBottom();
      saveSession(activeSymbol, activeTimeframe, messages);
    }
  }

  function scrollToBottom() {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  function quickPick(q: string) { input = q; void send(); }

  // ── Persona-aware intent chips (W-0541 PR4-B) ──────────────────────────────
  const PERSONA_CHIPS: Record<string, string[]> = {
    quant:         ['DSL로 변환해줘', 'OI surge 스캔', '백테스트 결과 요약', '통합 수급 스캔'],
    chart_analyst: ['이 패턴 이름이 뭐야?', '비슷한 사례 보여줘', '지지선 찾아줘', '밈코인 DEX 스캔'],
    discretionary: ['차트 분석해줘', '지지/저항 찾아줘', '현재 센티먼트는?', '통합 수급 스캔'],
    hybrid:        ['차트 분석해줘', 'DSL로 변환해줘', '비슷한 사례 보여줘', '통합 수급 스캔'],
  };
  const PERSONA_PLACEHOLDER: Record<string, string> = {
    quant:         'DSL 조건 입력 또는 질문 — ↵ 전송',
    chart_analyst: '패턴명, 지표 질문 또는 분석 요청 — ↵ 전송',
    discretionary: '무엇이든 물어보세요 — ↵ 전송',
    hybrid:        '무엇이든 물어보세요 — ↵ 전송',
  };
  const intentChips = $derived(PERSONA_CHIPS[$traderProfile.trader_style] ?? PERSONA_CHIPS.discretionary);
  const aiPlaceholder = $derived(PERSONA_PLACEHOLDER[$traderProfile.trader_style] ?? '무엇이든 물어보세요 — ↵ 전송');

  function getSegments(msg: Message): Segment[] {
    if (msg.role === 'user') return [{ kind: 'text', text: msg.text }];
    return parseDirectives(msg.text);
  }

  // ── / shortcut — focus input ──────────────────────────────────────────────
  function onFocusCmd(e: Event) {
    const d = (e as CustomEvent).detail;
    if (d?.id === 'focus_ai_input' || d?.id === 'focus_ai_search') textareaEl?.focus();
  }
  if (typeof window !== 'undefined') window.addEventListener('cogochi:cmd', onFocusCmd);
  onDestroy(() => { if (typeof window !== 'undefined') window.removeEventListener('cogochi:cmd', onFocusCmd); });

  // ── Deeplink: initialDecideId ─────────────────────────────────────────────
  $effect(() => {
    if (initialDecideId) shellStore.openDrawer('decide-full');
  });

  const QUICKS = $derived([
    `${activeSymbol} 지금 어때?`,
    'entry plan 줘봐',
    '비슷한 패턴 있어?',
    '강세 코인 스캔',
    '밈코인 DEX 스캔',
    '통합 수급 스캔',
    '고래 알람 확인',
  ]);
</script>

<div
  class="agent-panel"
  class:agent-panel--page={isPageSurface}
  class:wide
  class:folded
  data-ai-state={folded ? 'folded' : wide ? 'wide' : 'default'}
>
  {#if folded && !isPageSurface}
    <button class="unfold-strip" onclick={() => { folded = false; }} aria-label="Expand AI panel">
      [&lt;]
    </button>

  {:else}
    <div class="panel-top">
      <!-- ── Header ── -->
      <div class="panel-hdr">
        <span class="ai-dot"></span>
        <div class="hdr-copy">
          <span class="hdr-title">{isPageSurface ? `${agentId ?? 'terminal_copilot'} Live Agent` : 'AI Desk'}</span>
          <span class="hdr-meta">{activeSymbol} · {activeTimeframe}</span>
        </div>
        <span class="hdr-spacer"></span>
        {#if busy}<span class="hdr-busy">LIVE</span>{/if}
        {#if !isPageSurface}
          <button class="fold-btn" onclick={() => { folded = true; }} aria-label="Fold AI panel">&gt;</button>
        {/if}
      </div>

      {#if isPageSurface}
        <div class="page-controls">
          <label class="page-control">
            <span>SYMBOL</span>
            <input bind:value={activeSymbol} maxlength="16" spellcheck="false" />
          </label>
          <label class="page-control">
            <span>TIMEFRAME</span>
            <select bind:value={activeTimeframe}>
              {#each TIMEFRAME_OPTIONS as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
        </div>
      {/if}

      {#if aiEnvelope}
        <div class="panel-section-head">
          <span class="section-kicker">STATE</span>
        </div>
        <ContextEnvelopeHeader envelope={aiEnvelope} />
      {/if}

      <!-- ── Model settings (collapsed by default) ── -->
      <div class="model-settings-section">
        <button
          class="model-settings-toggle"
          onclick={() => { modelSettingsOpen = !modelSettingsOpen; }}
          aria-expanded={modelSettingsOpen}
        >
          <span class="ops-toggle-label">MODEL</span>
          <span class="ops-toggle-sym">{manualModelOverride ? 'MANUAL · ' : ''}{resolvedModelOption?.label ?? resolvedModelId}</span>
          <span class="ops-toggle-arrow">{modelSettingsOpen ? '▴' : '▾'}</span>
        </button>
        {#if modelSettingsOpen}
          <div class="model-row">
            <div class="model-copy">
              <span class="model-lbl">ROUTING</span>
              <span class="model-hint">{activeRouteProfile.description}</span>
            </div>
            <select class="model-sel" bind:value={selectedRouteProfileId} disabled={busy || manualModelOverride}>
              {#each routeProfiles as profile}
                <option value={profile.id}>{profile.label}{profile.badge ? ` · ${profile.badge}` : ''}</option>
              {/each}
            </select>
          </div>
          <div class="route-summary-row">
            <span class="route-summary">{activeRouteSummary}</span>
            <button
              class="route-toggle"
              class:route-toggle--active={manualModelOverride}
              type="button"
              onclick={() => { manualModelOverride = !manualModelOverride; }}
              disabled={busy}
            >
              {manualModelOverride ? 'MANUAL' : 'AUTO'}
            </button>
          </div>
          <div class="model-row">
            <div class="model-copy">
              <span class="model-lbl">MODEL</span>
              <span class="model-hint">
                {#if manualModelOverride}
                  direct override for this panel
                {:else}
                  next {pipelineLabel(predictedPipelineId, pipelineLabels)} turn will use {resolvedModelOption?.label ?? resolvedModelId}
                {/if}
              </span>
            </div>
            <select class="model-sel" bind:value={selectedModel} disabled={busy || !manualModelOverride}>
              {#each models as m}
                <option value={m.id}>{m.label}{m.badge ? ` · ${m.badge}` : ''}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>

      <div class="signal-ops-section">
        <button
          class="signal-ops-toggle"
          onclick={() => { signalOpsOpen = !signalOpsOpen; }}
          aria-expanded={signalOpsOpen}
        >
          <span class="ops-toggle-label">MARKET SIGNALS</span>
          <span class="ops-toggle-sym">{activeSymbol} · {activeTimeframe}</span>
          <span class="ops-toggle-arrow">{signalOpsOpen ? '▴' : '▾'}</span>
        </button>
        {#if signalOpsOpen}
          <SignalOpsPanel symbol={activeSymbol} timeframe={activeTimeframe} />
        {/if}
      </div>

      <div class="signal-ops-section">
        <button
          class="signal-ops-toggle"
          onclick={() => { autoTraderOpen = !autoTraderOpen; }}
          aria-expanded={autoTraderOpen}
        >
          <span class="ops-toggle-label">AUTO TRADER</span>
          <span class="ops-toggle-arrow">{autoTraderOpen ? '▴' : '▾'}</span>
        </button>
        {#if autoTraderOpen}
          <AutoTraderPanel />
        {/if}
      </div>
    </div>

    <!-- ── Messages ── -->
    <div class="messages" bind:this={scrollEl}>
      {#if messages.length === 0}
        <div class="welcome">
          {#if contextCard}
            <AnalyzeContextCard data={contextCard} symbol={activeSymbol} timeframe={activeTimeframe} />
          {/if}
          <div class="welcome-card">
            <div class="panel-section-head">
              <span class="section-kicker">ACTION</span>
            </div>
            <div class="welcome-title">Ask for a read, plan, or scan.</div>
            <div class="wl-hint">현재 심볼과 차트 데이터가 자동으로 context에 포함됩니다. 빠른 질문으로 바로 액션 포인트를 찾을 수 있습니다.</div>
            <div class="quick-grid">
              {#each QUICKS as q}
                <button class="wl-pick" onclick={() => quickPick(q)}>
                  <span class="pick-chevron">›</span>{q}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        {#each messages as msg}
          {@const segs = getSegments(msg)}
          <div class="msg msg--{msg.role}">
            {#if msg.role === 'assistant' && (msg.pipelineId || msg.modelId)}
              <div class="msg-meta">
                <span>{msg.routeProfileId ? `${findRouteProfile(routeProfiles, msg.routeProfileId).label} · ` : ''}{msg.pipelineId ? pipelineLabel(msg.pipelineId, pipelineLabels) : 'reply'}</span>
                {#if msg.modelId}
                  <span>{findModelOption(models, msg.modelId)?.label ?? msg.modelId}</span>
                {/if}
              </div>
            {/if}
            {#each segs as seg, si}
              {#if seg.kind === 'text'}
                <span class="msg-text">{seg.text}{#if msg.streaming && si === segs.length - 1}<span class="cursor">▋</span>{/if}</span>
              {:else if seg.directive.type === 'verdict_card'}
                <VerdictCard payload={seg.directive.payload as VerdictCardPayload} {onSelectSymbol} />
              {:else if seg.directive.type === 'signal_card'}
                <SignalCard payload={seg.directive.payload as SignalCardPayload} {onSelectSymbol} />
              {:else if seg.directive.type === 'similarity_card'}
                <SimilarityCard payload={seg.directive.payload as SimilarityCardPayload} />
              {:else if seg.directive.type === 'passport_card'}
                <PassportMiniCard payload={seg.directive.payload as PassportCardPayload} />
              {:else if seg.directive.type === 'tv_fit_card'}
                <TvFitCard payload={seg.directive.payload as TvFitCardPayload} />
              {:else if seg.directive.type === 'dex_card'}
                <DexCard payload={seg.directive.payload as DexCardPayload} onquickpick={quickPick} />
              {:else if seg.directive.type === 'position_verdict_card'}
                <PositionVerdictCard payload={seg.directive.payload as PositionVerdictCardPayload} {onSelectSymbol} />
              {:else if seg.directive.type === 'flow_card'}
                <FlowCard payload={seg.directive.payload as FlowCardPayload} />
              {:else if seg.directive.type === 'alert_card'}
                <AlertCard payload={seg.directive.payload as AlertCardPayload} />
              {/if}
            {/each}
            {#if msg.widgets?.length}
              {#each msg.widgets as w}
                <div class="scan-widget">
                  <div class="scan-widget-hdr">{w.name.toUpperCase()} · {w.items?.length ?? 0}개</div>
                  {#each (w.items ?? []) as item}
                    <button
                      class="scan-row"
                      class:scan-row--long={item.direction === 'long'}
                      class:scan-row--short={item.direction === 'short'}
                      onclick={() => {
                        if (isPageSurface) activeSymbol = item.symbol;
                        onSelectSymbol?.(item.symbol);
                      }}
                    >
                      <span class="scan-sym">{item.symbol}</span>
                      {#if item.alpha != null}<span class="scan-alpha">α{Math.round(item.alpha)}</span>{/if}
                      {#if item.direction}<span class="scan-dir">{item.direction.toUpperCase()}</span>{/if}
                      {#if item.setup}<span class="scan-setup">{item.setup}</span>{/if}
                    </button>
                  {/each}
                </div>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- ── Persona intent chips (W-0541 PR4-B) ── -->
    {#if messages.length === 0}
    <div class="intent-chips">
      {#each intentChips as chip}
        <button class="intent-chip" onclick={() => quickPick(chip)}>{chip}</button>
      {/each}
    </div>
    {/if}

    <!-- ── Input ── -->
    <div class="input-area">
      <div class="panel-section-head panel-section-head--input">
        <span class="section-kicker">PROMPT</span>
      </div>
      <div
        class="input-box"
        role="presentation"
        onclick={() => textareaEl?.focus()}
      >
        <textarea
          bind:this={textareaEl}
          bind:value={input}
          aria-label="AI prompt input"
          placeholder={aiPlaceholder}
          rows={2}
          disabled={busy}
          onkeydown={onKeydown}
          spellcheck="false"
        ></textarea>
        <div class="input-footer">
          <span class="ctx-hint">{activeSymbol} · {activeTimeframe}</span>
          <span class="hdr-spacer"></span>
          <button
            class="send-btn"
            class:active={input.trim().length > 0 && !busy}
            onclick={() => void send()}
            disabled={busy || !input.trim()}
          >{busy ? '…' : '↑'}</button>
        </div>
      </div>
    </div>
  {/if}
</div>

{#if !isPageSurface}
  <!-- Decide drawer (deeplink + Decide mode) -->
  <DrawerSlide
    open={drawerOpen && ($shellStore.tabs.find(t => t.id === $shellStore.activeTabId)?.tabState.drawerKind === 'decide-full') === true}
    title="DECIDE"
    onClose={() => shellStore.closeDrawer()}
  >
    <DecideRightPanel />
  </DrawerSlide>
{/if}

<style>
/* ── Root ── */
.agent-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0)),
    var(--term-surface-1, var(--g1));
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
}
.agent-panel--page {
  min-height: 720px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
}
.agent-panel.folded {
  width: 20px;
  min-width: 20px;
}

.panel-top {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 78%, transparent);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.006)),
    var(--term-surface-0, var(--g0));
  flex-shrink: 0;
}
.page-controls {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 10px;
  padding: 10px 14px 12px;
}
.page-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.page-control span {
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  letter-spacing: 0.08em;
}
.page-control input,
.page-control select {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--term-border, var(--g3));
  background: var(--term-surface-2, var(--g2));
  color: var(--term-text, var(--g7));
  padding: 0 10px;
  font: inherit;
}

/* ── Folded strip ── */
.unfold-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--g5);
  cursor: pointer;
  font-size: var(--ui-text-xs);
  writing-mode: vertical-rl;
  transition: color 0.08s;
}
.unfold-strip:hover { color: var(--g7); }

/* ── Header ── */
.panel-hdr {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  flex-shrink: 0;
}
.ai-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand, #f5a623);
  animation: pulse 2.5s infinite;
  flex-shrink: 0;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
.hdr-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}
.hdr-title {
  font-size: 11px;
  color: var(--term-text-0, var(--g8));
  letter-spacing: 0.06em;
  line-height: 1.1;
}
.hdr-meta {
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hdr-spacer { flex: 1; }
.hdr-busy {
  font-size: 11px;
  color: var(--brand);
  letter-spacing: 0.14em;
  padding: 2px 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
}
.fold-btn {
  width: 18px;
  height: 18px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--term-border, var(--g4));
  border-radius: var(--term-radius-sm, 5px);
  color: var(--term-text-2, var(--g5));
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  transition: color 0.08s, background 0.08s, border-color 0.08s;
}
.fold-btn:hover {
  color: var(--term-text-0, var(--g7));
  background: var(--term-surface-2, var(--g2));
  border-color: var(--term-border, var(--g4));
}

.panel-section-head {
  display: flex;
  align-items: center;
  padding: 0 10px;
  min-height: 20px;
}

.panel-section-head--input {
  padding: 0 0 4px;
  min-height: 0;
}

.section-kicker {
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  letter-spacing: 0.14em;
}

/* ── Model row ── */
.model-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 10px 10px;
  flex-shrink: 0;
}
.model-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 64px;
}
.model-lbl {
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  letter-spacing: 0.12em;
}
.model-hint {
  font-family: var(--fb);
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  line-height: 1.35;
}
.route-summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 10px;
}
.route-summary {
  flex: 1;
  min-width: 0;
  font-family: var(--fb);
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.route-toggle {
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid var(--term-border, var(--g4));
  background: transparent;
  color: var(--term-text-2, var(--g5));
  font-size: 11px;
  letter-spacing: 0.12em;
  cursor: pointer;
}
.route-toggle--active {
  color: var(--term-text-1, var(--g7));
  border-color: color-mix(in srgb, var(--brand) 52%, var(--term-border, var(--g4)));
  background: color-mix(in srgb, var(--brand) 12%, transparent);
}
.model-sel {
  flex: 1;
  min-width: 0;
  height: 26px;
  background: var(--term-surface-2, var(--g2));
  color: var(--term-text-1, var(--g7));
  border: 1px solid var(--term-border, var(--g4));
  border-radius: var(--term-radius-sm, 5px);
  padding: 0 7px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.model-sel:focus { border-color: var(--brand); }
.model-sel:disabled { opacity: 0.5; }

/* ── Model settings toggle ── */
.model-settings-section {
  flex-shrink: 0;
  border-top: 1px solid var(--term-border, var(--g3));
}
.model-settings-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--term-text-2, var(--g5));
  font-size: 11px;
  font-family: inherit;
  text-align: left;
  transition: color 0.12s, background 0.12s;
}
.model-settings-toggle:hover {
  color: var(--term-text-1, var(--g7));
  background: rgba(255,255,255,0.03);
}

/* ── Signal ops toggle ── */
.signal-ops-section {
  flex-shrink: 0;
  border-top: 1px solid var(--term-border, var(--g3));
}
.signal-ops-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--term-text-2, var(--g5));
  font-size: 11px;
  font-family: inherit;
  text-align: left;
  transition: color 0.12s, background 0.12s;
}
.signal-ops-toggle:hover {
  color: var(--term-text-1, var(--g7));
  background: rgba(255,255,255,0.03);
}
.ops-toggle-label {
  letter-spacing: 0.12em;
  flex-shrink: 0;
}
.ops-toggle-sym {
  flex: 1;
  font-size: var(--ui-text-xs, 11px);
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ops-toggle-arrow {
  flex-shrink: 0;
  font-size: var(--ui-text-xs, 11px);
}

/* ── Messages ── */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.msg-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--term-text-3, var(--g4));
}

/* ── Welcome ── */
.welcome { display: flex; flex-direction: column; gap: 8px; padding-top: 2px; }
.welcome-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: var(--term-radius-md, 8px);
  border: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 78%, transparent);
  background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01));
}
.welcome-title {
  font-family: var(--fb);
  font-size: 12px;
  font-weight: 600;
  color: var(--term-text-0, var(--g8));
  line-height: 1.3;
}
.wl-pick {
  text-align: left;
  min-height: 28px;
  padding: 6px 8px;
  background: var(--term-surface-2, var(--g2));
  border: 1px solid var(--term-border, var(--g4));
  border-radius: var(--term-radius-sm, 5px);
  font-size: 11px;
  color: var(--term-text-1, var(--g7));
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s;
}
.wl-pick:hover { background: var(--term-surface-3, var(--g3)); border-color: var(--term-border-strong, var(--g5)); }
.pick-chevron { color: var(--brand); margin-right: 6px; }
.quick-grid {
  display: grid;
  gap: 6px;
}
.wl-hint {
  font-size: 11px;
  color: var(--term-text-2, var(--g4));
  line-height: 1.45;
  font-family: var(--fb);
}

/* ── Message bubbles ── */
.msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 96%;
}
.msg--user {
  align-self: flex-end;
  background: color-mix(in srgb, var(--brand) 10%, var(--term-surface-3, var(--g3)));
  border: 1px solid color-mix(in srgb, var(--brand) 24%, var(--term-border, var(--g4)));
  border-radius: 8px 8px 4px 8px;
  padding: 6px 8px;
}
.msg--assistant {
  align-self: flex-start;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 80%, transparent);
  border-radius: 4px 8px 8px 8px;
  padding: 6px 8px;
}
.msg-text {
  font-size: 11px;
  color: var(--term-text-1, var(--g8));
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
  font-family: var(--fb);
}
.msg--user .msg-text { color: var(--g9); }
.cursor { animation: blink 1s step-end infinite; color: var(--brand); }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Input area ── */
.input-area {
  border-top: 1px solid var(--term-border, var(--g3));
  padding: 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.02)),
    var(--term-surface-0, var(--g0));
  flex-shrink: 0;
}
.input-box {
  background: var(--term-surface-2, var(--g2));
  border: 1px solid var(--term-border, var(--g4));
  border-radius: var(--term-radius-md, 8px);
  padding: 7px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.1s;
}
.input-box:focus-within { border-color: var(--brand); }
textarea {
  background: transparent;
  color: var(--term-text-0, var(--g9));
  font-size: 11px;
  font-family: var(--fb);
  resize: none;
  width: 100%;
  line-height: 1.5;
  border: none;
  outline: none;
}
textarea::placeholder { color: var(--term-text-2, var(--g5)); }
  .intent-chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px 4px; }
  .intent-chip { font-family: 'JetBrains Mono', monospace; font-size: var(--ui-text-xs, 11px); color: var(--g7, #9d9690); background: var(--g2, #131110); border: 1px solid var(--g3, #1c1918); border-radius: 12px; padding: 4px 10px; cursor: pointer; transition: color 0.1s, border-color 0.1s; }
  .intent-chip:hover { color: var(--amb, #f5a623); border-color: var(--amb, #f5a623); }
textarea:disabled { opacity: 0.6; }
.input-footer {
  display: flex;
  align-items: center;
  gap: 4px;
}
.ctx-hint { font-size: 11px; color: var(--term-text-2, var(--g5)); letter-spacing: 0.04em; }
.send-btn {
  min-width: 26px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--term-radius-sm, 5px);
  background: var(--term-surface-3, var(--g3));
  color: var(--term-text-2, var(--g5));
  border: 1px solid var(--term-border, var(--g4));
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s;
}
.send-btn.active {
  background: color-mix(in srgb, var(--brand) 15%, transparent);
  color: var(--brand);
  border-color: color-mix(in srgb, var(--brand) 40%, transparent);
}
.send-btn.active:hover { background: color-mix(in srgb, var(--brand) 25%, transparent); }
.send-btn:disabled { cursor: not-allowed; opacity: 0.6; }

/* ── Scan widget ── */
.scan-widget {
  margin-top: 4px;
  border: 1px solid var(--term-border, var(--g3));
  border-radius: var(--term-radius-md, 8px);
  overflow: hidden;
}
.scan-widget-hdr {
  font-size: 11px;
  color: var(--term-text-2, var(--g5));
  letter-spacing: 0.12em;
  padding: 5px 7px;
  background: var(--term-surface-1, var(--g1));
  border-bottom: 1px solid var(--term-border, var(--g3));
}
.scan-row {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  min-height: 24px;
  padding: 4px 6px;
  background: transparent;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g2)) 72%, transparent);
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-align: left;
  transition: background 0.08s;
}
.scan-row:last-child { border-bottom: none; }
.scan-row:hover { background: var(--term-surface-2, var(--g2)); }
.scan-sym { color: var(--term-text-1, var(--g8)); font-weight: 600; min-width: 58px; }
.scan-alpha { color: var(--brand); font-size: 11px; }
.scan-dir { font-size: 11px; letter-spacing: 0.06em; }
.scan-row--long .scan-dir { color: var(--bull, #26a69a); }
.scan-row--short .scan-dir { color: var(--bear, #ef5350); }
.scan-setup { color: var(--term-text-2, var(--g5)); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 76px; }
</style>
