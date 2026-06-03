<script lang="ts">
  import { blocksToString, stringToBlocks, KNOWN_INDICATORS, OPERATORS } from './dsl.js';
  import type { ConditionBlock, Operator } from './dsl.js';

  interface Props {
    dsl: string;
    onDslChange: (v: string) => void;
  }

  let { dsl, onDslChange }: Props = $props();

  let blocks = $state<ConditionBlock[]>([]);
  let showDsl = $state(true);
  let prevDsl = $state('');

  $effect(() => {
    if (dsl !== prevDsl) {
      prevDsl = dsl;
      blocks = stringToBlocks(dsl);
    }
  });

  function updateBlocks(newBlocks: ConditionBlock[]) {
    blocks = newBlocks;
    const s = blocksToString(blocks);
    prevDsl = s;
    onDslChange(s);
  }

  function addBlock() {
    updateBlocks([...blocks, { indicator: 'rsi14', operator: '<', value: 30 }]);
  }

  function removeBlock(i: number) {
    updateBlocks(blocks.filter((_, idx) => idx !== i));
  }

  function updateBlock(i: number, field: keyof ConditionBlock, value: string | number) {
    const updated = blocks.map((b, idx) =>
      idx === i ? { ...b, [field]: field === 'value' ? Number(value) : value } : b
    );
    updateBlocks(updated);
  }
</script>

<div class="condition-form">
  <div class="form-header">
    <span class="section-label">조건 블록</span>
    <button class="toggle-btn" onclick={() => (showDsl = !showDsl)}>
      {showDsl ? '블록 뷰' : 'DSL 뷰'}
    </button>
  </div>

  {#if showDsl}
    <pre class="dsl-preview">{dsl || '(조건 없음)'}</pre>
  {:else}
    <div class="blocks">
      {#each blocks as block, i}
        <div class="block-row">
          <select
            value={block.indicator}
            onchange={(e) => updateBlock(i, 'indicator', (e.target as HTMLSelectElement).value)}
          >
            {#each KNOWN_INDICATORS as ind}
              <option value={ind}>{ind}</option>
            {/each}
          </select>
          <select
            value={block.operator}
            onchange={(e) => updateBlock(i, 'operator', (e.target as HTMLSelectElement).value as Operator)}
          >
            {#each OPERATORS as op}
              <option value={op}>{op}</option>
            {/each}
          </select>
          <input
            type="number"
            value={block.value}
            step="0.1"
            onchange={(e) => updateBlock(i, 'value', (e.target as HTMLInputElement).valueAsNumber)}
          />
          <button class="remove-btn" onclick={() => removeBlock(i)} aria-label="조건 삭제">×</button>
        </div>
        {#if i < blocks.length - 1}
          <div class="connector">AND</div>
        {/if}
      {/each}
    </div>

    <button class="add-btn" onclick={addBlock}>+ 조건 추가</button>
  {/if}
</div>

<style>
  .condition-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    flex: 1;
    overflow-y: auto;
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-label {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .toggle-btn {
    font-size: 11px;
    color: var(--sc-accent);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
  }

  .blocks {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .block-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .block-row select,
  .block-row input {
    background: var(--lis-surface-1);
    border: 1px solid var(--lis-border-soft);
    border-radius: 4px;
    color: var(--sc-text-0);
    font-size: 12px;
    padding: 6px 8px;
  }

  .block-row select:first-child {
    flex: 1;
  }

  .block-row input[type='number'] {
    width: 72px;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--sc-text-3);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 4px;
  }

  .connector {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
    padding: 2px 8px;
    text-align: center;
  }

  .add-btn {
    background: none;
    border: 1px dashed var(--lis-border-soft);
    border-radius: 6px;
    color: var(--sc-text-2);
    font-size: 12px;
    padding: 8px;
    cursor: pointer;
    text-align: center;
    margin-top: 4px;
  }

  .add-btn:hover {
    border-color: var(--lis-border);
    color: var(--sc-text-1);
  }

  .dsl-preview {
    background: var(--lis-surface-1);
    border: 1px solid var(--lis-border-soft);
    border-radius: 6px;
    color: var(--sc-text-1);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 12px;
    white-space: pre-wrap;
    word-break: break-all;
    min-height: 60px;
  }
</style>
