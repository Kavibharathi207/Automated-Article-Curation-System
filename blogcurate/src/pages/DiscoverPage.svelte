<script>
  import {
    searchQuery, rejectedIds, interestedBlogs, bookmarks,
    rejectBlog, interestBlog, toggleBookmark,
    currentPage, selectedBlog, articleFrom, addRecentSearch
  } from '../stores/store.js';
  import { mockBlogs, trendingTopics } from '../data/mockData.js';

  let discoverTab = 'trending';

  let searchInput = '';
  let showSuggestions = false;
  let searching = false;

  $: searchInput = $searchQuery;
  $: suggestions = searchInput.trim()
    ? trendingTopics.filter(t => t.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 6)
    : trendingTopics.slice(0, 6);

  function doSearch(term) {
    const t = (term || searchInput).trim();
    if (!t) return;
    addRecentSearch(t);
    searchQuery.set(t);
    showSuggestions = false;
    searchInput = t;
    searching = true;
    setTimeout(() => searching = false, 600);
  }
  function clearSearch() { searchQuery.set(''); searchInput = ''; }
  function onKey(e) {
    if (e.key === 'Enter') doSearch();
    if (e.key === 'Escape') showSuggestions = false;
  }

  function matchesQuery(blog, query) {
    if (!query) return false;
    const q = query.toLowerCase();
    const hay = [blog.title, blog.summary, blog.category, blog.source, ...(blog.tags || [])].join(' ').toLowerCase();
    return q.split(/\s+/).filter(Boolean).every(w => hay.includes(w));
  }

  $: results = $searchQuery ? mockBlogs.filter(b => matchesQuery(b, $searchQuery)) : [];
  $: interestedIds = $interestedBlogs.map(b => b.id);

  const trendingIds   = [1, 7, 11, 18, 14];
  const editorPickIds = [8, 5, 17, 13, 2];
  const evergreenIds  = [4, 9, 20, 3, 19];

  $: featuredTrending    = mockBlogs.filter(b => trendingIds.includes(b.id));
  $: featuredEditorPicks = mockBlogs.filter(b => editorPickIds.includes(b.id));
  $: featuredEvergreen   = mockBlogs.filter(b => evergreenIds.includes(b.id));

  const topicIcons = ['🤖','🔍','🛡️','🏥','💡','⚡','🚗','🌱','💻','☸️','🏢','🔗'];

  let dismissing = {};
  function animateReject(id) {
    dismissing = { ...dismissing, [id]: 'left' };
    setTimeout(() => { rejectBlog(id); delete dismissing[id]; dismissing = { ...dismissing }; }, 320);
  }
  function animateInterest(blog) {
    dismissing = { ...dismissing, [blog.id]: 'right' };
    setTimeout(() => { interestBlog(blog); delete dismissing[blog.id]; dismissing = { ...dismissing }; }, 320);
  }
  function openArticle(blog) {
    selectedBlog.set(blog); articleFrom.set('discover');
    currentPage.set('article'); window.scrollTo(0, 0);
  }

  const sections = [
    { id: 'trending',  icon: '🔥', label: 'Trending Now',    sub: 'Popular articles gaining traction this week' },
    { id: 'editors',   icon: '✨', label: "Editor's Picks",  sub: 'High-quality reads chosen for depth and insight' },
    { id: 'evergreen', icon: '📚', label: 'Evergreen Reads', sub: 'Timeless guides and deep-dives worth saving' },
  ];
</script>

