<script lang="ts">
  interface PassportSummary {
    tier: string;
    winRate: number;
    totalLp: number;
    streak: number;
    wins: number;
    losses: number;
  }

  interface Props {
    passport: PassportSummary | null;
    isAuthenticated?: boolean;
    pendingCount?: number;
    watchlistCount?: number;
  }

  const { passport, isAuthenticated = false, pendingCount = 0, watchlistCount = 0 }: Props = $props();

  const totalVerdicts = $derived(passport ? passport.wins + passport.losses : null);
</script>

<div class="hero-tier-card">
  <span class="htc-label">Tier</span>
  {#if passport}
    <div class="htc-body">
      <span class="tier-badge" data-tier={passport.tier.toLowerCase()}>{passport.tier}</span>
    </div>
    <span class="htc-meta">{passport.winRate.toFixed(1)}% win · {passport.totalLp.toLocaleString()} LP</span>
    {#if pendingCount > 0}
      <span class="htc-pending">{pendingCount} pending</span>
    {/if}
    {#if watchlistCount > 0}
      <a href="/cogochi?panel=wl" class="htc-watching">{watchlistCount} watching</a>
    {/if}
  {:else if isAuthenticated}
    <div class="htc-body htc-loading">Loading…</div>
    <span class="htc-meta">{totalVerdicts ?? '—'} verdicts</span>
  {:else}
    <div class="htc-body htc-empty">—</div>
    <span class="htc-meta">Sign in</span>
  {/if}
</div>

<style>
  .hero-tier-card {
    background: var(--surface-1, rgba(255,255,255,0.02));
    border: 1px solid rgba(249,216,194,0.07);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .htc-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,247,235,0.35);
  }
  .htc-body {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .htc-meta {
    font-size: var(--ui-text-xs);
    color: rgba(250,247,235,0.3);
    font-family: 'JetBrains Mono', monospace;
  }
  .htc-loading, .htc-empty {
    font-size: 11px;
    color: rgba(250,247,235,0.25);
    font-style: italic;
  }
  .htc-pending {
    font-size: var(--ui-text-xs);
    color: var(--amb, #f5a623);
    font-family: 'JetBrains Mono', monospace;
  }
  .htc-watching {
    font-size: var(--ui-text-xs);
    color: rgba(250,247,235,0.3);
    font-family: 'JetBrains Mono', monospace;
    text-decoration: none;
  }
  .htc-watching:hover { color: rgba(250,247,235,0.6); }
  .tier-badge {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(249,216,194,0.08);
    color: rgba(249,216,194,0.7);
  }
  .tier-badge[data-tier="gold"]     { background: rgba(255,193,7,0.12);  color: #FFC107; }
  .tier-badge[data-tier="silver"]   { background: rgba(176,196,222,0.12); color: #B0C4DE; }
  .tier-badge[data-tier="platinum"] { background: rgba(147,112,219,0.12); color: #9370DB; }
</style>
