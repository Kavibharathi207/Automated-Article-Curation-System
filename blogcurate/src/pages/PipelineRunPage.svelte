<script>
  import { currentPage, pipelineRuns } from '../stores/store.js';

  const STAGES = [
    { n:0, name:'Control Flag'       },
    { n:1, name:'Theme Calibration'  },
    { n:2, name:'Query Generation'   },
    { n:3, name:'Discovery & Dedup'  },
    { n:4, name:'AI Quality Scoring' },
    { n:5, name:'Summary Generation' },
    { n:6, name:'Image Retrieval'    },
    { n:7, name:'CMS Publication'    },
  ];

  const mockRun = {
    id: 1,
    triggeredAt: new Date(Date.now() - 5*60*60*1000).toISOString(),
    completedAt:  new Date(Date.now() - 4*60*60*1000 - 12*60*1000).toISOString(),
    articlesPublished: 31,
    stages: [
      { n:0, status:'success', durationMs:110,    note:'Flag: ON' },
      { n:1, status:'success', durationMs:38000,  note:'4 themes calibrated' },
      { n:2, status:'success', durationMs:14000,  note:'20 queries generated' },
      { n:3, status:'success', durationMs:88000,  note:'67 candidates, 34 after dedup' },
      { n:4, status:'success', durationMs:196000, note:'31 approved, 3 featured' },
      { n:5, status:'warning', durationMs:172000, note:'2 summaries regenerated, 1 skipped' },
      { n:6, status:'success', durationMs:54000,  note:'100% image coverage' },
      { n:7, status:'success', durationMs:19000,  note:'31 articles delivered to CMS' },
    ],
  };

  const statusBadge = { success:'badge-complete', warning:'badge-running', error:'badge-error' };
  const statusLabel = { success:'Complete', warning:'Warning', error:'Error' };

  function fmt(ms) { return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`; }
  function runtime(run) {
    const mins = Math.round((new Date(run.completedAt) - new Date(run.triggeredAt)) / 60000);
    return `${mins} min`;
  }
</script>

<div class="run-wrap">
  <div class="run-header">
    <button class="back-btn" on:click={() => currentPage.set('dashboard')}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Dashboard
    </button>
    <h1 class="page-title">Pipeline Run Log</h1>
    <p class="page-sub">Stage-by-stage breakdown of the last nightly pipeline execution</p>
  </div>

  <!-- Run summary -->
  <div class="summary-row">
    {#each [
      { label:'Triggered', value: new Date(mockRun.triggeredAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) },
      { label:'Completed', value: new Date(mockRun.completedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) },
      { label:'Runtime',   value: runtime(mockRun) },
      { label:'Published', value: `${mockRun.articlesPublished} articles` },
    ] as s, i}
      <div class="summary-block" class:last={i === 3}>
        <div class="summary-label">{s.label}</div>
        <div class="summary-val">{s.value}</div>
      </div>
    {/each}
  </div>

  <!-- Stage breakdown -->
  <div class="stages-card">
    <div class="stages-heading">Stage Breakdown</div>
    {#each mockRun.stages as stage}
      <div class="stage-row">
        <span class="stage-num">{stage.n}</span>
        <span class="stage-name">{STAGES[stage.n].name}</span>
        <span class="stage-note">{stage.note}</span>
        <div class="stage-bar-track">
          <div class="stage-bar {stage.status}" style="width:{Math.min(100,(stage.durationMs/200000)*100)}%"></div>
        </div>
        <span class="stage-dur">{fmt(stage.durationMs)}</span>
        <span class="badge {statusBadge[stage.status]}">{statusLabel[stage.status]}</span>
      </div>
    {/each}
  </div>

  {#if $pipelineRuns.length === 0}
    <p class="live-note">Live run history will appear here once the backend pipeline is connected.</p>
  {/if}
</div>

<style>
  .run-wrap { max-width: 900px; margin: 0 auto; padding: 0 24px 80px; }

  .run-header {
    padding: 32px 0 28px; border-bottom: 1px solid var(--divider); margin-bottom: 32px;
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; margin-bottom: 12px; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-black); }
  .page-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .page-sub { font-size: 14px; color: var(--text-muted); }

  .summary-row {
    display: flex; border: 1px solid var(--divider); border-radius: 8px;
    overflow: hidden; margin-bottom: 24px;
  }
  .summary-block {
    flex: 1; padding: 20px 24px;
    border-right: 1px solid var(--divider);
  }
  .summary-block.last { border-right: none; }
  .summary-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-hint); margin-bottom: 6px; }
  .summary-val   { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--text-black); }

  .stages-card {
    border: 1px solid var(--divider); border-radius: 8px;
    background: var(--white); padding: 24px;
  }
  .stages-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .stage-row {
    display: grid; grid-template-columns: 24px 160px 1fr 100px 48px 80px;
    align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--divider);
  }
  .stage-row:last-child { border-bottom: none; }
  .stage-num  { font-size: 11px; font-weight: 700; color: var(--text-hint); }
  .stage-name { font-size: 13px; font-weight: 500; color: var(--text-black); }
  .stage-note { font-size: 12px; color: var(--text-muted); }
  .stage-bar-track { height: 4px; background: var(--divider); border-radius: 2px; overflow: hidden; }
  .stage-bar { height: 100%; border-radius: 2px; background: var(--green); }
  .stage-bar.warning { background: var(--amber); }
  .stage-bar.error   { background: var(--red); }
  .stage-dur  { font-size: 12px; color: var(--text-muted); text-align: right; }

  .live-note { margin-top: 16px; font-size: 13px; color: var(--text-muted); text-align: center; }

  @media (max-width: 768px) {
    .summary-row { flex-wrap: wrap; }
    .summary-block { min-width: 50%; }
    .stage-row { grid-template-columns: 24px 1fr 48px; }
    .stage-note, .stage-bar-track, .stage-dur { display: none; }
  }
</style>
