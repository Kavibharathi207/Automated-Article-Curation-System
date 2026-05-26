<script>
  import { scheduledPosts } from '../stores/store.js';
 // @ts-ignore
   $: published = $scheduledPosts.filter(p => p.status === 'published').slice().reverse();
  // @ts-ignore
  function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }
</script>

<div class="feed-inner">
  <div class="feed-heading">Published Posts</div>
  {#if published.length === 0}
    <div class="empty-feed">
      <p class="empty-title">No published posts yet</p>
      <p class="empty-sub">Schedule a blog and it will appear here once published.</p>
    </div>
  {:else}
    <div class="feed-list">
      {#each published as p}
        <div class="feed-row">
          <div class="feed-body">
            <div class="feed-title">{p.title}</div>
            <div class="feed-meta">
              <span class="feed-cat">{p.category}</span>
              <span class="feed-sep">·</span>
              <span class="feed-time">{fmtTime(p.scheduledAt)}</span>
              <span class="feed-sep">·</span>
              <span class="feed-status">Published</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .feed-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .empty-feed { padding: 20px 0; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .empty-sub   { font-size: 13px; color: var(--text-muted); }
  .feed-list { display: flex; flex-direction: column; }
  .feed-row {
    padding: 12px 0; border-bottom: 1px solid var(--divider);
  }
  .feed-row:last-child { border-bottom: none; }
  .feed-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; line-height: 1.4; }
  .feed-meta  { display: flex; align-items: center; gap: 5px; }
  .feed-cat   { font-size: 11px; font-weight: 500; color: var(--text-muted); background: var(--off-white); border: 1px solid var(--divider); padding: 2px 8px; border-radius: 100px; }
  .feed-sep   { font-size: 11px; color: var(--text-hint); }
  .feed-time  { font-size: 12px; color: var(--text-muted); }
  .feed-status { font-size: 12px; font-weight: 500; color: var(--green); }
</style>
