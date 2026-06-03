<script lang="ts">
  type WatchlistEvent = {
    region: 'US' | 'KR' | 'Global';
    dateLabel: string;
    title: string;
    note: string;
    impact: 'high' | 'medium';
  };

  type WatchlistIssue = {
    region: 'US' | 'KR' | 'Global';
    title: string;
    summary: string;
    tone: 'bullish' | 'cautious' | 'mixed';
  };

  const { events = [], issues = [] } = $props<{
    events?: WatchlistEvent[];
    issues?: WatchlistIssue[];
  }>();

  function regionLabel(region: WatchlistEvent['region'] | WatchlistIssue['region']): string {
    if (region === 'US') return 'US';
    if (region === 'KR') return 'KR';
    return 'Global';
  }

  function impactLabel(impact: WatchlistEvent['impact']): string {
    return impact === 'high' ? 'High impact' : 'Watch';
  }
</script>

<section class="watchlist" aria-label="Weekly catalyst watch">
  <div class="watchlist-head">
    <div>
      <p class="eyebrow">Catalyst Watch</p>
      <h2>이번 주 촉매</h2>
    </div>
    <span class="watchlist-count">{events.length + issues.length} checks</span>
  </div>

  <div class="watchlist-grid">
    <div class="watch-card">
      <div class="watch-card-head">
        <span class="watch-title">Key Events</span>
        <span class="watch-sub">{events.length > 0 ? `${events.length} items` : 'Editorial feed'}</span>
      </div>
      {#if events.length > 0}
        <ul class="event-list">
          {#each events as event (`${event.region}-${event.dateLabel}-${event.title}`)}
            <li class="event-row">
              <div class="event-meta">
                <span class="region-chip">{regionLabel(event.region)}</span>
                <span class="date-chip">{event.dateLabel}</span>
              </div>
              <div class="event-body">
                <div class="event-title-row">
                  <span class="event-title">{event.title}</span>
                  <span class:impact-high={event.impact === 'high'} class="impact-chip">{impactLabel(event.impact)}</span>
                </div>
                <p>{event.note}</p>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="empty">No scheduled watchlist items for this week yet.</div>
      {/if}
    </div>

    <div class="watch-card">
      <div class="watch-card-head">
        <span class="watch-title">Live Issues</span>
        <span class="watch-sub">US · KR · Global</span>
      </div>
      {#if issues.length > 0}
        <ul class="issue-list">
          {#each issues as issue (`${issue.region}-${issue.title}`)}
            <li class="issue-row">
              <span class="region-chip">{regionLabel(issue.region)}</span>
              <div class="issue-body">
                <div class="issue-title-row">
                  <span class="issue-title">{issue.title}</span>
                  <span class:issue-cautious={issue.tone === 'cautious'} class:issue-bullish={issue.tone === 'bullish'} class="issue-tone">
                    {issue.tone}
                  </span>
                </div>
                <p>{issue.summary}</p>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="empty">No live issue notes yet.</div>
      {/if}
    </div>
  </div>
</section>

<style>
  .watchlist {
    width: 100%;
    margin: 0;
    padding: 12px;
    border: 1px solid rgba(249, 216, 194, 0.12);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(250, 247, 235, 0.035), rgba(250, 247, 235, 0.012)),
      rgba(14, 12, 11, 0.96);
    box-shadow: none;
    box-sizing: border-box;
  }

  .watchlist-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(249, 216, 194, 0.72);
  }

  h2 {
    margin: 0;
    font-size: 15px;
    line-height: 1.2;
    color: #f8f2ee;
  }

  .watchlist-count {
    flex: 0 0 auto;
    padding: 3px 7px;
    border: 1px solid rgba(249, 216, 194, 0.14);
    border-radius: 4px;
    color: rgba(249, 216, 194, 0.72);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    text-transform: uppercase;
  }

  .watchlist-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .watch-card {
    padding: 10px;
    border: 1px solid rgba(249, 216, 194, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
  }

  .watch-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .watch-title {
    font-size: 12px;
    font-weight: 700;
    color: #f5ebe3;
  }

  .watch-sub {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(239, 233, 228, 0.52);
  }

  .event-list,
  .issue-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 7px;
  }

  .event-row,
  .issue-row {
    display: grid;
    gap: 8px;
    padding: 9px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.03);
  }

  .event-row {
    grid-template-columns: auto 1fr;
  }

  .event-meta {
    display: grid;
    align-content: start;
    gap: 5px;
  }

  .region-chip,
  .date-chip,
  .impact-chip,
  .issue-tone {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    line-height: 1;
  }

  .region-chip {
    border: 1px solid rgba(249, 216, 194, 0.14);
    background: rgba(249, 216, 194, 0.06);
    color: #f7d8c2;
  }

  .date-chip {
    border: 1px solid rgba(130, 196, 255, 0.16);
    background: rgba(130, 196, 255, 0.08);
    color: #a9d8ff;
  }

  .impact-chip {
    border: 1px solid rgba(249, 216, 194, 0.1);
    background: rgba(249, 216, 194, 0.05);
    color: rgba(239, 233, 228, 0.82);
  }

  .impact-high {
    border-color: rgba(240, 133, 78, 0.2);
    background: rgba(240, 133, 78, 0.12);
    color: #ffbd8d;
  }

  .event-body,
  .issue-body {
    display: grid;
    gap: 5px;
  }

  .event-title-row,
  .issue-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .event-title,
  .issue-title {
    font-size: 12px;
    font-weight: 700;
    color: #fff8f4;
  }

  .event-body p,
  .issue-body p {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.45;
    color: rgba(239, 233, 228, 0.72);
  }

  .issue-row {
    grid-template-columns: auto 1fr;
    align-items: start;
  }

  .issue-tone {
    border: 1px solid rgba(239, 233, 228, 0.1);
    background: rgba(239, 233, 228, 0.05);
    color: rgba(239, 233, 228, 0.72);
    text-transform: capitalize;
  }

  .issue-cautious {
    border-color: rgba(255, 180, 88, 0.18);
    background: rgba(255, 180, 88, 0.12);
    color: #ffcd78;
  }

  .issue-bullish {
    border-color: rgba(92, 224, 168, 0.18);
    background: rgba(92, 224, 168, 0.12);
    color: #8ef0c2;
  }

  .empty {
    padding: 18px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    color: rgba(239, 233, 228, 0.56);
    font-size: 12px;
  }

  @media (max-width: 920px) {
    .watchlist-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .watchlist-grid {
      grid-template-columns: 1fr;
    }

    .event-row,
    .issue-row {
      grid-template-columns: 1fr;
    }

    .event-title-row,
    .issue-title-row {
      align-items: start;
      flex-direction: column;
    }
  }
</style>
