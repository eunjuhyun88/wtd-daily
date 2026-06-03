<script lang="ts">
  import { dispatchLever, type LeverId } from '$lib/analytics/lever-events';

  let {
    lever,
    label,
    cta,
    href,
    surface
  }: {
    lever: LeverId;
    label: string;
    cta: string;
    href: string;
    surface: string;
  } = $props();

  function onClick() {
    dispatchLever(lever, { surface, trigger: 'cta_click' });
  }
</script>

<a class="band band-{lever}" {href} onclick={onClick} aria-label={label}>
  <span class="band-l">{label}</span>
  <span class="band-cta">{cta} <span class="band-arrow">→</span></span>
</a>

<style>
  .band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 clamp(12px, 3vw, 24px);
    padding: 14px 18px;
    border: 1px solid rgba(249, 216, 194, 0.18);
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(249, 216, 194, 0.05), rgba(219, 154, 159, 0.04));
    color: var(--g9, #eceae8);
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .band:hover {
    border-color: rgba(249, 216, 194, 0.4);
    background: linear-gradient(90deg, rgba(249, 216, 194, 0.08), rgba(219, 154, 159, 0.06));
  }
  .band-l {
    font-size: 14px;
    line-height: 1.4;
  }
  .band-cta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: rgba(249, 216, 194, 0.9);
    white-space: nowrap;
  }
  .band-arrow { margin-left: 4px; }
  @media (max-width: 640px) {
    .band { flex-direction: column; align-items: flex-start; }
    .band-cta { align-self: flex-end; }
  }
</style>
