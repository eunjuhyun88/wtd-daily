<script lang="ts">
  let { state }: { state: 'ready' | 'seeded' | 'empty' } = $props();
</script>

<span
  class="wiki-state-pill"
  class:ready={state === 'ready'}
  class:seeded={state === 'seeded'}
  class:empty={state === 'empty'}
></span>

<style>
  .wiki-state-pill {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .wiki-state-pill.ready {
    background: rgba(219, 154, 159, 0.8);
  }

  .wiki-state-pill.seeded {
    background: transparent;
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    box-sizing: border-box;
  }

  .wiki-state-pill.empty {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
