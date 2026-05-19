<script>
  import { pipelineStatus, setFlag } from '../../stores/store.js';

  // Pipeline Control
  let runTime   = '02:00';
  let tz        = 'Asia/Kolkata';
  let parallel  = true;
  let bilingual = false;

  // CMS Connection
  let cmsEndpoint   = 'https://cms.example.com/api/v1';
  let cmsApiKey     = 'sk-••••••••••••••••••••••••••••••••';
  let cmsStatus     = 'connected'; // 'connected' | 'error' | 'testing'
  let showKey       = false;

  function testCms() {
    cmsStatus = 'testing';
    setTimeout(() => { cmsStatus = 'connected'; }, 1200);
  }
  function rotateKey() {
    cmsApiKey = 'sk-' + Math.random().toString(36).slice(2, 34);
  }

  // Quality Thresholds
  let minRelevance  = 7.0;
  let minInnovation = 6.5;

  // Notifications
  let notifPipelineComplete = true;
  let notifPipelineFail     = true;
  let notifNewArticle       = false;
  let notifThemeCalibrated  = false;
  let notifDailyDigest      = true;

  // Content Filters
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

  // Danger Zone
  let confirmReset  = false;
  let confirmPause  = false;
  let confirmDelete = false;

  // Save bar
  let lastSaved = null;
  let saving    = false;

  function save() {
    saving = true;
    setTimeout(() => {
      saving    = false;
      lastSaved = new Date();
    }, 700);
  }

  function fmtSaved(d) {
    if (!d) return null;
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  $: flag = $pipelineStatus?.flag ?? 'ON';
</script>

<div class="settings-page">

  <!-- Pipeline Control -->
  <div class="section-card">
    <div class="section-head">
      <span class="section-icon">⚙️</span>
      <div>
        <div class="section-title">Pipeline Control</div>
        <div class="section-desc">Scheduling, timezone, and processing options</div>
      </div>
    </div>
    <div class="fields">
      <div class="field-row">
        <label class="field-label">Run Time</label>
        <input type="time" bind:value={runTime} class="field-input narrow" />
      </div>
      <div class="field-row">
        <label class="field-label">Timezone</label>
        <select bind:value={tz} class="field-input narrow">
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
        <div class="toggle" class:on={parallel} on:click={() => parallel = !parallel}></div>
      </div>
      <div class="field-row">
        <div>
          <div class="field-label">Bilingual Mode</div>
          <div class="field-hint">Generate articles in French &amp; English</div>
        </div>
        <div class="toggle" class:on={bilingual} on:click={() => bilingual = !bilingual}></div>
      </div>
    </div>
  </div>

  <!-- CMS Connection -->
  <div class="section-card">
    <div class="section-head">
      <span class="section-icon">🔌</span>
      <div>
        <div class="section-title">CMS Connection</div>
        <div class="section-desc">Endpoint, credentials, and connection health</div>
      </div>
    </div>
    <div class="fields">
      <div class="field-row">
        <label class="field-label">Endpoint URL</label>
        <div class="inline-field">
          <input bind:value={cmsEndpoint} class="field-input" placeholder="https://cms.example.com/api/v1" />
          <button class="btn-inline" on:click={testCms} disabled={cmsStatus === 'testing'}>
            {cmsStatus === 'testing' ? 'Testing…' : 'Test'}
          </button>
        </div>
      </div>
      <div class="field-row">
        <label class="field-label">Connection Status</label>
        <span class="cms-pill {cmsStatus}">
          {#if cmsStatus === 'connected'}✓ Connected
          {:else if cmsStatus === 'testing'}⟳ Testing…
          {:else}✗ Error{/if}
        </span>
      </div>
      <div class="field-row">
        <label class="field-label">API Key</label>
        <div class="inline-field">
          {#if showKey}
            <input type="text" bind:value={cmsApiKey} class="field-input mono" />
          {:else}
            <input type="password" bind:value={cmsApiKey} class="field-input mono" />
          {/if}
          <button class="btn-inline" on:click={() => showKey = !showKey}>{showKey ? 'Hide' : 'Show'}</button>
          <button class="btn-inline" on:click={rotateKey}>Rotate</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Quality Thresholds -->
  <div class="section-card">
    <div class="section-head">
      <span class="section-icon">🎯</span>
      <div>
        <div class="section-title">Quality Thresholds</div>
        <div class="section-desc">Minimum scores required to pass the pipeline</div>
      </div>
    </div>
    <div class="fields">
      <div class="slider-row">
        <div class="slider-labels">
          <span class="field-label">Relevance Minimum</span>
          <span class="slider-val">{minRelevance.toFixed(1)}</span>
        </div>
        <input type="range" min="1" max="10" step="0.1" bind:value={minRelevance} class="slider" />
        <div class="slider-ends"><span>1.0</span><span>10.0</span></div>
      </div>
      <div class="slider-row">
        <div class="slider-labels">
          <span class="field-label">Innovation Minimum</span>
          <span class="slider-val">{minInnovation.toFixed(1)}</span>
        </div>
        <input type="range" min="1" max="10" step="0.1" bind:value={minInnovation} class="slider" />
        <div class="slider-ends"><span>1.0</span><span>10.0</span></div>
      </div>
    </div>
  </div>

  <!-- Notifications -->
  <div class="section-card">
    <div class="section-head">
      <span class="section-icon">🔔</span>
      <div>
        <div class="section-title">Notifications</div>
        <div class="section-desc">Choose which events trigger an alert</div>
      </div>
    </div>
    <div class="fields">
      {#each [
        { label: 'Pipeline run completed',  hint: 'Alert when a run finishes successfully', bind: 'notifPipelineComplete' },
        { label: 'Pipeline failure',        hint: 'Immediate alert on any run error',       bind: 'notifPipelineFail'     },
        { label: 'New article published',   hint: 'Alert when an article goes live',        bind: 'notifNewArticle'       },
        { label: 'Theme calibrated',        hint: 'Alert after a theme recalibration',      bind: 'notifThemeCalibrated'  },
        { label: 'Daily digest',            hint: 'Summary email every morning at 08:00',   bind: 'notifDailyDigest'      },
      ] as row, i}
        <div class="field-row">
          <div>
            <div class="field-label">{row.label}</div>
            <div class="field-hint">{row.hint}</div>
          </div>
          <div class="toggle" class:on={
            i === 0 ? notifPipelineComplete :
            i === 1 ? notifPipelineFail :
            i === 2 ? notifNewArticle :
            i === 3 ? notifThemeCalibrated :
                      notifDailyDigest
          } on:click={() => {
            if (i === 0) notifPipelineComplete = !notifPipelineComplete;
            else if (i === 1) notifPipelineFail = !notifPipelineFail;
            else if (i === 2) notifNewArticle = !notifNewArticle;
            else if (i === 3) notifThemeCalibrated = !notifThemeCalibrated;
            else notifDailyDigest = !notifDailyDigest;
          }}></div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Content Filters -->
  <div class="section-card">
    <div class="section-head">
      <span class="section-icon">🔍</span>
      <div>
        <div class="section-title">Content Filters</div>
        <div class="section-desc">Deduplication, banned terms, and word count limits</div>
      </div>
    </div>
    <div class="fields">
      <div class="field-row">
        <div>
          <div class="field-label">Deduplication Window</div>
          <div class="field-hint">Days to look back when checking for duplicate content</div>
        </div>
        <div class="num-input-wrap">
          <input type="number" bind:value={dedupWindow} min="1" max="365" class="field-input narrow num" />
          <span class="num-unit">days</span>
        </div>
      </div>
      <div class="field-row word-count-row">
        <div>
          <div class="field-label">Word Count Limits</div>
          <div class="field-hint">Articles outside this range are rejected</div>
        </div>
        <div class="wc-pair">
          <div class="wc-field">
            <span class="wc-lbl">Min</span>
            <input type="number" bind:value={minWords} min="100" max="5000" class="field-input narrow num" />
          </div>
          <span class="wc-sep">–</span>
          <div class="wc-field">
            <span class="wc-lbl">Max</span>
            <input type="number" bind:value={maxWords} min="100" max="20000" class="field-input narrow num" />
          </div>
        </div>
      </div>
      <div class="banned-section">
        <div class="field-label" style="margin-bottom:10px">Banned Terms</div>
        <div class="terms-pills">
          {#each bannedTerms as t}
            <span class="term-pill">
              {t}
              <button class="term-remove" on:click={() => removeTerm(t)}>×</button>
            </span>
          {/each}
          <div class="term-add-wrap">
            <input
              bind:value={newTerm}
              on:keydown={onTermKey}
              placeholder="Add term…"
              class="term-add-input"
            />
            <button class="btn-add-term" on:click={addTerm}>+</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Danger Zone -->
  <div class="section-card danger-card">
    <div class="section-head">
      <span class="section-icon">⚠️</span>
      <div>
        <div class="section-title danger-title">Danger Zone</div>
        <div class="section-desc">Irreversible and disruptive actions — proceed with care</div>
      </div>
    </div>
    <div class="danger-actions">
      <div class="danger-row">
        <div>
          <div class="danger-label">Reset Deduplication Database</div>
          <div class="danger-hint">Clears all stored content hashes. Next run will re-process all articles.</div>
        </div>
        {#if confirmReset}
          <div class="confirm-pair">
            <button class="btn-danger" on:click={() => { confirmReset = false; }}>Confirm Reset</button>
            <button class="btn-cancel" on:click={() => confirmReset = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn-danger-outline" on:click={() => confirmReset = true}>Reset DB</button>
        {/if}
      </div>
      <div class="danger-row">
        <div>
          <div class="danger-label amber">Pause Pipeline for 7 Days</div>
          <div class="danger-hint">Sets flag to PAUSE and schedules auto-resume. No alert is sent.</div>
        </div>
        {#if confirmPause}
          <div class="confirm-pair">
            <button class="btn-amber" on:click={() => { setFlag('PAUSE'); confirmPause = false; }}>Confirm Pause</button>
            <button class="btn-cancel" on:click={() => confirmPause = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn-amber-outline" on:click={() => confirmPause = true}>Pause 7d</button>
        {/if}
      </div>
      <div class="danger-row">
        <div>
          <div class="danger-label">Delete All Theme Profiles</div>
          <div class="danger-hint">Permanently removes all theme configurations. Cannot be undone.</div>
        </div>
        {#if confirmDelete}
          <div class="confirm-pair">
            <button class="btn-danger" on:click={() => { confirmDelete = false; }}>Confirm Delete</button>
            <button class="btn-cancel" on:click={() => confirmDelete = false}>Cancel</button>
          </div>
        {:else}
          <button class="btn-danger-outline" on:click={() => confirmDelete = true}>Delete Themes</button>
        {/if}
      </div>
    </div>
  </div>

</div>

<!-- Sticky Save Bar -->
<div class="save-bar">
  <span class="save-ts">
    {#if lastSaved}Last saved at {fmtSaved(lastSaved)}{:else}Unsaved changes{/if}
  </span>
  <button class="btn-save" on:click={save} disabled={saving}>
    {saving ? 'Saving…' : 'Save Settings'}
  </button>
</div>

<style>
  .settings-page {
    max-width: 760px;
    padding-bottom: 80px;
  }

  /* Section Cards */
  .section-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .section-head {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 18px 22px 14px;
    border-bottom: 1px solid var(--border);
  }
  .section-icon { font-size: 18px; margin-top: 1px; flex-shrink: 0; }
  .section-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .section-desc  { font-size: 12px; color: var(--text3); margin-top: 2px; }

  .fields { padding: 6px 22px 14px; }

  /* Field rows */
  .field-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .field-row:last-child { border-bottom: none; }
  .field-label { font-size: 13px; font-weight: 500; color: var(--text); }
  .field-hint  { font-size: 11px; color: var(--text3); margin-top: 2px; }

  .field-input {
    background: var(--bg3); border: 1.5px solid var(--border);
    color: var(--text); border-radius: 8px;
    padding: 8px 12px; font-size: 13px;
    outline: none; transition: border-color 0.15s;
    font-family: inherit; width: 100%;
  }
  .field-input:focus { border-color: #1DB37E; }
  .field-input.narrow { width: 160px; }
  .field-input.num    { width: 80px; text-align: right; }
  .field-input.mono   { font-family: monospace; font-size: 12px; }

  /* Inline field (input + button) */
  .inline-field { display: flex; gap: 6px; align-items: center; flex: 1; max-width: 420px; }
  .inline-field .field-input { flex: 1; width: auto; }
  .btn-inline {
    padding: 7px 13px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: var(--bg3); border: 1px solid var(--border); color: var(--text2);
    cursor: pointer; white-space: nowrap; transition: all 0.12s; flex-shrink: 0;
  }
  .btn-inline:hover:not(:disabled) { color: var(--text); border-color: var(--text2); }
  .btn-inline:disabled { opacity: 0.5; cursor: not-allowed; }

  /* CMS status pill */
  .cms-pill {
    font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 99px;
  }
  .cms-pill.connected { background: rgba(29,179,126,0.12); color: #1DB37E; }
  .cms-pill.testing   { background: rgba(251,191,36,0.12);  color: var(--yellow); }
  .cms-pill.error     { background: rgba(248,113,113,0.12); color: var(--red); }

  /* Toggle */
  .toggle {
    width: 38px; height: 21px; border-radius: 99px;
    background: var(--bg3); border: 1.5px solid var(--border);
    cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .toggle.on { background: #1DB37E; border-color: #1DB37E; }
  .toggle::after {
    content: ''; position: absolute;
    width: 15px; height: 15px; border-radius: 50%;
    background: #fff; top: 1px; left: 1px; transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(17px); }

  /* Sliders */
  .slider-row { padding: 14px 0; border-bottom: 1px solid var(--border); }
  .slider-row:last-child { border-bottom: none; }
  .slider-labels { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .slider-val { font-size: 18px; font-weight: 700; color: #1DB37E; font-variant-numeric: tabular-nums; }
  .slider {
    width: 100%; height: 4px; border-radius: 99px;
    appearance: none; background: var(--bg3); border: none; padding: 0; cursor: pointer;
    accent-color: #1DB37E;
  }
  .slider-ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--text3); margin-top: 5px; }

  /* Num input */
  .num-input-wrap { display: flex; align-items: center; gap: 6px; }
  .num-unit { font-size: 12px; color: var(--text3); }

  /* Word count pair */
  .word-count-row { align-items: flex-start; padding-top: 14px; }
  .wc-pair { display: flex; align-items: center; gap: 8px; }
  .wc-field { display: flex; align-items: center; gap: 5px; }
  .wc-lbl  { font-size: 11px; color: var(--text3); }
  .wc-sep  { font-size: 14px; color: var(--text3); }

  /* Banned terms */
  .banned-section { padding: 14px 0 4px; }
  .terms-pills { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
  .term-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; padding: 4px 10px; border-radius: 99px;
    background: var(--bg3); color: var(--text2);
    border: 1px solid var(--border);
  }
  .term-remove {
    background: none; border: none; color: var(--text3);
    cursor: pointer; font-size: 14px; line-height: 1; padding: 0;
    display: flex; align-items: center;
  }
  .term-remove:hover { color: var(--red); }
  .term-add-wrap { display: flex; gap: 4px; align-items: center; }
  .term-add-input {
    background: var(--bg3); border: 1.5px solid var(--border);
    color: var(--text); border-radius: 99px;
    padding: 4px 12px; font-size: 12px; width: 120px;
    outline: none; font-family: inherit;
  }
  .term-add-input:focus { border-color: #1DB37E; }
  .btn-add-term {
    width: 26px; height: 26px; border-radius: 50%;
    background: rgba(29,179,126,0.12); color: #1DB37E;
    border: 1px solid rgba(29,179,126,0.3);
    font-size: 18px; line-height: 1; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.12s;
  }
  .btn-add-term:hover { background: rgba(29,179,126,0.22); }

  /* Danger Zone */
  .danger-card { border-color: rgba(248,113,113,0.3); }
  .danger-title { color: var(--red); }
  .danger-actions { padding: 6px 22px 14px; }
  .danger-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }
  .danger-row:last-child { border-bottom: none; }
  .danger-label { font-size: 13px; font-weight: 500; color: var(--red); }
  .danger-label.amber { color: var(--yellow); }
  .danger-hint  { font-size: 11px; color: var(--text3); margin-top: 2px; }

  .btn-danger-outline {
    padding: 7px 16px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: transparent; border: 1.5px solid rgba(248,113,113,0.4); color: var(--red);
    cursor: pointer; white-space: nowrap; transition: all 0.12s; flex-shrink: 0;
  }
  .btn-danger-outline:hover { background: rgba(248,113,113,0.08); }
  .btn-danger {
    padding: 7px 16px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: var(--red); color: #fff; border: none;
    cursor: pointer; white-space: nowrap; transition: opacity 0.12s;
  }
  .btn-danger:hover { opacity: 0.85; }
  .btn-amber-outline {
    padding: 7px 16px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: transparent; border: 1.5px solid rgba(251,191,36,0.4); color: var(--yellow);
    cursor: pointer; white-space: nowrap; transition: all 0.12s; flex-shrink: 0;
  }
  .btn-amber-outline:hover { background: rgba(251,191,36,0.08); }
  .btn-amber {
    padding: 7px 16px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: var(--yellow); color: #000; border: none;
    cursor: pointer; white-space: nowrap; transition: opacity 0.12s;
  }
  .btn-amber:hover { opacity: 0.85; }
  .btn-cancel {
    padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 500;
    background: var(--bg3); border: 1px solid var(--border); color: var(--text2);
    cursor: pointer; transition: all 0.12s;
  }
  .btn-cancel:hover { color: var(--text); }
  .confirm-pair { display: flex; gap: 6px; flex-shrink: 0; }

  /* Sticky Save Bar */
  .save-bar {
    position: fixed; bottom: 0; left: 230px; right: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 28px;
    background: var(--bg2); border-top: 1px solid var(--border);
    z-index: 90;
  }
  .save-ts { font-size: 12px; color: var(--text3); }
  .btn-save {
    padding: 9px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;
    background: #1DB37E; color: #fff; border: none;
    cursor: pointer; transition: opacity 0.15s;
  }
  .btn-save:hover:not(:disabled) { opacity: 0.85; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
