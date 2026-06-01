<script>
  import { pipelineStatus, setFlag } from '../../stores/store.js';

  let runTime   = '02:00';
  let tz        = 'Asia/Kolkata';
  let parallel  = true;
  let bilingual = false;

  let cmsEndpoint = 'https://cms.example.com/api/v1';
  let cmsApiKey   = 'sk-••••••••••••••••••••••••••••••••';
  let cmsStatus   = 'connected';
  let showKey     = false;

  function testCms() {
    cmsStatus = 'testing';
    setTimeout(() => { cmsStatus = 'connected'; }, 1200);
  }
  function rotateKey() { cmsApiKey = 'sk-' + Math.random().toString(36).slice(2, 34); }

  let minRelevance  = 7.0;
  let minInnovation = 6.5;

  let notifs = [
    { label: 'Pipeline run completed',  hint: 'Alert when a run finishes successfully', on: true  },
    { label: 'Pipeline failure',        hint: 'Immediate alert on any run error',       on: true  },
    { label: 'New article published',   hint: 'Alert when an article goes live',        on: false },
    { label: 'Theme calibrated',        hint: 'Alert after a theme recalibration',      on: false },
    { label: 'Daily digest',            hint: 'Summary email every morning at 08:00',   on: true  },
  ];

  let dedupWindow = 30;
  let minWords    = 400;
  let maxWords    = 2000;
  let bannedTerms = ['sponsored', 'advertisement', 'click here', 'buy now'];
  let newTerm     = '';

  function addTerm() {
    const t = newTerm.trim().toLowerCase();
    if (t && !bannedTerms.includes(t)) bannedTerms = [...bannedTerms, t];
    newTerm = '';
  }
  function removeTerm(t) { bannedTerms = bannedTerms.filter(b => b !== t); }
  function onTermKey(e) { if (e.key === 'Enter') addTerm(); }

  let confirmReset  = false;
  let confirmPause  = false;
  let confirmDelete = false;

  let lastSaved = null;
  let saving    = false;

  function save() {
    saving = true;
    setTimeout(() => { saving = false; lastSaved = new Date(); }, 700);
  }
  function fmtSaved(d) {
    return d?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  $: flag = $pipelineStatus?.flag ?? 'ON';
</script>

<div class="settings-page">
  <h1 class="page-title">Settings</h1>
  <div class="page-divider"></div>

  <!-- Pipeline Control -->
  <div class="section">
    <div class="section-head">
      <div class="section-title">Pipeline Control</div>
      <div class="section-desc">Scheduling, timezone, and processing options</div>
    </div>
    <div class="fields">
      <div class="field-row">
        <label class="field-label" for="run-time">Run Time</label>
        <input id="run-time" type="time" bind:value={runTime} class="field-narrow" />
      </div>
      <div class="field-row">
        <label class="field-label" for="run-tz">Timezone</label>
        <select id="run-tz" bind:value={tz} class="field-narrow">
          <option value="Asia/Kolkata">IST — Asia/Kolkata</option>
          <option value="Europe/Paris">CET — Europe/Paris</option>
          <option value="America/New_York">EST — America/New_York</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
      <div class="field-row">
        <div>
          <div class="field-label">Parallel Processing</div>
          <div class="field-hint">Run scoring and generation concurrently</div>
        </div>
        <button class="toggle" class:on={parallel} aria-label="Toggle parallel processing" on:click={() => parallel = !parallel}></button>
      </div>
      <div class="field-row">
        <div>
          <div class="field-label">Bilingual Mode</div>
          <div class="field-hint">Generate articles in French &amp; English</div>
        </div>
        <button class="toggle" class:on={bilingual} aria-label="Toggle bilingual mode" on:click={() => bilingual = !bilingual}></button>
      </div>
    </div>
  </div>

  <!-- CMS Connection -->
  <div class="section">
    <div class="section-head">
      <div class="section-title">CMS Connection</div>
      <div class="section-desc">Endpoint, credentials, and connection health</div>
    </div>
    <div class="fields">
      <div class="field-row">
        <label class="field-label" for="cms-endpoint">Endpoint URL</label>
        <div class="inline-row">
          <input id="cms-endpoint" bind:value={cmsEndpoint} placeholder="https://cms.example.com/api/v1" style="flex:1" />
          <button class="btn btn-secondary btn-sm" on:click={testCms} disabled={cmsStatus === 'testing'}>
            {cmsStatus === 'testing' ? 'Testing…' : 'Test'}
          </button>
        </div>
      </div>
      <div class="field-row">
        <label class="field-label" for="cms-status">Connection Status</label>
        <span id="cms-status" class="cms-pill {cmsStatus}">
          {#if cmsStatus === 'connected'}✓ Connected
          {:else if cmsStatus === 'testing'}⟳ Testing…
          {:else}✗ Error{/if}
        </span>
      </div>
      <div class="field-row">
        <label class="field-label" for="cms-key">API Key</label>
        <div class="inline-row">
          {#if showKey}
            <input id="cms-key" type="text" bind:value={cmsApiKey} style="flex:1;font-family:monospace;font-size:13px" />
          {:else}
            <input id="cms-key" type="password" bind:value={cmsApiKey} style="flex:1;font-family:monospace;font-size:13px" />
          {/if}
          <button class="btn btn-secondary btn-sm" on:click={() => showKey = !showKey}>{showKey ? 'Hide' : 'Show'}</button>
          <button class="btn btn-secondary btn-sm" on:click={rotateKey}>Rotate</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Quality Thresholds -->
  <div class="section">
    <div class="section-head">
      <div class="section-title">Quality Thresholds</div>
      <div class="section-desc">Minimum scores required to pass the pipeline</div>
    </div>
    <div class="fields">
      <div class="slider-row">
        <div class="slider-top">
          <span class="field-label">Relevance Minimum</span>
          <span class="slider-val">{minRelevance.toFixed(1)}</span>
        </div>
        <input type="range" min="1" max="10" step="0.1" bind:value={minRelevance} class="slider" />
        <div class="slider-ends"><span>1.0</span><span>10.0</span></div>
      </div>
      <div class="slider-row">
        <div class="slider-top">
          <span class="field-label">Innovation Minimum</span>
          <span class="slider-val">{minInnovation.toFixed(1)}</span>
        </div>
        <input type="range" min="1" max="10" step="0.1" bind:value={minInnovation} class="slider" />
        <div class="slider-ends"><span>1.0</span><span>10.0</span></div>
      </div>
    </div>
  </div>

  <!-- Notifications -->
  <div class="section">
    <div class="section-head">
      <div class="section-title">Notifications</div>
      <div class="section-desc">Choose which events trigger an alert</div>
    </div>
    <div class="fields">
      {#each notifs as n}
        <div class="field-row">
          <div>
            <div class="field-label">{n.label}</div>
            <div class="field-hint">{n.hint}</div>
          </div>
          <button class="toggle" class:on={n.on} aria-label="Toggle {n.label}" on:click={() => n.on = !n.on}></button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Content Filters -->
  <div class="section">
    <div class="section-head">
      <div class="section-title">Content Filters</div>
      <div class="section-desc">Deduplication, banned terms, and word count limits</div>
    </div>
    <div class="fields">
      <div class="field-row">
        <div>
          <div class="field-label">Deduplication Window</div>
          <div class="field-hint">Days to look back when checking for duplicate content</div>
        </div>
        <div class="inline-row" style="width:auto;gap:8px">
          <input type="number" bind:value={dedupWindow} min="1" max="365" style="width:80px;text-align:right" />
          <span class="field-hint">days</span>
        </div>
      </div>
      <div class="field-row">
        <div>
          <div class="field-label">Word Count Limits</div>
          <div class="field-hint">Articles outside this range are rejected</div>
        </div>
        <div class="inline-row" style="width:auto;gap:8px">
          <span class="field-hint">Min</span>
          <input type="number" bind:value={minWords} min="100" max="5000" style="width:80px;text-align:right" />
          <span class="field-hint">–</span>
          <span class="field-hint">Max</span>
          <input type="number" bind:value={maxWords} min="100" max="20000" style="width:90px;text-align:right" />
        </div>
      </div>
      <div class="banned-section">
        <div class="field-label" style="margin-bottom:12px">Banned Terms</div>
        <div class="terms-row">
          {#each bannedTerms as t}
            <span class="term-pill">
              {t}
              <button on:click={() => removeTerm(t)}>×</button>
            </span>
          {/each}
          <div class="term-add">
            <input bind:value={newTerm} on:keydown={onTermKey} placeholder="Add term…" style="width:140px" />
            <button class="btn btn-secondary btn-sm" on:click={addTerm}>Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Danger Zone -->
  <div class="section danger-section">
    <div class="section-head">
      <div class="section-title" style="color:var(--red)">Danger Zone</div>
      <div class="section-desc">Irreversible and disruptive actions — proceed with care</div>
    </div>
    <div class="fields">
      <div class="field-row">
        <div>
          <div class="field-label" style="color:var(--red)">Reset Deduplication Database</div>
          <div class="field-hint">Clears all stored content hashes. Next run will re-process all articles.</div>
        </div>
        {#if confirmReset}
          <div class="inline-row" style="width:auto;gap:8px">
            <button class="btn btn-danger btn-sm" on:click={() => confirmReset = false}>Confirm Reset</button>
            <button class="btn btn-secondary btn-sm" on:click={() => confirmReset = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn btn-danger btn-sm" on:click={() => confirmReset = true}>Reset DB</button>
        {/if}
      </div>
      <div class="field-row">
        <div>
          <div class="field-label" style="color:var(--amber)">Pause Pipeline for 7 Days</div>
          <div class="field-hint">Sets flag to PAUSE and schedules auto-resume. No alert is sent.</div>
        </div>
        {#if confirmPause}
          <div class="inline-row" style="width:auto;gap:8px">
            <button class="btn btn-sm amber-btn" on:click={() => { setFlag('PAUSE'); confirmPause = false; }}>Confirm Pause</button>
            <button class="btn btn-secondary btn-sm" on:click={() => confirmPause = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn btn-sm amber-btn-outline" on:click={() => confirmPause = true}>Pause 7d</button>
        {/if}
      </div>
      <div class="field-row">
        <div>
          <div class="field-label" style="color:var(--red)">Delete All Theme Profiles</div>
          <div class="field-hint">Permanently removes all theme configurations. Cannot be undone.</div>
        </div>
        {#if confirmDelete}
          <div class="inline-row" style="width:auto;gap:8px">
            <button class="btn btn-danger btn-sm" on:click={() => confirmDelete = false}>Confirm Delete</button>
            <button class="btn btn-secondary btn-sm" on:click={() => confirmDelete = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn btn-danger btn-sm" on:click={() => confirmDelete = true}>Delete Themes</button>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Sticky save bar -->
<div class="save-bar">
  <span class="save-ts">{lastSaved ? `Last saved at ${fmtSaved(lastSaved)}` : 'Unsaved changes'}</span>
  <button class="btn btn-primary" on:click={save} disabled={saving}>
    {saving ? 'Saving…' : 'Save Settings'}
  </button>
</div>

<style>
  .settings-page { max-width: 760px; padding-bottom: 80px; }
  .page-title { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--text-black); margin-bottom: 24px; }
  .page-divider { border-top: 1px solid var(--divider); margin-bottom: 32px; }

  .section { margin-bottom: 0; border-bottom: 1px solid var(--divider); padding-bottom: 32px; margin-bottom: 32px; }
  .section:last-child { border-bottom: none; }
  .section-head { margin-bottom: 20px; }
  .section-title { font-size: 15px; font-weight: 500; color: var(--text-black); margin-bottom: 3px; }
  .section-desc  { font-size: 13px; color: var(--text-muted); }

  .fields { display: flex; flex-direction: column; }
  .field-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; padding: 14px 12px; border-bottom: 1px solid var(--divider);
    border-radius: 6px; margin: 0 -12px;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .field-row:hover {
    background: var(--off-white);
    box-shadow: inset 2px 0 0 var(--text-black);
  }
  .field-row:last-child { border-bottom: none; }
  .field-label { font-size: 14px; font-weight: 500; color: var(--text-black); }
  .field-hint  { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
  .field-narrow { width: 180px; }

  .inline-row { display: flex; align-items: center; gap: 8px; }

  .cms-pill { font-size: 13px; font-weight: 500; padding: 4px 12px; border-radius: 100px; }
  .cms-pill.connected { background: var(--green-light); color: var(--green); }
  .cms-pill.testing   { background: var(--amber-light); color: var(--amber); }
  .cms-pill.error     { background: var(--red-light);   color: var(--red); }

  /* Toggle */
  .toggle {
    width: 40px; height: 22px; border-radius: 99px;
    background: var(--divider); cursor: pointer;
    position: relative; transition: background 0.2s; flex-shrink: 0; border: none;
  }
  .toggle.on { background: var(--green); }
  .toggle::after {
    content: ''; position: absolute;
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; top: 3px; left: 3px; transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(18px); }

  /* Sliders */
  .slider-row { padding: 14px 0; border-bottom: 1px solid var(--divider); }
  .slider-row:last-child { border-bottom: none; }
  .slider-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .slider-val { font-size: 20px; font-weight: 700; color: var(--green); font-variant-numeric: tabular-nums; }
  .slider {
    width: 100%; height: 4px; border-radius: 2px;
    appearance: none; background: var(--divider); border: none; padding: 0; cursor: pointer;
    accent-color: var(--green);
  }
  .slider-ends { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-hint); margin-top: 6px; }

  /* Banned terms */
  .banned-section { padding: 14px 0 4px; }
  .terms-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .term-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; padding: 4px 12px; border-radius: 100px;
    background: #F2F2F2; color: var(--text-body);
  }
  .term-pill button {
    background: none; border: none; cursor: pointer;
    font-size: 15px; color: var(--text-muted); padding: 0; line-height: 1;
  }
  .term-pill button:hover { color: var(--red); }
  .term-add { display: flex; gap: 8px; align-items: center; }

  /* Danger */
  .danger-section .section-head { border-left: 3px solid var(--red); padding-left: 12px; }
  .amber-btn { background: var(--amber); color: #fff; border: none; }
  .amber-btn:hover { background: #B45309; }
  .amber-btn-outline { background: var(--white); color: var(--amber); border: 1px solid var(--amber); }
  .amber-btn-outline:hover { background: var(--amber-light); }

  /* Save bar */
  .save-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: flex-end; gap: 16px;
    padding: 14px 32px;
    background: var(--white); border-top: 1px solid var(--divider);
    z-index: 90;
  }
  .save-ts { font-size: 13px; color: var(--text-muted); }
</style>
