<script lang="ts">
  import type { Tab, WorkspaceStageMode } from './shell.store';
  import { chartIndicators, toggleIndicator, type IndicatorKey } from '$lib/stores/chartIndicators';

  type PanelType = 'fr' | 'oi' | 'cvd' | 'liq';

  const PANEL_TO_INDICATOR: Record<PanelType, IndicatorKey> = {
    fr: 'funding',
    oi: 'oi',
    cvd: 'cvd',
    liq: 'liq',
  };

  interface Props {
    tabs: Tab[];
    activeTabId: string;
    setActiveTabId: (id: string) => void;
    onCloseTab: (id: string) => void;
    onNewTab: () => void;
    sidebarVisible: boolean;
    toggleSidebar: () => void;
    workspaceMode: WorkspaceStageMode;
    workspacePaneIds: [string | null, string | null, string | null, string | null];
    workspaceImmersivePaneId: string | null;
    onToggleCompare: (id: string) => void;
    onExpandPane: (id: string) => void;
    onSetWorkspaceMode: (mode: WorkspaceStageMode) => void;
    onResetWorkspaceStage: () => void;
    onIndicators?: () => void;
    onReorderTabs?: (fromId: string, toId: string) => void;
    activePanels?: PanelType[];
    onActivePanelsChange?: (panels: PanelType[]) => void;
  }

  const {
    tabs,
    activeTabId,
    setActiveTabId,
    onCloseTab,
    onNewTab,
    sidebarVisible,
    toggleSidebar,
    workspaceMode,
    workspacePaneIds,
    workspaceImmersivePaneId,
    onToggleCompare,
    onExpandPane,
    onSetWorkspaceMode,
    onResetWorkspaceStage,
    onIndicators,
    onReorderTabs,
    activePanels = ['fr', 'oi'],
    onActivePanelsChange,
  }: Props = $props();

  const PANELS: Array<{ id: PanelType; label: string }> = [
    { id: 'fr',  label: 'FR' },
    { id: 'oi',  label: 'OI' },
    { id: 'cvd', label: 'CVD' },
    { id: 'liq', label: 'LIQ' },
  ];

  function togglePanel(p: PanelType) {
    const next = activePanels.includes(p)
      ? activePanels.filter(x => x !== p)
      : [...activePanels, p];
    onActivePanelsChange?.(next);
    // Also flip the underlying chartIndicators store so ChartBoard's native
    // multi-pane mount/destroy actually reacts to the click.
    toggleIndicator(PANEL_TO_INDICATOR[p]);
  }

  // Reflect chartIndicators store back into the active-panel button state so
  // toggles done elsewhere (IndicatorLibrary, pane × button) keep these in sync.
  $effect(() => {
    const ind = $chartIndicators;
    const next: PanelType[] = [];
    if (ind.funding) next.push('fr');
    if (ind.oi) next.push('oi');
    if (ind.cvd) next.push('cvd');
    if (ind.liq) next.push('liq');
    const same = next.length === activePanels.length && next.every((x) => activePanels.includes(x));
    if (!same) onActivePanelsChange?.(next);
  });

  // ── Tab drag-to-reorder ────────────────────────────────────────────────────
  let dragFromId = $state<string | null>(null);
  let dragOverId = $state<string | null>(null);

  function onDragStart(e: DragEvent, id: string) {
    dragFromId = id;
    e.dataTransfer?.setData('text/plain', id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: DragEvent, id: string) {
    if (!dragFromId || dragFromId === id) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverId = id;
  }

  function onDrop(e: DragEvent, toId: string) {
    e.preventDefault();
    if (dragFromId && dragFromId !== toId) onReorderTabs?.(dragFromId, toId);
    dragFromId = null;
    dragOverId = null;
  }

  function onDragEnd() {
    dragFromId = null;
    dragOverId = null;
  }

  function tabColor(kind: string): string {
    if (kind === 'trade') return 'var(--brand)';
    if (kind === 'train') return 'var(--amb)';
    if (kind === 'flywheel') return '#7aa2e0';
    return 'var(--g6)';
  }

  function tabSymbol(tab: Tab): string {
    const sym = tab.tabState?.symbol ?? 'BTC';
    return sym.replace(/USDT$/, '');
  }

  function tabTF(tab: Tab): string {
    return tab.tabState?.timeframe ?? '4h';
  }

  function paneSlot(id: string): number {
    return workspacePaneIds.findIndex(p => p === id);
  }

  function isInPane(id: string): boolean {
    return paneSlot(id) >= 0;
  }

  function paneCount(): number {
    return workspacePaneIds.filter(Boolean).length;
  }

  function paneLabel(slot: number): string {
    if (workspaceImmersivePaneId) return 'focus';
    if (slot === 0) return 'A';
    if (slot === 1) return 'B';
    if (slot === 2) return 'C';
    return 'D';
  }

  function paneColor(slot: number): string {
    if (slot === 0) return 'var(--brand)';
    if (slot === 1) return 'var(--amb)';
    if (slot === 2) return '#8bb0ff';
    return '#a0d080';
  }

  const LAYOUT_MODES: Array<{ id: WorkspaceStageMode; label: string; title: string }> = [
    { id: 'single', label: '▣', title: 'Single pane' },
    { id: 'split-2', label: '◫', title: 'Two-up compare' },
    { id: 'grid-4', label: '⊞', title: 'Four-up compare' },
  ];
</script>

<div class="tab-bar">
  <!-- Sidebar toggle -->
  <button class="sidebar-toggle" title="Toggle sidebar (⌘B)" onclick={toggleSidebar}>
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
      <rect x="0" y="0" width="5" height="10" rx="1" fill={sidebarVisible ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1" opacity={sidebarVisible ? '0.7' : '0.4'} />
      <rect x="7" y="0" width="7" height="2" rx="0.5" fill="currentColor" opacity={sidebarVisible ? '0.5' : '0.35'} />
      <rect x="7" y="4" width="7" height="2" rx="0.5" fill="currentColor" opacity={sidebarVisible ? '0.5' : '0.35'} />
      <rect x="7" y="8" width="7" height="2" rx="0.5" fill="currentColor" opacity={sidebarVisible ? '0.5' : '0.35'} />
    </svg>
  </button>

  <!-- Tabs -->
  <div class="tabs-scroll">
    {#each tabs as t (t.id)}
      {@const slot = paneSlot(t.id)}
      {@const inPane = slot >= 0}
      {@const isActive = t.id === activeTabId}
      {@const isFocused = workspaceImmersivePaneId === t.id}
      <div
        class="tab"
        class:active={isActive}
        class:in-pane={inPane && paneCount() > 1}
        class:immersive={isFocused}
        class:drag-over={dragOverId === t.id}
        style:--tab-color={tabColor(t.kind)}
        style:--pane-color={inPane ? paneColor(slot) : 'transparent'}
        role="button"
        tabindex="0"
        draggable={onReorderTabs != null}
        onclick={() => setActiveTabId(t.id)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTabId(t.id); } }}
        ondragstart={(e) => onDragStart(e, t.id)}
        ondragover={(e) => onDragOver(e, t.id)}
        ondrop={(e) => onDrop(e, t.id)}
        ondragend={onDragEnd}
        aria-pressed={isActive}
        title="{t.title} · {tabSymbol(t)} · {tabTF(t)}"
      >
        {#if inPane && paneCount() > 1}
          <span class="pane-badge" style:background={paneColor(slot)} title="Pane {paneLabel(slot)}">{paneLabel(slot)}</span>
        {/if}
        <span class="tab-symbol">{tabSymbol(t)}</span>
        <span class="tab-tf" class:tab-tf-active={isActive}>{tabTF(t)}</span>
        <span class="tab-title">{t.title}</span>

        <div class="tab-actions">
          {#if paneCount() > 1 || workspaceMode !== 'single'}
            <button
              class="tab-act tab-act--compare"
              class:in-pane={inPane}
              type="button"
              title={inPane ? 'Remove from compare' : 'Add to compare'}
              onclick={(e) => { e.stopPropagation(); onToggleCompare(t.id); }}
              aria-label={inPane ? 'Remove from compare' : 'Add to compare'}
            >{inPane ? '−' : '⊕'}</button>
          {/if}
          {#if !t.locked}
            <button
              class="tab-act tab-act--close"
              type="button"
              title="Close tab"
              onclick={(e) => { e.stopPropagation(); onCloseTab(t.id); }}
              aria-label="Close tab"
            >×</button>
          {/if}
        </div>
      </div>
    {/each}

    <button class="new-tab-btn" onclick={onNewTab} title="New tab (⌘T)">+</button>
  </div>

  <!-- Spacer -->
  <div class="tab-bar-spacer"></div>

  <!-- Sub-panel toggles -->
  <div class="tab-bar-sep"></div>
  <div class="panel-toggle-group" role="group" aria-label="Sub-panels">
    {#each PANELS as p}
      <button
        class="panel-toggle-btn"
        class:active={activePanels.includes(p.id)}
        type="button"
        title="Toggle {p.label} panel"
        onclick={() => togglePanel(p.id)}
        aria-pressed={activePanels.includes(p.id)}
      >{p.label}</button>
    {/each}
  </div>

  {#if onIndicators}
    <div class="tab-bar-sep"></div>
    <button
      class="ind-tab-btn"
      type="button"
      title="Indicator settings"
      onclick={onIndicators}
      aria-label="Indicator settings"
    >⚙</button>
  {/if}
</div>

<style>
  .tab-bar {
    height: var(--term-tabbar-h, 22px);
    display: flex;
    align-items: stretch;
    background: var(--term-surface-0, var(--g0));
    border-bottom: 1px solid var(--term-border, color-mix(in srgb, var(--g5) 28%, transparent));
    flex-shrink: 0;
    user-select: none;
  }

  /* Sidebar toggle */
  .sidebar-toggle {
    width: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-right: 1px solid var(--term-border, color-mix(in srgb, var(--g5) 18%, transparent));
    cursor: pointer;
    color: var(--g6);
    transition: color 0.12s;
  }
  .sidebar-toggle:hover { color: var(--g8); }

  /* Tabs scroll area */
  .tabs-scroll {
    display: flex;
    align-items: stretch;
    overflow: auto hidden;
    scrollbar-width: none;
    flex: 0 1 auto;
    min-width: 0;
  }
  .tabs-scroll::-webkit-scrollbar { display: none; }

  /* Single tab */
  .tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 0 5px 0 7px;
    min-width: 90px;
    max-width: 172px;
    cursor: pointer;
    border-right: 1px solid var(--term-border, color-mix(in srgb, var(--g5) 16%, transparent));
    border-top: 1.5px solid transparent;
    transition: background 0.12s, border-top-color 0.12s;
    outline: none;
  }

  .tab:hover { background: color-mix(in srgb, var(--g2) 60%, transparent); }

  .tab.active {
    background: var(--g1);
    border-top-color: var(--tab-color);
  }

  .tab.in-pane { border-bottom: 1.5px solid var(--pane-color); }

  .tab.drag-over {
    border-left: 2px solid var(--brand);
    background: color-mix(in srgb, var(--brand) 6%, transparent);
  }

  .tab.immersive {
    border-top-color: var(--brand);
    border-bottom-color: var(--brand);
    background: color-mix(in srgb, var(--brand) 8%, transparent);
  }

  /* Pane badge (A/B/C/D) */
  .pane-badge {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0;
    color: #000;
    opacity: 0.9;
  }

  .tab-symbol {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--g8);
    flex-shrink: 0;
  }

  /* TF badge — same visual language as ChartToolbar .tf-chip:
     mono font, ALLCAPS short labels, brand color when active so the user
     sees one consistent TF treatment across tab list and toolbar strip. */
  .tab-tf {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--g5);
    padding: 0 3px;
    border: 1px solid transparent;
    border-radius: 3px;
    flex-shrink: 0;
    line-height: 1.4;
  }
  .tab.active .tab-tf {
    color: var(--brand, #4a9eff);
    border-color: color-mix(in srgb, var(--brand, #4a9eff) 30%, transparent);
    background: color-mix(in srgb, var(--brand, #4a9eff) 8%, transparent);
  }

  .tab-title {
    font-size: var(--ui-text-xs);
    color: var(--g6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .tab.active .tab-symbol { color: var(--g9); }
  .tab.active .tab-title { color: var(--g7); }

  /* Tab action buttons */
  .tab-actions {
    display: flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .tab:hover .tab-actions,
  .tab.active .tab-actions { opacity: 1; }

  .tab-act {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background: transparent;
    border: none;
    font-size: var(--ui-text-xs);
    cursor: pointer;
    color: var(--g5);
    transition: color 0.1s, background 0.1s;
    line-height: 1;
    padding: 0;
  }

  .tab-act:hover { color: var(--g9); background: color-mix(in srgb, var(--g4) 40%, transparent); }

  .tab-act--compare.in-pane { color: var(--pane-color); }
  .tab-act--close:hover { color: var(--neg); }

  /* New tab */
  .new-tab-btn {
    width: 20px;
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: var(--g5);
    font-size: 11px;
    cursor: pointer;
    transition: color 0.12s;
    align-self: center;
  }
  .new-tab-btn:hover { color: var(--g8); }

  /* Spacer */
  .tab-bar-spacer { flex: 1; }

  /* Sep */
  .tab-bar-sep {
    width: 1px;
    align-self: stretch;
    margin: 4px 2px;
    background: var(--term-border, color-mix(in srgb, var(--g5) 20%, transparent));
    flex-shrink: 0;
  }

  /* Sub-panel toggle group */
  .panel-toggle-group {
    display: flex;
    align-items: center;
    gap: 1px;
    padding: 0 2px;
    flex-shrink: 0;
  }

  .panel-toggle-btn {
    padding: 0 5px;
    height: 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--g5);
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s;
    flex-shrink: 0;
  }

  .panel-toggle-btn:hover { color: var(--g8); }

  .panel-toggle-btn.active {
    color: var(--brand);
    border-bottom-color: var(--brand);
  }

  /* INDICATORS button (right side) */
  .ind-tab-btn {
    width: 20px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--g5);
    font-size: 11px;
    cursor: pointer;
    transition: color 0.12s, background 0.12s;
    flex-shrink: 0;
  }
  .ind-tab-btn:hover {
    color: var(--g8);
    background: color-mix(in srgb, var(--g3) 50%, transparent);
  }
  @media (max-width: 900px) {
    .ind-tab-btn { display: none; }
  }
</style>
