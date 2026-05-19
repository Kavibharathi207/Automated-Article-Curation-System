<script>
  import { currentPage, searchQuery, recentSearches, addRecentSearch } from '../stores/store.js';
  import { trendingTopics } from '../data/mockData.js';

  let query = '';

  function search(q) {
    const term = (q || query).trim();
    if (!term) return;
    addRecentSearch(term);
    searchQuery.set(term);
    currentPage.set('discover');
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

  <!-- Topics -->
  <section class="topics-section">
    <div class="topics-grid">
      <div class="topics-col">
        <h2 class="topics-heading">Trending Topics</h2>
        <div class="chip-list">
          {#each trendingTopics as t}
            <button class="chip" on:click={() => search(t)}>{t}</button>
          {/each}
        </div>
      </div>

      {#if $recentSearches.length > 0}
        <div class="topics-col">
          <h2 class="topics-heading">Recent Searches</h2>
          <div class="chip-list">
            {#each $recentSearches as t}
              <button class="chip chip-recent" on:click={() => search(t)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                {t}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <!-- How it works -->
  <section class="how-section">
    <h2 class="section-heading">How It Works</h2>
    <div class="how-grid">
      {#each [
        { step:'01', title:'Search a Topic',    desc:'Enter any topic or keyword. Our AI scans thousands of sources to find the most relevant articles published in the last 24 hours.', color: '#1A8917' },
        { step:'02', title:'Pick What You Like', desc:'Browse AI-scored results ranked by relevance and innovation. Mark articles as Interested to add them to your generation queue.', color: '#7C3AED' },
        { step:'03', title:'AI Generates',       desc:'Mistral 7B synthesises your selected articles into a single, polished, publish-ready blog post — locally, for free, in seconds.', color: '#D97706' },
        { step:'04', title:'Auto Publishes',     desc:'Set your publish time once. Your blog goes live every morning at your scheduled time, automatically — no manual action needed.', color: '#242424' },
      ] as s, i}
        <div class="how-card">
          <div class="how-number" style="color:{s.color}">{s.step}</div>
          {#if i < 3}<div class="how-connector"></div>{/if}
          <h3 class="how-title">{s.title}</h3>
          <p class="how-desc">{s.desc}</p>
        </div>
      {/each}
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
    padding: 72px 0 56px;
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
    display: flex; align-items: center; gap: 0;
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
    background: var(--text-black); color: #fff; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 9px 22px; border-radius: 100px; white-space: nowrap;
    transition: background 0.15s;
  }
  .search-btn:hover { background: #333; }

  /* Topics */
  .topics-section { padding: 48px 0 40px; border-bottom: 1px solid var(--divider); }
  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 32px;
  }
  .topics-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--off-white); border: 1px solid var(--divider);
    color: var(--text-body); font-size: 13px; font-family: var(--sans);
    padding: 6px 14px; border-radius: 100px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .chip:hover { background: var(--text-black); color: #fff; border-color: var(--text-black); }
  .chip-recent { color: var(--text-muted); }

  /* How it works */
  .how-section { padding: 48px 0 0; }
  .section-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 28px;
  }
  .how-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid var(--divider);
    border-radius: 8px;
    overflow: hidden;
  }
  .how-card {
    padding: 28px 24px;
    border-right: 1px solid var(--divider);
    background: var(--white);
    position: relative;
    transition: background 0.15s;
  }
  .how-card:last-child { border-right: none; }
  .how-card:hover { background: var(--off-white); }
  .how-number {
    font-family: var(--serif); font-size: 32px; font-weight: 700;
    line-height: 1; margin-bottom: 16px; opacity: 0.9;
  }
  .how-title {
    font-size: 15px; font-weight: 600; color: var(--text-black);
    margin-bottom: 10px; line-height: 1.3;
  }
  .how-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }

  @media (max-width: 700px) {
    .hero { padding: 48px 0 40px; }
    .how-grid { grid-template-columns: 1fr 1fr; }
    .how-card { border-bottom: 1px solid var(--divider); }
    .how-card:nth-child(even) { border-right: none; }
  }
  @media (max-width: 420px) {
    .how-grid { grid-template-columns: 1fr; }
    .how-card { border-right: none; }
  }
</style>
