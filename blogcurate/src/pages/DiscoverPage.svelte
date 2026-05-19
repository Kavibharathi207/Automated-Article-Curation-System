<script>
  import { onMount } from 'svelte';
  import { searchQuery, rejectedIds, interestedBlogs, bookmarks, rejectBlog, interestBlog, toggleBookmark, currentPage, selectedBlogId } from '../stores/store.js';
  import { mockBlogs } from '../data/mockData.js';

  let loading = true;
  let filter = 'all';
  let localSearch = '';

  onMount(() => {
    loading = true;
    setTimeout(() => loading = false, 1200);
  });

  $: interestedIds = $interestedBlogs.map(b => b.id);

  function matchesQuery(blog, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const haystack = [
      blog.title, blog.summary, blog.category, blog.source,
      ...(blog.tags || []), ...(blog.keywords || []),
    ].join(' ').toLowerCase();
    return terms.every(term => haystack.includes(term));
  }

  $: queryMatched = mockBlogs.filter(b => matchesQuery(b, $searchQuery));
  // Counts scoped to current query results only
  $: interestedCount = queryMatched.filter(b => interestedIds.includes(b.id)).length;
  $: rejectedCount   = queryMatched.filter(b => $rejectedIds.includes(b.id)).length;

  $: filtered = queryMatched.filter(b => {
    if (filter === 'interested') return interestedIds.includes(b.id);
    if (filter === 'rejected')   return $rejectedIds.includes(b.id);
    if (localSearch) return b.title.toLowerCase().includes(localSearch.toLowerCase())
                        || b.summary.toLowerCase().includes(localSearch.toLowerCase());
    return true;
  });

  function getScores(id) {
    const seed = id * 137;
    const rel = +((6.5 + (seed % 35) / 10)).toFixed(1);
    const inn = +((6.0 + ((seed * 3) % 40) / 10)).toFixed(1);
    return { rel: Math.min(rel, 10), inn: Math.min(inn, 10) };
  }
  function scorePillClass(v) { return v >= 9 ? 'high' : v >= 7 ? 'mid' : 'low'; }

  function handleGenerate(blog) {
    selectedBlogId.set(blog.id);
    currentPage.set('preview');
  }
</script>

