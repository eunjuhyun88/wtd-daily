<script lang="ts">
  import type { CommunitySocialPayload } from '$lib/types/social';

  interface Props {
    social: CommunitySocialPayload | null;
    loading: boolean;
    onretry?: () => void;
  }

  const { social, loading, onretry }: Props = $props();

  function fmtTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  function fmtVolume(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }

  const sentimentLabel = $derived(
    social
      ? social.metrics.sentimentScore >= 0.1
        ? '강세'
        : social.metrics.sentimentScore <= -0.1
        ? '약세'
        : '중립'
      : null
  );

  const sentimentColor = $derived(
    social
      ? social.metrics.sentimentScore >= 0.1
        ? 'rgba(74,222,128,0.9)'
        : social.metrics.sentimentScore <= -0.1
        ? 'rgba(248,113,113,0.9)'
        : 'rgba(250,247,235,0.5)'
      : null
  );
</script>

{#if loading}
  <div class="ssp-wrap ssp-skeleton">
    <div class="ssp-sk-row ssp-sk-w80"></div>
    <div class="ssp-sk-row ssp-sk-w60"></div>
    <div class="ssp-sk-row ssp-sk-w70"></div>
  </div>

{:else if social === null}
  <div class="ssp-wrap ssp-error">
    <p class="ssp-err-msg">소셜 데이터를 불러올 수 없습니다</p>
    {#if onretry}
      <button class="ssp-retry" onclick={onretry} type="button">다시 시도</button>
    {/if}
  </div>

{:else if social.source === 'mock'}
  <div class="ssp-wrap ssp-mock">
    <p class="ssp-mock-msg">데이터 없음 (API 키 미설정)</p>
    <p class="ssp-mock-hint">Santiment 또는 LunarCrush API 키를 설정하면 실시간 소셜 감성 데이터를 표시합니다.</p>
  </div>

{:else}
  <div class="ssp-wrap">
    <!-- Header: source + time -->
    <div class="ssp-header">
      <span class="ssp-source">{social.source}</span>
      <span class="ssp-time">{fmtTime(social.fetchedAt)}</span>
    </div>

    <!-- Sentiment gauge -->
    <div class="ssp-gauge-row">
      <span class="ssp-gauge-label">강세</span>
      <div class="ssp-gauge-bar">
        <div
          class="ssp-gauge-bull"
          style="width:{social.metrics.bullishPct}%"
        ></div>
        <div
          class="ssp-gauge-bear"
          style="width:{social.metrics.bearishPct}%"
        ></div>
      </div>
      <span class="ssp-gauge-label">약세</span>
    </div>
    <div class="ssp-gauge-pcts">
      <span class="ssp-pct-bull">{social.metrics.bullishPct.toFixed(0)}%</span>
      {#if sentimentLabel && sentimentColor}
        <span class="ssp-sentiment-label" style="color:{sentimentColor}">{sentimentLabel}</span>
      {/if}
      <span class="ssp-pct-bear">{social.metrics.bearishPct.toFixed(0)}%</span>
    </div>

    <!-- Volume + galaxy score -->
    <div class="ssp-stats-row">
      <div class="ssp-stat">
        <span class="ssp-stat-val">{fmtVolume(social.metrics.volume24h)}</span>
        <span class="ssp-stat-label">24h 멘션</span>
      </div>
      {#if social.metrics.galaxyScore != null}
        <div class="ssp-stat">
          <span class="ssp-stat-val">{social.metrics.galaxyScore.toFixed(0)}</span>
          <span class="ssp-stat-label">Galaxy Score</span>
        </div>
      {/if}
    </div>

    <!-- Top mentions -->
    {#if social.topMentions.length > 0}
      <div class="ssp-mentions">
        <div class="ssp-mentions-hdr">Top Mentions</div>
        {#each social.topMentions.slice(0, 5) as m (m.id)}
          <div class="ssp-mention" class:bull={m.sentiment === 'bull'} class:bear={m.sentiment === 'bear'}>
            <div class="ssp-mention-top">
              <span class="ssp-mention-author">@{m.author}</span>
              {#if m.likes != null}
                <span class="ssp-mention-likes">♥ {m.likes}</span>
              {/if}
            </div>
            <p class="ssp-mention-text">
              {#if m.url}
                <a href={m.url} target="_blank" rel="noopener noreferrer" class="ssp-mention-link">
                  {m.text}
                </a>
              {:else}
                {m.text}
              {/if}
            </p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .ssp-wrap {
    padding: 12px 0;
    font-family: 'JetBrains Mono', monospace;
    color: rgba(250,247,235,.85);
  }

  /* Skeleton */
  .ssp-skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 0;
  }
  @keyframes ssp-pulse {
    0%, 100% { opacity: .35; }
    50% { opacity: .65; }
  }
  .ssp-sk-row {
    height: 14px;
    border-radius: 4px;
    background: rgba(255,255,255,.12);
    animation: ssp-pulse 1.4s ease-in-out infinite;
  }
  .ssp-sk-w80 { width: 80%; }
  .ssp-sk-w60 { width: 60%; }
  .ssp-sk-w70 { width: 70%; }

  /* Error */
  .ssp-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 0;
  }
  .ssp-err-msg {
    font-size: 12px;
    color: rgba(255,255,255,.4);
    margin: 0;
  }
  .ssp-retry {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 4px 14px;
    background: none;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 4px;
    color: rgba(250,247,235,.6);
    cursor: pointer;
    transition: border-color .15s, color .15s;
  }
  .ssp-retry:hover {
    border-color: rgba(74,222,128,.5);
    color: rgba(74,222,128,.9);
  }

  /* Mock */
  .ssp-mock {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ssp-mock-msg {
    font-size: 12px;
    color: rgba(255,255,255,.4);
    margin: 0;
  }
  .ssp-mock-hint {
    font-size: 11px;
    color: rgba(255,255,255,.25);
    margin: 0;
    line-height: 1.5;
  }

  /* Header */
  .ssp-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .ssp-source {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(74,222,128,.7);
    font-weight: 600;
  }
  .ssp-time {
    font-size: 11px;
    color: rgba(255,255,255,.3);
    margin-left: auto;
  }

  /* Gauge */
  .ssp-gauge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .ssp-gauge-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,.3);
    flex-shrink: 0;
  }
  .ssp-gauge-bar {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: rgba(255,255,255,.07);
    display: flex;
    overflow: hidden;
  }
  .ssp-gauge-bull {
    background: rgba(74,222,128,.7);
    height: 100%;
    border-radius: 4px 0 0 4px;
    transition: width .4s ease;
  }
  .ssp-gauge-bear {
    background: rgba(248,113,113,.7);
    height: 100%;
    border-radius: 0 4px 4px 0;
    margin-left: auto;
    transition: width .4s ease;
  }
  .ssp-gauge-pcts {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    margin-bottom: 14px;
    padding: 0 2px;
  }
  .ssp-pct-bull { color: rgba(74,222,128,.8); font-weight: 600; }
  .ssp-pct-bear { color: rgba(248,113,113,.8); font-weight: 600; }
  .ssp-sentiment-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  /* Stats */
  .ssp-stats-row {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
  }
  .ssp-stat { display: flex; flex-direction: column; gap: 2px; }
  .ssp-stat-val { font-size: 14px; font-weight: 600; }
  .ssp-stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,.3);
  }

  /* Mentions */
  .ssp-mentions { display: flex; flex-direction: column; gap: 8px; }
  .ssp-mentions-hdr {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,.3);
    margin-bottom: 4px;
  }
  .ssp-mention {
    padding: 8px 10px;
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 6px;
    background: rgba(255,255,255,.02);
  }
  .ssp-mention.bull { border-color: rgba(74,222,128,.15); }
  .ssp-mention.bear { border-color: rgba(248,113,113,.15); }
  .ssp-mention-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .ssp-mention-author {
    font-size: 11px;
    font-weight: 600;
    color: rgba(250,247,235,.6);
  }
  .ssp-mention-likes {
    font-size: 11px;
    color: rgba(255,255,255,.28);
    margin-left: auto;
  }
  .ssp-mention-text {
    font-size: 11px;
    color: rgba(250,247,235,.55);
    margin: 0;
    line-height: 1.45;
    line-clamp: 2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ssp-mention-link {
    color: inherit;
    text-decoration: none;
  }
  .ssp-mention-link:hover { color: rgba(74,222,128,.8); }
</style>
