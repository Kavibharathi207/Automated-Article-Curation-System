<script>
  import {
    searchQuery, rejectedIds, interestedBlogs, bookmarks,
    rejectBlog, interestBlog, toggleBookmark,
    currentPage, selectedBlog, articleFrom, addRecentSearch, interestBlog as markInterested
  } from '../stores/store.js';
  import { mockBlogs, trendingTopics } from '../data/mockData.js';

  let discoverTab = 'trending';
  let searchInput = '';
  let showSuggestions = false;
  let searching = false;
  let webResults = [];      // results fetched/simulated from URL or web search
  let searchMode = 'local'; // 'local' | 'web' | 'url'
  let urlPreview = null;    // single article parsed from a URL paste

  $: searchInput = $searchQuery;
  $: isUrl = /^https?:\/\//i.test(searchInput.trim());
  $: suggestions = searchInput.trim() && !isUrl
    ? trendingTopics.filter(t => t.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 6)
    : trendingTopics.slice(0, 6);

  // Simulate fetching a URL — parse domain/path as title/source
  function simulateFetchUrl(url) {
    const u = new URL(url);
    const domain = u.hostname.replace('www.', '');
    const slug = u.pathname.split('/').filter(Boolean).pop() || '';
    const title = slug
      ? slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : `Article from ${domain}`;
    const category = guessCategory(title + ' ' + domain);
    return {
      id: Date.now(),
      title,
      source: domain,
      sourceUrl: url,
      summary: `This article was fetched from ${domain}. The AI has analysed the content and is ready to curate a blog post based on it.`,
      image: `https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=300&fit=crop`,
      category,
      readTime: '5 min',
      tags: [category, domain],
      lang: 'EN',
      _fromUrl: true,
    };
  }

  // Simulate web search results for a keyword
  function simulateWebSearch(query) {
    const q = query.toLowerCase();
    // First match from mockBlogs
    const local = mockBlogs.filter(b => {
      const hay = [b.title, b.summary, b.category, b.source, ...(b.tags||[])].join(' ').toLowerCase();
      return q.split(/\s+/).filter(Boolean).some(w => hay.includes(w));
    });
    // Pad with AI-generated mock web results if fewer than 3 local matches
    const extras = [
      { id: 9001, title: `${query}: A Deep Dive into What's Changing in 2025`, source: 'techcrunch.com', sourceUrl: `https://techcrunch.com/search?q=${encodeURIComponent(query)}`, summary: `An in-depth analysis of recent developments around ${query}, covering the key players, technical shifts, and what it means for the industry going forward.`, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=300&fit=crop', category: guessCategory(query), readTime: '7 min', tags: [query], lang: 'EN', _fromWeb: true },
      { id: 9002, title: `The State of ${query} — Industry Report 2025`, source: 'wired.com', sourceUrl: `https://wired.com/search?q=${encodeURIComponent(query)}`, summary: `Wired's comprehensive overview of ${query} examines market trends, emerging technologies, and the companies leading the charge.`, image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=300&fit=crop', category: guessCategory(query), readTime: '9 min', tags: [query], lang: 'EN', _fromWeb: true },
      { id: 9003, title: `Why ${query} Matters More Than Ever`, source: 'venturebeat.com', sourceUrl: `https://venturebeat.com/search?q=${encodeURIComponent(query)}`, summary: `VentureBeat explores how ${query} is reshaping expectations, and what businesses need to understand to stay ahead of the curve.`, image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=300&fit=crop', category: guessCategory(query), readTime: '6 min', tags: [query], lang: 'EN', _fromWeb: true },
    ];
    return [...local, ...extras.slice(0, Math.max(0, 4 - local.length))];
  }

  function guessCategory(text) {
    const t = text.toLowerCase();
    if (/ai|llm|gpt|claude|mistral|machine learning|neural/.test(t)) return 'AI';
    if (/startup|funding|vc|venture|saas|founder/.test(t)) return 'Startups';
    if (/health|medical|hospital|clinical/.test(t)) return 'Healthcare';
    if (/security|cyber|hack|phishing/.test(t)) return 'Security';
    if (/svelte|react|javascript|web dev|frontend/.test(t)) return 'Web Dev';
    if (/ev|electric|green|sustainability|climate/.test(t)) return 'Sustainability';
    return 'Technology';
  }

  async function doSearch(term) {
    const t = (term || searchInput).trim();
    if (!t) return;
    addRecentSearch(t);
    searchQuery.set(t);
    showSuggestions = false;
    searchInput = t;
    searching = true;
    urlPreview = null;
    webResults = [];

    await new Promise(r => setTimeout(r, 800)); // simulate network delay

    if (/^https?:\/\//i.test(t)) {
      searchMode = 'url';
      try { urlPreview = simulateFetchUrl(t); }
      catch { urlPreview = null; }
    } else {
      searchMode = 'web';
      webResults = simulateWebSearch(t);
    }
    searching = false;
  }

  function clearSearch() {
    searchQuery.set(''); searchInput = '';
    webResults = []; urlPreview = null; searchMode = 'local';
  }
  function onKey(e) {
    if (e.key === 'Enter') doSearch();
    if (e.key === 'Escape') showSuggestions = false;
  }

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
  function curateNow(blog) {
    interestBlog(blog);
    selectedBlog.set(blog);
    currentPage.set('preview');
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
    <div class="search-bar" class:url-mode={isUrl} on:click={() => showSuggestions = true}>
      {#if isUrl}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      {/if}
      <input
        bind:value={searchInput}
        placeholder="Search keywords or paste a URL (https://…)"
        on:keydown={onKey}
        on:focus={() => showSuggestions = true}
        on:blur={() => setTimeout(() => showSuggestions = false, 150)}
      />
      {#if searchInput}<button class="search-clear" on:click={clearSearch}>✕</button>{/if}
      <button class="search-btn" on:click={() => doSearch()}>
        {isUrl ? 'Fetch & Curate' : 'Search'}
      </button>
    </div>
    {#if isUrl}
      <div class="url-hint">🔗 URL detected — we'll fetch this article and prepare it for AI curation.</div>
    {:else if showSuggestions}
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
    <section class="results-section">
      <div class="results-header">
        <div class="results-header-left">
          {#if searchMode === 'url'}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            <span class="results-title">Article fetched from <strong>{$searchQuery}</strong></span>
          {:else}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span class="results-title">Web results for "<strong>{$searchQuery}</strong>"</span>
          {/if}
        </div>
        <button class="results-clear" on:click={clearSearch}>Clear</button>
      </div>

      {#if searching}
        <div class="loading-row">
          <div class="spinner"></div>
          <span>{searchMode === 'url' ? 'Fetching article and analysing content…' : 'Searching the web…'}</span>
        </div>

      <!-- URL mode: single article fetched -->
      {:else if searchMode === 'url'}
        {#if !urlPreview}
          <div class="empty-state">
            <p class="empty-title">Could not fetch that URL</p>
            <p class="empty-sub">Make sure the URL is correct, or try pasting keywords instead.</p>
          </div>
        {:else}
          <div class="url-result-card">
            <img src={urlPreview.image} alt="" class="url-result-img" />
            <div class="url-result-body">
              <div class="url-result-meta">
                <span class="result-source">{urlPreview.source}</span>
                <span class="result-dot">·</span>
                <span class="result-read">{urlPreview.readTime} read</span>
                <span class="result-category">{urlPreview.category}</span>
                <a href={urlPreview.sourceUrl} target="_blank" rel="noopener" class="url-ext-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Open original
                </a>
              </div>
              <h3 class="result-title">{urlPreview.title}</h3>
              <p class="result-summary">{urlPreview.summary}</p>
              <div class="ai-curation-box">
                <div class="ai-curation-icon">✨</div>
                <div>
                  <p class="ai-curation-title">Ready to curate</p>
                  <p class="ai-curation-sub">The AI has analysed this article. Click below to generate a curated blog post from it.</p>
                </div>
              </div>
              <div class="url-result-actions">
                <button class="ra-btn generate" on:click={() => curateNow(urlPreview)}>✨ Generate blog now</button>
                <button class="ra-btn" on:click={() => interestBlog(urlPreview)}>👍 Mark interested</button>
                <button class="ra-icon-btn" on:click={() => toggleBookmark(urlPreview.id)} title="Bookmark">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        {/if}

      <!-- Web/keyword search results -->
      {:else if webResults.length === 0}
        <div class="empty-state">
          <p class="empty-title">No results found</p>
          <p class="empty-sub">Try different keywords or paste a direct article URL.</p>
        </div>
      {:else}
        <div class="result-list">
          {#each webResults as blog}
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
                  {#if blog._fromWeb}
                    <span class="web-badge">🌐 Web</span>
                  {/if}
                  {#if blog.sourceUrl && blog.sourceUrl !== '#'}
                    <a href={blog.sourceUrl} target="_blank" rel="noopener" class="url-ext-link">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  {/if}
                </div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <h3 class="result-title" on:click={() => openArticle(blog)}>{blog.title}</h3>
                <p class="result-summary">{blog.summary}</p>
                <div class="result-actions">
                  {#if isInterested}
                    <button class="ra-btn interested-active" on:click={() => animateInterest(blog)}>👍 Interested</button>
                    <button class="ra-btn generate" on:click={() => curateNow(blog)}>✨ Generate</button>
                  {:else if !isRejected}
                    <button class="ra-btn" on:click={() => animateInterest(blog)}>👍 Interested</button>
                    <button class="ra-btn generate" on:click={() => curateNow(blog)}>✨ Curate</button>
                    <button class="ra-btn" on:click={() => animateReject(blog.id)}>👎 Skip</button>
                  {/if}
                  <button class="ra-icon-btn" class:bk-active={isBookmarked} on:click={() => toggleBookmark(blog.id)} title="Bookmark">
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
  .results-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--divider); margin-bottom: 16px; }
  .results-header-left { display: flex; align-items: center; gap: 8px; }
  .results-title { font-size: 15px; color: var(--text-muted); }
  .results-title strong { color: var(--text-black); }
  .search-bar.url-mode:focus-within { border-color: #6a1b9a; box-shadow: 0 0 0 3px rgba(106,27,154,0.08); }
  .url-hint {
    margin-top: 8px; font-size: 13px; color: #6a1b9a;
    display: flex; align-items: center; gap: 6px;
  }
  .url-ext-link {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; color: var(--text-muted); text-decoration: none;
    transition: color 0.12s;
  }
  .url-ext-link:hover { color: var(--text-black); }
  .web-badge {
    font-size: 10px; font-weight: 600; padding: 1px 6px;
    background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca;
    border-radius: 100px;
  }

  /* URL single-result card */
  .url-result-card {
    display: flex; gap: 24px; align-items: flex-start;
    padding: 28px; border: 1px solid var(--divider); border-radius: 10px;
    background: var(--white); margin-top: 8px;
  }
  .url-result-img { width: 180px; height: 120px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
  .url-result-body { flex: 1; min-width: 0; }
  .url-result-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
  .url-result-actions { display: flex; align-items: center; gap: 8px; margin-top: 16px; }

  .ai-curation-box {
    display: flex; align-items: flex-start; gap: 12px;
    background: #faf5ff; border: 1px solid #e9d5ff;
    border-radius: 8px; padding: 14px 16px; margin-top: 16px;
  }
  .ai-curation-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
  .ai-curation-title { font-size: 14px; font-weight: 600; color: #6b21a8; margin-bottom: 3px; }
  .ai-curation-sub { font-size: 13px; color: #7c3aed; line-height: 1.5; }
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
