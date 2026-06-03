<script lang="ts">
  import { onMount } from 'svelte';

  interface PatternRow { slug: string; label: string; symbol?: string; }
  interface ScreenerRow { id: string; name: string; dsl: string; is_active: boolean; }

  interface Props {
    activeSymbol?: string;
    onSelectSymbol?: (symbol: string) => void;
    onOpenSignal?: () => void;
  }

  let { activeSymbol = 'BTCUSDT', onSelectSymbol, onOpenSignal }: Props = $props();

  let patterns = $state<PatternRow[]>([]);
  let screeners = $state<ScreenerRow[]>([]);
  let patternsLoading = $state(true);
  let screenersLoading = $state(true);

  onMount(() => {
    fetch('/api/patterns/terminal')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        patterns = (d?.patterns ?? [])
          .slice(0, 12)
          .map((p: { slug?: string; label?: string; symbol?: string }) => ({
            slug: p.slug ?? '',
            label: p.label ?? p.slug ?? '',
            symbol: p.symbol,
          }))
          .filter((p: PatternRow) => p.slug.length > 0);
      })
      .catch(() => {})
      .finally(() => { patternsLoading = false; });

    fetch('/api/engine/user-screener')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        screeners = (Array.isArray(d) ? d : []).filter((s: ScreenerRow) => s.is_active).slice(0, 10);
      })
      .catch(() => {})
      .finally(() => { screenersLoading = false; });
  });
</script>

<div class="lp-wrap">
  <!-- My Patterns -->
  <div class="lp-section-hd">
    <span class="lp-section-label">MY PATTERNS</span>
    {#if !patternsLoading}<span class="lp-count">{patterns.length}</span>{/if}
  </div>

  {#if patternsLoading}
    <div class="lp-empty">loading…</div>
  {:else if patterns.length === 0}
    <div class="lp-empty lp-empty--hint">저장된 패턴 없음</div>
  {:else}
    <ul class="lp-list">
      {#each patterns as p (p.slug)}
        <li>
          <button
            type="button"
            class="lp-row"
            onclick={() => onSelectSymbol?.(p.symbol ?? activeSymbol)}
            title={p.slug}
          >
            <span class="lp-dot"></span>
            <span class="lp-label">{p.label}</span>
            {#if p.symbol}<span class="lp-sym">{p.symbol.replace('USDT','')}</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Active Screeners -->
  <div class="lp-section-hd">
    <span class="lp-section-label">ACTIVE SCREENERS</span>
    {#if !screenersLoading}<span class="lp-count">{screeners.length}</span>{/if}
    <button class="lp-add-btn" onclick={() => onOpenSignal?.()} title="스크리너 빌더 열기">+</button>
  </div>

  {#if screenersLoading}
    <div class="lp-empty">loading…</div>
  {:else if screeners.length === 0}
    <div class="lp-empty lp-empty--hint">
      <span>활성 스크리너 없음</span>
      <button class="lp-text-btn" onclick={() => onOpenSignal?.()}>+ 새로 만들기</button>
    </div>
  {:else}
    <ul class="lp-list">
      {#each screeners as sc (sc.id)}
        <li>
          <button
            type="button"
            class="lp-row"
            onclick={() => onOpenSignal?.()}
            title={sc.dsl}
          >
            <span class="lp-active-dot"></span>
            <span class="lp-label">{sc.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Open builder CTA -->
  <div class="lp-cta-wrap">
    <button class="lp-cta-btn" onclick={() => onOpenSignal?.()}>
      스크리너 빌더 열기 →
    </button>
  </div>
</div>

<style>
  .lp-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    background: var(--term-surface-0, var(--g0));
  }

  .lp-section-hd {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--term-surface-0, var(--g0));
    border-bottom: 1px solid var(--term-border, var(--g4));
    position: sticky;
    top: 0;
    z-index: 1;
    flex-shrink: 0;
    min-height: 20px;
  }
  .lp-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--term-text-2, #404060);
    flex: 1;
  }
  .lp-count {
    font-size: 11px;
    color: var(--term-text-2, #404060);
  }
  .lp-add-btn {
    background: none;
    border: none;
    color: var(--brand, #5b5bd6);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
  }

  .lp-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .lp-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 26px;
    padding: 4px 8px;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 70%, transparent);
    font-family: inherit;
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s, color 0.1s;
  }
  .lp-row:hover {
    background: var(--term-surface-1, var(--g2));
    color: var(--term-text-0, #e0e0f0);
  }

  .lp-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--brand, #5b5bd6);
    flex-shrink: 0;
  }
  .lp-active-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #22AB94;
    flex-shrink: 0;
  }
  .lp-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lp-sym {
    font-size: 11px;
    color: var(--term-text-2, #404060);
    flex-shrink: 0;
  }

  .lp-empty {
    padding: 6px 10px;
    font-size: 11px;
    color: var(--term-text-2, #404060);
    letter-spacing: 0.04em;
  }
  .lp-empty--hint {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .lp-text-btn {
    background: none;
    border: none;
    color: var(--brand, #5b5bd6);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    text-align: left;
    letter-spacing: 0.04em;
  }

  .lp-cta-wrap {
    margin-top: auto;
    padding: 8px;
    border-top: 1px solid var(--term-border, var(--g3));
    flex-shrink: 0;
  }
  .lp-cta-btn {
    width: 100%;
    padding: 5px 0;
    background: var(--term-surface-1, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    color: var(--term-text-2, #404060);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .lp-cta-btn:hover {
    border-color: var(--brand, #5b5bd6);
    color: var(--brand, #5b5bd6);
  }
</style>
