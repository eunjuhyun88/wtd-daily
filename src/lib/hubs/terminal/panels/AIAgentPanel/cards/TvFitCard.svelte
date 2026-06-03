<script lang="ts">
  import type { TvFitCardPayload } from '$lib/agent/directives';
  interface Props { payload: TvFitCardPayload; }
  let { payload }: Props = $props();

  const tierColor = (() => {
    const t = payload.author_score?.tier;
    if (t === 'S') return '#f0c040';
    if (t === 'A') return '#4caf50';
    if (t === 'B') return '#7a8a9a';
    return '#444a55';
  })();

  function pct(x: number | null | undefined, d = 0): string {
    if (x == null || Number.isNaN(x)) return '–';
    return `${(x * 100).toFixed(d)}%`;
  }
</script>

<div class="tv-fit">
  <div class="tv-head">
    <span class="tv-asset">{payload.asset || '?'}{payload.timeframe ? ` · ${payload.timeframe}` : ''}</span>
    <a class="tv-link" href={payload.source_url} target="_blank" rel="noopener noreferrer">TV ↗</a>
  </div>

  <div class="tv-author">
    <span class="tv-handle">@{payload.author_handle || 'unknown'}</span>
    {#if payload.author_score}
      <span class="tv-tier" style="background:{tierColor}">{payload.author_score.tier}</span>
      <span class="tv-stat">hit {pct(payload.author_score.hit_rate_24h)} · n {payload.author_score.n_ideas_30d}</span>
    {:else}
      <span class="tv-tier" style="background:{tierColor}">신규</span>
    {/if}
  </div>

  {#if payload.idea_excerpt}
    <div class="tv-excerpt">{payload.idea_excerpt}</div>
  {/if}

  <div class="tv-fits">
    {#if payload.fits.length === 0}
      <div class="tv-nofit">닮은 패턴 없음</div>
    {:else}
      {#each payload.fits as f}
        <div class="tv-fit-row">
          <span class="tv-fit-name">{f.pattern_name}</span>
          <span class="tv-fit-sim">sim {pct(f.similarity)}</span>
          <span class="tv-fit-dir" class:match={f.direction_match}>{f.direction_match ? '방향✓' : '방향✗'}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
.tv-fit {
  display: flex; flex-direction: column; gap: 6px;
  background: #111222; border: 1px solid #2a2a3a; border-radius: 8px;
  padding: 10px 12px; width: 100%;
}
.tv-head { display: flex; justify-content: space-between; align-items: center; }
.tv-asset { font-size: 13px; font-weight: 600; color: #d8dde8; font-family: monospace; }
.tv-link { font-size: var(--ui-text-xs); color: #4a6fa5; text-decoration: none; }
.tv-link:hover { color: #6e8fc5; text-decoration: underline; }
.tv-author { display: flex; align-items: center; gap: 6px; font-size: var(--ui-text-xs); }
.tv-handle { color: #9aa6b8; font-family: monospace; }
.tv-tier {
  display: inline-block; padding: 1px 6px; border-radius: 3px;
  font-weight: 700; color: #111; font-size: 11px; letter-spacing: 0.04em;
}
.tv-stat { color: #7a8a9a; }
.tv-excerpt {
  font-size: var(--ui-text-xs); color: #8a96a8; line-height: 1.4;
  background: #0c0c18; border-radius: 4px; padding: 4px 6px;
}
.tv-fits { display: flex; flex-direction: column; gap: 3px; margin-top: 2px; }
.tv-nofit { font-size: var(--ui-text-xs); color: #7a8a9a; font-style: italic; }
.tv-fit-row {
  display: grid; grid-template-columns: 1fr auto auto;
  gap: 8px; align-items: baseline;
  font-size: var(--ui-text-xs);
  padding: 3px 6px; background: #0c0c18; border-radius: 3px;
}
.tv-fit-name { color: #d8dde8; }
.tv-fit-sim { color: #4a6fa5; font-family: monospace; }
.tv-fit-dir { color: #f44336; font-weight: 600; }
.tv-fit-dir.match { color: #4caf50; }
</style>
