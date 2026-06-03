<script lang="ts">
  interface Props {
    winCount: number;
    lossCount: number;
    totalTrades: number;
  }

  let { winCount, lossCount, totalTrades }: Props = $props();

  const winRate = $derived(totalTrades > 0 ? winCount / totalTrades : 0);
</script>

<div class="trades-bar-wrap">
  <div class="bar-header">
    <span class="bar-total">{totalTrades} Trades</span>
    <span class="bar-winrate">Win Rate {(winRate * 100).toFixed(2)}%</span>
  </div>
  <div class="bar-track">
    <div class="bar-win" style="width: {winRate * 100}%"></div>
    <div class="bar-loss" style="width: {(1 - winRate) * 100}%"></div>
  </div>
  <div class="bar-footer">
    <span class="bar-w"><span class="dot win-dot"></span>{winCount}W</span>
    <span class="bar-l">{lossCount}L<span class="dot loss-dot"></span></span>
  </div>
</div>

<style>
  .trades-bar-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 0 8px;
  }
  .bar-header {
    display: flex;
    justify-content: space-between;
    font-size: var(--ui-text-xs, 12px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255,255,255,0.5);
  }
  .bar-winrate {
    color: rgba(255,255,255,0.7);
    font-weight: 500;
  }
  .bar-track {
    display: flex;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(255,255,255,0.06);
  }
  .bar-win {
    height: 100%;
    background: #22c55e;
    border-radius: 3px 0 0 3px;
    transition: width 0.3s ease;
  }
  .bar-loss {
    height: 100%;
    background: #f87171;
    border-radius: 0 3px 3px 0;
    transition: width 0.3s ease;
  }
  .bar-footer {
    display: flex;
    justify-content: space-between;
    font-size: var(--ui-text-xs, 12px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255,255,255,0.45);
  }
  .bar-w, .bar-l {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .win-dot { background: #22c55e; }
  .loss-dot { background: #f87171; }
</style>