<div class="discover-wrap">

  <!-- Header + Search -->
  <div class="discover-header">
    <div>
      <h1 class="discover-title">Discover</h1>
      <p class="discover-sub">Search articles, explore topics, and find featured reads.</p>
    </div>
  </div>

  <div class="search-wrap">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="search-bar" on:click={() => showSuggestions = true}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input bind:value={searchInput} placeholder="Search articles, topics, sources…" on:keydown={onKey} on:focus={() => showSuggestions = true} on:blur={() => setTimeout(() => showSuggestions = false, 150)} />
      {#if searchInput}<button class="search-clear" on:click={clearSearch}>✕</button>{/if}
      <button class="search-btn" on:click={() => doSearch()}>Search</button>
    </div>
    {#if showSuggestions}
      <div class="suggestions-drop">
        <p class="suggestions-label">Suggested topics</p>
        {#each suggestions as s}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="suggestion-item" on:click={() => doSearch(s)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            {s}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if $searchQuery}
    <!-- SEARCH RESULTS -->
    <section class="results-section">
      <div class="results-header">
        <span class="results-title">Results for "<strong>{$searchQuery}</strong>"</span>
        <button class="results-clear" on:click={clearSearch}>Clear search</button>
      </div>
      {#if searching}
        <div class="loading-row"><div class="spinner"></div><span>Searching…</span></div>
      {:else if results.length === 0}
        <div class="empty-state">
          <p class="empty-title">No results for "{$searchQuery}"</p>
          <p class="empty-sub">Try a broader term or pick a topic below.</p>
        </div>
      {:else}
        <div class="result-list">
          {#each results as blog}
            {@const isRejected   = $rejectedIds.includes(blog.id)}
            {@const isInterested = interestedIds.includes(blog.id)}
            {@const isBookmarked = $bookmarks.includes(Number(blog.id))}
            <article class="result-card" class:is-rejected={isRejected} class:dismiss-right={dismissing[blog.id]==='right'} class:dismiss-left={dismissing[blog.id]==='left'}>
              <div class="result-body">
                <div class="result-meta-row">
                  <span class="result-source">{blog.source}</span>
                  <span class="result-dot">·</span>
                  <span class="result-read">{blog.readTime} read</span>
                  <span class="result-category">{blog.category}</span>
                  {#if blog.lang === 'FR'}<span class="result-lang">FR</span>{/if}
                </div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <h3 class="result-title" on:click={() => openArticle(blog)}>{blog.title}</h3>
                <p class="result-summary">{blog.summary}</p>
                <div class="result-actions">
                  {#if isInterested}
                    <button class="ra-btn interested-active" on:click={() => animateInterest(blog)}>👍 Interested</button>
                    <button class="ra-btn generate" on:click={() => { selectedBlog.set(blog); currentPage.set('preview'); }}>✨ Generate</button>
                  {:else if !isRejected}
                    <button class="ra-btn" on:click={() => animateInterest(blog)}>👍 Interested</button>
                    <button class="ra-btn" on:click={() => animateReject(blog.id)}>👎 Skip</button>
                  {/if}
                  <button class="ra-icon-btn" class:bk-active={isBookmarked} on:click={() => toggleBookmark(blog.id)} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  </button>
                </div>
              </div>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
              <img class="result-thumb" src={blog.image} alt="" on:click={() => openArticle(blog)} />
            </article>
          {/each}
        </div>
      {/if}
    </section>

  {:else}
    <!-- Explore Topics always on top -->
    <section class="topics-section">
      <h2 class="topics-heading">🗂️ Explore Topics</h2>
      <div class="topics-grid">
        {#each trendingTopics as topic, i}
          <button class="topic-chip" on:click={() => doSearch(topic)}>
            <span class="topic-icon">{topicIcons[i % topicIcons.length]}</span>
            {topic}
          </button>
        {/each}
      </div>
    </section>

    <!-- HORIZONTAL TAB LAYOUT -->
    <div class="discover-library">
      <div class="disc-top">
        <p class="disc-sidebar-heading">Browse</p>
        <nav class="disc-nav">
          {#each sections as s}
            <button
              class="disc-nav-item"
              class:active={discoverTab === s.id}
              on:click={() => discoverTab = s.id}
            >
              <span class="disc-nav-icon">{s.icon}</span>
              {s.label}
            </button>
          {/each}
        </nav>
      </div>

      <div class="disc-main">

        {#each sections as s}
          {#if discoverTab === s.id}
            <div class="disc-section-head">
              <div>
                <h2 class="disc-section-title"><span>{s.icon}</span> {s.label}</h2>
                <p class="disc-section-sub">{s.sub}</p>
              </div>
            </div>
          {/if}
        {/each}

        <!-- TRENDING -->
        {#if discoverTab === 'trending'}
          <div class="feat-grid">
            {#each featuredTrending as blog, i}
              {@const isBookmarked = $bookmarks.includes(Number(blog.id))}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="feat-card" class:feat-hero={i === 0} on:click={() => openArticle(blog)}>
                <img class="feat-img" src={blog.image} alt="" />
                <div class="feat-body">
                  <span class="feat-tag trending-tag">🔥 Trending</span>
                  <h3 class="feat-title">{blog.title}</h3>
                  <p class="feat-meta">{blog.source} · {blog.readTime} read</p>
                  <p class="feat-summary">{blog.summary}</p>
                </div>
                <button class="feat-bk" class:bk-active={isBookmarked} on:click|stopPropagation={() => toggleBookmark(blog.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
            {/each}
          </div>

        <!-- EDITOR'S PICKS -->
        {:else if discoverTab === 'editors'}
          <div class="feat-grid">
            {#each featuredEditorPicks as blog, i}
              {@const isBookmarked = $bookmarks.includes(Number(blog.id))}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="feat-card" class:feat-hero={i === 0} on:click={() => openArticle(blog)}>
                <img class="feat-img" src={blog.image} alt="" />
                <div class="feat-body">
                  <span class="feat-tag editor-tag">✨ Editor's Pick</span>
                  <h3 class="feat-title">{blog.title}</h3>
                  <p class="feat-meta">{blog.source} · {blog.readTime} read</p>
                  <p class="feat-summary">{blog.summary}</p>
                </div>
                <button class="feat-bk" class:bk-active={isBookmarked} on:click|stopPropagation={() => toggleBookmark(blog.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
            {/each}
          </div>

        <!-- EVERGREEN -->
        {:else if discoverTab === 'evergreen'}
          <div class="feat-grid">
            {#each featuredEvergreen as blog, i}
              {@const isBookmarked = $bookmarks.includes(Number(blog.id))}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="feat-card" class:feat-hero={i === 0} on:click={() => openArticle(blog)}>
                <img class="feat-img" src={blog.image} alt="" />
                <div class="feat-body">
                  <span class="feat-tag evergreen-tag">📚 Evergreen</span>
                  <h3 class="feat-title">{blog.title}</h3>
                  <p class="feat-meta">{blog.source} · {blog.readTime} read</p>
                  <p class="feat-summary">{blog.summary}</p>
                </div>
                <button class="feat-bk" class:bk-active={isBookmarked} on:click|stopPropagation={() => toggleBookmark(blog.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}

      </div>
    </div>
  {/if}

</div>

<style>
  .discover-wrap { max-width: 1080px; margin: 0 auto; padding: 0 32px 80px; }

  .discover-header { padding: 24px 0 20px; border-bottom: 1px solid var(--divider); margin-bottom: 24px; }
  .discover-title { font-family: var(--serif); font-size: 32px; font-weight: 700; color: var(--text-black); letter-spacing: -0.4px; margin-bottom: 4px; }
  .discover-sub { font-size: 14px; color: var(--text-muted); }

  /* Search */
  .search-wrap { position: relative; margin-bottom: 28px; }
  .search-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--white); border: 1.5px solid var(--divider-strong);
    border-radius: 100px; padding: 8px 8px 8px 18px; max-width: 640px;
    transition: border-color 0.2s, box-shadow 0.2s; cursor: text;
  }
  .search-bar:focus-within { border-color: var(--text-black); box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
  .search-bar svg { color: var(--text-muted); flex-shrink: 0; }
  .search-bar input { flex: 1; border: none; background: transparent; outline: none; font-size: 15px; color: var(--text-black); font-family: var(--sans); }
  .search-bar input::placeholder { color: var(--text-hint); }
  .search-clear { background: none; border: none; cursor: pointer; font-size: 13px; color: var(--text-muted); padding: 2px 6px; border-radius: 50%; transition: color 0.15s; }
  .search-clear:hover { color: var(--text-black); }
  .search-btn { background: var(--text-black); color: var(--white); border: none; cursor: pointer; font-size: 14px; font-weight: 500; font-family: var(--sans); padding: 9px 22px; border-radius: 100px; white-space: nowrap; transition: opacity 0.15s; }
  .search-btn:hover { opacity: 0.85; }
  .suggestions-drop { position: absolute; top: calc(100% + 4px); left: 0; background: var(--white); border: 1px solid var(--divider); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.10); width: 340px; z-index: 100; overflow: hidden; animation: fadeIn 0.12s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
  .suggestions-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); padding: 10px 14px 6px; }
  .suggestion-item { display: flex; align-items: center; gap: 8px; padding: 9px 14px; font-size: 13px; color: var(--text-body); cursor: pointer; transition: background 0.12s; }
  .suggestion-item:hover { background: var(--off-white); color: var(--text-black); }

  /* Library layout — horizontal tabs */
  .discover-library { display: flex; flex-direction: column; border: 1px solid var(--divider); border-radius: 8px; background: var(--white); overflow: hidden; }

  .disc-top { border-bottom: 1px solid var(--divider); padding: 14px 24px 0; }
  .disc-sidebar-heading { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
  .disc-nav { display: flex; flex-direction: row; overflow-x: auto; gap: 0; }
  .disc-nav::-webkit-scrollbar { height: 0; }
  .disc-nav-item {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 18px 12px; background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    white-space: nowrap; transition: color 0.15s;
    border-bottom: 2px solid transparent; position: relative; top: 1px;
  }
  .disc-nav-item:hover { color: var(--text-black); }
  .disc-nav-item.active { color: var(--text-black); font-weight: 600; border-bottom-color: var(--text-black); }
  .disc-nav-icon { font-size: 15px; }

  .disc-main { flex: 1; min-width: 0; padding: 24px 28px; }

  .disc-section-head { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--divider); }
  .disc-section-title { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--text-black); letter-spacing: -0.2px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .disc-section-sub { font-size: 13px; color: var(--text-muted); }

  /* Cards grid */
  .feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .feat-card {
    position: relative; background: var(--white);
    border: 1px solid var(--divider); border-radius: 10px;
    overflow: hidden; cursor: pointer;
    display: flex; flex-direction: column;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .feat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.10); transform: translateY(-3px); }
  .feat-hero { grid-column: 1 / -1; flex-direction: row; align-items: stretch; }
  .feat-hero .feat-img { width: 280px; height: auto; flex-shrink: 0; border-radius: 0; }
  .feat-hero .feat-summary { display: block; }
  .feat-img { width: 100%; height: 150px; object-fit: cover; display: block; }
  .feat-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .feat-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; padding: 3px 8px; border-radius: 100px; width: fit-content; }
  .trending-tag  { background: #fff3e0; color: #e65100; }
  .editor-tag    { background: #f3e5f5; color: #6a1b9a; }
  .evergreen-tag { background: #e8f5e9; color: #1b5e20; }
  .feat-title { font-family: var(--serif); font-size: 15px; font-weight: 700; color: var(--text-black); line-height: 1.3; }
  .feat-meta { font-size: 12px; color: var(--text-muted); }
  .feat-summary { font-size: 13px; color: var(--text-muted); line-height: 1.5; display: none; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .feat-bk { position: absolute; top: 9px; right: 9px; background: rgba(255,255,255,0.9); border: none; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.15s; box-shadow: 0 1px 4px rgba(0,0,0,0.10); }
  .feat-bk:hover, .feat-bk.bk-active { color: var(--text-black); background: var(--white); }

  /* Topics — always above library */
  .topics-section { margin-bottom: 24px; }
  .topics-heading { font-family: var(--sans); font-size: 15px; font-weight: 700; color: var(--text-black); margin-bottom: 12px; }
  .topics-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .topic-chip { display: inline-flex; align-items: center; gap: 7px; background: var(--white); border: 1px solid var(--divider); color: var(--text-body); font-size: 13px; font-family: var(--sans); padding: 8px 16px; border-radius: 100px; cursor: pointer; transition: border-color 0.15s, background 0.15s, transform 0.15s; }
  .topic-chip:hover { border-color: var(--text-black); background: var(--off-white); transform: translateY(-1px); }
  .topic-icon { font-size: 15px; }

  /* Results */
  .results-section { margin-bottom: 48px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--divider); margin-bottom: 4px; }
  .results-title { font-size: 16px; color: var(--text-muted); }
  .results-title strong { color: var(--text-black); }
  .results-clear { background: none; border: none; cursor: pointer; font-size: 13px; color: var(--text-muted); font-family: var(--sans); padding: 0; transition: color 0.15s; }
  .results-clear:hover { color: var(--text-black); }
  .loading-row { display: flex; align-items: center; gap: 12px; padding: 32px 0; font-size: 14px; color: var(--text-muted); }
  .empty-state { padding: 40px 0; text-align: center; }
  .empty-title { font-size: 16px; font-weight: 600; color: var(--text-black); margin-bottom: 6px; }
  .empty-sub { font-size: 14px; color: var(--text-muted); }
  .result-list { padding-top: 4px; }
  .result-card { display: flex; align-items: flex-start; gap: 20px; padding: 22px 0; border-bottom: 1px solid var(--divider); transition: opacity 0.2s, transform 0.32s ease; }
  .result-card:hover { background: var(--off-white); padding: 22px 12px; margin: 0 -12px; border-radius: 8px; }
  .result-card.is-rejected { opacity: 0.4; }
  .result-card.dismiss-right { transform: translateX(50px); opacity: 0; pointer-events: none; }
  .result-card.dismiss-left  { transform: translateX(-50px); opacity: 0; pointer-events: none; }
  .result-body { flex: 1; min-width: 0; }
  .result-meta-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .result-source { font-size: 13px; font-weight: 500; color: var(--text-black); }
  .result-dot    { font-size: 13px; color: var(--text-hint); }
  .result-read   { font-size: 13px; color: var(--text-muted); }
  .result-category { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; background: var(--off-white); border: 1px solid var(--divider); color: var(--text-muted); padding: 2px 8px; border-radius: 100px; }
  .result-lang { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; padding: 2px 7px; border-radius: 100px; }
  .result-title { font-family: var(--serif); font-size: 19px; font-weight: 700; color: var(--text-black); line-height: 1.3; margin-bottom: 8px; cursor: pointer; }
  .result-title:hover { text-decoration: underline; text-decoration-color: var(--divider-strong); }
  .result-summary { font-size: 14px; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .result-actions { display: flex; align-items: center; gap: 6px; }
  .ra-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; font-family: var(--sans); padding: 5px 12px; border-radius: 100px; cursor: pointer; border: 1px solid var(--divider); background: var(--white); color: var(--text-muted); transition: all 0.15s; }
  .ra-btn:hover { border-color: var(--text-black); color: var(--text-black); }
  .ra-btn.interested-active { background: rgba(26,137,23,0.08); border-color: var(--green); color: var(--green); }
  .ra-btn.generate { background: var(--text-black); color: var(--white); border-color: var(--text-black); }
  .ra-btn.generate:hover { opacity: 0.85; }
  .ra-icon-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: none; border: none; cursor: pointer; color: var(--text-muted); transition: background 0.15s, color 0.15s; }
  .ra-icon-btn:hover { background: var(--off-white); color: var(--text-black); }
  .ra-icon-btn.bk-active { color: var(--text-black); }
  .result-thumb { width: 130px; height: 87px; object-fit: cover; border-radius: 4px; flex-shrink: 0; cursor: pointer; }
  .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--divider); border-top-color: var(--text-black); animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .discover-wrap { padding: 0 16px 60px; }
    .disc-top { padding: 10px 16px 0; }
    .disc-main { padding: 16px; }
    .feat-grid { grid-template-columns: 1fr 1fr; }
    .feat-hero { flex-direction: column; }
    .feat-hero .feat-img { width: 100%; height: 180px; }
    .result-card { flex-direction: column-reverse; gap: 12px; }
    .result-thumb { width: 100%; height: 160px; }
  }
  @media (max-width: 480px) {
    .feat-grid { grid-template-columns: 1fr; }
    .disc-nav-item { padding: 7px 12px 10px; font-size: 12px; }
  }
</style>
