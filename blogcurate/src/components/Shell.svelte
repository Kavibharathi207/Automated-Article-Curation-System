<script>
// @ts-nocheck

  import { user, currentPage, notifications, unreadCount, markAllRead, dark, toggleTheme, logout, pipelineFlag } from '../stores/store.js';
  import HomePage         from '../pages/HomePage.svelte';
  import DiscoverPage     from '../pages/DiscoverPage.svelte';
  import PreviewPage      from '../pages/PreviewPage.svelte';
  import DashboardPage    from '../pages/DashboardPage.svelte';
  import SettingsPage     from '../pages/SettingsPage.svelte';
  import ScheduledPage    from '../pages/ScheduledPage.svelte';
  import PublishedPage    from '../pages/PublishedPage.svelte';
  import InterestedPage   from '../pages/InterestedPage.svelte';
  import RejectedPage     from '../pages/RejectedPage.svelte';
  import ThemesPage       from '../pages/ThemesPage.svelte';
  import PipelineRunPage  from '../pages/PipelineRunPage.svelte';
  import OnboardingModal  from './OnboardingModal.svelte';

  let showNotif    = false;
  let showUserMenu = false;
  let showOnboarding = $user?.isNew ?? false;

  // Show onboarding whenever a new user logs in
  $: showOnboarding = $user?.isNew ?? false;

  const nav = [
    { page: 'home',        icon: '🏠', label: 'Home'         },
    { page: 'discover',    icon: '🔍', label: 'Discover'     },
    { page: 'dashboard',   icon: '📊', label: 'Dashboard'   },
    { page: 'themes',      icon: '🗂', label: 'Themes'      },
    { page: 'pipeline',    icon: '🔁', label: 'Pipeline Log' },
    { page: 'settings',    icon: '⚙️', label: 'Settings'    },
  ];

  const titles = {
    home:       'Home',
    discover:   'Discover Blogs',
    preview:    'Blog Preview',
    dashboard:  'Dashboard',
    settings:   'Settings',
    scheduled:  'Scheduled Posts',
    published:  'Published Posts',
    interested: 'Interested Blogs',
    rejected:   'Rejected Blogs',
    themes:     'Theme Profiles',
    pipeline:   'Pipeline Run Log',
  };

  function openNotif(e) {
    e.stopPropagation();
    showNotif = !showNotif;
    showUserMenu = false;
    if (showNotif) markAllRead();
  }

  function openUserMenu(e) {
    e.stopPropagation();
    showUserMenu = !showUserMenu;
    showNotif = false;
  }

  function closeAll() {
    showNotif = false;
    showUserMenu = false;
  }

  function navigate(page) {
    currentPage.set(page);
    closeAll();
  }
</script>

<svelte:window on:click={closeAll} />

