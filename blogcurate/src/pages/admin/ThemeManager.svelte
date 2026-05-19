<script>
  import { onMount } from 'svelte';
  import { adminThemes, themesLoading, fetchThemes, calibrateTheme, calibratingId } from '../../stores/store.js';

  let showAddModal = false;
  let newThemeName = '';
  let newThemeLang = 'EN';
  let newKeywords  = [];
  let kwInput      = '';

  onMount(fetchThemes);

  function addKw() {
    const k = kwInput.trim();
    if (k && !newKeywords.includes(k)) newKeywords = [...newKeywords, k];
    kwInput = '';
  }
  function removeKw(k) { newKeywords = newKeywords.filter(x => x !== k); }
  function onKwKey(e) { if (e.key === 'Enter') { e.preventDefault(); addKw(); } }
  function closeModal() { showAddModal = false; newThemeName = ''; newThemeLang = 'EN'; newKeywords = []; kwInput = ''; }
</script>

<h1 class="page-title">Themes</h1>
<div style="border-top:1px solid var(--divider);margin-bottom:32px"></div>

{#if $themesLoading}
  <div class="skel-list">
    {#each Array(4) as _}
      <div class="skel-row">
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div class="skeleton" style="width:180px;height:16px"></div>
          <div class="skeleton" style="width:280px;height:12px"></div>
          <div style="display:flex;gap:6px">
            {#each Array(4) as _}<div class="skeleton" style="width:60px;height:22px;border-radius:100px"></div>{/each}
          </div>
        </div>
        <div class="skeleton" style="width:110px;height:34px;border-radius:100px"></div>
      </div>
    {/each}
  </div>
{:else if $adminThemes.length === 0}
  <div class="empty-state">
    <h3>No themes configured.</h3>
    <p>Add a theme to start curating articles.</p>
  </div>
{:else}
  <div class="theme-list">
    {#each $adminThemes as theme}
      {@const calibrating = $calibratingId === theme.id}
      <div class="theme-row">
        <div class="theme-body">
          <div class="theme-name">{theme.name}</div>
          <div class="theme-meta">
            Last calibrated:
            <span>{theme.lastCalibrated
              ? new Date(theme.lastCalibrated).toLocaleDateString('en-GB', { dateStyle: 'long' })
              : 'Never'}</span>
            {#if theme.articles7d !== undefined}
              · Articles (7d): <span>{theme.articles7d}</span>
            {/if}
            {#if theme.lang}
              · <span class="badge badge-{theme.lang === 'FR' ? 'fr' : 'en'}">{theme.lang}</span>
            {/if}
          </div>
          {#if theme.keywords?.length}
            <div class="theme-keywords">
              {#each theme.keywords.slice(0,5) as kw}
                <span class="badge badge-theme">{kw}</span>
              {/each}
              {#if theme.keywords.length > 5}
                <span class="badge badge-gray">+{theme.keywords.length - 5} more</span>
              {/if}
            </div>
          {/if}
        </div>
        <button
          class="btn btn-secondary btn-sm"
          on:click={() => calibrateTheme(theme.id)}
          disabled={calibrating || !!$calibratingId}
        >
          {calibrating ? 'Calibrating…' : 'Calibrate now'}
        </button>
      </div>
    {/each}
  </div>
{/if}

<!-- Add theme link -->
<button class="add-theme-link" on:click={() => showAddModal = true}>+ Add a theme</button>

<!-- Add theme modal -->
{#if showAddModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <h2 class="modal-title">Add new theme</h2>
      <div class="form-group">
        <label class="form-label">Theme name</label>
        <input bind:value={newThemeName} placeholder="e.g. tech-innovation" />
      </div>
      <div class="form-group">
        <label class="form-label">Language</label>
        <select bind:value={newThemeLang} style="width:auto">
          <option value="EN">EN</option>
          <option value="FR">FR</option>
          <option value="Both">Both</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Keywords</label>
        <div class="kw-input-row">
          <input bind:value={kwInput} on:keydown={onKwKey} placeholder="Type keyword and press Enter" />
          <button class="btn btn-secondary btn-sm" on:click={addKw}>Add</button>
        </div>
        {#if newKeywords.length}
          <div class="kw-pills">
            {#each newKeywords as k}
              <span class="kw-pill">
                {k}
                <button on:click={() => removeKw(k)}>×</button>
              </span>
            {/each}
          </div>
        {/if}
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={closeModal}>Cancel</button>
        <button class="btn btn-primary" disabled={!newThemeName.trim()}>Add theme</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page-title { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--text-black); margin-bottom: 24px; }

  .skel-list { display: flex; flex-direction: column; }
  .skel-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 0; border-bottom: 1px solid var(--divider); }

  .theme-list { display: flex; flex-direction: column; }
  .theme-row {
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    padding: 24px 0; border-bottom: 1px solid var(--divider);
  }
  .theme-body { flex: 1; min-width: 0; }
  .theme-name { font-size: 16px; font-weight: 500; color: var(--text-black); margin-bottom: 6px; }
  .theme-meta { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
  .theme-meta span { color: var(--text-body); }
  .theme-keywords { display: flex; flex-wrap: wrap; gap: 6px; }

  .add-theme-link {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-muted); font-family: var(--sans);
    padding: 20px 0; display: block; transition: color 0.15s;
  }
  .add-theme-link:hover { color: var(--text-black); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 500; padding: 24px;
  }
  .modal {
    background: var(--white); border: 1px solid var(--divider);
    border-radius: var(--radius); padding: 32px;
    width: 100%; max-width: 480px;
  }
  .modal-title { font-size: 18px; font-weight: 500; color: var(--text-black); margin-bottom: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
  .kw-input-row { display: flex; gap: 8px; }
  .kw-input-row input { flex: 1; }
  .kw-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .kw-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 13px; padding: 4px 10px; border-radius: 100px;
    background: #F2F2F2; color: var(--text-body);
  }
  .kw-pill button {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-muted); padding: 0; line-height: 1;
  }
  .kw-pill button:hover { color: var(--red); }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
</style>
