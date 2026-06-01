<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    pipelineStatus,
    fetchStatus,
    setFlag,
    triggerRun,
    currentAdminPage,
    editorialProfiles,
    fetchEditorialProfiles,
    runHistory,
    fetchRuns,
  } from '../../stores/store.js';

  let interval;
  let triggering = false;

  onMount(() => {
    fetchStatus();
    fetchEditorialProfiles();
    fetchRuns();

    interval = setInterval(() => {
      if ($pipelineStatus?.status === 'RUNNING') fetchStatus();
    }, 30000);
  });

  onDestroy(() => clearInterval(interval));

  async function handleTrigger() {
    triggering = true;
    await triggerRun();
    await new Promise((r) => setTimeout(r, 800));
    triggering = false;
    fetchStatus();
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }

  // Calculate stats from editorial profiles
  $: totalArticlesAnalyzed = $editorialProfiles.reduce((sum, p) => sum + (p.articlesAnalyzed || 0), 0);
  $: averageAcceptanceRate = $editorialProfiles.length > 0
    ? Math.round(($editorialProfiles.reduce((sum, p) => sum + (p.acceptanceRate || 0), 0) / $editorialProfiles.length) * 100)
    : 0;
  $: averageQuality = $editorialProfiles.length > 0
    ? Math.round(($editorialProfiles.reduce((sum, p) => sum + (p.lastCalibrationQuality || 0), 0) / $editorialProfiles.length) * 100)
    : 0;
  $: themeCount = $editorialProfiles.length;
  $: lastRun = $runHistory?.[0];
  $: totalPublished = ($runHistory ?? []).reduce((sum, r) => sum + (r.published || 0), 0);

  $: flag = $pipelineStatus?.flag ?? 'ON';
  $: isRunning = $pipelineStatus?.status === 'RUNNING';
</script>

