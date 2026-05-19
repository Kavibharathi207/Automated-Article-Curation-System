<script>
  import { currentPage, scheduledPosts } from '../stores/store.js';
  import { mockGeneratedBlog } from '../data/mockData.js';
  $: posts = $scheduledPosts.filter(p => p.status === 'published');
</script>

<div class="page">
  <div class="page-header">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn-ghost btn-sm" on:click={() => currentPage.set('dashboard')}>← Dashboard</button>
      <div>
        <h1>✅ Published Posts</h1>
        <p>{posts.length} blog{posts.length !== 1 ? 's' : ''} published</p>
      </div>
    </div>
  </div>

  {#if posts.length === 0}
    <div class="empty-state">
      <div class="e-icon">📰</div>
      <h3>No published posts yet</h3>
      <p>Scheduled blogs will appear here once they go live.</p>
      <button class="btn btn-primary" style="margin-top:16px" on:click={() => currentPage.set('home')}>🔍 Start Curating</button>
    </div>
  {:else}
    <div class="detail-list">
      {#each [...posts].reverse() as post}
        <div class="detail-card">
          <img
            src={mockGeneratedBlog.coverImage}
            alt=""
            class="detail-card-img"
          />
          <div class="detail-card-body">
            <div class="detail-card-title">{post.title}</div>
            <div class="detail-card-meta">
              <span class="tag tag-green">✅ Published</span>
              <span class="tag tag-purple">{post.category}</span>
              <span class="detail-time">
                📅 {new Date(post.scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <p class="detail-card-summary">{mockGeneratedBlog.content[1].text}</p>
          </div>
          <div class="detail-card-actions">
            <button class="btn btn-outline btn-sm" on:click={() => currentPage.set('preview')}>👁 View</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
