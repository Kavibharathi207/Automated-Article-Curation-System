<script>
  import { currentPage, themes } from '../stores/store.js';

  function daysSince(iso) {
    return Math.floor((Date.now() - new Date(iso)) / 86400000);
  }
</script>

<div class="page">
  <div class="page-header">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn-ghost btn-sm" on:click={() => currentPage.set('dashboard')}>← Dashboard</button>
      <div>
        <h1>🗂 Theme Profiles</h1>
        <p>AI-calibrated editorial profiles — recalibrated every Monday from the 50 most recent published articles</p>
      </div>
    </div>
  </div>

  <div class="themes-grid">
    {#each $themes as theme}
      {@const days = daysSince(theme.lastCalibrated)}
      <div class="theme-card">
        <div class="theme-card-header">
          <div class="theme-card-name">{theme.name}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="tag {theme.language === 'FR' ? 'tag-cyan' : 'tag-purple'}">{theme.language}</span>
            {#if days <= 7}
              <span class="tag tag-green">✅ Fresh</span>
            {:else}
              <span class="tag tag-yellow">⚠️ Stale</span>
            {/if}
          </div>
        </div>

        <div class="theme-card-spirit">"{theme.spirit}"</div>

        <div class="theme-card-keywords">
          {#each theme.keywords as kw}
            <span class="tag tag-gray">{kw}</span>
          {/each}
        </div>

        <div class="theme-card-footer">
          <span>🕐 Calibrated {days === 0 ? 'today' : `${days}d ago`}</span>
          <button class="btn btn-outline btn-sm" on:click={() => {}}>🔄 Recalibrate</button>
        </div>
      </div>
    {/each}
  </div>
</div>
