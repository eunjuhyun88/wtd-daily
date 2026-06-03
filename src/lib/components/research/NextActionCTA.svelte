<script lang="ts">
  /**
   * NextActionCTA — sticky bottom bar on the bucket detail page.
   *
   * Derives one contextual question + up to two action buttons from the
   * active mode's status (W-0414 PR8E). Mirrors Marina's "what next?"
   * prompt but frames it as an entry-decision action, not a backtest.
   */
  import type { ModeStatusOut, PoolingChainOut } from '$lib/types/research';

  type Mode = 'standard' | 'conservative' | 'aggressive';
  type Action =
    | { label: string; href: string; primary: boolean; onclick?: never }
    | { label: string; href?: never; primary: boolean; onclick: () => void };

  interface Props {
    activeMode: Mode;
    status: ModeStatusOut | undefined;
    chain: PoolingChainOut;
    bucketKey: string;
    onSwitchMode: (m: Mode) => void;
  }

  const { activeMode, status, chain, bucketKey, onSwitchMode }: Props = $props();

  const config = $derived.by<{ question: string; actions: Action[] } | null>(() => {
    if (!status) return null;

    const s = status.status;
    const parentKey = chain.parent?.key ?? null;
    const parentHref = parentKey
      ? `/research/buckets/${encodeURIComponent(parentKey)}`
      : null;
    const cfHref = `/lab/counterfactual?bucket=${encodeURIComponent(bucketKey)}`;

    switch (s) {
      case 'cold_start':
        return {
          question: 'Insufficient data at cell level. View parent bucket?',
          actions: parentHref
            ? [{ label: 'View parent →', href: parentHref, primary: true }]
            : [],
        };

      case 'watch': {
        const switchTarget: Mode = activeMode !== 'conservative' ? 'conservative' : 'standard';
        return {
          question:
            activeMode !== 'conservative'
              ? 'Not ready to accept. Check conservative threshold?'
              : 'Conservative threshold not met. Compare with standard?',
          actions: [
            {
              label: `Switch to ${switchTarget}`,
              primary: true,
              onclick: () => onSwitchMode(switchTarget),
            },
            ...(parentHref
              ? [{ label: 'View parent →', href: parentHref, primary: false } as Action]
              : []),
          ],
        };
      }

      case 'accept': {
        const switchTarget: Mode = activeMode !== 'conservative' ? 'conservative' : 'aggressive';
        return {
          question:
            activeMode !== 'conservative'
              ? 'Accept conditions met. Verify with conservative threshold?'
              : 'Passes conservative — strong signal. Run counterfactual?',
          actions: [
            {
              label: activeMode !== 'conservative' ? 'Switch to conservative' : 'Switch to aggressive',
              primary: true,
              onclick: () => onSwitchMode(switchTarget),
            },
            { label: 'Counterfactual →', href: cfHref, primary: false },
          ],
        };
      }

      case 'block':
        return {
          question: 'Blocked. Trace what would have changed this verdict?',
          actions: [
            { label: 'Counterfactual →', href: cfHref, primary: true },
            ...(parentHref
              ? [{ label: 'View parent →', href: parentHref, primary: false } as Action]
              : []),
          ],
        };

      case 'force_block':
        return {
          question: 'Hard blocked. Review the evidence trail?',
          actions: [{ label: 'Counterfactual →', href: cfHref, primary: true }],
        };

      default:
        return null;
    }
  });
</script>

{#if config && config.actions.length > 0}
  <aside
    class="next-action-cta"
    aria-label="Suggested next action"
    data-testid="next-action-cta"
    data-status={status?.status}
    data-mode={activeMode}
  >
    <p class="question">{config.question}</p>
    <div class="actions">
      {#each config.actions as action (action.label)}
        {#if action.href}
          <a class="btn" class:primary={action.primary} href={action.href}>{action.label}</a>
        {:else if action.onclick}
          <button class="btn" class:primary={action.primary} onclick={action.onclick}>
            {action.label}
          </button>
        {/if}
      {/each}
    </div>
  </aside>
{/if}

<style>
  .next-action-cta {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 20px;
    background: rgba(10, 10, 12, 0.94);
    border-top: 1px solid rgba(249, 216, 194, 0.14);
    backdrop-filter: blur(8px);
    z-index: 10;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
  }

  .question {
    margin: 0;
    flex: 1;
    color: rgba(250, 247, 235, 0.72);
    font-size: var(--ui-text-sm);
    line-height: 1.3;
    min-width: 0;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 3px;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
    text-decoration: none;
    cursor: pointer;
    border: 1px solid rgba(249, 216, 194, 0.22);
    color: rgba(250, 247, 235, 0.78);
    background: rgba(249, 216, 194, 0.06);
    transition: background 0.12s, color 0.12s;
  }
  .btn:hover {
    background: rgba(249, 216, 194, 0.14);
    color: rgba(250, 247, 235, 0.95);
  }

  .btn.primary {
    background: rgba(249, 216, 194, 0.14);
    border-color: rgba(249, 216, 194, 0.45);
    color: rgba(250, 247, 235, 0.95);
  }
  .btn.primary:hover {
    background: rgba(249, 216, 194, 0.24);
  }

  @media (max-width: 768px) {
    .next-action-cta {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
    }
    .actions {
      width: 100%;
    }
    .btn {
      flex: 1;
      justify-content: center;
      text-align: center;
    }
  }
</style>
