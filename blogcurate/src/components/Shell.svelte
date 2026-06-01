<script>
// @ts-nocheck

  import { user, currentPage, searchQuery, notifications, unreadCount, markAllRead, dark, toggleTheme, logout, pipelineFlag } from '../stores/store.js';
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
  import BlogDetailPage   from '../pages/BlogDetailPage.svelte';
  import BookmarksPage    from '../pages/BookmarksPage.svelte';

  let showNotif    = false;
  let showUserMenu = false;
  let showOnboarding = $user?.isNew ?? false;
  let showWelcomeBack = !$user?.isNew;

  $: showOnboarding = $user?.isNew ?? false;

  if (showWelcomeBack) setTimeout(() => showWelcomeBack = false, 4000);

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
    article:    'Article',
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
    if (page === 'discover') searchQuery.set('');
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

    <!-- Welcome back banner -->
    {#if showWelcomeBack && $currentPage === 'home'}
      <div class="welcome-banner">
        <span>👋 Welcome back, <strong>{$user?.name?.split(' ')[0]}</strong>!</span>
        <button on:click={() => showWelcomeBack = false}>✕</button>
      </div>
    {/if}

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
    {:else if $currentPage === 'article'}    <BlogDetailPage />
    {:else if $currentPage === 'bookmarks'}  <BookmarksPage />
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
  button.sidebar-user:hover { background: var(--off-white); }
  .new-badge {
    font-size: 11px; font-weight: 600;
    background: var(--green-light); color: var(--green-dark);
    padding: 3px 10px; border-radius: 99px;
  }

  /* Fix broken CSS variable references from old design system */
  .notif-dropdown { background: var(--white); border: 1px solid var(--divider); border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--divider); font-size: 13px; font-weight: 600; color: var(--text-black); }
  .notif-header button { background: none; border: none; cursor: pointer; font-size: 12px; color: var(--green); font-family: inherit; }
  .notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--divider); transition: background 0.1s; }
  .notif-item.unread { background: var(--off-white); }
  .notif-item:hover { background: var(--off-white); }
  .n-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); margin-top: 4px; flex-shrink: 0; }
  .n-dot.read { background: var(--divider); }
  .n-text { font-size: 13px; color: var(--text-body); }
  .n-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .welcome-banner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 24px; font-size: 13px;
    background: var(--off-white); border-bottom: 1px solid var(--divider);
    color: var(--text-body); animation: slideIn 0.3s ease;
  }
  .welcome-banner strong { color: var(--text-black); }
  .welcome-banner button {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-muted); line-height: 1;
  }
  .welcome-banner button:hover { color: var(--text-black); }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .flag-banner { display: flex; align-items: center; gap: 12px; padding: 9px 24px; font-size: 13px; border-bottom: 1px solid var(--divider); }
  .flag-banner.off   { background: var(--red-light);   color: var(--red); }
  .flag-banner.pause { background: var(--amber-light); color: var(--amber); }
  .flag-banner-icon { font-size: 14px; }
  .user-name  { font-size: 13px; font-weight: 600; color: var(--text-black); }
  .user-email { font-size: 11px; color: var(--text-muted); }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--text-black); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 52px; border-bottom: 1px solid var(--divider); background: var(--white); }
  .topbar-right { display: flex; align-items: center; gap: 4px; }
  .topbar-title { font-size: 15px; font-weight: 600; color: var(--text-black); }
  .icon-btn { padding: 6px 10px; border-radius: 100px; font-size: 16px; color: var(--text-muted); transition: background 0.15s; }
  .icon-btn:hover { background: var(--off-white); color: var(--text-black); }
  .notif-dot { position: absolute; top: 2px; right: 6px; min-width: 15px; height: 15px; background: var(--red); color: #fff; border-radius: 99px; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
  .notif-wrap { position: relative; }
  .notif-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 300px; z-index: 400; }
  .app-shell { display: flex; min-height: 100vh; background: var(--white); }
  .sidebar { width: 220px; flex-shrink: 0; border-right: 1px solid var(--divider); display: flex; flex-direction: column; background: var(--white); position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 20px 16px 16px; border-bottom: 1px solid var(--divider); }
  .logo-icon { font-size: 22px; }
  .logo-text { font-size: 14px; font-weight: 700; color: var(--text-black); }
  .logo-sub  { font-size: 11px; color: var(--text-muted); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-muted); font-family: var(--sans); text-align: left; transition: background 0.15s, color 0.15s; position: relative; }
  .nav-item:hover { background: var(--off-white); color: var(--text-black); }
  .nav-item.active { background: var(--off-white); color: var(--text-black); }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-badge { margin-left: auto; min-width: 18px; height: 18px; background: var(--red); color: #fff; border-radius: 99px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
  .sidebar-bottom { padding: 12px 8px; border-top: 1px solid var(--divider); }
  .main-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
</style>
