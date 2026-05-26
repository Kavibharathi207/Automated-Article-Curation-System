<script>
  import { currentPublicPage, selectedArticle, publicThemeFilter, dark, toggleTheme, appMode, isLoggedIn, fetchPublicArticles } from '../stores/store.js';
  import PublicHome    from '../pages/public/PublicHome.svelte';
  import ArticleDetail from '../pages/public/ArticleDetail.svelte';
  import { onMount } from 'svelte';

  onMount(() => fetchPublicArticles());
</script>

<div class="pub-shell">
  <header class="pub-nav">
    <div class="pub-nav-inner">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="pub-logo" on:click={() => { currentPublicPage.set('home'); selectedArticle.set(null); }}>
        Innovation Digest
      </div>
      <div class="pub-nav-right">
        <button class="icon-btn" on:click={toggleTheme}>{$dark ? '☀️' : '🌙'}</button>
        <button class="btn-admin" on:click={() => appMode.set('admin')}>
          {$isLoggedIn ? 'Admin' : 'Admin Login'}
        </button>
      </div>
    </div>
  </header>

  <main class="pub-main">
    {#if $currentPublicPage === 'home'}
      <PublicHome />
    {:else if $currentPublicPage === 'article'}
      <ArticleDetail />
    {/if}
  </main>
</div>

<style>
  .pub-shell { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }

  .pub-nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--bg); border-bottom: 1px solid var(--border);
  }
  .pub-nav-inner {
    max-width: 1192px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 57px;
  }
  .pub-logo {
    font-family: var(--serif); font-size: 22px; font-weight: 700;
    color: var(--text); cursor: pointer; letter-spacing: -0.3px;
  }
  .pub-nav-right { display: flex; align-items: center; gap: 10px; }

  .icon-btn {
    width: 34px; height: 34px; border-radius: 6px;
    background: transparent; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; color: var(--text2);
    transition: all 0.12s;
  }
  .icon-btn:hover { background: var(--hover); color: var(--text); }

  .btn-admin {
    padding: 7px 16px; border-radius: 99px;
    font-size: 13px; font-weight: 500;
    background: transparent; border: 1px solid var(--border);
    color: var(--text2); cursor: pointer; transition: all 0.12s;
  }
  .btn-admin:hover { border-color: var(--text); color: var(--text); }

  .pub-main { flex: 1; }
</style>
