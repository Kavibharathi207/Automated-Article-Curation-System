<script>
  import { currentPage, searchQuery, recentSearches, addRecentSearch, pipelineStats, interestedBlogs, scheduledPosts, bookmarks, activityLog } from '../stores/store.js';
  import { trendingTopics, generateSearchQueries, currentWeekSeed } from '../data/mockData.js';

  let query = '';
  let lang = 'EN';
  let activeTopic = null;
  let weekSeed = currentWeekSeed();
  let generating = false;
  $: queries = activeTopic ? generateSearchQueries(activeTopic, lang, weekSeed) : [];

  const typeIcons = {
    innovation: '📰',
    academic:   '🎓',
    funding:    '💰',
    patent:     '📋',
    press:      '📣',
  };

  function search(q) {
    const term = (q || query).trim();
    if (!term) return;
    addRecentSearch(term);
    searchQuery.set(term);
    currentPage.set('discover');
  }

  function selectTopic(t) {
    activeTopic = activeTopic === t ? null : t;
  }

  function handleGenerate() {
    currentPage.set('interested');
  }

  const topicColors = [
    '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6',
    '#a855f7','#3b82f6',
  ];

  $: workflowDone = [
    $interestedBlogs.length > 0,
    $interestedBlogs.length > 0,
    $scheduledPosts.length > 0,
    $scheduledPosts.filter(p => p.status === 'published').length > 0,
  ];

  const workflowSteps = [
    { label: 'Collect Articles',  icon: '📥' },
    { label: 'Analyze Content',   icon: '🔍' },
    { label: 'Generate Draft',    icon: '✍️' },
    { label: 'Schedule Publish',  icon: '📅' },
  ];

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }
</script>

