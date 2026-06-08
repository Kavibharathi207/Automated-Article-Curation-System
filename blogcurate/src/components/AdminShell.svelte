<script>
  import { currentAdminPage, isLoggedIn, adminLogout, appMode, pipelineStatus, setFlag, loginError, dark, toggleTheme } from '../stores/store.js';
  import AdminLogin      from '../pages/admin/AdminLogin.svelte';
  import AdminDashboard  from '../pages/admin/AdminDashboard.svelte';
  import RunHistory      from '../pages/admin/RunHistory.svelte';
  import ArticlesManager from '../pages/admin/ArticlesManager.svelte';
  import ThemeManager    from '../pages/admin/ThemeManager.svelte';
  import EditorialProfilesManager from '../pages/admin/EditorialProfilesManager.svelte';
  import AdminSettings   from '../pages/admin/AdminSettings.svelte';
  import { onMount } from 'svelte';

  let sidebarOpen = false;

  // Reset login error on open, but preserve existing session
  onMount(() => {
    loginError.set('');
    if (!$isLoggedIn) currentAdminPage.set('login');
  });

  const nav = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'runs',      label: 'Runs'       },
    { page: 'articles',  label: 'Articles'   },
    { page: 'themes',    label: 'Themes'     },
    { page: 'profiles',  label: 'Profiles'   },
    { page: 'settings',  label: 'Settings'   },
  ];

 // @ts-ignore
   $: flag = $pipelineStatus?.flag ?? 'ON';
  $: dotClass = flag === 'ON' ? 'dot-on' : flag === 'PAUSE' ? 'dot-pause' : 'dot-off';
</script>

