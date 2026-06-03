<script lang="ts">
  type Tone = 'pos' | 'neg' | 'neu';

  let {
    showSignIn = false,
    onSignIn,
    regimeChip,
    confluenceScore,
    biggestMover,
    nearestEvent,
    fmtPct,
    fmtPrice
  }: {
    showSignIn?: boolean;
    onSignIn: () => void;
    regimeChip: { label: string; tone: Tone };
    confluenceScore?: number | null;
    biggestMover: { symbol: string; label: string; changePct: number | null; price: number | null } | null;
    nearestEvent: { label: string; daysUntil: number; href: string } | null;
    fmtPct: (value: number | null | undefined) => string;
    fmtPrice: (value: number | null | undefined) => string;
  } = $props();
</script>

<header class="hdr">
  <div class="hdr-row">
    <p class="hdr-tagline">Crypto · KR/US · macro · onchain — one-page pulse.</p>
    <div class="hdr-actions">
      {#if showSignIn}
        <button type="button" class="btn btn-ghost" onclick={onSignIn}>Sign in</button>
      {/if}
      <a href="/cogochi" class="btn btn-primary">Open Terminal →</a>
    </div>
  </div>
</header>

<section class="hero-signals" aria-label="Today's three signals">
  <a href="#briefing" class="hs-chip hs-{regimeChip.tone}">
    <span class="hs-eyebrow">REGIME</span>
    <span class="hs-value">{regimeChip.label}</span>
    {#if confluenceScore != null}
      <span class="hs-meta">{(confluenceScore * 100).toFixed(0)} pts</span>
    {/if}
  </a>

  {#if biggestMover}
    <a href="/cogochi?symbol={biggestMover.symbol}" class="hs-chip hs-{(biggestMover.changePct ?? 0) >= 0 ? 'pos' : 'neg'}">
      <span class="hs-eyebrow">BIGGEST MOVE</span>
      <span class="hs-value">{biggestMover.label} {fmtPct(biggestMover.changePct)}</span>
      <span class="hs-meta">${fmtPrice(biggestMover.price)}</span>
    </a>
  {:else}
    <div class="hs-chip hs-neu hs-empty">
      <span class="hs-eyebrow">BIGGEST MOVE</span>
      <span class="hs-value">—</span>
    </div>
  {/if}

  {#if nearestEvent}
    <a href={nearestEvent.href} class="hs-chip hs-event">
      <span class="hs-eyebrow">NEXT EVENT</span>
      <span class="hs-value">{nearestEvent.label}</span>
      {#if nearestEvent.daysUntil <= 1}
        <span class="hs-meta hs-imminent">imminent</span>
      {/if}
    </a>
  {:else}
    <div class="hs-chip hs-neu hs-empty">
      <span class="hs-eyebrow">NEXT EVENT</span>
      <span class="hs-value">—</span>
    </div>
  {/if}
</section>

<style>
  .hdr { padding: 10px 0 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(249, 216, 194, 0.10); }
  .hdr-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
  .hdr-tagline {
    font-size: 12px;
    color: rgba(250, 247, 235, 0.42);
    margin: 0;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }
  .hdr-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 999px;
    border: 1px solid transparent;
    text-decoration: none;
    transition: opacity 0.15s, background 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    box-sizing: border-box;
  }
  .btn-ghost { color: rgba(250, 247, 235, 0.92); border-color: rgba(249, 216, 194, 0.18); }
  .btn-ghost:hover { background: rgba(249, 216, 194, 0.06); border-color: #f9d8c2; }
  .btn-primary {
    background: #faf7eb;
    color: #0a0807;
    border-color: #faf7eb;
  }
  .btn-primary:hover { background: #f9d8c2; border-color: #f9d8c2; }

  .hero-signals {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 0 clamp(12px, 3vw, 24px) 14px;
  }
  .hs-chip {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    border: 1px solid rgba(249, 216, 194, 0.10);
    border-radius: 8px;
    background: #14110f;
    text-decoration: none;
    color: rgba(250, 247, 235, 0.92);
    transition: border-color 0.15s, background 0.15s, transform 0.05s;
    min-width: 0;
  }
  .hs-chip:hover { border-color: rgba(249, 216, 194, 0.18); background: #1c1815; }
  .hs-chip:active:not(.hs-empty) { transform: translateY(1px); }
  .hs-chip:focus-visible { outline: 2px solid #f9d8c2; outline-offset: 2px; }
  .hs-chip.hs-empty { opacity: 0.55; cursor: default; }
  .hs-eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    color: rgba(250, 247, 235, 0.42);
    text-transform: uppercase;
  }
  .hs-value {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
    color: #faf7eb;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hs-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: rgba(250, 247, 235, 0.42);
  }
  .hs-imminent { color: #ff6b6b; font-weight: 600; }
  .hs-pos { border-color: rgba(95, 201, 122, 0.22); }
  .hs-pos .hs-value { color: #5fc97a; }
  .hs-neg { border-color: rgba(255, 107, 107, 0.22); }
  .hs-neg .hs-value { color: #ff6b6b; }
  .hs-neu .hs-value { color: #faf7eb; }
  .hs-event { border-color: rgba(233, 211, 107, 0.22); }
  .hs-event .hs-value { color: #e9d36b; }

  @media (max-width: 720px) {
    .hero-signals { grid-template-columns: 1fr; gap: 6px; }
  }
</style>
