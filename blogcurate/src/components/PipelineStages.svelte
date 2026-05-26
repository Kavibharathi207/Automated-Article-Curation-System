<script>
  import { stageRuns } from '../stores/store.js';
  // @ts-ignore
  function fmt(ms) { return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`; }
  $: maxMs = $stageRuns.length ? Math.max(...$stageRuns.map(s => s.durationMs)) : 1;
</script>

<div class="stages-inner">
  <div class="stages-heading">Last Run — Stage Breakdown</div>
  {#if $stageRuns.length === 0}
    <div class="empty-stages">
      <p class="empty-title">No pipeline runs yet</p>
      <p class="empty-sub">Trigger a run from the Admin Dashboard.</p>
    </div>
  {:else}
    {#each $stageRuns as s}
      <div class="stage-row">
        <span class="stage-num">{s.stage}</span>
        <span class="stage-name">{s.name}</span>
        <div class="stage-bar-track">
          <div class="stage-bar {s.status}" style="width:{Math.min(100,(s.durationMs/maxMs)*100)}%"></div>
        </div>
        <span class="stage-dur">{fmt(s.durationMs)}</span>
      </div>
    {/each}
  {/if}
</div>

<style>
  .stages-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .empty-stages { padding: 20px 0; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .empty-sub   { font-size: 13px; color: var(--text-muted); }
  .stage-row {
    display: grid; grid-template-columns: 24px 1fr 80px 40px;
    align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--divider);
  }
  .stage-row:last-child { border-bottom: none; }
  .stage-num  { font-size: 11px; font-weight: 700; color: var(--text-hint); }
  .stage-name { font-size: 13px; color: var(--text-black); font-weight: 500; }
  .stage-bar-track { height: 4px; background: var(--divider); border-radius: 2px; overflow: hidden; }
  .stage-bar { height: 100%; border-radius: 2px; background: var(--green); }
  .stage-bar.error   { background: var(--red); }
  .stage-bar.warning { background: var(--amber); }
  .stage-dur  { font-size: 12px; color: var(--text-muted); text-align: right; }
</style>
