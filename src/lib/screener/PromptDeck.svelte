<script lang="ts">
  interface Props {
    dsl: string;
    loading: boolean;
    onDslChange: (v: string) => void;
    onScan: () => void;
  }

  let { dsl, loading, onDslChange, onScan }: Props = $props();

  let promptText = $state('');
  let translating = $state(false);

  async function handleTranslate() {
    if (!promptText.trim()) return;
    translating = true;
    try {
      const res = await fetch('/api/screener/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json() as { dsl?: string };
      if (data.dsl) onDslChange(data.dsl);
    } finally {
      translating = false;
    }
  }
</script>

<div class="prompt-deck">
  <div class="section-label">자연어 → DSL</div>
  <textarea
    class="prompt-input"
    placeholder="RSI 30 아래이고 거래량 급등 중인 코인"
    bind:value={promptText}
    rows={3}
  ></textarea>
  <button class="btn-secondary" onclick={handleTranslate} disabled={translating || !promptText.trim()}>
    {translating ? '변환 중...' : '▶ AI 변환'}
  </button>

  <div class="divider"></div>

  <div class="section-label">DSL 직접 입력</div>
  <textarea
    class="dsl-input"
    placeholder="rsi14 < 30 AND vol_zscore > 2"
    value={dsl}
    oninput={(e) => onDslChange((e.target as HTMLTextAreaElement).value)}
    rows={3}
  ></textarea>

  <button class="btn-primary" onclick={onScan} disabled={loading || !dsl.trim()}>
    {loading ? '스캔 중...' : '▶ 스캔 실행'}
  </button>
</div>

<style>
  .prompt-deck {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  .section-label {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .prompt-input,
  .dsl-input {
    width: 100%;
    background: var(--lis-surface-1);
    border: 1px solid var(--lis-border-soft);
    border-radius: 6px;
    color: var(--sc-text-0);
    font-size: 13px;
    font-family: inherit;
    padding: 10px 12px;
    resize: vertical;
    min-height: 72px;
  }

  .dsl-input {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  .prompt-input:focus,
  .dsl-input:focus {
    outline: none;
    border-color: var(--lis-border);
  }

  .divider {
    border-top: 1px solid var(--lis-border-soft);
    margin: 4px 0;
  }

  .btn-primary,
  .btn-secondary {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary {
    background: var(--sc-accent);
    color: #000;
    font-weight: 600;
  }

  .btn-secondary {
    background: var(--lis-surface-2);
    color: var(--sc-text-1);
    border: 1px solid var(--lis-border-soft);
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
