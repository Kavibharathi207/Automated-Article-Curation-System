<script>
  import { onMount } from 'svelte';
  import { runHistory, runsLoading, fetchRuns } from '../../stores/store.js';

  let expandedId = null;

  onMount(fetchRuns);

  function fmt(str) { return str || '—'; }
  function runtime(start, end) {
    if (!start || !end) return '—';
    const m = Math.round((new Date(end) - new Date(start)) / 60000);
    return `${m} min`;
  }
  function statusBadge(s) {
    if (s === 'Complete') return 'badge-complete';
    if (s === 'Error')    return 'badge-error';
    return 'badge-skipped';
  }
  function toggle(id) { expandedId = expandedId === id ? null : id; }
</script>

<h1 class="page-title">Run history</h1>
<div style="border-top:1px solid var(--divider);margin-bottom:32px"></div>

{#if $runsLoading}
  <div class="skel-wrap">
    {#each Array(5) as _}
      <div class="skel-row">
        <div class="skeleton" style="width:120px;height:14px"></div>
        <div class="skeleton" style="width:120px;height:14px"></div>
        <div class="skeleton" style="width:40px;height:14px"></div>
        <div class="skeleton" style="width:40px;height:14px"></div>
        <div class="skeleton" style="width:40px;height:14px"></div>
        <div class="skeleton" style="width:40px;height:14px"></div>
        <div class="skeleton" style="width:70px;height:22px;border-radius:100px"></div>
      </div>
    {/each}
  </div>
{:else if $runHistory.length === 0}
  <div class="empty-state">
    <h3>No runs yet.</h3>
    <p>Trigger a manual run from the Dashboard to see history here.</p>
  </div>
{:else}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Started</th>
          <th>Completed</th>
          <th class="num">Disc.</th>
          <th class="num">Scored</th>
          <th class="num">Rejected</th>
          <th class="num pub">Published</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each $runHistory as run}
          <tr class="run-row" on:click={() => toggle(run.id)}>
            <td>{fmt(run.startedAt)}</td>
            <td>{fmt(run.completedAt)}</td>
            <td class="num">{run.discovered ?? '—'}</td>
            <td class="num">{run.scored ?? '—'}</td>
            <td class="num">{run.rejected ?? '—'}</td>
            <td class="num pub">{run.published ?? '—'}</td>
            <td><span class="badge {statusBadge(run.status)}">{run.status}</span></td>
          </tr>
          {#if expandedId === run.id}
            <tr class="expanded-row">
              <td colspan="7">
                <div class="expanded-inner">
                  <div class="exp-item"><span class="exp-label">Runtime</span><span>{runtime(run.startedAt, run.completedAt)}</span></div>
                  <div class="exp-item"><span class="exp-label">Run ID</span><span>#{run.id}</span></div>
                  {#if run.status === 'Error'}
                    <div class="exp-item"><span class="exp-label">Error</span><span style="color:var(--red)">Pipeline encountered an error during execution.</span></div>
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .page-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); margin-bottom: 24px;
  }

  .skel-wrap { display: flex; flex-direction: column; gap: 0; }
  .skel-row {
    display: flex; gap: 24px; align-items: center;
    padding: 16px 0; border-bottom: 1px solid var(--divider);
  }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead { }
  th {
    text-align: left; padding: 12px 16px;
    font-size: 12px; font-weight: 500; color: var(--text-muted);
    border-bottom: 2px solid var(--divider);
    font-family: var(--sans); white-space: nowrap;
  }
  th.num { text-align: right; }
  th.pub { color: var(--text-black); }
  td {
    padding: 16px 16px; border-bottom: 1px solid var(--divider);
    color: var(--text-body); font-family: var(--sans); vertical-align: top;
  }
  .run-row { cursor: pointer; }
  .run-row:hover td { background: var(--off-white); }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.pub { font-weight: 500; color: var(--text-black); }

  .expanded-row td { background: var(--off-white); padding: 0; }
  .expanded-inner {
    display: flex; gap: 32px; padding: 16px 16px;
    border-bottom: 1px solid var(--divider);
  }
  .exp-item { display: flex; flex-direction: column; gap: 3px; }
  .exp-label { font-size: 11px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
  .exp-item span:last-child { font-size: 13px; color: var(--text-body); }
</style>
