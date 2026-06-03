<script lang="ts">
  import type { PatternMatchView } from '$lib/contracts';
  import type { PatternStats } from '$lib/types/patternStats';

  interface Props {
    slug: string;
    matches: PatternMatchView[];
    selectedMatchKey: string | null;
    summaryStats?: PatternStats | null;
    onSelect: (key: string) => void;
  }

  let {
    slug,
    matches,
    selectedMatchKey,
    summaryStats = null,
    onSelect,
  }: Props = $props();

  function fmtPct(value: number | null | undefined, digits = 0): string {
    if (value == null || !Number.isFinite(value)) return '—';
    return `${(value * 100).toFixed(digits)}%`;
  }

  function fmtRelTime(iso: string | null): string {
    if (!iso) return '—';
    const ms = new Date(iso).getTime();
    if (!Number.isFinite(ms)) return '—';
    const diff = Date.now() - ms;
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function anchorTime(match: PatternMatchView): string | null {
    return match.triggerBarTs ?? match.lastEvalAt ?? match.enteredAt;
  }

  function sourceLabel(match: PatternMatchView): string {
    return match.source === 'candidate' ? 'pattern hit' : 'state only';
  }

  function phaseTone(phaseId: string): 'live' | 'watch' | 'early' | 'idle' {
    const phase = phaseId.trim().toUpperCase();
    if (phase === 'BREAKOUT') return 'live';
    if (phase === 'ACCUMULATION' || phase === 'REAL_DUMP') return 'watch';
    if (phase === 'ARCH_ZONE' || phase === 'FAKE_DUMP') return 'early';
    return 'idle';
  }

  function breakoutCount(list: PatternMatchView[]): number {
    return list.filter((match) => match.phaseId.trim().toUpperCase() === 'BREAKOUT').length;
  }

  const avgConfidence = $derived((() => {
    const values = matches
      .map((match) => match.confidence)
      .filter((value): value is number => value != null && Number.isFinite(value));
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  })());
</script>

<div class="match-pane">
  <div class="match-head">
    <div class="match-titles">
      <span class="match-kicker">Live Matches</span>
      <strong class="match-slug" title={slug}>{slug}</strong>
    </div>
    <div class="match-stats">
      <span class="match-stat">{matches.length} symbols</span>
      {#if avgConfidence != null}
        <span class="match-stat">avg conf {fmtPct(avgConfidence)}</span>
      {/if}
      {#if breakoutCount(matches) > 0}
        <span class="match-stat match-stat-live">breakout {breakoutCount(matches)}</span>
      {/if}
      {#if summaryStats?.hit_rate != null}
        <span class="match-stat">WR {fmtPct(summaryStats.hit_rate)}</span>
      {/if}
    </div>
  </div>

  {#if matches.length === 0}
    <div class="match-empty">
      <div class="match-empty-title">현재 조건에 맞는 live symbol이 없습니다</div>
      <div class="match-empty-copy">패턴 자체 통계와 백테스트는 오른쪽에서 계속 볼 수 있습니다.</div>
    </div>
  {:else}
    <div class="match-scroll">
      <table class="match-table">
        <thead>
          <tr>
            <th class="col-symbol">Symbol</th>
            <th class="col-phase">Phase</th>
            <th class="col-conf">Conf</th>
            <th class="col-blocks">Blocks</th>
            <th class="col-last">Found</th>
            <th class="col-action" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {#each matches as match (match.key)}
            <tr
              class="match-row"
              class:match-row-selected={selectedMatchKey === match.key}
              onclick={() => onSelect(match.key)}
              role="button"
              tabindex="0"
              onkeydown={(event) => { if (event.key === 'Enter') onSelect(match.key); }}
            >
              <td class="col-symbol">
                <div class="symbol-stack">
                  <strong>{match.symbol}</strong>
                  <span class="meta-line">
                    {match.timeframe}
                    <span class="source-tag" class:source-tag-state={match.source === 'state'}>
                      {sourceLabel(match)}
                    </span>
                  </span>
                </div>
              </td>
              <td class="col-phase">
                <span class="phase-chip phase-{phaseTone(match.phaseId)}">{match.phaseLabel}</span>
              </td>
              <td class="col-conf">
                {#if match.confidence != null}
                  <span class="conf-val">{fmtPct(match.confidence)}</span>
                {:else if match.progressPct != null}
                  <span class="conf-val muted">{Math.round(match.progressPct)}%</span>
                {:else}
                  <span class="muted">—</span>
                {/if}
              </td>
              <td class="col-blocks">
                {#if match.blocksTriggered.length > 0}
                  <div class="block-list">
                    {#each match.blocksTriggered.slice(0, 2) as block (block)}
                      <span class="block-chip" title={block}>{block.replace(/_/g, ' ')}</span>
                    {/each}
                    {#if match.blocksTriggered.length > 2}
                      <span class="block-chip muted">+{match.blocksTriggered.length - 2}</span>
                    {/if}
                  </div>
                {:else}
                  <span class="muted">—</span>
                {/if}
              </td>
              <td class="col-last">
                <span class="time-val">{fmtRelTime(anchorTime(match))}</span>
              </td>
              <td class="col-action">
                <a
                  class="term-link"
                  href="/cogochi?sym={encodeURIComponent(match.symbol)}&pattern={encodeURIComponent(slug)}"
                  title="{match.symbol} 터미널에서 보기"
                  aria-label="{match.symbol} 터미널에서 보기"
                  onclick={(e) => e.stopPropagation()}
                >↗</a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .match-pane {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: var(--sc-bg-0);
  }

  .match-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--sc-line-2);
    flex-shrink: 0;
  }

  .match-titles {
    display: grid;
    gap: 4px;
  }

  .match-kicker {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sc-text-3);
  }

  .match-slug {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.84);
  }

  .match-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .match-stat {
    padding: 4px 7px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.5);
  }

  .match-stat-live {
    color: #86efac;
    border-color: rgba(74, 222, 128, 0.2);
    background: rgba(74, 222, 128, 0.08);
  }

  .match-empty {
    flex: 1;
    display: grid;
    place-content: center;
    gap: 6px;
    padding: 24px;
    text-align: center;
  }

  .match-empty-title {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.52);
  }

  .match-empty-copy {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.28);
  }

  .match-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .match-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(10, 10, 12, 0.94);
    backdrop-filter: blur(8px);
  }

  th {
    padding: 8px 12px;
    border-bottom: 1px solid var(--sc-active-bg);
    text-align: left;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.32);
  }

  .col-symbol { width: 128px; }
  .col-phase { width: 112px; }
  .col-conf { width: 76px; }
  .col-blocks { width: auto; }
  .col-last { width: 88px; }
  .col-action { width: 28px; text-align: center; }

  .term-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--sc-text-3);
    font-size: 11px;
    text-decoration: none;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
  }
  .term-link:hover {
    color: var(--sc-text-1);
    border-color: rgba(255, 255, 255, 0.25);
    background: var(--sc-active-bg);
  }

  .match-row {
    cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid var(--sc-line-1);
  }

  .match-row:hover {
    background: var(--sc-line-1);
  }

  .match-row-selected {
    background: var(--sc-selected-bg);
    box-shadow: inset 2px 0 0 var(--sc-selected-accent);
  }

  td {
    padding: 10px 12px;
    vertical-align: middle;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.8);
  }

  .symbol-stack {
    display: grid;
    gap: 4px;
  }

  .symbol-stack strong {
    font-size: 12px;
    color: var(--sc-text-0);
  }

  .meta-line {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--sc-text-3);
  }

  .source-tag {
    padding: 1px 5px;
    border-radius: 999px;
    border: 1px solid rgba(74, 222, 128, 0.18);
    background: rgba(74, 222, 128, 0.08);
    color: rgba(187, 247, 208, 0.82);
  }

  .source-tag-state {
    border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: rgba(250, 247, 235, 0.42);
  }

  .phase-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .phase-live {
    color: #bbf7d0;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.28);
  }

  .phase-watch {
    color: #93c5fd;
    background: rgba(96, 165, 250, 0.12);
    border: 1px solid rgba(96, 165, 250, 0.28);
  }

  .phase-early {
    color: #fde68a;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.24);
  }

  .phase-idle {
    color: rgba(250, 247, 235, 0.5);
    background: var(--sc-line-1);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .conf-val {
    color: rgba(250, 247, 235, 0.86);
    font-weight: 700;
  }

  .block-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .block-chip {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 3px 6px;
    border-radius: 4px;
    background: var(--sc-line-1);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 11px;
    color: var(--sc-text-2);
  }

  .time-val,
  .muted {
    color: var(--sc-text-3);
  }

  /* Hide blocks column when pane is narrow — fixed cols (432px) fit without scroll */
  @container (max-width: 460px) {
    .col-blocks { display: none; }
  }
</style>