<!-- Pipeline control bar -->
<div class="control-bar">
  <div class="control-left">
    <span class="control-label">Pipeline</span>
    <span class="status-indicator">
      <span class="status-dot {isRunning ? 'running' : 'idle'}"></span>
      <span class="status-text" class:running={isRunning}>{$pipelineStatus?.status ?? 'IDLE'}</span>
    </span>
  </div>
  <div class="control-right">
    <div class="flag-btns">
      {#each ['ON', 'PAUSE', 'OFF'] as f}
        <button
          class="flag-btn flag-{f.toLowerCase()}"
          class:active={flag === f}
          on:click={() => setFlag(f)}
        >{f}</button>
      {/each}
    </div>
    <button
      class="btn btn-primary btn-sm"
      on:click={handleTrigger}
      disabled={triggering || isRunning}
    >
      {triggering ? 'Triggering…' : '▶ Trigger Run'}
    </button>
  </div>
</div>

<div style="border-top:1px solid var(--divider);margin-bottom:40px"></div>

<!-- Page title -->
<h1 class="page-title">Dashboard</h1>

<!-- Stat row -->
<div class="stat-row">
  <div class="stat-block">
    <div class="stat-num">{totalArticlesAnalyzed.toLocaleString()}</div>
    <div class="stat-lbl">articles analyzed</div>
  </div>
  <div class="stat-block">
    <div class="stat-num">{themeCount}</div>
    <div class="stat-lbl">active themes</div>
  </div>
  <div class="stat-block">
    <div class="stat-num">{averageAcceptanceRate}%</div>
    <div class="stat-lbl">avg acceptance rate</div>
  </div>
  <div class="stat-block">
    <div class="stat-num">{averageQuality}%</div>
    <div class="stat-lbl">avg calibration quality</div>
  </div>
</div>

<div style="border-top:1px solid var(--divider);margin-bottom:40px"></div>

{#if isRunning}
  <div class="running-note">
    <span class="status-dot running" style="display:inline-block"></span>
    Pipeline is running — auto-refreshing every 30 seconds
  </div>
{/if}

<!-- Latest Run Section -->
{#if lastRun}
  <div class="section-label">Latest Run</div>
  <button class="last-run-card" on:click={() => currentAdminPage.set('runs')}>
    <div class="run-header">
      <div>
        <div class="run-date">{fmtDate(lastRun.startedAt)}</div>
        <div class="run-status"><span class="badge badge-complete">Complete</span></div>
      </div>
    </div>
    <div class="run-stats">
      <div class="run-stat">
        <span class="run-stat-val">{lastRun.published}</span>
        <span class="run-stat-lbl">published</span>
      </div>
      <div class="run-stat">
        <span class="run-stat-val">{lastRun.scored}</span>
        <span class="run-stat-lbl">scored</span>
      </div>
      <div class="run-stat">
        <span class="run-stat-val">{lastRun.rejected}</span>
        <span class="run-stat-lbl">rejected</span>
      </div>
      <div class="run-stat">
        <span class="run-stat-val">{totalPublished}</span>
        <span class="run-stat-lbl">total (all)</span>
      </div>
    </div>
    <div class="run-footer">View run history →</div>
  </button>

  <div style="border-top:1px solid var(--divider);margin-bottom:40px"></div>
{/if}

<!-- Quick nav -->
<div class="section-label">Navigate</div>
<div class="quick-nav">
  {#each [
    { page: 'runs', title: 'Run History', desc: 'View all pipeline executions' },
    { page: 'articles', title: 'Articles Manager', desc: 'Browse published articles' },
    { page: 'themes', title: 'Theme Manager', desc: 'Manage and calibrate themes' },
    { page: 'profiles', title: 'Editorial Profiles', desc: 'Weekly AI-analyzed theme profiles' },
  ] as q}
    <button class="quick-card" on:click={() => currentAdminPage.set(q.page)}>
      <div class="qc-title">{q.title}</div>
      <div class="qc-desc">{q.desc}</div>
      <div class="qc-arrow">→</div>
    </button>
  {/each}
</div>

<style>
  /* Control bar */
  .control-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 0 20px; flex-wrap: wrap; gap: 12px;
  }
  .control-left { display: flex; align-items: center; gap: 16px; }
  .control-label { font-size: 13px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .status-indicator { display: flex; align-items: center; gap: 7px; }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    display: inline-block;
  }
  .status-dot.running { background: var(--green); box-shadow: 0 0 0 3px rgba(26,137,23,0.2); animation: pulse 1.5s infinite; }
  .status-dot.idle    { background: var(--text-hint); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .status-text { font-size: 13px; font-weight: 500; color: var(--text-muted); }
  .status-text.running { color: var(--green); }

  .control-right { display: flex; align-items: center; gap: 10px; }
  .flag-btns { display: flex; gap: 6px; }
  .flag-btn {
    padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid var(--divider);
    background: var(--white); color: var(--text-muted);
    font-family: var(--sans); transition: all 0.12s;
  }
  .flag-btn:hover { border-color: var(--text-black); color: var(--text-black); }
  .flag-btn.flag-on.active    { background: var(--green-light);  color: var(--green);  border-color: var(--green); }
  .flag-btn.flag-pause.active { background: var(--amber-light);  color: var(--amber);  border-color: var(--amber); }
  .flag-btn.flag-off.active   { background: var(--red-light);    color: var(--red);    border-color: var(--red); }

  /* Page title */
  .page-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); margin-bottom: 32px;
  }

  .stat-row { display: flex; margin-bottom: 0; }
  .stat-block {
    padding: 20px 32px; flex: 1;
    border-radius: 8px; cursor: default;
    transition: border-color 0.18s, box-shadow 0.18s;
    border: 1px solid transparent;
  }
  .stat-block:hover {
    border-color: var(--text-black);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .stat-block + .stat-block { border-left: 1px solid var(--divider); }
  .stat-block + .stat-block:hover { border-left-color: var(--text-black); }
  .stat-num { font-family: var(--serif); font-size: 40px; font-weight: 700; color: var(--text-black); line-height: 1.1; }
  .stat-num.red { color: var(--red); }
  .stat-lbl { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

  .running-note {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--green); margin-bottom: 24px;
  }

  /* Last run section */
  .section-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }

  .last-run-card {
    width: 100%; background: var(--white); border: 1px solid var(--divider); border-radius: var(--radius);
    padding: 24px; cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s;
    text-align: left; font-family: var(--sans);
  }
  .last-run-card:hover { border-color: var(--text-black); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

  .run-header {
    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
  }
  .run-date { font-size: 14px; font-weight: 500; color: var(--text-black); }
  .run-status { margin-top: 4px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .badge-complete { background: #dcfce7; color: #166534; }

  .run-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;
  }
  .run-stat {
    display: flex; flex-direction: column; align-items: center; text-align: center;
  }
  .run-stat-val { font-size: 24px; font-weight: 700; color: var(--text-black); }
  .run-stat-lbl { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

  .run-footer {
    font-size: 13px; color: var(--text-muted); font-weight: 500; padding-top: 12px; border-top: 1px solid var(--divider);
  }

  /* Quick nav */
  .quick-nav { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; border: 1px solid var(--divider); border-radius: var(--radius); overflow: hidden; }
  .quick-card {
    background: var(--white); border: none; border-right: 1px solid var(--divider);
    padding: 24px; text-align: left; cursor: pointer;
    transition: background 0.12s; position: relative;
    font-family: var(--sans);
  }
  .quick-card:last-child { border-right: none; }
  .quick-card:hover { background: var(--off-white); }
  .qc-title { font-size: 15px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .qc-desc  { font-size: 13px; color: var(--text-muted); }
  .qc-arrow { position: absolute; top: 24px; right: 20px; font-size: 16px; color: var(--text-hint); }

  @media (max-width: 768px) {
    .stat-row { flex-wrap: wrap; }
    .stat-block { min-width: 50%; }
    .quick-nav { grid-template-columns: 1fr; }
    .quick-card { border-right: none; border-bottom: 1px solid var(--divider); }
    .quick-card:last-child { border-bottom: none; }
  }
</style>