{#if !$isLoggedIn}
  <AdminLogin />
{:else}
  <div class="admin-shell">
    <!-- Black top nav -->
    <header class="admin-nav">
      <div class="admin-nav-left">
        <button class="hamburger" on:click={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar">
          <span class:open={sidebarOpen}></span>
          <span class:open={sidebarOpen}></span>
          <span class:open={sidebarOpen}></span>
        </button>
        <button class="admin-logo" on:click={() => currentAdminPage.set('dashboard')}>
          <span class="pipeline-dot {dotClass}"></span>
          BlogCurate
        </button>
        <nav class="admin-nav-links">
          {#each nav as n}
            <button
              class="admin-nav-link"
              class:active={$currentAdminPage === n.page}
              on:click={() => currentAdminPage.set(n.page)}
            >{n.label}</button>
          {/each}
        </nav>
      </div>

      <div class="admin-nav-right">
        <div class="pipe-toggle">
          {#each ['ON','PAUSE','OFF'] as f}
            <button
              class="pt-btn pt-{f.toLowerCase()}"
              class:pt-active={flag === f}
              on:click={() => setFlag(f)}
            >{f}</button>
          {/each}
        </div>
        <button class="admin-back-btn" on:click={() => appMode.set('landing')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Home
        </button>
        <button class="admin-theme-btn" on:click={toggleTheme} aria-label="Toggle theme">
          {#if $dark}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          {:else}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          {/if}
        </button>
        <button class="admin-ghost-link" on:click={adminLogout}>Logout</button>
      </div>
    </header>

    <!-- Sidebar overlay -->
    {#if sidebarOpen}
      <div class="sidebar-overlay" on:click={() => sidebarOpen = false}></div>
    {/if}

    <!-- Slide-in sidebar -->
    <aside class="sidebar" class:sidebar-open={sidebarOpen}>
      <div class="sidebar-header">
        <span class="sidebar-brand">BlogCurate</span>
      </div>
      <nav class="sidebar-nav">
        {#each nav as n, i}
          <button
            class="sidebar-item"
            class:sidebar-item-active={$currentAdminPage === n.page}
            class:sidebar-item-visible={sidebarOpen}
            style="transition-delay: {sidebarOpen ? i * 40 : 0}ms"
            on:click={() => { currentAdminPage.set(n.page); sidebarOpen = false; }}
          >{n.label}</button>
        {/each}
      </nav>
    </aside>

  <!-- Page content -->
    <main class="admin-main" class:shifted={sidebarOpen}>
      <div class="page-container">
        {#if $currentAdminPage === 'dashboard'}    <AdminDashboard />
        {:else if $currentAdminPage === 'runs'}     <RunHistory />
        {:else if $currentAdminPage === 'articles'} <ArticlesManager />
        {:else if $currentAdminPage === 'themes'}   <ThemeManager />
        {:else if $currentAdminPage === 'profiles'} <EditorialProfilesManager />
        {:else if $currentAdminPage === 'settings'} <AdminSettings />
        {/if}
      </div>
    </main>
  </div>
{/if}

<style>
  .admin-shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--white); position: relative; }

  /* Black nav */
  .admin-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
    background: var(--black);
    border-bottom: 1px solid #2A2A2A;
    position: sticky; top: 0; z-index: 200;
  }
  .admin-nav-left { display: flex; align-items: center; gap: 32px; }

  .admin-logo {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--serif); font-size: 22px; font-weight: 700;
    color: #fff; background: none; border: none; cursor: pointer; padding: 0;
    letter-spacing: -0.3px;
  }
  .pipeline-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .dot-on    { background: var(--green); box-shadow: 0 0 0 3px rgba(26,137,23,0.3); animation: pulse 2s infinite; }
  .dot-pause { background: var(--amber); }
  .dot-off   { background: var(--red); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

  .admin-nav-links { display: flex; align-items: center; gap: 2px; }
  .admin-nav-link {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-hint); font-family: var(--sans);
    padding: 6px 12px; transition: color 0.15s;
    border-bottom: 2px solid transparent; height: 56px;
    display: flex; align-items: center;
  }
  .admin-nav-link:hover { color: #fff; }
  .admin-nav-link.active { color: #fff; border-bottom-color: #fff; }

  .admin-nav-right { display: flex; align-items: center; gap: 12px; }

  /* Pipeline toggle */
  .pipe-toggle {
    display: flex; gap: 2px;
    background: #2A2A2A; border-radius: 4px; padding: 3px;
  }
  .pt-btn {
    padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 700;
    cursor: pointer; border: none; background: none; color: #6B6B6B;
    font-family: var(--sans); transition: all 0.12s;
  }
  .pt-btn:hover { color: #fff; }
  .pt-btn.pt-on.pt-active    { background: rgba(26,137,23,0.2);  color: #4ADE80; }
  .pt-btn.pt-pause.pt-active { background: rgba(217,119,6,0.2);  color: #FCD34D; }
  .pt-btn.pt-off.pt-active   { background: rgba(201,75,75,0.2);  color: #FCA5A5; }

  .admin-ghost-link {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-hint); font-family: var(--sans);
    padding: 4px 8px; transition: color 0.15s;
  }
  .admin-ghost-link:hover { color: #fff; }

  .admin-theme-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    color: #ccc; cursor: pointer; transition: all 0.15s;
  }
  .admin-theme-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }

  .admin-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    color: #fff; font-size: 13px; font-family: var(--sans); font-weight: 500;
    padding: 6px 14px; border-radius: 100px; cursor: pointer;
    transition: background 0.15s;
  }
  .admin-back-btn:hover { background: rgba(255,255,255,0.15); }

  .admin-main { flex: 1; }

  /* Hamburger */
  .hamburger {
    display: flex; flex-direction: column; justify-content: center; gap: 5px;
    width: 36px; height: 36px; background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 4px; transition: background 0.15s;
  }
  .hamburger:hover { background: rgba(255,255,255,0.1); }
  .hamburger span {
    display: block; height: 2px; background: #fff; border-radius: 2px;
    transition: all 0.3s ease-in-out; transform-origin: center;
  }
  .hamburger span:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
  .hamburger span:nth-child(2).open { opacity: 0; transform: scaleX(0); }
  .hamburger span:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }

  /* Overlay */
  .sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 150; animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* Sidebar */
  .sidebar {
    position: fixed; top: 56px; left: 0; bottom: 0;
    width: 0; overflow: hidden;
    background: var(--black); border-right: 1px solid #2A2A2A;
    z-index: 160;
    transition: width 0.3s ease-in-out;
  }
  .sidebar-open { width: 280px; }

  .sidebar-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #2A2A2A;
  }
  .sidebar-brand {
    font-family: var(--serif); font-size: 20px; font-weight: 700;
    color: #fff; white-space: nowrap;
  }

  .sidebar-nav {
    display: flex; flex-direction: column; padding: 12px 0;
  }

  .sidebar-item {
    display: flex; align-items: center;
    padding: 12px 24px; font-size: 15px; font-family: var(--sans);
    font-weight: 500; color: #999; background: none; border: none;
    cursor: pointer; text-align: left; white-space: nowrap;
    opacity: 0; transform: translateX(-15px);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.15s, background 0.15s;
  }
  .sidebar-item-visible {
    opacity: 1; transform: translateX(0);
  }
  .sidebar-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .sidebar-item-active { color: #fff; }

  /* Main content shift */
  .admin-main {
    flex: 1;
    transition: margin-left 0.3s ease-in-out;
  }
  .admin-main.shifted { margin-left: 280px; }

  @media (max-width: 768px) {
    .admin-nav { padding: 0 16px; }
    .admin-nav-links { display: none; }
    .admin-main.shifted { margin-left: 0; }
  }
</style>
