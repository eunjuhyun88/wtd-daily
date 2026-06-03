<script lang="ts">
  import { onMount } from 'svelte';
  import { communityPosts, hydrateCommunityPosts } from '$lib/stores/communityStore';
  import CommunityPost from './CommunityPost.svelte';
  import CommunityComposer from './CommunityComposer.svelte';
  import SocialSentiPanel from './SocialSentiPanel.svelte';
  import { fetchSocialSenti } from '$lib/api/socialSentiApi';
  import type { CommunitySocialPayload } from '$lib/types/social';

  interface Props {
    token?: string;
    slug?: string;
    initialSocial?: CommunitySocialPayload;
  }

  const { token, slug, initialSocial }: Props = $props();

  let activeTab = $state<'community' | 'social'>('community');

  let socialData = $state<CommunitySocialPayload | null>(null);
  let socialLoading = $state(true);
  let abortCtrl: AbortController | null = null;

  $effect(() => {
    socialData = initialSocial ?? null;
    socialLoading = !initialSocial;
  });

  onMount(() => {
    void hydrateCommunityPosts();
  });

  $effect(() => {
    if (initialSocial) return;
    if (!token) {
      socialLoading = false;
      return;
    }
    abortCtrl?.abort();
    abortCtrl = new AbortController();
    const ctrl = abortCtrl;
    socialLoading = true;
    const timer = setTimeout(() => ctrl.abort(), 10000);
    fetchSocialSenti(token, ctrl.signal).then(data => {
      clearTimeout(timer);
      if (ctrl.signal.aborted) return;
      socialData = data;
      socialLoading = false;
    });
    return () => { abortCtrl?.abort(); };
  });

  function retryFetch() {
    if (!token) return;
    abortCtrl?.abort();
    abortCtrl = new AbortController();
    const ctrl = abortCtrl;
    socialLoading = true;
    socialData = null;
    const timer = setTimeout(() => ctrl.abort(), 10000);
    fetchSocialSenti(token, ctrl.signal).then(data => {
      clearTimeout(timer);
      if (ctrl.signal.aborted) return;
      socialData = data;
      socialLoading = false;
    });
  }
</script>

<div class="cf-wrap">
  <!-- Tab bar -->
  <div class="cf-tabs" role="tablist">
    <button
      class="cf-tab"
      class:active={activeTab === 'community'}
      role="tab"
      aria-selected={activeTab === 'community'}
      onclick={() => activeTab = 'community'}
      type="button"
    >커뮤니티</button>
    <button
      class="cf-tab"
      class:active={activeTab === 'social'}
      role="tab"
      aria-selected={activeTab === 'social'}
      onclick={() => activeTab = 'social'}
      type="button"
    >소셜 감성</button>
  </div>

  <!-- Community tab -->
  {#if activeTab === 'community'}
    <div class="cf-panel">
      <CommunityComposer />
      <div class="cf-posts">
        {#if $communityPosts.length === 0}
          <div class="cf-empty">아직 커뮤니티 글이 없습니다.</div>
        {:else}
          {#each $communityPosts as post (post.id)}
            <CommunityPost {post} />
          {/each}
        {/if}
      </div>
    </div>

  <!-- Social sentiment tab -->
  {:else}
    <div class="cf-panel">
      <SocialSentiPanel social={socialData} loading={socialLoading} onretry={retryFetch} />
    </div>
  {/if}
</div>

<style>
  .cf-wrap {
    font-family: 'JetBrains Mono', monospace;
    color: rgba(250,247,235,.85);
  }

  /* Tabs */
  .cf-tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    margin-bottom: 0;
  }
  .cf-tab {
    padding: 8px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: rgba(250,247,235,.38);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color .15s, border-color .15s;
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .cf-tab:hover { color: rgba(250,247,235,.65); }
  .cf-tab.active {
    color: rgba(250,247,235,.92);
    border-bottom-color: rgba(74,222,128,.7);
  }

  /* Panel */
  .cf-panel {
    padding-top: 4px;
  }

  /* Posts list */
  .cf-posts {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 4px;
  }
  .cf-empty {
    font-size: 11px;
    color: rgba(255,255,255,.3);
    padding: 16px 0;
    text-align: center;
  }
</style>
