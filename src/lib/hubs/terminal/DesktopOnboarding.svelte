<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const STORAGE_KEY = 'wtd.desktopOnboarded';
  const STORAGE_VER = 'v1';

  const STEPS = [
    {
      num: '01',
      title: '범위 선택',
      body: '차트에서 드래그해 범위를 선택하세요. B키로 현재 설정을 저장합니다.',
      hint: 'Drag chart → press B',
    },
    {
      num: '02',
      title: 'AI 분석',
      body: '오른쪽 AI 패널에서 "BTC 분석해줘"처럼 자연어로 질문하세요.',
      hint: 'Right panel → AI tab',
    },
    {
      num: '03',
      title: '패턴 저장',
      body: '범위 선택 후 Save로 패턴을 저장하면 AI가 유사 구조를 찾습니다.',
      hint: 'Select range → Save',
    },
    {
      num: '04',
      title: '워치리스트',
      body: '왼쪽 패널에서 종목을 추가하고 실시간 가격과 지표를 확인하세요.',
      hint: 'Left panel → [ to expand',
    },
  ];

  let visible = $state(false);
  let step = $state(0);

  onMount(() => {
    if (!browser) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== STORAGE_VER) {
      const t = setTimeout(() => { visible = true; }, 800);
      return () => clearTimeout(t);
    }
  });

  function next() {
    if (step < STEPS.length - 1) {
      step++;
    } else {
      dismiss();
    }
  }

  function dismiss() {
    visible = false;
    if (browser) localStorage.setItem(STORAGE_KEY, STORAGE_VER);
  }

</script>

{#if visible}
  {@const cur = STEPS[step]}
  <div class="coach-wrap" role="dialog" aria-label="Getting started — step {step + 1} of {STEPS.length}">
    <div class="coach-card">
      <div class="coach-progress">
        {#each STEPS as _, i (i)}
          <span class="coach-dot" class:active={i === step} class:done={i < step}></span>
        {/each}
      </div>
      <div class="coach-body">
        <span class="coach-num">{cur.num}</span>
        <div class="coach-content">
          <div class="coach-title">{cur.title}</div>
          <div class="coach-text">{cur.body}</div>
          <div class="coach-hint">{cur.hint}</div>
        </div>
      </div>
      <div class="coach-actions">
        <button class="coach-skip" type="button" onclick={dismiss}>건너뛰기</button>
        <button class="coach-next" type="button" onclick={next}>
          {step < STEPS.length - 1 ? '다음 →' : '완료 ✓'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .coach-wrap {
    position: fixed;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    pointer-events: none;
    animation: coach-in 200ms var(--sc-ease, ease) both;
  }

  @keyframes coach-in {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .coach-card {
    pointer-events: all;
    background: var(--g1, #0a0a0a);
    border: 1px solid var(--brand-d, rgba(219,154,159,0.38));
    border-radius: 6px;
    padding: 12px 16px;
    width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  .coach-progress {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
  }

  .coach-dot {
    width: 20px;
    height: 3px;
    border-radius: 2px;
    background: var(--g4, rgba(255,255,255,0.08));
    transition: background 200ms;
  }
  .coach-dot.active { background: var(--brand, #db9a9f); }
  .coach-dot.done   { background: var(--brand-d, rgba(219,154,159,0.38)); }

  .coach-body {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .coach-num {
    font-family: var(--fm, monospace);
    font-size: 18px;
    color: var(--brand, #db9a9f);
    font-weight: 700;
    line-height: 1;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .coach-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--g9, #f7f2ea);
    margin-bottom: 4px;
    font-family: var(--fb, sans-serif);
  }

  .coach-text {
    font-size: 11px;
    color: var(--g7, rgba(247,242,234,0.68));
    line-height: 1.55;
    font-family: var(--fb, sans-serif);
  }

  .coach-hint {
    font-family: var(--fm, monospace);
    font-size: 11px;
    color: var(--g5, rgba(247,242,234,0.36));
    margin-top: 6px;
    letter-spacing: 0.05em;
  }

  .coach-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .coach-skip {
    background: none;
    border: none;
    color: var(--g5, rgba(247,242,234,0.36));
    font-size: 11px;
    cursor: pointer;
    padding: 4px 0;
    font-family: var(--fb, sans-serif);
  }
  .coach-skip:hover { color: var(--g7); }

  .coach-next {
    background: var(--brand, #db9a9f);
    color: #000;
    border: none;
    border-radius: 4px;
    padding: 5px 14px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--fb, sans-serif);
  }
  .coach-next:hover { background: var(--sc-accent-hover, #e6a9ad); }
</style>
