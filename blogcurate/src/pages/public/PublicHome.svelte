<script>
  import { publicArticles, publicThemes, publicThemeFilter, currentPublicPage, selectedArticle } from '../../stores/store.js';

  function openArticle(a) {
    selectedArticle.set(a);
    currentPublicPage.set('article');
    window.scrollTo(0, 0);
  }

  function scoreBar(v) { return Math.round((v / 10) * 100); }

  $: filtered = $publicThemeFilter === 'All'
    ? $publicArticles
    : $publicArticles.filter(a => a.theme === $publicThemeFilter);

  $: featured = filtered.filter(a => a.featured);
</script>

<div class="pub-home">
  <!-- Hero -->
  <div class="pub-hero">
    <h1>Innovation Digest</h1>
    <p>AI-curated articles on technology, startups, and the future — published every morning.</p>
  </div>

  <!-- Theme filter -->
  <div class="theme-bar">
    <div class="theme-bar-inner">
      {#each $publicThemes as t}
        <button
          class="theme-chip"
          class:active={$publicThemeFilter === t}
          on:click={() => publicThemeFilter.set(t)}
        >{t}</button>
      {/each}
    </div>
  </div>

  <!-- Article grid -->
  <div class="pub-content">
    {#if filtered.length === 0}
      <div class="pub-empty">No articles found for this theme.</div>
    {:else}
      <!-- Featured articles -->
      {#if featured.length > 0}
        <div class="featured-section">
          <div class="section-label">Featured</div>
          <div class="featured-grid">
            {#each featured as a}
              <div class="featured-card" on:click={() => openArticle(a)}>
                <img class="featured-img" src={a.imageUrl} alt="" />
                <div class="featured-body">
                  <div class="card-theme">{a.theme}</div>
                  <div class="card-title">{a.title}</div>
                  <div class="card-summary">{a.summary?.slice(0, 120)}…</div>
                  <div class="card-footer">
                    <span class="card-date">{new Date(a.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                    <span class="read-more">Read more →</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- All articles -->
      <div class="section-label" style="margin-top:32px">
        {$publicThemeFilter === 'All' ? 'All Articles' : $publicThemeFilter}
      </div>
      <div class="article-grid">
        {#each filtered as a}
          <div class="article-card" on:click={() => openArticle(a)}>
            <img class="article-img" src={a.imageUrl} alt="" />
            <div class="article-body">
              <div class="card-meta-row">
                <span class="card-theme">{a.theme}</span>
                {#if a.featured}<span class="feat-badge">⭐ Featured</span>{/if}
              </div>
              <div class="card-title">{a.title}</div>
              <div class="card-summary">{a.summary?.slice(0, 100)}…</div>
              <div class="card-footer">
                <span class="card-date">{new Date(a.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                <span class="read-more">Read more →</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .pub-home { max-width: 1192px; margin: 0 auto; padding: 0 24px 60px; }

  .pub-hero {
    padding: 56px 0 40px; border-bottom: 1px solid var(--border);
    margin-bottom: 0;
  }
  .pub-hero h1 {
    font-family: var(--serif); font-size: 42px; font-weight: 700;
    color: var(--text); letter-spacing: -1px; line-height: 1.15; margin-bottom: 10px;
  }
  .pub-hero p { font-size: 16px; color: var(--text2); max-width: 520px; }

  .theme-bar {
    position: sticky; top: 57px; z-index: 40;
    background: var(--bg); border-bottom: 1px solid var(--border);
    margin: 0 -24px; padding: 0 24px;
  }
  .theme-bar-inner {
    display: flex; gap: 0; overflow-x: auto;
    scrollbar-width: none; max-width: 1192px; margin: 0 auto;
  }
  .theme-bar-inner::-webkit-scrollbar { display: none; }
  .theme-chip {
    padding: 14px 16px; font-size: 14px; font-weight: 400;
    color: var(--text2); background: none; border: none;
    border-bottom: 2px solid transparent; cursor: pointer;
    white-space: nowrap; transition: all 0.12s; margin-bottom: -1px;
  }
  .theme-chip:hover { color: var(--text); }
  .theme-chip.active { color: var(--text); border-bottom-color: var(--text); font-weight: 500; }

  .pub-content { padding-top: 32px; }
  .pub-empty { font-size: 14px; color: var(--text3); padding: 60px 0; text-align: center; }

  .section-label {
    font-size: 13px; font-weight: 600; color: var(--text3);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;
  }

  /* Featured */
  .featured-section { margin-bottom: 8px; }
  .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px,1fr)); gap: 24px; }
  .featured-card {
    display: flex; flex-direction: column; cursor: pointer;
    border: 1px solid var(--border); border-radius: 4px; overflow: hidden;
    transition: box-shadow 0.15s;
  }
  .featured-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .featured-img { width: 100%; height: 200px; object-fit: cover; }
  .featured-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }

  /* Article grid */
  .article-grid { display: flex; flex-direction: column; gap: 0; }
  .article-card {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 20px 0; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.1s;
  }
  .article-card:first-child { border-top: 1px solid var(--border); }
  .article-card:hover { background: var(--hover); padding-left: 8px; padding-right: 8px; margin: 0 -8px; }
  .article-img { width: 140px; height: 93px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
  .article-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }

  /* Shared card styles */
  .card-meta-row { display: flex; align-items: center; gap: 8px; }
  .card-theme { font-size: 12px; color: var(--text3); font-weight: 500; }
  .feat-badge { font-size: 11px; color: var(--yellow); font-weight: 600; }
  .card-title {
    font-family: var(--serif); font-size: 17px; font-weight: 700;
    color: var(--text); line-height: 1.35;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .card-summary {
    font-size: 13px; color: var(--text2); line-height: 1.6;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
  .card-date  { font-size: 12px; color: var(--text3); }
  .read-more  { font-size: 12px; color: var(--text2); font-weight: 500; }

  @media (max-width: 768px) {
    .pub-hero h1 { font-size: 28px; }
    .featured-grid { grid-template-columns: 1fr; }
    .article-card { flex-direction: column; }
    .article-img  { width: 100%; height: 180px; }
  }
</style>
