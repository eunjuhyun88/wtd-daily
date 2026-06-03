<script lang="ts">
  import ParamCard from './ParamCard.svelte';
  import { selectedSlug, setParamOverride, clearParamOverrides } from '$lib/stores/patternsHub';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  interface ParamSuggestion {
    paramKey: string;
    label: string;
    default: number | boolean;
    recommended: number | boolean;
    options: Array<{ value: number | boolean; label: string; isRecommended?: boolean }>;
    reason?: string;
  }

  let { slug }: { slug: string | null } = $props();
  let suggestions = $state<ParamSuggestion[]>([]);
  let overrides = $state<Record<string, number | boolean>>({});
  let loading = $state(false);
  let error = $state<string | null>(null);
  let nlInput = $state('');
  let running = $state(false);

  $effect(() => {
    if (!slug) { suggestions = []; overrides = {}; return; }
    void load(slug);
  });

  async function load(s: string) {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/patterns/${encodeURIComponent(s)}/param-suggestions`);
      const body = await res.json();
      suggestions = body.suggestions ?? [];
      overrides = {};
      suggestions.forEach((sg: ParamSuggestion) => {
        overrides[sg.paramKey] = sg.default as number | boolean;
      });
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  function handleSelect(key: string, val: number | boolean) {
    overrides = { ...overrides, [key]: val };
    setParamOverride(key, val);
  }

  function handleClear() {
    suggestions.forEach(sg => {
      overrides[sg.paramKey] = sg.default as number | boolean;
      setParamOverride(sg.paramKey, sg.default as number | boolean);
    });
    overrides = { ...overrides };
    clearParamOverrides();
  }

  async function handleRun() {
    if (!get(selectedSlug)) return;
    running = true;
    // Navigate to Backtest tab so user sees the result context
    await goto('?tab=test');
    running = false;
  }

  async function parseNL() {
    if (!nlInput.trim() || !slug) return;
    try {
      const res = await fetch('/api/agent/parse-param', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: nlInput }),
      });
      if (res.ok) {
        const body = await res.json() as { ok: boolean; paramKey?: string; value?: number };
        if (body.ok && body.paramKey && body.value !== undefined) {
          handleSelect(body.paramKey, body.value);
        }
      }
    } catch {
      // ignore
    }
    nlInput = '';
  }
</script>

{#if !slug}
  <div class="empty">Sidebar에서 패턴을 선택하세요</div>
{:else}
  <div class="tuner">
    <div class="tuner-header">
      <span class="tuner-slug">{slug}</span>
      <span class="tuner-label">파라미터 조정</span>
    </div>

    {#if loading}
      <div class="loading">로딩 중…</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else}
      <div class="cards">
        {#each suggestions as sg (sg.paramKey)}
          <ParamCard
            paramKey={sg.paramKey}
            label={sg.label}
            options={sg.options}
            selected={overrides[sg.paramKey]}
            reason={sg.reason}
            onSelect={(val) => handleSelect(sg.paramKey, val)}
          />
        {/each}
      </div>
    {/if}

    <div class="nl-row">
      <input
        class="nl-input"
        type="text"
        placeholder='예: "RSI를 12로 해줘"'
        bind:value={nlInput}
        onkeydown={(e) => { if (e.key === 'Enter') parseNL(); }}
      />
      <button class="nl-btn" type="button" onclick={parseNL}>↵</button>
    </div>

    <div class="actions">
      <button class="btn-run" type="button" onclick={handleRun} disabled={running}>
        {running ? '실행 중…' : '▶ 백테스트 실행'}
      </button>
      <button class="btn-clear" type="button" onclick={handleClear}>초기화</button>
    </div>
  </div>
{/if}

<style>
  .empty {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.3);
    text-align: center;
    padding: 32px 0;
  }

  .tuner {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }

  .tuner-header {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .tuner-slug {
    font-family: var(--sc-font-mono, monospace);
    font-size: 13px;
    font-weight: 700;
    color: rgba(250, 247, 235, 0.9);
    letter-spacing: 0.02em;
  }

  .tuner-label {
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.35);
  }

  .loading, .error {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.3);
    padding: 12px 0;
  }

  .error { color: rgba(219, 154, 159, 0.8); }

  .cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    overflow-y: auto;
  }

  .nl-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .nl-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 5px 8px;
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.75);
    outline: none;
    transition: border-color 0.15s;
  }

  .nl-input:focus { border-color: rgba(96, 165, 250, 0.4); }

  .nl-btn {
    width: 26px;
    height: 26px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: rgba(250, 247, 235, 0.6);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nl-btn:hover { background: rgba(255, 255, 255, 0.09); }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn-run {
    flex: 1;
    padding: 6px 0;
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    letter-spacing: 0.04em;
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 6px;
    color: #93c5fd;
    cursor: pointer;
    transition: background 0.12s;
  }

  .btn-run:hover:not(:disabled) { background: rgba(96, 165, 250, 0.22); }
  .btn-run:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-clear {
    padding: 6px 14px;
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(250, 247, 235, 0.5);
    cursor: pointer;
    transition: background 0.12s;
  }

  .btn-clear:hover { background: rgba(255, 255, 255, 0.09); }
</style>