<div class="home-wrap">
  <!-- Hero -->
  <section class="hero">
    <p class="hero-eyebrow">AI-Powered Curation</p>
    <h1 class="hero-title">What do you want to<br/>write about today?</h1>
    <p class="hero-sub">Enter a topic and Mistral AI will discover and generate the best blogs for you.</p>

    <div class="search-bar">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        bind:value={query}
        placeholder="e.g. AI Agents, healthcare, startup funding…"
        on:keydown={e => e.key === 'Enter' && search()}
      />
      <button class="search-btn" on:click={() => search()}>Search</button>
    </div>
  </section>

  <!-- ── STAT CARDS ── -->
  <section class="stat-cards">
    {#each [
      { label: 'Interested', value: $pipelineStats.interested, icon: '👍', page: 'interested' },
      { label: 'Scheduled',  value: $pipelineStats.scheduled,  icon: '📅', page: 'scheduled'  },
      { label: 'Published',  value: $pipelineStats.published,  icon: '✅', page: 'published'  },
      { label: 'Bookmarked', value: $bookmarks.length,         icon: '🔖', page: 'bookmarks'  },
    ] as s}
      <button class="stat-card" on:click={() => currentPage.set(s.page)}>
        <span class="stat-icon">{s.icon}</span>
        <span class="stat-value">{s.value}</span>
        <span class="stat-label">{s.label}</span>
      </button>
    {/each}
  </section>

  <!-- ── HERO GENERATE BUTTON ── -->
  <section class="generate-hero">
    <div class="generate-glow"></div>
    <div class="generate-inner">
      <p class="generate-eyebrow">✨ AI-Powered</p>
      <h2 class="generate-title">Ready to create your next article?</h2>
      <p class="generate-sub">{$interestedBlogs.length > 0 ? `${$interestedBlogs.length} article${$interestedBlogs.length !== 1 ? 's' : ''} selected — generate your blog now.` : 'Search a topic, mark articles as interested, then generate.'}</p>
      <button
        class="generate-btn"
        on:click={handleGenerate}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Generate Article
      </button>
    </div>
  </section>

  <!-- ── WORKFLOW PROGRESS ── -->
  <section class="workflow-section">
    <h2 class="section-label">Workflow Progress</h2>
    <div class="workflow-steps">
      {#each workflowSteps as step, i}
        <div class="workflow-step" class:done={workflowDone[i]}>
          <div class="step-icon-wrap" class:done={workflowDone[i]}>
            {#if workflowDone[i]}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            {:else}
              <span>{step.icon}</span>
            {/if}
          </div>
          <span class="step-label">{step.label}</span>
        </div>
        {#if i < workflowSteps.length - 1}
          <div class="step-connector" class:done={workflowDone[i]}></div>
        {/if}
      {/each}
    </div>
  </section>

  <!-- ── TOPIC CARDS ── -->
  <section class="topic-cards-section">
    <h2 class="section-label">Trending Topics</h2>
    <div class="topic-cards-grid">
      {#each trendingTopics as topic, i}
        <button
          class="topic-card"
          class:active={activeTopic === topic}
          style="--tc:{topicColors[i % topicColors.length]}"
          on:click={() => { selectTopic(topic); search(topic); }}
        >
          <span class="topic-card-icon" style="color:{topicColors[i % topicColors.length]}">
            {['🤖','🔍','🛡️','🏥','💡','⚡','🚗','🌱','💻','☸️','🏢','🔗'][i % 12]}
          </span>
          <span class="topic-card-name">{topic}</span>
          <svg class="topic-card-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      {/each}
    </div>
  </section>

  <!-- ── RECENT ACTIVITY + EMPTY STATE ── -->
  <section class="bottom-row">
    <!-- Recent Activity -->
    <div class="activity-panel">
      <h2 class="section-label">Recent Activity</h2>
      {#if $activityLog.length === 0}
        <div class="empty-state">
          <div class="empty-illustration">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <p class="empty-title">No recent activity</p>
          <p class="empty-sub">Your searches, interests, and bookmarks will appear here.</p>
        </div>
      {:else}
        <div class="activity-list">
          {#each $activityLog.slice(0, 6) as item}
            <div class="activity-row">
              <span class="activity-emoji">{item.icon}</span>
              <div class="activity-body">
                <div class="activity-title">{item.text}</div>
                <div class="activity-meta">{item.sub} · {timeAgo(item.time)}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Scheduled Empty State -->
    <div class="scheduled-panel">
      <h2 class="section-label">Scheduled Articles</h2>
      {#if $pipelineStats.scheduled === 0}
        <div class="empty-state">
          <div class="empty-illustration">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>
            </svg>
          </div>
          <p class="empty-title">No scheduled articles yet</p>
          <p class="empty-sub">Generate a blog and schedule it to publish automatically.</p>
          <button class="empty-cta" on:click={() => currentPage.set('home')}>Schedule Your First Article</button>
        </div>
      {:else}
        <div class="activity-list">
          {#each [...$scheduledPosts].filter(p => p.status === 'scheduled').slice(0,4) as post}
            <div class="activity-row">
              <span class="activity-dot scheduled"></span>
              <div class="activity-body">
                <div class="activity-title">{post.title}</div>
                <div class="activity-meta">
                  <span class="activity-status scheduled">Scheduled</span>
                  · {new Date(post.scheduledAt).toLocaleDateString('en-GB', { dateStyle: 'short' })}
                </div>
              </div>
            </div>
          {/each}
          <button class="view-all-link" on:click={() => currentPage.set('scheduled')}>View all →</button>
        </div>
      {/if}
    </div>
  </section>

</div>

<style>
  .home-wrap {
    max-width: 740px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }

  /* Hero */
  .hero {
    text-align: center;
    padding: 48px 0 40px;
    border-bottom: 1px solid var(--divider);
  }
  .hero-eyebrow {
    font-size: 12px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--green); margin-bottom: 16px;
  }
  .hero-title {
    font-family: var(--serif); font-size: clamp(32px, 5vw, 46px);
    font-weight: 700; color: var(--text-black); line-height: 1.18;
    letter-spacing: -0.5px; margin-bottom: 16px;
  }
  .hero-sub {
    font-size: 17px; color: var(--text-muted); line-height: 1.65;
    max-width: 480px; margin: 0 auto 36px;
  }

  /* Search bar */
  .search-bar {
    display: flex; align-items: center;
    background: var(--white); border: 1.5px solid var(--divider-strong);
    border-radius: 100px; padding: 6px 6px 6px 18px;
    max-width: 560px; margin: 0 auto;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-bar:focus-within {
    border-color: var(--text-black);
    box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
  }
  .search-icon { color: var(--text-muted); flex-shrink: 0; }
  .search-bar input {
    flex: 1; border: none; background: transparent; outline: none;
    font-size: 15px; color: var(--text-black); padding: 6px 12px;
    font-family: var(--sans);
  }
  .search-bar input::placeholder { color: var(--text-hint); }
  .search-btn {
    background: var(--text-black); color: var(--white); border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 9px 22px; border-radius: 100px; white-space: nowrap;
    transition: opacity 0.15s;
  }
  .search-btn:hover { opacity: 0.85; }

  /* Topics */
  .topics-section { padding: 40px 0; border-bottom: 1px solid var(--divider); }
  .topics-top {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 32px;
    margin-bottom: 0;
  }
  .topics-row-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .topics-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 0;
  }

  /* Language toggle */
  .lang-toggle {
    display: flex; gap: 2px;
    background: var(--off-white); border: 1px solid var(--divider);
    border-radius: 100px; padding: 2px;
  }
  .lang-btn {
    padding: 3px 12px; border-radius: 100px; border: none; cursor: pointer;
    font-size: 12px; font-weight: 600; font-family: var(--sans);
    color: var(--text-muted); background: transparent;
    transition: all 0.15s; letter-spacing: 0.04em;
  }
  .lang-btn.active {
    background: var(--text-black); color: var(--white);
  }

  .chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--off-white); border: 1px solid var(--divider);
    color: var(--text-body); font-size: 13px; font-family: var(--sans);
    padding: 6px 14px; border-radius: 100px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .chip:hover { background: var(--text-black); color: var(--white); border-color: var(--text-black); }
  .chip.chip-active { background: var(--text-black); color: var(--white); border-color: var(--text-black); }
  .chip-recent { color: var(--text-muted); }

  /* Queries panel */
  .queries-panel {
    margin-top: 24px;
    border: 1px solid var(--divider);
    border-radius: 8px;
    overflow: hidden;
    background: var(--white);
  }
  .queries-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--divider);
    background: var(--off-white);
  }
  .queries-title-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
  }
  .queries-title {
    font-size: 13px; color: var(--text-body);
  }
  .queries-title strong { color: var(--text-black); }
  .queries-sub { font-size: 12px; color: var(--text-muted); }

  .lang-badge {
    font-size: 11px; font-weight: 700; padding: 2px 8px;
    border-radius: 100px; letter-spacing: 0.06em;
  }
  .lang-badge.EN { background: var(--off-white); color: var(--text-muted); border: 1px solid var(--divider-strong); }
  .lang-badge.FR { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }

  .queries-list { display: flex; flex-direction: column; }
  .query-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 13px 20px;
    border-bottom: 1px solid var(--divider);
    background: var(--white); border-left: none; border-right: none; border-top: none;
    cursor: pointer; text-align: left; font-family: var(--sans);
    transition: background 0.12s;
    width: 100%;
  }
  .query-row:last-child { border-bottom: none; }
  .query-row:hover { background: var(--off-white); }
  .query-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }
  .query-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .query-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .query-type {
    font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .query-text {
    font-size: 13px; color: var(--text-black); line-height: 1.4;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .query-search-icon { color: var(--text-hint); flex-shrink: 0; }
  .query-row:hover .query-search-icon { color: var(--text-black); }

  .queries-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; background: var(--off-white);
    border-top: 1px solid var(--divider);
  }
  .novelty-note { font-size: 12px; color: var(--text-muted); }
  .search-all-btn {
    background: var(--text-black); color: #fff; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: var(--sans);
    padding: 7px 16px; border-radius: 100px; transition: background 0.15s;
    white-space: nowrap;
  }
  .search-all-btn:hover { background: #333; }

  /* How it works */
  .how-section { padding: 48px 0 0; }
  .section-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 28px;
  }
  .how-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 0; border: 1px solid var(--divider); border-radius: 8px; overflow: hidden;
  }
  .how-card {
    padding: 28px 24px; border-right: 1px solid var(--divider);
    background: var(--white); transition: background 0.15s, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .how-card:last-child { border-right: none; }
  .how-card:hover {
    background: var(--off-white);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    position: relative; z-index: 1;
  }
  .how-number {
    font-family: var(--serif); font-size: 32px; font-weight: 700;
    line-height: 1; margin-bottom: 16px; opacity: 0.9;
  }
  .how-title { font-size: 15px; font-weight: 600; color: var(--text-black); margin-bottom: 10px; line-height: 1.3; }
  .how-desc  { font-size: 13px; color: var(--text-muted); line-height: 1.65; }

  @media (max-width: 700px) {
    .hero { padding: 48px 0 40px; }
    .how-grid { grid-template-columns: 1fr 1fr; }
    .how-card { border-bottom: 1px solid var(--divider); }
    .how-card:nth-child(even) { border-right: none; }
    .queries-footer { flex-direction: column; gap: 10px; align-items: flex-start; }
  }
  @media (max-width: 420px) {
    .how-grid { grid-template-columns: 1fr; }
    .how-card { border-right: none; }
  }

  /* ── STAT CARDS ── */
  .stat-cards {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; padding: 28px 0 0;
  }
  .stat-card {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 20px 12px; border-radius: 12px;
    background: var(--white);
    border: 1px solid var(--divider);
    cursor: pointer; font-family: var(--sans);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  }
  .stat-icon { font-size: 22px; }
  .stat-value { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--text-black); line-height: 1; }
  .stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── GENERATE HERO ── */
  .generate-hero {
    position: relative; margin: 24px 0;
    border-radius: 12px; overflow: hidden;
    background: var(--off-white);
    border: 1px solid var(--divider);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .generate-hero:hover {
    border-color: var(--text-black);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  }
  .generate-glow { display: none; }
  .generate-inner {
    position: relative; padding: 32px; text-align: center;
  }
  .generate-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;
  }
  .generate-title {
    font-family: var(--serif); font-size: clamp(20px, 3vw, 24px);
    font-weight: 700; color: var(--text-black); margin-bottom: 8px; line-height: 1.25;
  }
  .generate-sub {
    font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6;
  }
  .generate-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--text-black);
    color: var(--white); border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 11px 28px; border-radius: 100px;
    transition: opacity 0.15s, transform 0.18s ease;
  }
  .generate-btn:hover {
    opacity: 0.85;
    transform: scale(1.03);
  }

  /* ── WORKFLOW ── */
  .workflow-section { padding: 8px 0 24px; }
  .section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .workflow-steps {
    display: flex; align-items: center; gap: 0;
    background: var(--white); border: 1px solid var(--divider);
    border-radius: 12px; padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .workflow-steps:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  }
  .workflow-step {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    flex: 1; opacity: 0.4; transition: opacity 0.2s;
  }
  .workflow-step.done { opacity: 1; }
  .step-icon-wrap {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--off-white); border: 2px solid var(--divider);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.2s;
  }
  .step-icon-wrap.done {
    background: #10b981; border-color: #10b981; color: var(--white);
  }
  .step-label { font-size: 11px; font-weight: 500; color: var(--text-muted); text-align: center; white-space: nowrap; }
  .workflow-step.done .step-label { color: var(--text-black); font-weight: 600; }
  .step-connector {
    flex: 0 0 32px; height: 2px;
    background: var(--divider); border-radius: 2px;
    transition: background 0.3s;
    margin-bottom: 20px;
  }
  .step-connector.done { background: #10b981; }

  /* ── TOPIC CARDS ── */
  .topic-cards-section { padding: 8px 0 24px; }
  .topic-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .topic-card {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px; border-radius: 10px;
    background: var(--white);
    border: 1.5px solid var(--divider);
    cursor: pointer; font-family: var(--sans);
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
    text-align: left;
  }
  .topic-card:hover, .topic-card.active {
    transform: scale(1.04);
    border-color: var(--tc);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 0 0 3px color-mix(in srgb, var(--tc) 15%, transparent);
  }
  .topic-card-icon { font-size: 18px; flex-shrink: 0; }
  .topic-card-name { flex: 1; font-size: 12px; font-weight: 500; color: var(--text-black); line-height: 1.3; }
  .topic-card-arrow { color: var(--text-hint); flex-shrink: 0; opacity: 0; transition: opacity 0.15s; }
  .topic-card:hover .topic-card-arrow { opacity: 1; }

  /* ── BOTTOM ROW ── */
  .bottom-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; padding: 8px 0 32px;
  }
  .activity-panel, .scheduled-panel {
    background: var(--white); border: 1px solid var(--divider);
    border-radius: 12px; padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .activity-panel:hover, .scheduled-panel:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  }
  .activity-list { display: flex; flex-direction: column; gap: 0; }
  .activity-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid var(--divider);
  }
  .activity-row:last-of-type { border-bottom: none; }
  .activity-emoji { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .activity-body { flex: 1; min-width: 0; }
  .activity-title {
    font-size: 13px; font-weight: 500; color: var(--text-black);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .activity-meta { font-size: 11px; color: var(--text-muted); }
  .activity-status.published { color: #10b981; font-weight: 600; }
  .activity-status.scheduled { color: #f59e0b; font-weight: 600; }
  .view-all-link {
    background: none; border: none; cursor: pointer;
    font-size: 12px; color: var(--text-muted); font-family: var(--sans);
    padding: 8px 0 0; transition: color 0.15s;
  }
  .view-all-link:hover { color: var(--text-black); }

  /* ── EMPTY STATE ── */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    padding: 24px 16px; text-align: center; gap: 6px;
  }
  .empty-illustration { margin-bottom: 8px; }
  .empty-title { font-size: 14px; font-weight: 600; color: var(--text-black); }
  .empty-sub { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .empty-cta {
    margin-top: 12px;
    display: inline-flex; align-items: center;
    background: var(--text-black); color: var(--white); border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: var(--sans);
    padding: 9px 20px; border-radius: 100px; transition: opacity 0.15s;
  }
  .empty-cta:hover { opacity: 0.85; }

  @media (max-width: 600px) {
    .stat-cards { grid-template-columns: repeat(2, 1fr); }
    .bottom-row { grid-template-columns: 1fr; }
    .topic-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .workflow-steps { overflow-x: auto; }
    .step-label { font-size: 10px; }
  }
</style>
