<script lang="ts">
  import { onMount, tick } from 'svelte';
  import ScanResultPanel, { type ScanHit } from './panels/ScanResultPanel.svelte';
  import { routeQuery } from '$lib/hubs/terminal/aiQueryRouter';
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
    type ModelCatalogResponse,
    type ModelOption,
    type PipelineId,
    type RouteProfileOption,
  } from './modelRouting';

  interface Props {
    agentId: string;
  }

  interface ToolTrace {
    name: string;
    status: 'running' | 'done';
    preview?: string;
  }

  interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    streaming?: boolean;
    error?: string;
    toolTraces?: ToolTrace[];
    latencyMs?: number;
    tokens?: number;
    modelId?: string;
    pipelineId?: string;
    routeProfileId?: string;
  }

  const { agentId }: Props = $props();

  const TIMEFRAME_OPTIONS = ['15m', '1h', '4h', '1d'] as const;
  const QUICK_PROMPTS = [
    '지금 시장에서 가장 중요한 리스크를 요약해줘',
    'BTCUSDT 기준으로 지금 기다릴지 볼지 판단해줘',
    '최근 비슷한 상황에서 내가 주의해야 할 패턴을 알려줘',
    '지금 뭐 살 수 있어? 스캔해줘',
  ] as const;

  let models = $state<ModelOption[]>(DEFAULT_MODELS);
  let routeProfiles = $state<RouteProfileOption[]>(DEFAULT_ROUTE_PROFILES);
  let selectedRouteProfileId = $state(DEFAULT_ROUTE_PROFILE_ID);
  let selectedModel = $state(DEFAULT_MODELS[0]?.id ?? 'openai/gpt-oss-120b');
  let manualModelOverride = $state(false);
  let pipelineLabels = $state<Record<string, string>>(DEFAULT_PIPELINE_LABELS);
  let symbol = $state('BTCUSDT');
  let timeframe = $state<(typeof TIMEFRAME_OPTIONS)[number]>('4h');
  let input = $state('');
  let busy = $state(false);
  let messages = $state<ChatMessage[]>([]);
  let scrollEl = $state<HTMLDivElement | null>(null);
  let scanHits = $state<ScanHit[]>([]);
  let scanLoading = $state(false);
  let scanError = $state<string | undefined>(undefined);

  const canSend = $derived(input.trim().length > 0 && !busy);
  const predictedPipelineId = $derived(guessPipelineId(input) as PipelineId);
  const activeRouteProfile = $derived(findRouteProfile(routeProfiles, selectedRouteProfileId));
  const resolvedModelId = $derived(
    manualModelOverride
      ? selectedModel
      : resolveModelForProfile(activeRouteProfile, predictedPipelineId, selectedModel),
  );
  const resolvedModelOption = $derived(findModelOption(models, resolvedModelId));
  const activeRouteSummary = $derived(routeSummary(activeRouteProfile, models));

  onMount(() => {
    if (messages.length === 0) {
      messages = [
        {
          role: 'assistant',
          text: `${agentId} 에이전트와 바로 대화할 수 있어요. 심볼과 타임프레임을 정한 뒤 질문을 보내면 실시간으로 응답합니다.`,
        },
      ];
    }
    void loadModels();
  });

  $effect(() => {
    messages;
    void tick().then(() => {
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  });

  async function loadModels(): Promise<void> {
    try {
      const res = await fetch('/api/terminal/agent/models');
      if (!res.ok) return;
      const data = (await res.json()) as ModelCatalogResponse;
      if (data.models?.length) {
        models = data.models;
        if (!data.models.some((model) => model.id === selectedModel)) {
          selectedModel = data.models[0].id;
        }
      }
      if (data.route_profiles?.length) routeProfiles = data.route_profiles;
      selectedRouteProfileId = data.default_route_profile_id ?? DEFAULT_ROUTE_PROFILE_ID;
      pipelineLabels = data.pipeline_labels ?? DEFAULT_PIPELINE_LABELS;
    } catch {
      // Keep defaults when the model list endpoint is unavailable.
    }
  }

  function setQuickPrompt(prompt: string): void {
    input = prompt;
  }

  function appendToLastAssistant(
    updater: (message: ChatMessage) => ChatMessage,
  ): void {
    const idx = messages.length - 1;
    messages = messages.map((message, i) => (
      i === idx ? updater(message) : message
    ));
  }

  function markToolRunning(name: string): void {
    appendToLastAssistant((message) => ({
      ...message,
      toolTraces: [...(message.toolTraces ?? []), { name, status: 'running' }],
    }));
  }

  function markToolDone(name: string, preview?: string): void {
    appendToLastAssistant((message) => ({
      ...message,
      toolTraces: (message.toolTraces ?? []).map((trace) => (
        trace.name === name && trace.status === 'running'
          ? { ...trace, status: 'done', preview: preview ?? trace.preview }
          : trace
      )),
    }));
  }

  async function send(): Promise<void> {
    const text = input.trim();
    if (!text || busy) return;

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-12)
      .map((message) => ({ role: message.role, content: message.text }));

    input = '';
    busy = true;

    // Detect market-scan intent before adding to chat
    const action = routeQuery(text);
    if (action?.type === 'market-scan') {
      scanLoading = true;
      scanError = undefined;
      scanHits = [];
      messages = [...messages, { role: 'user', text }];
      try {
        const scanRes = await fetch('/api/agent/scan/universe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe: action.timeframe ?? '1h', top_n: 10 }),
        });
        if (!scanRes.ok) throw new Error(`scan failed: ${scanRes.status}`);
        const scanData = (await scanRes.json()) as { hits: ScanHit[] };
        scanHits = scanData.hits;
      } catch {
        scanError = 'Failed to scan';
      } finally {
        scanLoading = false;
        busy = false;
      }
      return;
    }

    messages = [
      ...messages,
      { role: 'user', text },
      { role: 'assistant', text: '', streaming: true, toolTraces: [] },
    ];

    try {
      const res = await fetch('/api/terminal/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          symbol,
          timeframe,
          model: resolvedModelId,
          history,
        }),
      });

      if (!res.ok || !res.body) {
        const fallback = `요청 실패 (${res.status})`;
        appendToLastAssistant((message) => ({
          ...message,
          text: fallback,
          streaming: false,
          error: fallback,
        }));
        busy = false;
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
            continue;
          }

          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (eventType === 'chunk' && typeof data.text === 'string') {
              appendToLastAssistant((message) => ({
                ...message,
                text: message.text + data.text,
              }));
            } else if (eventType === 'tool_call' && typeof data.name === 'string') {
              markToolRunning(data.name);
            } else if (eventType === 'tool_result' && typeof data.name === 'string') {
              markToolDone(
                data.name,
                typeof data.preview === 'string' ? data.preview : undefined,
              );
            } else if (eventType === 'done') {
              appendToLastAssistant((message) => ({
                ...message,
                streaming: false,
                latencyMs: typeof data.latency_ms === 'number' ? data.latency_ms : undefined,
                tokens: typeof data.tokens === 'number' ? data.tokens : undefined,
                modelId: typeof data.model_id === 'string' ? data.model_id : resolvedModelId,
                pipelineId: typeof data.pipeline_id === 'string' ? data.pipeline_id : predictedPipelineId,
                routeProfileId: selectedRouteProfileId,
              }));
            }
          } catch {
            // Skip malformed SSE frames without breaking the session.
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '연결 오류';
      appendToLastAssistant((assistantMessage) => ({
        ...assistantMessage,
        text: assistantMessage.text || '연결 오류가 발생했습니다.',
        streaming: false,
        error: message,
      }));
    } finally {
      appendToLastAssistant((assistantMessage) => ({
        ...assistantMessage,
        streaming: false,
      }));
      busy = false;
    }
  }

  function handleComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }
</script>

<section class="agent-chat-card" aria-label={`${agentId} live chat`}>
  <div class="chat-header">
    <div>
      <span class="chat-kicker">Live Agent</span>
      <h2>{agentId}와 직접 대화</h2>
    </div>
    <p class="chat-note">실시간 엔진 SSE에 바로 연결됩니다.</p>
  </div>

  <div class="chat-controls">
    <label class="control">
      <span>Symbol</span>
      <input bind:value={symbol} maxlength="16" spellcheck="false" />
    </label>
    <label class="control">
      <span>Timeframe</span>
      <select bind:value={timeframe}>
        {#each TIMEFRAME_OPTIONS as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    <label class="control control--wide">
      <span>Routing</span>
      <select bind:value={selectedRouteProfileId} disabled={manualModelOverride}>
        {#each routeProfiles as profile}
          <option value={profile.id}>
            {profile.label}{profile.badge ? ` · ${profile.badge}` : ''}
          </option>
        {/each}
      </select>
    </label>
    <label class="control control--wide">
      <span>Model</span>
      <select bind:value={selectedModel} disabled={!manualModelOverride}>
        {#each models as model}
          <option value={model.id}>
            {model.label}{model.badge ? ` · ${model.badge}` : ''}
          </option>
        {/each}
      </select>
    </label>
  </div>

  <div class="routing-note">
    <span>{activeRouteSummary}</span>
    <button type="button" class="manual-toggle" class:manual-toggle--active={manualModelOverride} onclick={() => { manualModelOverride = !manualModelOverride; }}>
      {manualModelOverride ? 'Manual model' : `Auto ${pipelineLabel(predictedPipelineId, pipelineLabels)} -> ${resolvedModelOption?.label ?? resolvedModelId}`}
    </button>
  </div>

  <div class="quick-prompts">
    {#each QUICK_PROMPTS as prompt}
      <button type="button" class="quick-prompt" onclick={() => setQuickPrompt(prompt)}>
        {prompt}
      </button>
    {/each}
  </div>

  <div class="chat-scroll" bind:this={scrollEl}>
    {#each messages as message}
      <article class:message class:message--assistant={message.role === 'assistant'} class:message--user={message.role === 'user'}>
        <div class="message-meta">
          <span>{message.role === 'assistant' ? agentId : 'You'}</span>
          {#if message.role === 'assistant' && (message.pipelineId || message.modelId)}
            <span>{message.routeProfileId ? `${findRouteProfile(routeProfiles, message.routeProfileId).label} · ` : ''}{message.pipelineId ? pipelineLabel(message.pipelineId, pipelineLabels) : 'reply'}{message.modelId ? ` · ${findModelOption(models, message.modelId)?.label ?? message.modelId}` : ''}</span>
          {/if}
        </div>
        <div class="message-body">
          <p>{message.text}{#if message.streaming}<span class="cursor">▍</span>{/if}</p>

          {#if message.toolTraces?.length}
            <div class="tool-traces">
              {#each message.toolTraces as trace}
                <div class="tool-trace" class:tool-trace--done={trace.status === 'done'}>
                  <span>{trace.status === 'done' ? '✓' : '…'}</span>
                  <span>{trace.name}</span>
                  {#if trace.preview}
                    <span class="tool-preview">{trace.preview}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          {#if message.error}
            <div class="message-error">{message.error}</div>
          {/if}

          {#if message.role === 'assistant' && !message.streaming && (message.latencyMs || message.tokens)}
            <div class="message-stats">
              {#if message.latencyMs}<span>{message.latencyMs}ms</span>{/if}
              {#if message.tokens}<span>{message.tokens} tokens</span>{/if}
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if scanHits.length > 0 || scanLoading}
    <ScanResultPanel hits={scanHits} loading={scanLoading} error={scanError} />
  {/if}

  <div class="composer">
    <textarea
      bind:value={input}
      rows="3"
      placeholder={`${agentId}에게 물어보세요`}
      onkeydown={handleComposerKeydown}
    ></textarea>
    <button type="button" class="send-button" onclick={() => void send()} disabled={!canSend}>
      {busy ? 'Streaming…' : 'Send'}
    </button>
  </div>
</section>

<style>
  .agent-chat-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background:
      radial-gradient(circle at top right, rgba(245, 166, 35, 0.08), transparent 32%),
      rgba(255, 255, 255, 0.02);
    font-family: 'JetBrains Mono', monospace;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .chat-kicker {
    display: inline-block;
    margin-bottom: 8px;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.92);
  }

  .chat-note {
    margin: 0;
    max-width: 220px;
    font-size: 0.72rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.45);
    text-align: right;
  }

  .chat-controls {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .control--wide {
    min-width: 0;
  }

  .control span {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.3);
  }

  .control input,
  .control select,
  .composer textarea {
    width: 100%;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.9);
    font: inherit;
    box-sizing: border-box;
  }

  .control input,
  .control select {
    height: 40px;
    padding: 0 12px;
  }

  .routing-note {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.48);
  }

  .manual-toggle {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.72);
    font: inherit;
    font-size: 0.7rem;
    padding: 8px 12px;
    cursor: pointer;
  }

  .manual-toggle--active {
    border-color: rgba(245, 166, 35, 0.24);
    background: rgba(245, 166, 35, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .quick-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .quick-prompt {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.72);
    font: inherit;
    font-size: 0.72rem;
    padding: 8px 12px;
    cursor: pointer;
  }

  .chat-scroll {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 460px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .message--user {
    align-items: flex-end;
  }

  .message-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.34);
  }

  .message-body {
    max-width: min(100%, 620px);
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .message--user .message-body {
    background: rgba(245, 166, 35, 0.1);
    border-color: rgba(245, 166, 35, 0.18);
  }

  .message-body p {
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.6;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.88);
  }

  .cursor {
    margin-left: 2px;
    opacity: 0.85;
  }

  .tool-traces {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }

  .tool-trace {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.55);
  }

  .tool-trace--done {
    color: rgba(245, 166, 35, 0.82);
  }

  .tool-preview {
    color: rgba(255, 255, 255, 0.38);
  }

  .message-error,
  .message-stats {
    margin-top: 10px;
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.42);
  }

  .composer {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .composer textarea {
    min-height: 88px;
    resize: vertical;
    padding: 12px 14px;
    line-height: 1.55;
  }

  .send-button {
    align-self: flex-end;
    min-width: 120px;
    height: 42px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(245, 166, 35, 0.95), rgba(255, 196, 87, 0.95));
    color: #131313;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .send-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    .agent-chat-card {
      padding: 18px;
    }

    .chat-header,
    .chat-controls {
      grid-template-columns: 1fr;
      display: grid;
    }

    .chat-note {
      max-width: none;
      text-align: left;
    }

    .send-button {
      width: 100%;
      align-self: stretch;
    }
  }
</style>