<div class="discover-wrap">
  <!-- Page header -->
  <div class="discover-header">
    <div>
      <div class="breadcrumb">
        <button class="breadcrumb-back" on:click={() => currentPage.set('home')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Search
        </button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Results</span>
      </div>
      <h1 class="discover-title">Results for "{$searchQuery}"</h1>
      <p class="discover-meta">{queryMatched.length} article{queryMatched.length !== 1 ? 's' : ''} found{interestedCount > 0 ? ` · ${interestedCount} marked interested` : ''}</p>
    </div>
    {#if interestedCount > 0}
      <button class="generate-btn" on:click={() => currentPage.set('preview')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Generate Blog ({interestedCount})
      </button>
    {/if}
  </div>

  <!-- Filter bar -->
  <div class="filter-bar">
    <div class="filter-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input bind:value={localSearch} placeholder="Filter results…" />
    </div>
    <div class="filter-tabs">
      {#each [
        { key: 'all',        label: `All (${queryMatched.length})` },
        { key: 'interested', label: `Interested${interestedCount > 0 ? ` (${interestedCount})` : ''}` },
        { key: 'rejected',   label: `Rejected${rejectedCount > 0 ? ` (${rejectedCount})` : ''}` },
      ] as f}
        <button class="filter-tab" class:active={filter === f.key} on:click={() => filter = f.key}>
          {f.label}
        </button>
      {/each}
    </div>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">AI is searching for "{$searchQuery}"…</p>
    </div>
  {:else if filtered.length === 0}
    <div class="empty-state">
      <div class="e-icon">🔍</div>
      <h3>No results for "{$searchQuery}"</h3>
      <p>Try a broader topic or pick from Trending Topics</p>
      <button class="btn btn-outline" style="margin-top:20px" on:click={() => currentPage.set('home')}>← Back to Search</button>
    </div>
  {:else}
    <div class="article-list">
      {#each filtered as blog}
        {@const isRejected   = $rejectedIds.includes(blog.id)}
        {@const isInterested = interestedIds.includes(blog.id)}
        {@const isBookmarked = $bookmarks.includes(blog.id)}
        {@const sc = getScores(blog.id)}
        <article class="article-card" class:is-rejected={isRejected} class:is-interested={isInterested}>
          <div class="article-body">
            <!-- Meta row -->
            <div class="article-meta">
              <span class="article-source">{blog.source}</span>
              <span class="meta-dot">·</span>
              <span class="article-read-time">{blog.readTime}</span>
              <span class="meta-dot">·</span>
              <span class="article-category">{blog.category}</span>
            </div>

            <!-- Title + summary -->
            <h2 class="article-title">{blog.title}</h2>
            <p class="article-summary">{blog.summary}</p>

            <!-- Tags -->
            <div class="article-tags">
              {#each blog.tags as t}<span class="tag-pill">{t}</span>{/each}
            </div>

            <!-- Score + actions row -->
            <div class="article-footer">
              <div class="score-row">
                <span class="score-pill {scorePillClass(sc.rel)}" title="Relevance">R {sc.rel}</span>
                <span class="score-pill {scorePillClass(sc.inn)}" title="Innovation">I {sc.inn}</span>
                {#if sc.rel >= 9 && sc.inn >= 9}
                  <span class="featured-pill">⭐ Featured</span>
                {/if}
              </div>

              <div class="action-row">
                <button
                  class="action-btn bookmark"
                  class:bookmarked={isBookmarked}
                  on:click={() => toggleBookmark(blog.id)}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </button>

                {#if isInterested}
                  <button class="action-btn generate" on:click={() => handleGenerate(blog)}>
                    ✨ Generate Blog
                  </button>
                {:else}
                  <button class="action-btn reject" class:active={isRejected} on:click={() => rejectBlog(blog.id)}>
                    {isRejected ? 'Rejected' : 'Not Interested'}
                  </button>
                  <button class="action-btn interest" on:click={() => interestBlog(blog)}>
                    👍 Interested
                  </button>
                {/if}
              </div>
            </div>
          </div>

          <!-- Thumbnail -->
          <img class="article-thumb" src={blog.image} alt="" />
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .discover-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }

  /* Header */
  .discover-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; padding: 32px 0 24px;
    border-bottom: 1px solid var(--divider);
  }

  /* Breadcrumb */
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 12px;
  }
  .breadcrumb-back {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; transition: color 0.15s;
  }
  .breadcrumb-back:hover { color: var(--text-black); }
  .breadcrumb-sep { font-size: 13px; color: var(--text-hint); }
  .breadcrumb-current { font-size: 13px; color: var(--text-muted); }
  .discover-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px; line-height: 1.2;
    margin-bottom: 6px;
  }
  .discover-meta { font-size: 14px; color: var(--text-muted); }

  .generate-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--text-black); color: #fff; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 10px 20px; border-radius: 100px; white-space: nowrap;
    transition: background 0.15s; flex-shrink: 0;
  }
  .generate-btn:hover { background: #333; }

  /* Filter bar */
  .filter-bar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 16px 0;
    border-bottom: 1px solid var(--divider);
  }
  .filter-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--off-white); border: 1px solid var(--divider);
    border-radius: 100px; padding: 7px 14px; flex: 1; max-width: 280px;
  }
  .filter-search svg { color: var(--text-muted); flex-shrink: 0; }
  .filter-search input {
    border: none; background: transparent; outline: none;
    font-size: 13px; color: var(--text-black); padding: 0; width: 100%;
  }
  .filter-tabs { display: flex; gap: 0; }
  .filter-tab {
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 6px 14px; border-radius: 100px; transition: color 0.15s, background 0.15s;
  }
  .filter-tab:hover { color: var(--text-black); }
  .filter-tab.active {
    color: var(--text-black); font-weight: 500;
    background: var(--off-white);
  }

  /* Loading */
  .loading-state {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 80px 0;
  }
  .loading-text { font-size: 14px; color: var(--text-muted); }

  /* Article list — Medium-style rows */
  .article-list { padding-top: 8px; }

  .article-card {
    display: flex; align-items: flex-start; gap: 24px;
    padding: 28px 0; border-bottom: 1px solid var(--divider);
    transition: opacity 0.2s;
  }
  .article-card.is-rejected { opacity: 0.45; }
  .article-card.is-interested { background: transparent; }

  .article-body { flex: 1; min-width: 0; }

  .article-meta {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--text-muted); margin-bottom: 10px;
  }
  .meta-dot { color: var(--text-hint); }
  .article-source { font-weight: 500; color: var(--text-body); }
  .article-category {
    background: var(--off-white); border: 1px solid var(--divider);
    padding: 2px 8px; border-radius: 100px; font-size: 11px;
    color: var(--text-muted); font-weight: 500;
  }

  .article-title {
    font-family: var(--serif); font-size: 20px; font-weight: 700;
    color: var(--text-black); line-height: 1.3; letter-spacing: -0.2px;
    margin-bottom: 8px;
  }
  .article-summary {
    font-size: 14px; color: var(--text-muted); line-height: 1.65;
    margin-bottom: 12px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .tag-pill {
    font-size: 11px; color: var(--text-muted); background: var(--off-white);
    border: 1px solid var(--divider); padding: 3px 10px; border-radius: 100px;
  }

  /* Footer row */
  .article-footer {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .score-row { display: flex; align-items: center; gap: 6px; }
  .score-pill {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px;
    letter-spacing: 0.02em;
  }
  .score-pill.high { background: var(--green-light); color: var(--green-dark); }
  .score-pill.mid  { background: var(--amber-light); color: var(--amber); }
  .score-pill.low  { background: var(--off-white);   color: var(--text-muted); }
  .featured-pill {
    font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 100px;
    background: var(--amber-light); color: #92400E;
  }

  .action-row { display: flex; align-items: center; gap: 8px; }
  .action-btn {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--divider); background: var(--white);
    font-size: 13px; font-family: var(--sans); cursor: pointer;
    padding: 6px 14px; border-radius: 100px; transition: all 0.15s;
    color: var(--text-body); white-space: nowrap;
  }
  .action-btn:hover { border-color: var(--text-black); color: var(--text-black); }
  .action-btn.bookmark { padding: 6px 10px; color: var(--text-muted); }
  .action-btn.bookmark.bookmarked { color: var(--text-black); border-color: var(--text-black); }
  .action-btn.interest { background: var(--green); color: #fff; border-color: var(--green); }
  .action-btn.interest:hover { background: var(--green-dark); border-color: var(--green-dark); }
  .action-btn.reject.active { background: var(--red-light); color: var(--red); border-color: var(--red); }
  .action-btn.generate { background: var(--text-black); color: #fff; border-color: var(--text-black); }
  .action-btn.generate:hover { background: #333; }

  /* Thumbnail */
  .article-thumb {
    width: 120px; height: 80px; object-fit: cover;
    border-radius: 4px; flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .article-card { flex-direction: column-reverse; gap: 12px; }
    .article-thumb { width: 100%; height: 160px; }
    .filter-bar { flex-direction: column; align-items: flex-start; }
    .filter-search { max-width: 100%; }
    .discover-header { flex-direction: column; }
  }
</style>
