<script lang="ts">
  import { dispatchLever } from '$lib/analytics/lever-events';

  let {
    regime,
    score,
    confidence,
    btcChangePct,
    feargreed,
    generatedAt
  }: {
    regime: string | null | undefined;
    score: number | null | undefined;
    confidence: number | null | undefined;
    btcChangePct: number | null | undefined;
    feargreed: { value: number; classification: string } | null;
    generatedAt: number;
  } = $props();

  const regimeTone = $derived.by(() => {
    if (!regime) return 'neu';
    if (/risk[_-]?on|bull/i.test(regime)) return 'pos';
    if (/risk[_-]?off|bear/i.test(regime)) return 'neg';
    return 'neu';
  });

  const regimeLabel = $derived.by(() => {
    if (!regime) return 'Pending';
    if (/risk[_-]?on|bull/i.test(regime)) return 'Risk-On';
    if (/risk[_-]?off|bear/i.test(regime)) return 'Risk-Off';
    if (/neutral/i.test(regime)) return 'Neutral';
    return regime;
  });

  const thesis = $derived.by(() => {
    const fg = feargreed?.value;
    const dir = btcChangePct == null ? null : btcChangePct >= 0 ? 'up' : 'down';
    const fgWord = fg == null ? null : fg >= 60 ? 'greedy' : fg <= 40 ? 'fearful' : 'mixed';
    if (regimeTone === 'pos') return `Risk-on bias confirmed — BTC ${dir ?? 'flat'}, sentiment ${fgWord ?? 'mixed'}.`;
    if (regimeTone === 'neg') return `Risk-off active — BTC ${dir ?? 'flat'}, sentiment ${fgWord ?? 'mixed'}.`;
    return `Mixed signals — BTC ${dir ?? 'flat'}, sentiment ${fgWord ?? 'mixed'}.`;
  });

  const ts = $derived(new Date(generatedAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  function onL1Click() {
    dispatchLever('l1', { surface: 'headline', trigger: 'cta_click' });
  }
</script>

<section class="headline" aria-label="Today's headline">
  <div class="hl-row">
    <span class="hl-tag hl-{regimeTone}">{regimeLabel}</span>
    {#if score != null}
      <span class="hl-score">{(score * 100).toFixed(0)}<span class="hl-pts">pts</span></span>
    {/if}
    {#if confidence != null}
      <span class="hl-conf">{(confidence * 100).toFixed(0)}% conf</span>
    {/if}
    <span class="hl-ts">Updated {ts}</span>
  </div>
  <p class="hl-thesis">{thesis}</p>
  <div class="hl-cta">
    <a href="/daily#signals" class="hl-link" onclick={onL1Click}>
      이 한 줄을 만든 14개 시그널 보기 →
    </a>
  </div>
</section>

<style>
  .headline {
    margin: 0 clamp(12px, 3vw, 24px);
    padding: 18px 20px;
    border: 1px solid var(--g3, #1c1918);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(20, 18, 17, 0.6), rgba(11, 10, 9, 0.9));
  }
  .hl-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
  .hl-tag {
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .hl-pos { background: rgba(95, 201, 122, 0.15); color: #5fc97a; }
  .hl-neg { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
  .hl-neu { background: rgba(233, 211, 107, 0.15); color: #e9d36b; }
  .hl-score {
    color: var(--g9, #eceae8);
    font-weight: 700;
    font-size: 18px;
  }
  .hl-pts { font-size: 11px; color: var(--g6, #5a5650); margin-left: 2px; }
  .hl-conf { color: var(--g7, #9d9690); }
  .hl-ts { color: var(--g6, #5a5650); margin-left: auto; }
  .hl-thesis {
    margin: 10px 0 12px;
    color: var(--g9, #eceae8);
    font-size: clamp(15px, 2vw, 18px);
    line-height: 1.45;
  }
  .hl-cta { display: flex; justify-content: flex-end; }
  .hl-link {
    color: rgba(249, 216, 194, 0.85);
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    border-bottom: 1px dashed rgba(249, 216, 194, 0.4);
    padding-bottom: 1px;
  }
  .hl-link:hover { color: rgba(249, 216, 194, 1); border-bottom-color: rgba(249, 216, 194, 0.7); }
</style>
