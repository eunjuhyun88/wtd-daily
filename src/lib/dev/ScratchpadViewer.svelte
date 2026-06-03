<!--
  W-0494: Agent Scratchpad Viewer (devtools panel).

  Renders the JSONL trail captured by engine/observability/scratchpad.py for
  one conversation turn. Pass `runId` from the parent — the agent SSE stream
  emits `event: run_id` once at the start of every turn.
-->
<script lang="ts">
  interface ScratchpadCall {
    ts: string;
    kind: 'call';
    run_id: string;
    tool_use_id: string;
    tool_name: string;
    tool_input: Record<string, unknown>;
    user_id: string | null;
    parent_id: string | null;
  }

  interface ScratchpadResult {
    ts: string;
    kind: 'result';
    run_id: string;
    tool_use_id: string;
    content: string;
    latency_ms: number;
    is_error: boolean;
  }

  type Entry = ScratchpadCall | ScratchpadResult;

  interface Props {
    runId: string | null;
    pollMs?: number;
  }

  const { runId, pollMs = 2000 }: Props = $props();

  let entries = $state<Entry[]>([]);
  let loading = $state(false);
  let errorMsg = $state<string | null>(null);

  $effect(() => {
    if (!runId) {
      entries = [];
      return;
    }
    let cancelled = false;
    const controller = new AbortController();

    async function tick() {
      if (cancelled) return;
      loading = true;
      try {
        const res = await fetch(`/api/agent/scratchpad/${runId}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          errorMsg = `${res.status} ${res.statusText}`;
        } else {
          const data = await res.json() as { entries: Entry[] };
          entries = data.entries ?? [];
          errorMsg = null;
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          errorMsg = (err as Error).message;
        }
      } finally {
        loading = false;
      }
    }

    void tick();
    const handle = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(handle);
    };
  });

  const pairs = $derived.by(() => {
    const calls = new Map<string, ScratchpadCall>();
    const results = new Map<string, ScratchpadResult>();
    for (const e of entries) {
      if (e.kind === 'call') calls.set(e.tool_use_id, e);
      else results.set(e.tool_use_id, e);
    }
    return Array.from(calls.values())
      .sort((a, b) => a.ts.localeCompare(b.ts))
      .map((call) => ({ call, result: results.get(call.tool_use_id) ?? null }));
  });
</script>

<aside class="scratchpad">
  <header>
    <span class="title">Agent Scratchpad</span>
    {#if runId}
      <code class="run">{runId.slice(0, 8)}…</code>
    {/if}
    {#if loading}<span class="dot">●</span>{/if}
  </header>

  {#if !runId}
    <p class="hint">Waiting for agent run…</p>
  {:else if errorMsg}
    <p class="error">{errorMsg}</p>
  {:else if pairs.length === 0}
    <p class="hint">No tool calls yet.</p>
  {:else}
    <ol>
      {#each pairs as { call, result } (call.tool_use_id)}
        <li class:errored={result?.is_error}>
          <div class="row">
            <span class="tool">{call.tool_name}</span>
            {#if result}
              <span class="latency">{result.latency_ms} ms</span>
            {:else}
              <span class="latency pending">running…</span>
            {/if}
          </div>
          <pre class="input">{JSON.stringify(call.tool_input, null, 2)}</pre>
          {#if result}
            <pre class="output" class:err={result.is_error}>{result.content}</pre>
          {/if}
        </li>
      {/each}
    </ol>
  {/if}
</aside>

<style>
  .scratchpad {
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
    background: #0c0e12;
    color: #cdd6f4;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 8px 10px;
    max-width: 480px;
    max-height: 70vh;
    overflow: auto;
  }
  header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 4px;
  }
  .title {
    font-weight: 600;
    color: #f5e0dc;
  }
  .run {
    color: #94a3b8;
    font-size: 11px;
  }
  .dot {
    color: #facc15;
    font-size: 11px;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .hint, .error {
    color: #94a3b8;
    margin: 4px 0;
  }
  .error {
    color: #f87171;
  }
  ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    border-left: 2px solid #334155;
    padding: 4px 0 4px 8px;
    margin-bottom: 6px;
  }
  li.errored {
    border-left-color: #f87171;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .tool {
    color: #93c5fd;
    font-weight: 600;
  }
  .latency {
    color: #94a3b8;
    font-size: 11px;
  }
  .latency.pending {
    color: #facc15;
  }
  pre {
    margin: 2px 0 0 0;
    padding: 4px 6px;
    background: #11141a;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
    color: #e2e8f0;
    font-size: 11px;
  }
  pre.output.err {
    color: #fca5a5;
  }
</style>
