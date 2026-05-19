<script>
  import { themeStats } from '../stores/store.js';
</script>

<div class="themes-inner">
  <div class="themes-heading">Themes — Tonight</div>
  {#if $themeStats.length === 0}
    <div class="empty-themes">
      <p class="empty-title">No theme data yet</p>
      <p class="empty-sub">Theme stats appear after the first pipeline run.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table class="theme-table">
        <thead>
          <tr>
            <th>Theme</th>
            <th>Lang</th>
            <th>Candidates</th>
            <th>Approved</th>
            <th>Published</th>
            <th>Featured</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          {#each $themeStats as t}
            {@const rate = Math.round((t.published / t.candidates) * 100)}
            <tr>
              <td class="t-name">{t.name}</td>
              <td><span class="lang-pill">{t.language}</span></td>
              <td class="num">{t.candidates}</td>
              <td class="num">{t.approved}</td>
              <td class="num pub">{t.published}</td>
              <td class="num feat">{t.featured}</td>
              <td><span class="rate-pill {rate >= 50 ? 'good' : 'warn'}">{rate}%</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .themes-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .empty-themes { padding: 20px 0; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text-black); margin-bottom: 4px; }
  .empty-sub   { font-size: 13px; color: var(--text-muted); }
  .table-wrap { overflow-x: auto; }
  .theme-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .theme-table th {
    text-align: left; font-size: 10px; font-weight: 600;
    color: var(--text-hint); text-transform: uppercase; letter-spacing: 0.06em;
    padding: 0 10px 10px; border-bottom: 1px solid var(--divider);
  }
  .theme-table th:not(:first-child) { text-align: center; }
  .theme-table td {
    padding: 10px; border-bottom: 1px solid var(--divider);
    color: var(--text-body);
  }
  .theme-table tr:last-child td { border-bottom: none; }
  .theme-table tr:hover td { background: var(--off-white); }
  .t-name { font-weight: 500; color: var(--text-black); }
  .num { text-align: center; font-variant-numeric: tabular-nums; }
  .pub  { color: var(--green);  font-weight: 600; }
  .feat { color: var(--amber);  font-weight: 600; }
  .lang-pill {
    display: inline-block; font-size: 11px; font-weight: 600;
    padding: 2px 8px; border-radius: 100px;
    background: var(--off-white); border: 1px solid var(--divider);
    color: var(--text-muted);
  }
  .rate-pill {
    display: inline-block; padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 600;
  }
  .rate-pill.good { background: var(--green-light); color: var(--green-dark); }
  .rate-pill.warn { background: var(--amber-light); color: var(--amber); }
</style>
