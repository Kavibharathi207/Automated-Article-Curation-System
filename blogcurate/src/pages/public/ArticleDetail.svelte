<script>
  import { selectedArticle, currentPublicPage } from '../../stores/store.js';

  function scoreBar(v) { return Math.round((v / 10) * 100); }
  function scoreClass(v) { return v >= 9 ? 'high' : v >= 7 ? 'mid' : 'low'; }
</script>

{#if $selectedArticle}
  {@const a = $selectedArticle}
  <div class="detail-page">
    <div class="detail-inner">
      <button class="back-btn" on:click={() => { currentPublicPage.set('home'); window.scrollTo(0,0); }}>
        ← Back
      </button>

      <img class="detail-cover" src={a.imageUrl} alt="" />

      <div class="detail-meta-row">
        {#if a.featured}<span class="feat-badge">⭐ Featured</span>{/if}
        <span class="meta-theme">{a.theme}</span>
        <span class="meta-dot">·</span>
        <span class="meta-date">{new Date(a.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</span>
      </div>

      <h1 class="detail-title">{a.title}</h1>

      <div class="detail-summary">{a.summary}</div>

      <!-- Scores -->
      <div class="scores-section">
        <div class="score-row">
          <span class="score-label">Relevance</span>
          <div class="score-bar-wrap">
            <div class="score-bar {scoreClass(a.relevanceScore)}" style="width:{scoreBar(a.relevanceScore)}%"></div>
          </div>
          <span class="score-val {scoreClass(a.relevanceScore)}">{a.relevanceScore?.toFixed(1)}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Innovation</span>
          <div class="score-bar-wrap">
            <div class="score-bar {scoreClass(a.innovationScore)}" style="width:{scoreBar(a.innovationScore)}%"></div>
          </div>
          <span class="score-val {scoreClass(a.innovationScore)}">{a.innovationScore?.toFixed(1)}</span>
        </div>
      </div>

      {#if a.sourceUrl && a.sourceUrl !== '#'}
        <a class="source-btn" href={a.sourceUrl} target="_blank" rel="noopener">
          Read Original Article →
        </a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .detail-page { max-width: 1192px; margin: 0 auto; padding: 0 24px 80px; }
  .detail-inner { max-width: 720px; margin: 0 auto; padding-top: 32px; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; color: var(--text2); background: none; border: none;
    cursor: pointer; padding: 0; margin-bottom: 28px;
    transition: color 0.12s;
  }
  .back-btn:hover { color: var(--text); }

  .detail-cover {
    width: 100%; aspect-ratio: 1200/630; object-fit: cover;
    border-radius: 4px; margin-bottom: 28px;
  }

  .detail-meta-row {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .feat-badge { font-size: 12px; color: var(--yellow); font-weight: 600; }
  .meta-theme { font-size: 13px; color: var(--text3); font-weight: 500; }
  .meta-dot   { color: var(--text3); }
  .meta-date  { font-size: 13px; color: var(--text3); }

  .detail-title {
    font-family: var(--serif); font-size: 34px; font-weight: 700;
    color: var(--text); line-height: 1.25; letter-spacing: -0.5px;
    margin-bottom: 24px;
  }

  .detail-summary {
    font-size: 18px; line-height: 1.85; color: var(--text2);
    font-family: var(--serif);
    padding-bottom: 28px; border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
  }

  .scores-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
  .score-row { display: flex; align-items: center; gap: 12px; }
  .score-label { font-size: 13px; color: var(--text2); width: 80px; flex-shrink: 0; }
  .score-bar-wrap { flex: 1; height: 6px; background: var(--bg3); border-radius: 99px; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
  .score-bar.high { background: var(--green); }
  .score-bar.mid  { background: var(--yellow); }
  .score-bar.low  { background: var(--red); }
  .score-val { font-size: 13px; font-weight: 600; width: 30px; text-align: right; }
  .score-val.high { color: var(--green); }
  .score-val.mid  { color: var(--yellow); }
  .score-val.low  { color: var(--red); }

  .source-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 11px 24px; border-radius: 99px;
    background: var(--text); color: var(--bg);
    font-size: 14px; font-weight: 500; text-decoration: none;
    transition: opacity 0.12s;
  }
  .source-btn:hover { opacity: 0.85; }

  @media (max-width: 768px) {
    .detail-title { font-size: 24px; }
    .detail-summary { font-size: 16px; }
  }
</style>