<div class="app-shell">
  <!-- ── Sidebar ── -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">✨</div>
      <div>
        <div class="logo-text">BlogCurate AI</div>
        <div class="logo-sub">Powered by Mistral</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      {#each nav as n}
        <button
          class="nav-item"
          class:active={$currentPage === n.page}
          on:click={() => navigate(n.page)}
        >
          <span class="nav-icon">{n.icon}</span>
          {n.label}
          {#if n.page === 'discover' && $unreadCount > 0}
            <span class="nav-badge">{$unreadCount}</span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- User section -->
    <div class="sidebar-bottom">
      <button class="sidebar-user" on:click={() => navigate('settings')}>
        <div class="avatar">{$user?.avatar}</div>
        <div style="flex:1;min-width:0">
          <div class="user-name">{$user?.name}</div>
          <div class="user-email" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{$user?.email}</div>
        </div>
        <span style="font-size:12px;color:var(--text3)">⚙️</span>
      </button>
    </div>
  </aside>

  <!-- ── Main Content ── -->
  <div class="main-content">

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="topbar-title">{titles[$currentPage] || 'BlogCurate AI'}</div>
        {#if $user?.isNew && $currentPage === 'home'}
          <span class="new-badge">✨ New Account</span>
        {/if}
      </div>

      <div class="topbar-right">
        <!-- Theme toggle -->
        <button class="icon-btn" on:click|stopPropagation={toggleTheme} title="Toggle theme">
          {$dark ? '☀️' : '🌙'}
        </button>

        <!-- Notifications -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="notif-wrap" on:click|stopPropagation>
          <button class="icon-btn" on:click={openNotif} aria-label="Notifications">
            🔔
            {#if $unreadCount > 0}
              <span class="notif-dot">{$unreadCount > 9 ? '9+' : $unreadCount}</span>
            {/if}
          </button>
          {#if showNotif}
            <div class="notif-dropdown">
              <div class="notif-header">
                <span>Notifications</span>
                <button on:click={markAllRead}>Mark all read</button>
              </div>
              {#if $notifications.length === 0}
                <div style="padding:20px;text-align:center;font-size:12px;color:var(--text3)">No notifications</div>
              {:else}
                {#each $notifications as n}
                  <div class="notif-item" class:unread={!n.read}>
                    <span class="n-dot" class:read={n.read}></span>
                    <div>
                      <div class="n-text">{n.text}</div>
                      <div class="n-time">{n.time}</div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>

        <!-- User menu -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="notif-wrap" on:click|stopPropagation>
          <button class="avatar" style="cursor:pointer" on:click={openUserMenu} aria-label="User menu">{$user?.avatar}</button>
          {#if showUserMenu}
            <div class="notif-dropdown" style="width:200px">
              <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
                <div style="font-size:13px;font-weight:600;color:var(--text)">{$user?.name}</div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px">{$user?.email}</div>
              </div>
              <button class="notif-item" on:click={() => navigate('settings')}>
                <span class="n-dot" style="background:transparent"></span>
                <div class="n-text">⚙️ Settings</div>
              </button>
              <button class="notif-item" on:click={logout}>
                <span class="n-dot" style="background:transparent"></span>
                <div class="n-text" style="color:var(--red)">🚪 Sign Out</div>
              </button>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Pipeline OFF/PAUSE banner -->
    {#if $pipelineFlag === 'OFF'}
      <div class="flag-banner off">
        <span class="flag-banner-icon">🚨</span>
        <strong>Pipeline is OFF</strong> — Nightly runs are halted. Administrator has been alerted.
        <button class="btn btn-sm" style="margin-left:auto;background:var(--red);color:#fff" on:click={() => navigate('settings')}>Manage</button>
      </div>
    {:else if $pipelineFlag === 'PAUSE'}
      <div class="flag-banner pause">
        <span class="flag-banner-icon">⏸</span>
        <strong>Pipeline is PAUSED</strong> — Nightly runs will be skipped silently.
        <button class="btn btn-sm" style="margin-left:auto;background:var(--yellow);color:#000" on:click={() => navigate('settings')}>Manage</button>
      </div>
    {/if}

    <!-- Onboarding modal for new users -->
    {#if showOnboarding}
      <OnboardingModal on:close={() => showOnboarding = false} />
    {/if}

    <!-- Page content -->
    {#if $currentPage === 'home'}       <HomePage />
    {:else if $currentPage === 'discover'}   <DiscoverPage />
    {:else if $currentPage === 'preview'}    <PreviewPage />
    {:else if $currentPage === 'dashboard'}  <DashboardPage />
    {:else if $currentPage === 'settings'}   <SettingsPage />
    {:else if $currentPage === 'scheduled'}  <ScheduledPage />
    {:else if $currentPage === 'published'}  <PublishedPage />
    {:else if $currentPage === 'interested'} <InterestedPage />
    {:else if $currentPage === 'rejected'}   <RejectedPage />
    {:else if $currentPage === 'themes'}     <ThemesPage />
    {:else if $currentPage === 'pipeline'}   <PipelineRunPage />
    {/if}
  </div>
</div>

<style>
  .topbar-left { display: flex; align-items: center; gap: 10px; }
  button.notif-item, button.sidebar-user, button.icon-btn, button.avatar {
    background: none; border: none; cursor: pointer; font-family: inherit;
  }
  button.notif-item { width: 100%; text-align: left; }
  button.sidebar-user { width: 100%; text-align: left; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; }
  button.sidebar-user:hover { background: var(--hover); }
  .new-badge {
    font-size: 11px; font-weight: 600;
    background: var(--green-light); color: var(--green-dark);
    padding: 3px 10px; border-radius: 99px;
  }
</style>
