<script lang="ts">
  import { studioStore } from './studioStore.svelte';
  import DiscoverFeed from './DiscoverFeed.svelte';
  import PromptDeck from './PromptDeck.svelte';
  import ResultStage from './ResultStage.svelte';
</script>

<div class="wb-wrap">
  <!-- Tab bar -->
  <div class="wb-tabs">
    <button
      class="wb-tab"
      class:wb-tab-active={studioStore.tab === 'discover'}
      type="button"
      onclick={() => studioStore.setTab('discover')}
    >발굴된 패턴</button>
    <button
      class="wb-tab"
      class:wb-tab-active={studioStore.tab === 'prompt'}
      type="button"
      onclick={() => studioStore.setTab('prompt')}
    >내 패턴 만들기</button>
  </div>

  <!-- Content -->
  <div class="wb-body">
    {#if studioStore.tab === 'discover'}
      <DiscoverFeed />
    {:else}
      <div class="prompt-layout">
        <div class="prompt-left">
          <PromptDeck />
        </div>
        <div class="result-right">
          <ResultStage scanStatus={studioStore.scanStatus} scanResult={studioStore.scanResult} />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .wb-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #07070a;
    overflow: hidden;
  }

  .wb-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
    padding: 0 20px;
  }

  .wb-tab {
    padding: 10px 18px;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.35);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s;
    margin-bottom: -1px;
    letter-spacing: 0.04em;
  }
  .wb-tab:hover { color: rgba(250, 247, 235, 0.6); }
  .wb-tab-active {
    color: #60a5fa;
    border-bottom-color: #60a5fa;
  }

  .wb-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .prompt-layout {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .prompt-left {
    width: 30%;
    min-width: 280px;
    max-width: 420px;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .result-right {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
