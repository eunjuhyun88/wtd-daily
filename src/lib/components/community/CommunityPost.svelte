<script lang="ts">
  import type { CommunityPost } from '$lib/stores/communityStore';
  import { likeCommunityPost } from '$lib/stores/communityStore';

  interface Props {
    post: CommunityPost;
  }

  const { post }: Props = $props();
</script>

<div class="comm-post user-post">
  <div class="comm-head">
    <div
      class="comm-avatar"
      style="background:{post.avatarColor}20;color:{post.avatarColor}"
    >{post.avatar}</div>
    <span class="comm-name">{post.author}</span>
    <span class="comm-time">now</span>
  </div>
  <div class="comm-txt">{post.text}</div>
  <div class="comm-actions">
    {#if post.signal}
      <span class="comm-sig {post.signal}">{post.signal.toUpperCase()}</span>
    {/if}
    <button class="comm-react" onclick={() => likeCommunityPost(post.id)} type="button">👍</button>
    <button class="comm-react" onclick={() => likeCommunityPost(post.id)} type="button">🔥</button>
  </div>
</div>

<style>
  .comm-post {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .comm-head {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
  }
  .comm-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,.2);
    flex-shrink: 0;
  }
  .comm-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
  }
  .comm-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,.3);
    margin-left: auto;
  }
  .comm-txt {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255,255,255,.8);
  }
  .user-post {
    border-left: 2px solid #facc15;
    padding-left: 8px;
  }
  .comm-sig {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border: 1px solid;
    margin-top: 3px;
  }
  .comm-sig.long { color: #00ff88; border-color: rgba(0,255,136,.3); }
  .comm-sig.short { color: #ff2d55; border-color: rgba(255,45,85,.3); }
  .comm-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 3px;
  }
  .comm-react {
    font-size: 11px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    transition: all .12s;
  }
  .comm-react:hover {
    background: rgba(232,150,125,.1);
    border-color: rgba(232,150,125,.25);
  }
</style>
