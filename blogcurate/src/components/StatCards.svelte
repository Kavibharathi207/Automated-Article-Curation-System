<script>
// @ts-nocheck

  import { pipelineStats } from '../stores/store.js';

  const cards = [
    { label: 'Published',  key: 'published',  color: 'var(--green)' },
    { label: 'Scheduled',  key: 'scheduled',  color: 'var(--amber)' },
    { label: 'Interested', key: 'interested', color: '#7C3AED'       },
    { label: 'Rejected',   key: 'rejected',   color: 'var(--red)'   },
  ];
</script>

<div class="stat-grid">
  {#each cards as c}
    <div class="stat-card">
      <div class="stat-value" style="color:{c.color}">{$pipelineStats[c.key]}</div>
      <div class="stat-label">{c.label}</div>
    </div>
  {/each}
</div>

<style>
  .stat-grid {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
  }
  .stat-card {
    padding: 18px 20px; border: 1px solid var(--divider);
    border-radius: 8px; background: var(--white);
  }
  .stat-value {
    font-family: var(--serif); font-size: 32px; font-weight: 700;
    line-height: 1; margin-bottom: 6px;
  }
  .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }

  @media (max-width: 600px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
