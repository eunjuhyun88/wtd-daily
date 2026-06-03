<script lang="ts">
  interface Props {
    slug: string | null;
  }

  let { slug }: Props = $props();

  let text = $state<string | null>(null);
  let loading = $state(false);
  let lastSlug = $state<string | null>(null);

  $effect(() => {
    if (!slug || slug === lastSlug) return;
    lastSlug = slug;
    void load(slug);
  });

  async function load(s: string) {
    loading = true;
    text = null;
    try {
      const res = await fetch('/api/agent/explain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: s }),
      });
      if (res.ok) {
        const body = await res.json() as { text: string; latency_ms: number; provider: string };
        text = body.text;
      }
    } catch {
      // graceful: no block on failure
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <div class="explain-block explain-block--loading">
    <span class="dot"></span>
    <span class="dot dot--2"></span>
    <span class="dot dot--3"></span>
    <span class="label">분석 중…</span>
  </div>
{:else if text}
  <div class="explain-block">
    <div class="explain-header">
      <span class="ai-badge">MINARA ✦</span>
      <span class="slug-chip">{slug}</span>
    </div>
    <p class="explain-text">{text}</p>
  </div>
{/if}

<style>
  .explain-block {
    background: rgba(96, 165, 250, 0.05);
    border: 1px solid rgba(96, 165, 250, 0.15);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .explain-block--loading {
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    min-height: 36px;
  }

  .explain-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ai-badge {
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #93c5fd;
    text-transform: uppercase;
  }

  .slug-chip {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.35);
  }

  .explain-text {
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    line-height: 1.55;
    color: rgba(250, 247, 235, 0.75);
    margin: 0;
    white-space: pre-wrap;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #60a5fa;
    animation: pulse 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }
  .dot--2 { animation-delay: 0.2s; }
  .dot--3 { animation-delay: 0.4s; }

  .label {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.3);
    margin-left: 4px;
  }

  @keyframes pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1); }
  }
</style>
