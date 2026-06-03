<script lang="ts">
  import { aiDrawerOpen, aiDrawerContext, continuousFinding } from '$lib/stores/patternsHub';
  import { AIAgentPanel } from '$lib/hubs/terminal';

  // ESC close
  $effect(() => {
    if (!$aiDrawerOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aiDrawerOpen.set(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // 5 tool-call shortcuts (displayed as pill buttons above AI panel)
  type ToolShortcut = { id: string; label: string };
  const TOOLS: ToolShortcut[] = [
    { id: 'find-patterns',  label: 'Find Patterns' },
    { id: 'autorun-status', label: 'AutoRun Status' },
    { id: 'cycle-status',   label: 'Cycle Status' },
    { id: 'market-search',  label: 'Market Search' },
    { id: 'save-to-watch',  label: 'Save to Watch' },
  ];

  function runTool(id: string) {
    aiDrawerContext.update(c => ({ ...c, toolHint: id }));
  }

  // Continuous mode cost gate display
  const cf = $derived($continuousFinding);
  const todayPct = $derived(cf.today_cap > 0 ? Math.min((cf.today_count / cf.today_cap) * 100, 100) : 0);
  const monthPct = $derived(cf.month_cap_usd > 0 ? Math.min((cf.month_cost_usd / cf.month_cap_usd) * 100, 100) : 0);
  const costGateBlocked = $derived(cf.today_count >= cf.today_cap || cf.month_cost_usd >= cf.month_cap_usd);

  function toggleContinuous() {
    if (costGateBlocked && !cf.enabled) return;
    continuousFinding.update(s => ({ ...s, enabled: !s.enabled }));
  }
</script>

<!-- Backdrop -->
{#if $aiDrawerOpen}
  <div class="ai-backdrop" role="presentation" onclick={() => aiDrawerOpen.set(false)}></div>
{/if}

<!-- Drawer -->
<div class="ai-drawer" class:open={$aiDrawerOpen} aria-label="AI Pattern Assistant">
  <!-- Header -->
  <div class="ai-header">
    <span class="ai-title">AI ✦ Patterns</span>
    <div class="ai-header-actions">
      <!-- Continuous mode toggle -->
      <button
        type="button"
        class="cont-toggle"
        class:active={cf.enabled}
        class:blocked={costGateBlocked && !cf.enabled}
        onclick={toggleContinuous}
        title={costGateBlocked ? '일일 한도 또는 월 $20 한도 초과' : cf.enabled ? 'Continuous 중지' : 'Continuous 시작'}
        aria-label="Continuous mode 토글"
      >
        {cf.enabled ? '⏸ Continuous' : '▶ Continuous'}
      </button>
      <button type="button" class="ai-close" onclick={() => aiDrawerOpen.set(false)} aria-label="닫기">✕</button>
    </div>
  </div>

  <!-- Cost gate bar -->
  {#if cf.enabled || cf.today_count > 0}
    <div class="cost-bar-wrap">
      <div class="cost-bar-row">
        <span class="cost-label mono">오늘</span>
        <div class="cost-bar-track">
          <div class="cost-bar-fill" style="width:{todayPct}%" class:warn={todayPct > 80}></div>
        </div>
        <span class="cost-val mono">{cf.today_count}/{cf.today_cap}</span>
      </div>
      <div class="cost-bar-row">
        <span class="cost-label mono">월</span>
        <div class="cost-bar-track">
          <div class="cost-bar-fill" style="width:{monthPct}%" class:warn={monthPct > 80}></div>
        </div>
        <span class="cost-val mono">${cf.month_cost_usd.toFixed(2)}/${cf.month_cap_usd}</span>
      </div>
    </div>
  {/if}

  <!-- Tool shortcuts -->
  <div class="tool-pills">
    {#each TOOLS as t (t.id)}
      <button type="button" class="tool-pill mono" onclick={() => runTool(t.id)}>{t.label}</button>
    {/each}
  </div>

  <!-- AI Panel -->
  <div class="ai-body">
    {#if $aiDrawerOpen}
      <AIAgentPanel
        symbol={$aiDrawerContext.slug ?? 'BTCUSDT'}
        timeframe="4h"
        onSelectSymbol={() => {}}
      />
    {/if}
  </div>
</div>

<style>
  .ai-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 450;
  }
  .ai-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    background: #0d1117;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 451;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 250ms ease-out;
    overflow: hidden;
  }
  .ai-drawer.open { transform: translateX(0); }

  .ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
    gap: 8px;
  }
  .ai-title {
    font-size: var(--ui-text-sm, 13px);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.85);
    flex: 1;
  }
  .ai-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-close {
    background: none;
    border: none;
    color: rgba(250, 247, 235, 0.45);
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
    flex-shrink: 0;
  }
  .ai-close:hover { color: rgba(250, 247, 235, 0.85); }

  .cont-toggle {
    padding: 4px 10px;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    color: rgba(250, 247, 235, 0.65);
    cursor: pointer;
  }
  .cont-toggle.active {
    background: rgba(109, 214, 168, 0.12);
    border-color: rgba(109, 214, 168, 0.4);
    color: #6dd6a8;
  }
  .cont-toggle.blocked { opacity: 0.4; cursor: not-allowed; }

  .cost-bar-wrap {
    padding: 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cost-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cost-label {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.4);
    width: 24px;
    flex-shrink: 0;
  }
  .cost-bar-track {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }
  .cost-bar-fill {
    height: 100%;
    background: rgba(109, 214, 168, 0.6);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .cost-bar-fill.warn { background: rgba(251, 191, 36, 0.7); }
  .cost-val {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.5);
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
  }

  .tool-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
  }
  .tool-pill {
    padding: 3px 9px;
    font-size: 11px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(250, 247, 235, 0.6);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .tool-pill:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(250, 247, 235, 0.9);
  }

  .ai-body {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .mono { font-family: var(--sc-font-mono, monospace); }

  @media (max-width: 480px) {
    .ai-drawer { width: 100%; border-left: none; }
  }
</style>
