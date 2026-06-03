<script lang="ts">
  // W-0478 + W-0480 — InboxPanel: Right Rail single surface for cycle axis 3.
  // Section 1: ALERTS (W-0478) — live signals/alerts ingestion
  // Section 2-4: VerdictInboxPanel (Watch Hits / Review / Recent) — inherited from peek/
  import AlertInbox from './AlertInbox.svelte';
  import { alerts, alertCount } from './inboxStore';
  import VerdictInboxPanel from '../peek/VerdictInboxPanel.svelte';
</script>

<div class="inbox-panel">
  <header class="section-header">
    <span class="title">ALERTS</span>
    {#if $alertCount > 0}<span class="badge">{$alertCount}</span>{/if}
  </header>
  <AlertInbox alerts={$alerts} />

  <div class="section-divider"></div>

  <div class="verdict-host">
    <VerdictInboxPanel />
  </div>
</div>

<style>
  .inbox-panel {
    height: 100%;
    overflow-y: auto;
    padding: 10px 10px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.7);
    padding: 0 4px 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }
  .title { letter-spacing: 0.08em; font-weight: 600; }
  .badge {
    background: rgba(126, 212, 173, 0.18);
    border: 1px solid rgba(126, 212, 173, 0.4);
    color: #7ed4ad;
    padding: 1px 6px;
    border-radius: 8px;
    font-size: var(--ui-text-xs, 11px);
    line-height: 1.4;
  }
  .section-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: 4px -10px 0;
    flex-shrink: 0;
  }
  .verdict-host {
    flex: 1;
    min-height: 320px;
    margin: 0 -10px;
    display: flex;
    flex-direction: column;
  }
</style>
