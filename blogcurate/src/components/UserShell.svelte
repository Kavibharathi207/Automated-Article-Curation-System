<script>
  import { user, userAuthed, currentPage, notifications, unreadCount, markAllRead, logout, pipelineFlag, appMode } from '../stores/store.js';
  import AuthPage       from '../pages/AuthPage.svelte';
  import HomePage       from '../pages/HomePage.svelte';
  import DiscoverPage   from '../pages/DiscoverPage.svelte';
  import PreviewPage    from '../pages/PreviewPage.svelte';
  import DashboardPage  from '../pages/DashboardPage.svelte';
  import SettingsPage   from '../pages/SettingsPage.svelte';
  import ScheduledPage  from '../pages/ScheduledPage.svelte';
  import PublishedPage  from '../pages/PublishedPage.svelte';
  import InterestedPage from '../pages/InterestedPage.svelte';
  import RejectedPage   from '../pages/RejectedPage.svelte';
  import OnboardingModal from './OnboardingModal.svelte';

  let showNotif    = false;
  let showUserMenu = false;
  $: showOnboarding = $user?.isNew ?? false;

  // Page history for back navigation
  /** @type {string[]} */
  let history = [];
  $: if ($currentPage) {
    history = history[history.length - 1] !== $currentPage
      ? [...history, $currentPage]
      : history;
  }
  function goBack() {
    if (history.length > 1) {
      const prev = history[history.length - 2];
      history = history.slice(0, -1);
      currentPage.set(prev);
    }
  }
  $: canGoBack = history.length > 1;

  const nav = [
    { page: 'home',      label: 'Home'      },
    { page: 'discover',  label: 'Discover'  },
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'settings',  label: 'Settings'  },
  ];

  const titles = {
    home: 'Home', discover: 'Discover', preview: 'Preview',
    dashboard: 'Dashboard', settings: 'Settings',
    scheduled: 'Scheduled', published: 'Published',
    interested: 'Interested', rejected: 'Rejected',
  };

  /** @param {MouseEvent} e */
  function openNotif(e) {
    e.stopPropagation(); showNotif = !showNotif; showUserMenu = false;
    if (showNotif) markAllRead();
  }
  /** @param {MouseEvent} e */
  function openUserMenu(e) { e.stopPropagation(); showUserMenu = !showUserMenu; showNotif = false; }
  function closeAll() { showNotif = false; showUserMenu = false; }
  /** @param {string} page */
  function navigate(page) { currentPage.set(page); closeAll(); }
</script>

<svelte:window on:click={closeAll} />

