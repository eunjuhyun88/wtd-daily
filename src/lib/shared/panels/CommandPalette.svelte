<script lang="ts">
  import { onMount } from 'svelte';
  import { INDICATOR_REGISTRY } from '$lib/indicators/registry';
  import { shellStore } from '$lib/hubs/terminal';
  import { track } from '$lib/analytics';
  import { isVex, type MissionPhase } from '$lib/vex';

  const vexMode = isVex();

  interface Command {
    id: string;
    label: string;
    hint: string;
    section: string;
  }

  interface Props {
    q: string;
    onClose: () => void;
    onChange: (q: string) => void;
  }

  const { q, onClose, onChange }: Props = $props();

  const baseCommands: Command[] = [
    { id: 'open_indicator_settings', label: '⚙ Manage indicators', hint: '', section: 'indicators' },
    { id: 'new_tab', label: 'New tab', hint: '⌘T', section: 'view' },
    { id: 'toggle_side', label: 'Toggle sidebar', hint: '⌘B', section: 'view' },
    { id: 'toggle_ai', label: 'Toggle AI panel', hint: '⌘L', section: 'view' },
    // Mode
    { id: 'mode_trade', label: 'Switch to TRADE mode', hint: '', section: 'mode' },
    { id: 'mode_train', label: 'Switch to TRAIN mode', hint: '', section: 'mode' },
    { id: 'mode_fly', label: 'Switch to FLYWHEEL', hint: '', section: 'mode' },
    // TF shortcuts
    { id: 'tf_1m', label: 'Timeframe → 1m', hint: '1', section: 'tf' },
    { id: 'tf_5m', label: 'Timeframe → 5m', hint: '3', section: 'tf' },
    { id: 'tf_15m', label: 'Timeframe → 15m', hint: '4', section: 'tf' },
    { id: 'tf_1h', label: 'Timeframe → 1h', hint: '6', section: 'tf' },
    { id: 'tf_4h', label: 'Timeframe → 4h', hint: '7', section: 'tf' },
    { id: 'tf_1D', label: 'Timeframe → 1D', hint: '8', section: 'tf' },
    // Session
    { id: 'new_trade', label: 'New TRADE session', hint: '', section: 'session' },
    { id: 'reset', label: 'Reset all state', hint: '', section: 'system' },
  ];

  // Auto-generate toggle commands from the registry
  const indicatorCommands: Command[] = Object.values(INDICATOR_REGISTRY).map(def => ({
    id: `toggle_indicator:${def.id}`,
    label: `Toggle ${def.label ?? def.id}`,
    hint: def.family,
    section: 'indicators',
  }));

  const commands = [...baseCommands, ...indicatorCommands];

  // ── VEX 명령어 ────────────────────────────────────────────────────────────
  let vexMission   = $state<MissionPhase>('IDLE');
  let vexApprovalId = $state<string | undefined>(undefined);

  onMount(() => {
    if (!vexMode) return;
    window.vex!.getMissionState().then(s => {
      vexMission    = s.phase;
      vexApprovalId = s.pending_approval?.approval_id;
    });
    return window.vex!.onMissionStateChange(s => {
      vexMission    = s.phase;
      vexApprovalId = s.pending_approval?.approval_id;
    });
  });

  const vexCommands = $derived.by(() => {
    if (!vexMode) return [] as Command[];
    const proposed = vexMission === 'PROPOSED' && !!vexApprovalId;
    return [
      ...(proposed ? [
        { id: 'vex_approve', label: '✓ Approve trade',        hint: 'Y', section: 'vex' },
        { id: 'vex_reject',  label: '✕ Reject trade',         hint: 'N', section: 'vex' },
      ] : []),
      { id: 'vex_kill',             label: '■ Kill switch',          hint: '', section: 'vex' },
      { id: 'vex_trust_human',      label: 'Trust zone → HUMAN',     hint: '', section: 'vex' },
      { id: 'vex_trust_copilot',    label: 'Trust zone → CO-PILOT',  hint: '', section: 'vex' },
      { id: 'vex_trust_agent',      label: 'Trust zone → AGENT',     hint: '', section: 'vex' },
    ] satisfies Command[];
  });

  const allCommands = $derived([...vexCommands, ...commands]);

  const filtered = $derived(
    q
      ? allCommands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
      : allCommands
  );

  async function handleVexCommand(id: string) {
    if (!window.vex) return;
    if      (id === 'vex_approve'         && vexApprovalId) await window.vex.approve(vexApprovalId);
    else if (id === 'vex_reject'          && vexApprovalId) await window.vex.reject(vexApprovalId);
    else if (id === 'vex_kill')                             await window.vex.kill();
    else if (id === 'vex_trust_human')                      await window.vex.setTrustZone('HUMAN');
    else if (id === 'vex_trust_copilot')                    await window.vex.setTrustZone('CO-PILOT');
    else if (id === 'vex_trust_agent')                      await window.vex.setTrustZone('AGENT');
  }

  function onRun(c: Command) {
    track('cmdpalette_action', { command_id: c.id, section: c.section });
    if (c.id.startsWith('vex_')) {
      handleVexCommand(c.id);
      onClose();
      return;
    }
    if (c.id.startsWith('toggle_indicator:')) {
      const indicatorId = c.id.slice('toggle_indicator:'.length);
      shellStore.toggleIndicatorVisible(indicatorId);
      onClose();
      return;
    }
    if (c.id.startsWith('tf_')) {
      const tf = c.id.slice('tf_'.length);
      shellStore.setTimeframe(tf);
      onClose();
      return;
    }
    window.dispatchEvent(new CustomEvent('cogochi:cmd', { detail: c }));
    onClose();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && filtered[0]) {
      onRun(filtered[0]);
    }
  }
