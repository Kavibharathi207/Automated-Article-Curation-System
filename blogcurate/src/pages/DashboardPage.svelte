<script>
  import { currentPage, bookmarks, interestedBlogs, rejectedIds, scheduledPosts, pipelineStats, pipelineStatus, pipelineFlag, user } from '../stores/store.js';
  import { mockBlogs } from '../data/mockData.js';
  import Charts        from '../components/Charts.svelte';

  $: bookmarkedBlogs = mockBlogs.filter(b => $bookmarks.includes(b.id));

  // Top categories from interested blogs
  $: topCategories = (() => {
    const counts = {};
    $interestedBlogs.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();
  $: maxCatCount = topCategories.length ? topCategories[0][1] : 1;

  $: stats = [
    { label: 'Scheduled',  page: 'scheduled',  value: $pipelineStats.scheduled,  color: 'var(--amber)',      bg: 'var(--amber-light)' },
    { label: 'Published',  page: 'published',  value: $pipelineStats.published,  color: 'var(--green)',      bg: 'var(--green-light)' },
    { label: 'Interested', page: 'interested', value: $pipelineStats.interested, color: 'var(--text-black)', bg: 'var(--off-white)'   },
    { label: 'Rejected',   page: 'rejected',   value: $pipelineStats.rejected,   color: 'var(--red)',        bg: 'var(--red-light)'   },
  ];

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }
</script>

<div class="dash-wrap">

  <!-- Page header -->
  <div class="dash-header">
    <div>
      <h1 class="dash-title">Dashboard</h1>
      <p class="dash-sub">Welcome back, <strong>{$user?.name}</strong></p>
    </div>
    <button class="new-btn" on:click={() => currentPage.set('home')}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      New Search
    </button>
  </div>

  <!-- Pipeline status bar -->
  <div class="pipeline-bar">
    <div class="pipeline-bar-left">
      <span class="pipeline-label">Pipeline</span>
      <span class="flag-pill {$pipelineFlag.toLowerCase()}">
        <span class="flag-dot"></span>
        {$pipelineFlag}
      </span>
    </div>
    <div class="pipeline-bar-right">
      <div class="pipeline-meta">
        <span class="meta-label">Last run</span>
        <span class="meta-val">{fmtDate($pipelineStatus?.lastRun)}</span>
      </div>
      <div class="pipeline-meta">
        <span class="meta-label">Next run</span>
        <span class="meta-val">{fmtDate($pipelineStatus?.nextRun)}</span>
      </div>
    </div>
  </div>

  <!-- Stat cards -->
  <div class="stat-grid">
    {#each stats as s}
      <button class="stat-card" on:click={() => currentPage.set(s.page)}>
        <div class="stat-value" style="color:{s.color}">{s.value}</div>
        <div class="stat-label">{s.label}</div>
        <div class="stat-arrow">→</div>
      </button>
    {/each}
  </div>

  <!-- Two column: Queue + Bookmarks -->
  <div class="two-col">

    <!-- Publish Queue -->
    <div class="dash-card">
      <div class="card-head">
        <span class="card-heading">Publish Queue</span>
        <div class="card-head-actions">
          <button class="ghost-link" on:click={() => currentPage.set('scheduled')}>View all →</button>
          <button class="pill-btn" on:click={() => currentPage.set('home')}>+ New</button>
        </div>
      </div>

      {#if $scheduledPosts.length === 0}
        <div class="empty-block">
          <p class="empty-title">No posts yet</p>
          <p class="empty-sub">Search a topic and schedule a blog to see it here.</p>
          <button class="pill-btn" style="margin-top:14px" on:click={() => currentPage.set('home')}>Start Curating</button>
        </div>
      {:else}
        <div class="queue-list">
          {#each [...$scheduledPosts].reverse().slice(0,5) as item}
            <button class="queue-row" on:click={() => currentPage.set(item.status === 'published' ? 'published' : 'scheduled')}>
              <span class="q-dot {item.status}"></span>
              <div class="q-body">
                <div class="q-title">{item.title}</div>
                <div class="q-meta">
                  <span class="q-status {item.status}">{item.status === 'published' ? 'Published' : 'Scheduled'}</span>
                  <span class="q-sep">·</span>
                  <span class="q-time">{new Date(item.scheduledAt).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}</span>
                </div>
              </div>
              <span class="q-category">{item.category}</span>
            </button>
          {/each}
        </div>
        {#if $scheduledPosts.length > 5}
          <button class="ghost-link" style="margin-top:12px;width:100%;text-align:center" on:click={() => currentPage.set('scheduled')}>
            View all {$scheduledPosts.length} posts →
          </button>
        {/if}
      {/if}
    </div>

    <!-- Bookmarks -->
    <div class="dash-card">
      <div class="card-head">
        <span class="card-heading">Bookmarked Blogs</span>
        {#if bookmarkedBlogs.length > 0}
          <button class="ghost-link" on:click={() => currentPage.set('discover')}>View all →</button>
        {/if}
      </div>

      {#if bookmarkedBlogs.length === 0}
        <div class="empty-block">
          <p class="empty-title">No bookmarks yet</p>
          <p class="empty-sub">Pin blogs from Discover to save them here.</p>
          <button class="pill-btn" style="margin-top:14px" on:click={() => currentPage.set('discover')}>Go to Discover</button>
        </div>
      {:else}
        <div class="bookmark-list">
          {#each bookmarkedBlogs.slice(0,4) as blog}
            <button class="bookmark-row" on:click={() => currentPage.set('discover')}>
              <img src={blog.image} alt={blog.title} class="bookmark-thumb" />
              <div class="bookmark-body">
                <div class="bookmark-title">{blog.title}</div>
                <div class="bookmark-meta">{blog.source} · {blog.readTime}</div>
              </div>
              <span class="bookmark-cat">{blog.category}</span>
            </button>
          {/each}
          {#if bookmarkedBlogs.length > 4}
            <button class="ghost-link" style="margin-top:8px;width:100%;text-align:center" on:click={() => currentPage.set('discover')}>
              +{bookmarkedBlogs.length - 4} more →
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Activity chart -->
  <div class="dash-card" style="margin-top:20px">
    <Charts />
  </div>

  <!-- Most Selected Interests -->
  {#if topCategories.length > 0}
    <div class="dash-card" style="margin-top:20px">
      <div class="card-head">
        <span class="card-heading">Most Selected Interests</span>
        <button class="ghost-link" on:click={() => currentPage.set('interested')}>View all →</button>
      </div>
      <div class="interest-bars">
        {#each topCategories as [cat, count]}
          <div class="interest-row">
            <span class="interest-label">{cat}</span>
            <div class="interest-track">
              <div class="interest-fill" style="width:{Math.round((count / maxCatCount) * 100)}%"></div>
            </div>
            <span class="interest-count">{count}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

</div>

<style>
  .dash-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 40px 32px 80px;
  }

  /* Header */
  .dash-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; padding-bottom: 28px; margin-bottom: 28px;
    border-bottom: 1px solid var(--divider);
  }
  .dash-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .dash-sub { font-size: 14px; color: var(--text-muted); }
  .dash-sub strong { color: var(--text-black); font-weight: 600; }

  .new-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--text-black); color: var(--white); border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 10px 20px; border-radius: 100px; white-space: nowrap;
    transition: background 0.15s; flex-shrink: 0;
  }
  .new-btn:hover { background: var(--divider-strong); }

  /* Pipeline bar */
  .pipeline-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border: 1px solid var(--divider);
    border-radius: 8px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
    background: var(--off-white);
  }
  .pipeline-bar-left { display: flex; align-items: center; gap: 12px; }
  .pipeline-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .flag-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
  }
  .flag-pill.on    { background: var(--green-light); color: var(--green-dark); }
  .flag-pill.pause { background: var(--amber-light); color: var(--amber); }
  .flag-pill.off   { background: var(--red-light);   color: var(--red); }
  .flag-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

  .pipeline-bar-right { display: flex; align-items: center; gap: 24px; }
  .pipeline-meta { display: flex; flex-direction: column; gap: 2px; }
  .meta-label { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-hint); }
  .meta-val   { font-size: 13px; font-weight: 500; color: var(--text-black); }

  /* Stat grid */
  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 20px;
  }
  .stat-card {
    position: relative; padding: 20px 20px 16px;
    border: 1px solid var(--divider); border-radius: 8px;
    background: var(--white); cursor: pointer; text-align: left;
    transition: box-shadow 0.15s, border-color 0.15s;
    font-family: var(--sans); color: var(--text-body);
  }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: var(--divider-strong); }
  .stat-value {
    font-family: var(--serif); font-size: 36px; font-weight: 700;
    line-height: 1; margin-bottom: 6px;
  }
  .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
  .stat-arrow {
    position: absolute; top: 20px; right: 18px;
    font-size: 14px; color: var(--text-hint);
  }

  /* Two column */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  /* Cards */
  .dash-card {
    border: 1px solid var(--divider); border-radius: 8px;
    background: var(--white); padding: 24px;
  }
  .card-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .card-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .card-head-actions { display: flex; align-items: center; gap: 8px; }

  /* Buttons */
  .ghost-link {
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; transition: color 0.15s;
  }
  .ghost-link:hover { color: var(--text-black); }
  .pill-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--text-black); color: var(--white); border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: var(--sans);
    padding: 7px 14px; border-radius: 100px; transition: background 0.15s;
  }
  .pill-btn:hover { background: var(--divider-strong); }

  /* Empty state */
  .empty-block { padding: 20px 0; text-align: center; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .empty-sub   { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

  /* Queue */
  .queue-list { display: flex; flex-direction: column; }
  .queue-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--divider);
    cursor: pointer; transition: background 0.1s;
    width: 100%; background: none; border-left: none; border-right: none; border-top: none;
    text-align: left; font-family: var(--sans);
  }
  .queue-row:last-child { border-bottom: none; }
  .queue-row:hover { background: var(--off-white); margin: 0 -8px; padding: 12px 8px; border-radius: 6px; }
  .q-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .q-dot.scheduled { background: var(--amber); }
  .q-dot.published { background: var(--green); }
  .q-body { flex: 1; min-width: 0; }
  .q-title {
    font-size: 13px; font-weight: 500; color: var(--text-black);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .q-meta { display: flex; align-items: center; gap: 5px; }
  .q-status { font-size: 11px; font-weight: 600; }
  .q-status.scheduled { color: var(--amber); }
  .q-status.published { color: var(--green); }
  .q-sep  { font-size: 11px; color: var(--text-hint); }
  .q-time { font-size: 11px; color: var(--text-muted); }
  .q-category {
    font-size: 11px; font-weight: 500; color: var(--text-muted);
    background: var(--off-white); border: 1px solid var(--divider);
    padding: 2px 8px; border-radius: 100px; flex-shrink: 0;
  }

  /* Bookmarks */
  .bookmark-list { display: flex; flex-direction: column; }
  .bookmark-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--divider);
    cursor: pointer; width: 100%; background: none;
    border-left: none; border-right: none; border-top: none;
    text-align: left; font-family: var(--sans);
  }
  .bookmark-row:last-child { border-bottom: none; }
  .bookmark-row:hover .bookmark-title { color: var(--green); }
  .bookmark-thumb {
    width: 52px; height: 38px; object-fit: cover;
    border-radius: 4px; flex-shrink: 0;
  }
  .bookmark-body { flex: 1; min-width: 0; }
  .bookmark-title {
    font-size: 13px; font-weight: 500; color: var(--text-black);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px; transition: color 0.15s;
  }
  .bookmark-meta { font-size: 11px; color: var(--text-muted); }
  .bookmark-cat {
    font-size: 11px; font-weight: 500; color: var(--text-muted);
    background: var(--off-white); border: 1px solid var(--divider);
    padding: 2px 8px; border-radius: 100px; flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .dash-wrap { padding: 24px 16px 60px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .two-col   { grid-template-columns: 1fr; }
    .dash-header { flex-direction: column; }
    .pipeline-bar-right { display: none; }
  }

  /* Interest bars */
  .interest-bars { display: flex; flex-direction: column; gap: 12px; }
  .interest-row { display: flex; align-items: center; gap: 12px; }
  .interest-label { font-size: 13px; color: var(--text-body); font-weight: 500; width: 120px; flex-shrink: 0; }
  .interest-track { flex: 1; height: 6px; background: var(--divider); border-radius: 99px; overflow: hidden; }
  .interest-fill { height: 100%; background: var(--green); border-radius: 99px; transition: width 0.5s ease; }
  .interest-count { font-size: 12px; color: var(--text-muted); font-weight: 600; width: 20px; text-align: right; flex-shrink: 0; }
</style>