{#if !$userAuthed}
  <AuthPage />
{:else}
  <div class="shell">
    <!-- Top nav -->
    <header class="topnav">
      <div class="topnav-inner">
        <div class="topnav-left">
          {#if canGoBack}
            <button class="back-btn" on:click={goBack} aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          {/if}
          <button class="logo-btn" on:click={() => navigate('home')}>Innovation Digest</button>
        </div>

        <nav class="topnav-links">
          {#each nav as n}
            <button
              class="nav-link"
              class:active={$currentPage === n.page}
              on:click={() => navigate(n.page)}
            >{n.label}</button>
          {/each}
        </nav>

        <div class="topnav-right">
          <!-- Back to landing -->
          <button class="icon-btn landing-back" on:click={() => appMode.set('landing')} title="Back to home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <!-- Write / Search -->
          <button class="icon-btn" on:click={() => navigate('home')} title="New search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span class="icon-btn-label">Write</span>
          </button>

          <!-- Notifications -->
          <div class="rel" role="none" on:click|stopPropagation>
            <button class="icon-btn" on:click={openNotif} aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {#if $unreadCount > 0}
                <span class="notif-badge">{$unreadCount > 9 ? '9+' : $unreadCount}</span>
              {/if}
            </button>
            {#if showNotif}
              <div class="dropdown notif-dropdown">
                <div class="dropdown-header">
                  <span class="dropdown-title">Notifications</span>
                  <button class="dropdown-action" on:click={markAllRead}>Mark all read</button>
                </div>
                {#if $notifications.length === 0}
                  <div class="dropdown-empty">You're all caught up</div>
                {:else}
                  {#each $notifications as n}
                    <div class="notif-item" class:unread={!n.read}>
                      <span class="n-dot" class:read={n.read}></span>
                      <div class="n-body">
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
          <div class="rel" role="none" on:click|stopPropagation>
            <button class="avatar-btn" on:click={openUserMenu} aria-label="User menu">
              <span class="user-avatar">{($user?.name ?? 'U')[0].toUpperCase()}</span>
            </button>
            {#if showUserMenu}
              <div class="dropdown user-dropdown">
                <div class="user-dropdown-profile">
                  <span class="user-avatar user-avatar-lg">{($user?.name ?? 'U')[0].toUpperCase()}</span>
                  <div>
                    <div class="ud-name">{$user?.name}</div>
                    <div class="ud-email">{$user?.email}</div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" on:click={() => navigate('dashboard')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </button>
                <button class="dropdown-item" on:click={() => navigate('settings')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Settings
                </button>
                <button class="dropdown-item" on:click={() => appMode.set('admin')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Admin Panel
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item danger" on:click={logout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign out
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </header>

    <!-- Pipeline banner -->
    {#if $pipelineFlag === 'OFF'}
      <div class="pipeline-banner off">
        <span>Pipeline is <strong>OFF</strong> — Nightly runs are halted.</span>
        <button class="banner-btn" on:click={() => navigate('settings')}>Manage →</button>
      </div>
    {:else if $pipelineFlag === 'PAUSE'}
      <div class="pipeline-banner pause">
        <span>Pipeline is <strong>PAUSED</strong> — Nightly runs will be skipped silently.</span>
        <button class="banner-btn" on:click={() => navigate('settings')}>Manage →</button>
      </div>
    {/if}

    {#if showOnboarding}
      <OnboardingModal on:close={() => { showOnboarding = false; }} />
    {/if}

    <!-- Page -->
    <main class="main-content">
      {#if $currentPage === 'home'}        <HomePage />
      {:else if $currentPage === 'discover'}   <DiscoverPage />
      {:else if $currentPage === 'preview'}    <PreviewPage />
      {:else if $currentPage === 'dashboard'}  <DashboardPage />
      {:else if $currentPage === 'settings'}   <SettingsPage />
      {:else if $currentPage === 'scheduled'}  <ScheduledPage />
      {:else if $currentPage === 'published'}  <PublishedPage />
      {:else if $currentPage === 'interested'} <InterestedPage />
      {:else if $currentPage === 'rejected'}   <RejectedPage />
      {/if}
    </main>
  </div>
{/if}

<style>
  .shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--white); }

  /* ── Top nav ── */
  .topnav {
    position: sticky; top: 0; z-index: 200;
    background: var(--white); border-bottom: 1px solid var(--divider);
  }
  .topnav-inner {
    max-width: 1192px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 57px;
  }

  .topnav-left { display: flex; align-items: center; gap: 8px; }

  .back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    background: none; border: 1px solid var(--divider);
    color: var(--text-muted); cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .back-btn:hover { background: var(--off-white); color: var(--text-black); border-color: var(--divider-strong); }

  .logo-btn {
    font-family: var(--serif); font-size: 22px; font-weight: 700; letter-spacing: -0.3px;
    color: var(--text-black); background: none; border: none; cursor: pointer; padding: 0;
    white-space: nowrap;
  }

  /* Nav links with active underline */
  .topnav-links { display: flex; align-items: center; gap: 0; }
  .nav-link {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-muted); font-family: var(--sans);
    padding: 0 14px; height: 57px; position: relative;
    transition: color 0.15s; letter-spacing: 0.01em;
  }
  .nav-link:hover { color: var(--text-black); }
  .nav-link.active { color: var(--text-black); font-weight: 500; }
  .nav-link.active::after {
    content: ''; position: absolute; bottom: 0; left: 14px; right: 14px;
    height: 2px; background: var(--text-black); border-radius: 2px 2px 0 0;
  }

  .topnav-right { display: flex; align-items: center; gap: 4px; }
  .landing-back { color: var(--text-hint); }
  .landing-back:hover { color: var(--text-black); }
  .rel { position: relative; }

  /* Icon buttons */
  .icon-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); padding: 6px 10px; border-radius: 100px;
    transition: color 0.15s, background 0.15s; font-size: 13px;
  }
  .icon-btn:hover { color: var(--text-black); background: var(--off-white); }
  .icon-btn-label { font-family: var(--sans); font-size: 13px; }

  /* Notification badge */
  .notif-badge {
    position: absolute; top: 3px; right: 6px;
    min-width: 15px; height: 15px;
    background: var(--red); color: #fff;
    border-radius: 99px; font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 3px;
    pointer-events: none;
  }

  /* Avatar button */
  .avatar-btn {
    background: none; border: none; cursor: pointer; padding: 4px;
    border-radius: 50%; transition: opacity 0.15s;
  }
  .avatar-btn:hover { opacity: 0.8; }
  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--text-black); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; font-family: var(--sans);
    user-select: none;
  }
  .user-avatar-lg { width: 40px; height: 40px; font-size: 16px; flex-shrink: 0; }

  /* Dropdowns */
  .dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--white); border: 1px solid var(--divider);
    border-radius: 8px; z-index: 400;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;
  }
  .notif-dropdown { min-width: 320px; }
  .user-dropdown  { min-width: 220px; }

  .dropdown-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px 12px;
  }
  .dropdown-title { font-size: 14px; font-weight: 600; color: var(--text-black); }
  .dropdown-action {
    font-size: 12px; color: var(--green); background: none;
    border: none; cursor: pointer; font-family: var(--sans); padding: 0;
  }
  .dropdown-action:hover { text-decoration: underline; }
  .dropdown-divider { border-top: 1px solid var(--divider); margin: 4px 0; }
  .dropdown-empty {
    padding: 24px 18px; font-size: 13px; color: var(--text-muted); text-align: center;
  }
  .dropdown-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 18px;
    cursor: pointer; font-size: 14px; color: var(--text-body); font-family: var(--sans);
    background: none; border: none; width: 100%; text-align: left; transition: background 0.1s;
  }
  .dropdown-item:hover { background: var(--off-white); }
  .dropdown-item.danger { color: var(--red); }
  .dropdown-item svg { color: var(--text-muted); flex-shrink: 0; }

  /* Notification items */
  .notif-item {
    display: flex; gap: 12px; padding: 12px 18px;
    border-top: 1px solid var(--divider); transition: background 0.1s;
  }
  .notif-item.unread { background: #FAFAFA; }
  .notif-item:hover { background: var(--off-white); }
  .n-body { flex: 1; }
  .n-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); margin-top: 5px; flex-shrink: 0; }
  .n-dot.read { background: var(--divider); }
  .n-text { font-size: 13px; color: var(--text-body); line-height: 1.5; }
  .n-time { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

  /* User dropdown profile block */
  .user-dropdown-profile {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 18px 14px;
  }
  .ud-name { font-size: 14px; font-weight: 600; color: var(--text-black); }
  .ud-email { font-size: 12px; color: var(--text-muted); margin-top: 1px; }

  /* Pipeline banner */
  .pipeline-banner {
    display: flex; align-items: center; justify-content: center; gap: 16px;
    padding: 9px 24px; font-size: 13px;
    border-bottom: 1px solid var(--divider);
  }
  .pipeline-banner.off   { background: var(--red-light);   color: var(--red); }
  .pipeline-banner.pause { background: var(--amber-light); color: var(--amber); }
  .banner-btn {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: var(--sans);
    color: inherit; text-decoration: underline; padding: 0;
  }

  .main-content { flex: 1; }

  @media (max-width: 768px) {
    .topnav-inner { padding: 0 16px; }
    .topnav-links { display: none; }
    .icon-btn-label { display: none; }
  }
</style>
