<script>
  import { onMount } from 'svelte';
  import { articles, articlesLoading, fetchArticles, fetchThemes, adminThemes, currentAdminPage } from '../../stores/store.js';

  let themeFilter  = '';
  let statusFilter = '';
  let slideOver    = null;

  onMount(() => { fetchArticles(); fetchThemes(); });

  $: filtered = $articles.filter(a => {
    const tOk = !themeFilter  || a.theme === themeFilter;
    const sOk = !statusFilter || a.status === statusFilter;
    return tOk && sOk;
  });

  $: uniqueThemes   = [...new Set($articles.map(a => a.theme).filter(Boolean))];
  $: uniqueStatuses = [...new Set($articles.map(a => a.status).filter(Boolean))];

  function scoreClass(v) { return v >= 9 ? 'high' : v >= 7 ? 'mid' : 'low'; }
  function fmtDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'medium' });
  }
  function openSlide(a) { slideOver = a; }
  function closeSlide() { slideOver = null; }
</script>

<div class="articles-page" class:has-slide={slideOver}>
  <div class="page-hdr">
    <button class="back-btn" on:click={() => currentAdminPage.set('dashboard')}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Dashboard
    </button>
    <h1 class="page-title">Articles</h1>
  </div>
  <div style="border-top:1px solid var(--divider);margin-bottom:24px"></div>

  <!-- Filters -->
  <div class="filter-bar">
    <select bind:value={themeFilter} style="width:auto">
      <option value="">All Themes</option>
      {#each uniqueThemes as t}<option value={t}>{t}</option>{/each}
    </select>
    <select bind:value={statusFilter} style="width:auto">
      <option value="">All Status</option>
      {#each uniqueStatuses as s}<option value={s}>{s}</option>{/each}
    </select>
    <button class="btn btn-secondary btn-sm" on:click={() => fetchArticles(themeFilter)}>↻ Refresh</button>
  </div>

  {#if $articlesLoading}
    <div class="skel-list">
      {#each Array(5) as _}
        <div class="skel-row">
          <div class="skeleton" style="width:60px;height:60px;border-radius:4px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="width:60%;height:16px"></div>
            <div class="skeleton" style="width:40%;height:12px"></div>
            <div class="skeleton" style="width:80%;height:12px"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if filtered.length === 0}
    <div class="empty-state">
      <h3>No articles found.</h3>
      <p>Try changing the filters or trigger a pipeline run.</p>
    </div>
  {:else}
    <div class="article-list">
      {#each filtered as a}
        <button class="article-row" on:click={() => openSlide(a)}>
          {#if a.imageUrl}
            <img class="article-thumb" src={a.imageUrl} alt={a.title} />
          {:else}
            <div class="article-thumb placeholder" aria-hidden="true"></div>
          {/if}
          <div class="article-body">
            <div class="article-title">
              {#if a.featured}<span class="star" aria-label="Featured">⭐</span>{/if}
              {a.title}
            </div>
            <div class="article-meta">
              {#if a.theme}<span class="badge badge-theme">{a.theme}</span>{/if}
              {#if a.lang === 'FR'}<span class="badge badge-fr">FR</span>{/if}
              {#if a.publishedAt}<span class="meta-date">{fmtDate(a.publishedAt)}</span>{/if}
            </div>
            {#if a.summary}
              <div class="article-summary">{a.summary}</div>
            {/if}
          </div>
          <div class="article-scores" aria-label="Relevance {a.relevanceScore?.toFixed(1)}, Innovation {a.innovationScore?.toFixed(1)}">
            <span class="score-val {scoreClass(a.relevanceScore)}">{a.relevanceScore?.toFixed(1)}</span>
            <span class="score-val {scoreClass(a.innovationScore)}">{a.innovationScore?.toFixed(1)}</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- Slide-over -->
{#if slideOver}
  <div
    class="overlay"
    role="button"
    tabindex="0"
    aria-label="Close panel"
    on:click={closeSlide}
    on:keydown={e => (e.key === 'Enter' || e.key === 'Escape') && closeSlide()}
  ></div>
  <div class="slide-over">
    <button class="slide-close" on:click={closeSlide}>✕</button>
    {#if slideOver.imageUrl}
      <img src={slideOver.imageUrl} alt="" class="slide-img" />
    {/if}
    <div class="slide-body">
      <div class="slide-meta">
        {#if slideOver.theme}<span class="badge badge-theme">{slideOver.theme}</span>{/if}
        {#if slideOver.lang === 'FR'}<span class="badge badge-fr">FR</span>{/if}
        {#if slideOver.featured}<span class="badge badge-featured">⭐ Featured</span>{/if}
      </div>
      <h2 class="slide-title">{slideOver.title}</h2>
      {#if slideOver.summary}
        <p class="slide-summary">{slideOver.summary}</p>
      {/if}
      <div class="slide-scores">
        <div class="score-bar-row">
          <span class="score-bar-label">Relevance</span>
          <div class="score-bar-track"><div class="score-bar-fill" style="width:{(slideOver.relevanceScore/10)*100}%"></div></div>
          <span class="score-bar-val {slideOver.relevanceScore >= 9 ? 'high' : ''}">{slideOver.relevanceScore?.toFixed(1)} / 10</span>
        </div>
        <div class="score-bar-row">
          <span class="score-bar-label">Innovation</span>
          <div class="score-bar-track"><div class="score-bar-fill" style="width:{(slideOver.innovationScore/10)*100}%"></div></div>
          <span class="score-bar-val {slideOver.innovationScore >= 9 ? 'high' : ''}">{slideOver.innovationScore?.toFixed(1)} / 10</span>
        </div>
      </div>
      {#if slideOver.sourceUrl}
        <a href={slideOver.sourceUrl} target="_blank" rel="noopener" class="btn btn-primary btn-full" style="margin-top:24px">
          Read original article →
        </a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; margin-bottom: 12px; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-black); }
  .articles-page { max-width: 900px; }
  .page-title { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--text-black); margin-bottom: 24px; }
  .filter-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }

  .skel-list { display: flex; flex-direction: column; }
  .skel-row { display: flex; gap: 16px; align-items: flex-start; padding: 20px 0; border-bottom: 1px solid var(--divider); }

  .article-list { display: flex; flex-direction: column; }
  .article-row {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 20px 0; border-bottom: 1px solid var(--divider);
    cursor: pointer; transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    width: 100%; background: none; border-left: none; border-right: none; border-top: none;
    text-align: left; font-family: var(--sans);
  }
  .article-row:hover {
    background: var(--off-white); margin: 0 -16px;
    padding-left: 16px; padding-right: 16px;
    box-shadow: inset 2px 0 0 var(--text-black);
  }
  .article-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius); flex-shrink: 0; }
  .article-thumb.placeholder { background: var(--divider); }
  .article-body { flex: 1; min-width: 0; }
  .article-title { font-size: 15px; font-weight: 500; color: var(--text-black); line-height: 1.4; margin-bottom: 6px; }
  .star { margin-right: 4px; }
  .article-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
  .meta-date { font-size: 12px; color: var(--text-muted); }
  .article-summary {
    font-size: 13px; color: var(--text-muted); line-height: 1.6;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .article-scores { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; flex-shrink: 0; }
  .score-val { font-size: 13px; font-weight: 500; color: var(--text-muted); }
  .score-val.high { color: var(--green); }
  .score-val.mid  { color: var(--amber); }
  .score-val.low  { color: var(--red); }

  /* Slide-over */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 400; }
  .slide-over {
    position: fixed; top: 0; right: 0; bottom: 0; width: 400px;
    background: var(--white); border-left: 1px solid var(--divider);
    z-index: 500; overflow-y: auto;
  }
  .slide-close {
    position: absolute; top: 16px; right: 16px;
    background: none; border: none; cursor: pointer;
    font-size: 16px; color: var(--text-muted); padding: 4px;
  }
  .slide-close:hover { color: var(--text-black); }
  .slide-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
  .slide-body { padding: 24px; }
  .slide-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .slide-title { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--text-black); line-height: 1.3; margin-bottom: 16px; }
  .slide-summary { font-family: var(--serif); font-size: 16px; color: var(--text-body); line-height: 1.8; margin-bottom: 24px; }
  .slide-scores { display: flex; flex-direction: column; gap: 10px; }

  @media (max-width: 640px) {
    .slide-over { width: 100%; }
  }
</style>
