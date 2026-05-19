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

  // Mock last run for display — backend will replace this
  const mockRun = {
    id: 1,
    triggeredAt: new Date(Date.now() - 5*60*60*1000).toISOString(),
    completedAt: new Date(Date.now() - 4*60*60*1000 - 12*60*1000).toISOString(),
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

  const statusIcon = { success:'✅', warning:'⚠️', error:'❌' };

  function fmt(ms) {
    return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
  }

  function runtime(run) {
    const mins = Math.round((new Date(run.completedAt) - new Date(run.triggeredAt)) / 60000);
    return `${mins} min`;
  }
</script>

<div class="page">
  <div class="page-header">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn-ghost btn-sm" on:click={() => currentPage.set('dashboard')}>← Dashboard</button>
      <div>
        <h1>🔁 Pipeline Run Log</h1>
        <p>Stage-by-stage breakdown of the last nightly pipeline execution</p>
      </div>
    </div>
  </div>

  <!-- Run summary -->
  <div class="card" style="margin-bottom:18px">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      {#each [
        { label:'Triggered',  value: new Date(mockRun.triggeredAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) },
        { label:'Completed',  value: new Date(mockRun.completedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) },
        { label:'Runtime',    value: runtime(mockRun) },
        { label:'Published',  value: `${mockRun.articlesPublished} articles` },
      ] as s}
        <div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:3px">{s.label}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text)">{s.value}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Stage breakdown -->
  <div class="card">
    <div class="card-title">Stage Breakdown</div>
    {#each mockRun.stages as stage}
      <div class="run-stage-row">
        <span class="run-stage-num">{stage.n}</span>
        <span class="run-status-icon">{statusIcon[stage.status]}</span>
        <span class="run-stage-name">{STAGES[stage.n].name}</span>
        <span style="font-size:11px;color:var(--text3);flex:1">{stage.note}</span>
        <div class="run-stage-bar-wrap">
          <div class="run-stage-bar {stage.status}" style="width:{Math.min(100,(stage.durationMs/200000)*100)}%"></div>
        </div>
        <span class="run-stage-dur">{fmt(stage.durationMs)}</span>
      </div>
    {/each}
  </div>

  {#if $pipelineRuns.length === 0}
    <div style="margin-top:14px;font-size:12px;color:var(--text3);text-align:center">
      Live run history will appear here once the backend pipeline is connected.
    </div>
  {/if}
</div>
