<script>
  import { appMode } from '../stores/store.js';

  // Show back button if user arrived here from user/admin mode
  let prevMode = null;
  function goBack() { if (prevMode) appMode.set(prevMode); }
</script>

<div class="landing">
  <!-- Top bar -->
  <header class="landing-nav">
    <div class="nav-left">
      <div class="nav-logo">ACS</div>
    </div>
    <div class="nav-right">
      <button class="nav-link-btn" on:click={() => appMode.set('user')}>User Platform</button>
      <button class="btn btn-primary btn-sm" on:click={() => appMode.set('admin')}>Admin Panel</button>
    </div>
  </header>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-inner">
      <h1>Automated Article<br/>Curation System.</h1>
      <p>AI curates the best articles overnight.<br/>Published every morning at 02:00 IST.</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" on:click={() => appMode.set('user')}>
          Read articles →
        </button>
        <button class="btn btn-secondary btn-lg" on:click={() => appMode.set('admin')}>
          Admin panel
        </button>
      </div>
    </div>
  </div>

  <!-- Divider -->
  <div class="divider"></div>

  <!-- Two cards -->
  <div class="cards-row page-container">
    <button class="entry-card" on:click={() => appMode.set('user')}>
      <div class="entry-label">User Platform</div>
      <div class="entry-title">Discover curated articles, mark interests, generate and schedule blog posts.</div>
      <ul class="entry-list">
        <li>Search any topic</li>
        <li>Mark interested / not interested</li>
        <li>AI generates blog with Mistral</li>
        <li>Set timer &amp; auto-publish</li>
        <li>Track your publish queue</li>
      </ul>
      <div class="entry-cta">Enter User Platform →</div>
    </button>

    <button class="entry-card" on:click={() => appMode.set('admin')}>
      <div class="entry-label">Admin Panel</div>
      <div class="entry-title">Manage the pipeline, monitor runs, review articles, calibrate themes.</div>
      <ul class="entry-list">
        <li>Pipeline control (ON / PAUSE / OFF)</li>
        <li>Run history &amp; logs</li>
        <li>Articles manager</li>
        <li>Theme calibration</li>
        <li>API key protected</li>
      </ul>
      <div class="entry-cta admin">Enter Admin Panel →</div>
    </button>
  </div>

  <footer class="landing-footer">
    <span>ACS — Automated Curation System</span>
    <span>Powered by Mistral · Ollama</span>
  </footer>
</div>

<style>
  .landing { min-height: 100vh; display: flex; flex-direction: column; background: var(--white); }

  .landing-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 57px;
    border-bottom: 1px solid var(--divider);
    position: sticky; top: 0; background: var(--white); z-index: 100;
  }
  .nav-left { display: flex; align-items: center; gap: 8px; }
  .nav-logo {
    font-family: var(--serif); font-size: 22px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px;
  }
  .nav-right { display: flex; align-items: center; gap: 8px; }
  .nav-link-btn {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--text-muted); font-family: var(--sans);
    padding: 6px 12px; border-radius: 100px; transition: color 0.15s, background 0.15s;
  }
  .nav-link-btn:hover { color: var(--text-black); background: var(--off-white); }

  .hero {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 80px 24px 64px; border-bottom: 1px solid var(--divider);
  }
  .hero-inner { text-align: center; max-width: 640px; }
  .hero-inner h1 {
    font-family: var(--serif); font-size: 52px; font-weight: 700;
    color: var(--text-black); line-height: 1.15; margin-bottom: 20px;
  }
  .hero-inner p {
    font-size: 18px; color: var(--text-muted); line-height: 1.6; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  .cards-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; padding-top: 48px; padding-bottom: 64px;
  }

  .entry-card {
    background: none; border: none; cursor: pointer;
    text-align: left; padding: 32px 40px 32px 0;
    border-right: 1px solid var(--divider);
    transition: background 0.15s;
  }
  .entry-card:last-child { border-right: none; padding-left: 40px; padding-right: 0; }
  .entry-card:hover { background: var(--off-white); }

  .entry-label {
    font-size: 12px; font-weight: 500; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
  }
  .entry-title {
    font-family: var(--serif); font-size: 22px; font-weight: 700;
    color: var(--text-black); line-height: 1.35; margin-bottom: 20px;
  }
  .entry-list {
    list-style: none; display: flex; flex-direction: column; gap: 8px;
    padding: 20px 0; border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider); margin-bottom: 20px;
  }
  .entry-list li { font-size: 14px; color: var(--text-muted); }
  .entry-list li::before { content: '— '; color: var(--text-hint); }

  .entry-cta { font-size: 14px; font-weight: 500; color: var(--green); }
  .entry-cta.admin { color: var(--text-black); }

  .landing-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px; border-top: 1px solid var(--divider);
    font-size: 13px; color: var(--text-hint);
  }

  @media (max-width: 640px) {
    .cards-row { grid-template-columns: 1fr; }
    .entry-card { border-right: none; border-bottom: 1px solid var(--divider); padding: 28px 0; }
    .entry-card:last-child { border-bottom: none; padding-left: 0; }
    .hero-inner h1 { font-size: 36px; }
    .landing-nav { padding: 0 20px; }
    .landing-footer { padding: 16px 20px; flex-direction: column; gap: 4px; text-align: center; }
  }
</style>
