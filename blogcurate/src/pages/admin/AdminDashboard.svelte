<script>
  import { onMount, onDestroy } from 'svelte';
  import { pipelineStatus, pipelineLoading, fetchStatus, setFlag, triggerRun, currentAdminPage } from '../../stores/store.js';

  let interval;
  let triggering = false;

  onMount(() => {
    fetchStatus();
    interval = setInterval(() => {
      if ($pipelineStatus?.status === 'RUNNING') fetchStatus();
    }, 30000);
  });
  onDestroy(() => clearInterval(interval));

  async function handleTrigger() {
    triggering = true;
    await triggerRun();
    await new Promise(r => setTimeout(r, 800));
    triggering = false;
    fetchStatus();
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }

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
      {#each ['ON','PAUSE','OFF'] as f}
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
    <div class="stat-num">{$pipelineStatus?.published?.toLocaleString() ?? '—'}</div>
    <div class="stat-lbl">articles published</div>
  </div>
  <div class="stat-block">
    <div class="stat-num" class:red={($pipelineStatus?.failed ?? 0) > 0}>
      {$pipelineStatus?.failed ?? '—'}
    </div>
    <div class="stat-lbl">failed</div>
  </div>
  <div class="stat-block">
    <div class="stat-num" style="font-size:22px;font-weight:600">{fmtDate($pipelineStatus?.lastRun)}</div>
    <div class="stat-lbl">last run</div>
  </div>
  <div class="stat-block">
    <div class="stat-num" style="font-size:22px;font-weight:600">{fmtDate($pipelineStatus?.nextRun)}</div>
    <div class="stat-lbl">next run</div>
  </div>
</div>

<div style="border-top:1px solid var(--divider);margin-bottom:40px"></div>

{#if isRunning}
  <div class="running-note">
    <span class="status-dot running" style="display:inline-block"></span>
    Pipeline is running — auto-refreshing every 30 seconds
  </div>
{/if}

<!-- Quick nav -->
<div class="section-label">Navigate</div>
<div class="quick-nav">
  {#each [
    { page:'runs',     title:'Run History',     desc:'View all pipeline executions' },
    { page:'articles', title:'Articles Manager', desc:'Browse published articles' },
    { page:'themes',   title:'Theme Manager',    desc:'Manage and calibrate themes' },
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

  /* Stat row */
  .stat-row { display: flex; margin-bottom: 0; }
  .stat-block { padding: 0 40px 32px 0; flex: 1; }
  .stat-block + .stat-block { padding-left: 40px; border-left: 1px solid var(--divider); }
  .stat-num { font-family: var(--serif); font-size: 40px; font-weight: 700; color: var(--text-black); line-height: 1.1; }
  .stat-num.red { color: var(--red); }
  .stat-lbl { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

  .running-note {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--green); margin-bottom: 24px;
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
