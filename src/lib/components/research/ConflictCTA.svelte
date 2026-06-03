<script lang="ts">
  /**
   * ConflictCTA — sticky bottom CTA shown when at least one bucket has
   * conflicting verdicts across modes (W-0414 PR8B §F: Hybrid info+action).
   *
   * Picks the bucket with the largest `n` for highest signal-to-noise.
   */
  import type { BucketListItem } from '$lib/types/research';

  interface Props {
    bucket: BucketListItem;
  }
  const { bucket }: Props = $props();

  const modes = $derived(bucket.modes ?? {});
  const std = $derived(modes.standard?.status ?? '—');
  const cons = $derived(modes.conservative?.status ?? '—');
  const aggr = $derived(modes.aggressive?.status ?? '—');
</script>

<aside class="conflict-cta" role="status" data-testid="conflict-cta">
  <div class="head">
    <span class="badge">CONFLICT</span>
    <span class="key">{bucket.bucket_key}</span>
    <span class="meta">n={bucket.state.n}</span>
  </div>
  <div class="modes">
    <span><b>Std</b> {std}</span>
    <span><b>Cons</b> {cons}</span>
    <span><b>Aggr</b> {aggr}</span>
  </div>
  <div class="actions">
    <a class="btn primary" href={`/research/bucket-attribution?bucket=${encodeURIComponent(bucket.bucket_key)}`}>
      Investigate
    </a>
  </div>
</aside>

<style>
  .conflict-cta {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: rgba(20, 12, 12, 0.94);
    border-top: 1px solid rgba(239, 68, 68, 0.45);
    backdrop-filter: blur(6px);
    z-index: 5;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
  }
  .head { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
  .badge {
    padding: 2px 7px;
    background: rgba(239, 68, 68, 0.2);
    color: var(--sc-red-300);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 3px;
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .key {
    color: rgba(250, 247, 235, 0.95);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    color: rgba(250, 247, 235, 0.5);
    font-variant-numeric: var(--ui-tabular);
  }
  .modes {
    display: flex;
    gap: 12px;
    color: rgba(250, 247, 235, 0.78);
  }
  .modes b {
    color: rgba(250, 247, 235, 0.55);
    font-weight: 500;
    margin-right: 4px;
  }
  .actions { margin-left: auto; }
  .btn.primary {
    padding: 6px 12px;
    background: rgba(219, 154, 159, 0.22);
    border: 1px solid rgba(219, 154, 159, 0.5);
    color: rgba(250, 247, 235, 0.95);
    border-radius: 3px;
    text-decoration: none;
    font-weight: 600;
    font-size: var(--ui-text-sm);
  }
  .btn.primary:hover { background: rgba(219, 154, 159, 0.34); }

  @media (max-width: 768px) {
    .conflict-cta {
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 10px;
    }
    .modes { font-size: var(--ui-text-xs); gap: 8px; }
    .actions { margin-left: 0; width: 100%; }
    .btn.primary { display: block; width: 100%; text-align: center; }
  }
</style>