</script>

<button type="button" class="overlay" onclick={onClose} aria-label="Close command palette"></button>
<div class="palette">
  <div class="header">
    <input
      type="text"
      value={q}
      placeholder="/ command or search…"
      onchange={(e) => onChange((e.target as HTMLInputElement).value)}
      onkeydown={onKeyDown}
      oninput={(e) => onChange((e.target as HTMLInputElement).value)}
    />
  </div>
  <div class="list">
    {#each filtered as c, i (c.id)}
      <button
        type="button"
        class="item"
        class:item-vex={c.section === 'vex'}
        onclick={() => onRun(c)}
        onmouseenter={(e) => e.currentTarget.style.background = 'var(--g2)'}
        onmouseleave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span class="section" class:section-vex={c.section === 'vex'}>{c.section}</span>
        <span class="label">{c.label}</span>
        {#if c.hint}
          <span class="hint">{c.hint}</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    border: none;
    padding: 0;
    z-index: 80;
  }

  .palette {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 520px;
    background: var(--g1);
    border: 0.5px solid var(--g4);
    border-radius: 6px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
    z-index: 90;
    overflow: hidden;
  }

  .header {
    padding: 12px 14px;
    border-bottom: 0.5px solid var(--g3);
  }

  .header input {
    background: transparent;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: var(--g9);
    width: 100%;
  }

  .header input::placeholder {
    color: var(--g5);
  }

  .list {
    max-height: 400px;
    overflow: auto;
  }

  .item {
    padding: 9px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    border-bottom: 0.5px solid var(--g3);
    transition: background 0.1s;
  }

  .item:last-child {
    border-bottom: none;
  }

  .section {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    color: var(--g5);
    letter-spacing: 0.14em;
    width: 60px;
    text-transform: uppercase;
  }

  .label {
    flex: 1;
    font-size: 11px;
    color: var(--g8);
  }

  .hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    color: var(--g5);
    padding: 2px 6px;
    background: var(--g2);
    border: 0.5px solid var(--g4);
    border-radius: 2px;
    letter-spacing: 0.08em;
  }

  /* ── VEX 명령어 ─────────────────────────────────────────── */
  .section-vex {
    color: var(--amb);
  }

  .item-vex {
    border-left: 2px solid rgba(242, 209, 147, 0.3);
  }

  .item-vex:hover {
    background: rgba(242, 209, 147, 0.04) !important;
  }
</style>
