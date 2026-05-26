<script>
// @ts-nocheck

  import { pipelineStatus, pipelineFlag } from '../stores/store.js';
  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }
</script>

<div class="pipeline-header">
  <div class="ph-left">
    <span class="ph-title">Curation Pipeline</span>
    <span class="ph-sub">Automated Article Curation System</span>
  </div>
  <div class="ph-right">
    <div class="ph-meta">
      <span class="ph-meta-label">Last run</span>
      <span class="ph-meta-val">{fmtDate($pipelineStatus?.lastRun)}</span>
    </div>
    <div class="ph-meta">
      <span class="ph-meta-label">Next run</span>
      <span class="ph-meta-val">{fmtDate($pipelineStatus?.nextRun)}</span>
    </div>
    <span class="flag-badge {$pipelineFlag.toLowerCase()}">
      <span class="flag-dot"></span>
      {$pipelineFlag}
    </span>
  </div>
</div>

<style>
  .pipeline-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0 18px; border-bottom: 1px solid var(--divider);
    flex-wrap: wrap; gap: 12px;
  }
  .ph-left { display: flex; flex-direction: column; gap: 2px; }
  .ph-title { font-size: 15px; font-weight: 600; color: var(--text-black); }
  .ph-sub   { font-size: 12px; color: var(--text-muted); }
  .ph-right { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .ph-meta  { display: flex; flex-direction: column; gap: 2px; }
  .ph-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-hint); }
  .ph-meta-val   { font-size: 13px; font-weight: 500; color: var(--text-black); }
  .flag-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600;
  }
  .flag-badge.on    { background: var(--green-light); color: var(--green-dark); }
  .flag-badge.pause { background: var(--amber-light); color: var(--amber); }
  .flag-badge.off   { background: var(--red-light);   color: var(--red); }
  .flag-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
</style>
