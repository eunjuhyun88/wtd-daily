<script lang="ts">
  import { traderProfile, type TraderStyle, type AiDepth } from '$lib/stores/traderProfile';

  const STYLES: Array<{ id: TraderStyle; label: string; desc: string; icon: string }> = [
    { id: 'quant',          label: 'Quant',         desc: 'DSL 조건 스크리너 → HITS 검증 → Deploy',        icon: '⟨⟩' },
    { id: 'chart_analyst',  label: 'Chart Analyst', desc: '인디케이터 + 드로잉 → 구간 선택 → 유사 패턴 리콜', icon: '◰' },
    { id: 'discretionary',  label: 'Discretionary', desc: '가격 + 뉴스 → 구간 선택 → 알림 생성 → 페이퍼',   icon: '⊙' },
    { id: 'hybrid',         label: 'Hybrid',        desc: '모든 기능 균등 접근 (직접 설정)',                 icon: '≋' },
  ];

  const AI_DEPTHS: Array<{ id: AiDepth; label: string; desc: string }> = [
    { id: 'l0', label: 'L0 — Brief',    desc: '핵심만 1-2줄' },
    { id: 'l1', label: 'L1 — Standard', desc: '근거 포함 요약' },
    { id: 'l2', label: 'L2 — Detailed', desc: '데이터 인용 + 분석 체인' },
    { id: 'l3', label: 'L3 — Full',     desc: '전체 reasoning 공개' },
  ];

  const currentStyle = $derived($traderProfile.trader_style);
  const currentDepth = $derived($traderProfile.ai_depth_default);
</script>

<section class="persona-panel">
  <h2 class="pp-title">Trader Persona</h2>
  <p class="pp-sub">
    Terminal의 기본 CTA 순서, AI 응답 깊이, SIGNAL 탭 배치가 선택한 페르소나에 맞게 조정됩니다.
    언제든지 변경 가능하며, 기기에 저장됩니다.
  </p>

  <div class="pp-section">
    <h3 class="pp-section-title">Trading Style</h3>
    <div class="style-grid">
      {#each STYLES as s}
        <button
          class="style-card"
          class:selected={currentStyle === s.id}
          onclick={() => traderProfile.setStyle(s.id)}
          aria-pressed={currentStyle === s.id}
        >
          <span class="style-icon">{s.icon}</span>
          <span class="style-label">{s.label}</span>
          <span class="style-desc">{s.desc}</span>
          {#if currentStyle === s.id}<span class="style-check">✓</span>{/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="pp-section">
    <h3 class="pp-section-title">AI Response Depth</h3>
    <p class="pp-hint">AI 분석 패널의 기본 응답 깊이를 설정합니다. 대화 중 언제든 변경 가능합니다.</p>
    <div class="depth-list">
      {#each AI_DEPTHS as d}
        <button
          class="depth-row"
          class:selected={currentDepth === d.id}
          onclick={() => traderProfile.setAiDepth(d.id)}
          aria-pressed={currentDepth === d.id}
        >
          <span class="depth-label">{d.label}</span>
          <span class="depth-desc">{d.desc}</span>
          {#if currentDepth === d.id}<span class="depth-check">✓</span>{/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="pp-reset">
    <button class="reset-btn" onclick={() => traderProfile.reset()}>
      기본값으로 초기화 (Discretionary / L0)
    </button>
  </div>
</section>

<style>
  .persona-panel { max-width: 580px; }
  .pp-title { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: var(--g9, #eceae8); margin: 0 0 6px; }
  .pp-sub { font-size: 12px; color: var(--g6, #6b6560); line-height: 1.6; margin: 0 0 24px; }
  .pp-section { margin-bottom: 28px; }
  .pp-section-title { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--g7, #9d9690); letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 10px; }
  .pp-hint { font-size: 11px; color: var(--g5, #3d3830); margin: 0 0 8px; line-height: 1.5; }

  .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .style-card { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 14px 14px 12px; background: var(--g1, #0c0a09); border: 1px solid var(--g3, #1c1918); border-radius: 6px; cursor: pointer; text-align: left; transition: border-color 0.12s, background 0.12s; }
  .style-card:hover { border-color: var(--g5, #3d3830); background: var(--g2, #131110); }
  .style-card.selected { border-color: var(--amb, #f5a623); background: color-mix(in srgb, var(--amb, #f5a623) 6%, var(--g1, #0c0a09)); }
  .style-icon { font-size: 18px; color: var(--g6, #6b6560); line-height: 1; }
  .style-card.selected .style-icon { color: var(--amb, #f5a623); }
  .style-label { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: var(--g9, #eceae8); }
  .style-desc { font-size: 11px; color: var(--g6, #6b6560); line-height: 1.4; }
  .style-check { position: absolute; top: 10px; right: 12px; font-size: 11px; color: var(--amb, #f5a623); font-weight: 700; }

  .depth-list { display: flex; flex-direction: column; gap: 2px; }
  .depth-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--g1, #0c0a09); border: 1px solid var(--g3, #1c1918); border-radius: 4px; cursor: pointer; text-align: left; transition: border-color 0.12s; }
  .depth-row:hover { border-color: var(--g5, #3d3830); }
  .depth-row.selected { border-color: var(--amb, #f5a623); }
  .depth-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--g9, #eceae8); min-width: 110px; }
  .depth-desc { font-size: 11px; color: var(--g6, #6b6560); flex: 1; }
  .depth-check { font-size: 11px; color: var(--amb, #f5a623); font-weight: 700; }

  .pp-reset { padding-top: 8px; border-top: 1px solid var(--g3, #1c1918); }
  .reset-btn { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--g5, #3d3830); background: none; border: none; cursor: pointer; padding: 0; transition: color 0.12s; }
  .reset-btn:hover { color: var(--g7, #9d9690); }
</style>
