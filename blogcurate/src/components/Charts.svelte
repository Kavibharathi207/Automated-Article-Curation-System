<script>
  import { weeklyActivity, pipelineStats } from '../stores/store.js';

  $: maxVal = Math.max(...$weeklyActivity.map(d => d.count), 1);
  const BAR_H = 80;
  function barH(v) { return Math.max(4, Math.round((v / maxVal) * BAR_H)); }
  $: hasActivity = $weeklyActivity.some(d => d.count > 0);
</script>

<div class="chart-inner">
  <div class="chart-head">
    <span class="chart-heading">Weekly Activity</span>
    {#if hasActivity}
      <span class="chart-summary">{$pipelineStats.total} total · {$pipelineStats.published} published · {$pipelineStats.scheduled} scheduled</span>
    {/if}
  </div>

  {#if !hasActivity}
    <div class="empty-chart">
      <p class="empty-title">No activity yet</p>
      <p class="empty-sub">Start curating blogs to see your weekly progress.</p>
    </div>
  {:else}
    <div class="bar-chart">
      {#each $weeklyActivity as d}
        <div class="bar-group">
          <div class="bar-wrap">
            <div class="bar" style="height:{barH(d.count)}px" title="{d.count} blog{d.count !== 1 ? 's' : ''}">
              {#if d.count > 0}<span class="bar-val">{d.count}</span>{/if}
            </div>
          </div>
          <div class="bar-label">{d.day}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .chart-inner { width: 100%; }
  .chart-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .chart-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .chart-summary { font-size: 12px; color: var(--text-muted); }

  .empty-chart { padding: 24px 0; text-align: center; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .empty-sub   { font-size: 13px; color: var(--text-muted); }

  .bar-chart {
    display: flex; align-items: flex-end; gap: 8px;
    height: 100px; padding-bottom: 24px;
  }
  .bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .bar-wrap   { display: flex; align-items: flex-end; height: 80px; }
  .bar {
    width: 100%; min-height: 4px; border-radius: 3px 3px 0 0;
    background: var(--text-black); opacity: 0.15;
    position: relative; transition: opacity 0.15s;
  }
  .bar:hover { opacity: 0.35; }
  .bar-val {
    position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
    font-size: 11px; color: var(--text-muted); white-space: nowrap;
  }
  .bar-label { font-size: 11px; color: var(--text-muted); margin-top: 6px; }
</style>
