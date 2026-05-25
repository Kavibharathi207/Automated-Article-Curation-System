<script>
  import { currentPage, themes } from '../stores/store.js';

  function daysSince(iso) {
    return Math.floor((Date.now() - new Date(iso)) / 86400000);
  }
</script>

<div class="themes-wrap">
  <div class="themes-header">
    <button class="back-btn" on:click={() => currentPage.set('dashboard')}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Dashboard
    </button>
    <h1 class="page-title">Theme Profiles</h1>
    <p class="page-sub">AI-calibrated editorial profiles — recalibrated every Monday from the 50 most recent published articles</p>
  </div>

  <div class="themes-grid">
    {#each $themes as theme}
      {@const days = daysSince(theme.lastCalibrated)}
      <div class="theme-card">
        <div class="theme-card-top">
          <div class="theme-name">{theme.name}</div>
          <div class="theme-badges">
            <span class="badge {theme.language === 'FR' ? 'badge-fr' : 'badge-en'}">{theme.language}</span>
            {#if days <= 7}
              <span class="badge badge-complete">Fresh</span>
            {:else}
              <span class="badge badge-amber">Stale</span>
            {/if}
          </div>
        </div>

        {#if theme.spirit}
          <div class="theme-spirit">"{theme.spirit}"</div>
        {/if}

        <div class="theme-keywords">
          {#each theme.keywords as kw}
            <span class="badge badge-theme">{kw}</span>
          {/each}
        </div>

        <div class="theme-footer">
          <span class="theme-date">Calibrated {days === 0 ? 'today' : `${days}d ago`}</span>
          <button class="btn btn-secondary btn-sm">Recalibrate</button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .themes-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px 80px; }

  .themes-header {
    padding: 32px 0 28px; border-bottom: 1px solid var(--divider); margin-bottom: 32px;
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; margin-bottom: 12px; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-black); }
  .page-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .page-sub { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

  .themes-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
  }
  .theme-card {
    background: var(--white); border: 1px solid var(--divider);
    border-radius: 8px; padding: 20px;
  }
  .theme-card-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 10px;
  }
  .theme-name { font-size: 15px; font-weight: 600; color: var(--text-black); }
  .theme-badges { display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
  .theme-spirit {
    font-size: 13px; color: var(--text-muted); font-style: italic;
    line-height: 1.6; margin-bottom: 12px;
  }
  .theme-keywords { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .theme-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 14px; border-top: 1px solid var(--divider);
  }
  .theme-date { font-size: 12px; color: var(--text-muted); }

  @media (max-width: 600px) {
    .themes-grid { grid-template-columns: 1fr; }
  }
</style>
