<script lang="ts">
  import { studioStore } from './studioStore.svelte';

  let symbolsInput = $state('');

  async function handleScan() {
    if (!studioStore.promptText.trim()) return;
    studioStore.setScanStatus('parsing');
    studioStore.setParsedDraft(null);
    studioStore.setScanResult(null);
    studioStore.setErrorMsg('');

    try {
      // Step 1: parse natural language → draft
      const symbolHint = symbolsInput.trim().split(/[\s,]+/).filter(Boolean)[0] ?? null;
      const parseRes = await fetch('/api/engine/patterns/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: studioStore.promptText, symbol: symbolHint }),
      });
      if (!parseRes.ok) {
        const err = await parseRes.json().catch(() => ({ detail: parseRes.statusText }));
        throw new Error(String((err as { detail?: string }).detail ?? parseRes.statusText));
      }
      const draft = await parseRes.json() as Record<string, unknown>;
      studioStore.setParsedDraft(draft);

      // Step 2: targeted autoresearch scan
      studioStore.setScanStatus('scanning');
      const rawSymbols = symbolsInput.trim().split(/[\s,]+/).filter(Boolean).map(s => s.toUpperCase());
      const symbols = rawSymbols.length > 0 ? rawSymbols : null;

      const scanRes = await fetch('/api/engine/research/autoresearch/targeted', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ symbols, draft, timeframe: ' 1h', top_n: 5 }),
      });
      if (!scanRes.ok) {
        const err = await scanRes.json().catch(() => ({ detail: scanRes.statusText }));
        throw new Error(String((err as { detail?: string }).detail ?? scanRes.statusText));
      }
      const result = await scanRes.json();
      studioStore.setScanResult(result);
      studioStore.setScanStatus('done');
    } catch (err) {
      studioStore.setErrorMsg(err instanceof Error ? err.message : '스캔 중 오류가 발생했습니다');
      studioStore.setScanStatus('error');
    }
  }

  const canScan = $derived(
    studioStore.promptText.trim().length > 0 &&
    studioStore.scanStatus !== 'parsing' &&
    studioStore.scanStatus !== 'scanning'
  );
</script>

<div class="deck-wrap">
  <div class="deck-section">
    <label class="deck-label" for="prompt-input">아이디어 입력</label>
    <textarea
      id="prompt-input"
      class="prompt-ta"
      placeholder="예: BTC 15분봉에서 볼린저 하단 터치 + RSI 30 이하"
      value={studioStore.promptText}
      oninput={(e) => studioStore.setPromptText((e.target as HTMLTextAreaElement).value)}
    ></textarea>
  </div>

  <div class="deck-section">
    <label class="deck-label" for="symbols-input">심볼 지정 (선택)</label>
    <input
      id="symbols-input"
      class="symbols-input"
      type="text"
      placeholder="BTC,ETH (기본: top 5)"
      bind:value={symbolsInput}
    />
    <span class="symbols-hint">최대 10개 · 미입력 시 거래량 상위 5개 자동 선택</span>
  </div>

  <button
    class="scan-btn"
    type="button"
    disabled={!canScan}
    onclick={handleScan}
  >
    {#if studioStore.scanStatus === 'parsing'}
      분석 중…
    {:else if studioStore.scanStatus === 'scanning'}
      스캔 중…
    {:else}
      Scan
    {/if}
  </button>

  {#if studioStore.scanStatus !== 'idle'}
    <div class="status-bar">
      <span class="status-dot" class:dot-active={studioStore.scanStatus === 'parsing' || studioStore.scanStatus === 'scanning'}></span>
      <span class="status-text">
        {#if studioStore.scanStatus === 'parsing'}패턴 구조 분석 중…
        {:else if studioStore.scanStatus === 'scanning'}심볼 스캔 중…
        {:else if studioStore.scanStatus === 'done'}완료
        {:else if studioStore.scanStatus === 'error'}오류 발생
        {/if}
      </span>
    </div>
  {/if}
</div>

<style>
  .deck-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 16px;
    height: 100%;
    overflow-y: auto;
  }

  .deck-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .deck-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .prompt-ta {
    height: 200px;
    padding: 10px 12px;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: rgba(250, 247, 235, 0.85);
    resize: none;
    outline: none;
    line-height: 1.55;
  }
  .prompt-ta:focus { border-color: rgba(96, 165, 250, 0.4); }
  .prompt-ta::placeholder { color: rgba(250, 247, 235, 0.2); }

  .symbols-input {
    padding: 7px 12px;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: rgba(250, 247, 235, 0.85);
    outline: none;
  }
  .symbols-input:focus { border-color: rgba(96, 165, 250, 0.4); }
  .symbols-input::placeholder { color: rgba(250, 247, 235, 0.2); }

  .symbols-hint {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.2);
  }

  .scan-btn {
    padding: 10px 0;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    background: rgba(96, 165, 250, 0.12);
    border: 1px solid rgba(96, 165, 250, 0.35);
    border-radius: 5px;
    color: #60a5fa;
    cursor: pointer;
    transition: background 0.12s;
    letter-spacing: 0.04em;
  }
  .scan-btn:hover:not(:disabled) { background: rgba(96, 165, 250, 0.2); }
  .scan-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(250, 247, 235, 0.25);
    flex-shrink: 0;
  }
  .status-dot.dot-active {
    background: #60a5fa;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .status-text {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.4);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
