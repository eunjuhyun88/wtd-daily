<script lang="ts">
  interface Option {
    value: number | boolean;
    label: string;
    isRecommended?: boolean;
  }

  interface Props {
    paramKey: string;
    label: string;
    options: Option[];
    selected?: number | boolean;
    reason?: string;
    onSelect: (value: number | boolean) => void;
  }

  let { paramKey, label, options, selected, reason, onSelect }: Props = $props();
</script>

<div class="param-card">
  <div class="param-label">{label}</div>
  {#each options as opt}
    <label class="param-option" class:selected={selected === opt.value}>
      <input
        type="radio"
        name={paramKey}
        checked={selected === opt.value}
        onchange={() => onSelect(opt.value)}
      />
      <span class="opt-label">{opt.label}</span>
      {#if opt.isRecommended}
        <span class="ai-badge">AI 추천</span>
      {/if}
    </label>
  {/each}
  {#if reason}
    <div class="reason">{reason}</div>
  {/if}
</div>

<style>
  .param-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .param-label {
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.65);
    letter-spacing: 0.03em;
    margin-bottom: 2px;
  }

  .param-option {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 5px;
    transition: background 0.1s;
  }

  .param-option:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .param-option.selected {
    background: rgba(96, 165, 250, 0.1);
  }

  .param-option input {
    accent-color: #60a5fa;
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .opt-label {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.75);
    flex: 1;
  }

  .param-option.selected .opt-label {
    color: #93c5fd;
  }

  .ai-badge {
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba(219, 154, 159, 0.9);
    background: rgba(219, 154, 159, 0.1);
    border: 1px solid rgba(219, 154, 159, 0.2);
    border-radius: 3px;
    padding: 1px 5px;
    flex-shrink: 0;
  }

  .reason {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.35);
    margin-top: 3px;
    padding-top: 5px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    line-height: 1.4;
  }
</style>
