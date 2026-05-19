<script>
  import { onMount, onDestroy } from 'svelte';
  import { currentPage, publishTime, timezone, schedulePost, searchQuery } from '../stores/store.js';
  import { mockGeneratedBlog } from '../data/mockData.js';

  let loading      = true;
  let regenerating = false;
  let editing      = false;
  let published    = false;
  let countdown    = { h: 0, m: 0, s: 0 };
  let interval;

  let relevanceScore  = 8.7;
  let innovationScore = 9.2;
  $: isFeatured = relevanceScore >= 9 && innovationScore >= 9;
  $: scorePillClass = (v) => v >= 9 ? 'high' : v >= 7 ? 'mid' : 'low';

  const BANNED = ['revolutionary','game-changing','groundbreaking','unprecedented','disruptive','amazing','incredible','world-class','best-in-class','cutting-edge'];
  $: bannedFound = BANNED.filter(w => blog.content.some(b => b.text?.toLowerCase().includes(w)));
  $: wordCount = blog.content.filter(b => b.type === 'p').map(b => b.text).join(' ').split(/\s+/).filter(Boolean).length;
  $: wcStatus = wordCount >= 90 && wordCount <= 110 ? 'ok' : wordCount < 90 ? 'low' : 'high';

  let blog = { ...mockGeneratedBlog, content: mockGeneratedBlog.content.map(b => ({ ...b })) };
  let editTitle   = blog.title;
  let editContent = blog.content.map(b => b.type === 'h2' ? `## ${b.text}` : b.text).join('\n\n');

  onMount(() => {
    setTimeout(() => loading = false, 1800);
    interval = setInterval(tick, 1000);
    tick();
  });
  onDestroy(() => clearInterval(interval));

  function tick() {
    const [hh, mm] = $publishTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hh, mm, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    const diff = Math.max(0, Math.floor((target - new Date()) / 1000));
    countdown = { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
  }
  $: tick(), $publishTime;
  function pad(n) { return String(n).padStart(2, '0'); }

  const regenerateVariants = [
    {
      title: `${$searchQuery}: Key Trends Shaping the Industry in 2025`,
      content: [
        { type: 'h2', text: 'Why This Topic Matters Now' },
        { type: 'p',  text: `The conversation around ${$searchQuery} has shifted dramatically over the past 12 months. What was once a niche concern for early adopters has become a mainstream priority for organisations of every size, driven by a convergence of technological maturity, regulatory pressure, and competitive necessity.` },
        { type: 'h2', text: 'The Three Forces Driving Change' },
        { type: 'p',  text: `First, the cost of inaction has risen sharply. Second, tooling has matured to the point where implementation no longer requires specialist expertise. Third, early movers are reporting measurable competitive advantages — creating urgency for those still on the sidelines.` },
        { type: 'h2', text: 'What Practitioners Are Doing Differently' },
        { type: 'p',  text: `The most effective teams are not treating ${$searchQuery} as a one-time project but as an ongoing capability. They invest in measurement frameworks, iterate rapidly on early results, and build internal knowledge rather than outsourcing understanding to vendors.` },
        { type: 'h2', text: 'The Implication for Innovation Leaders' },
        { type: 'p',  text: `Organisations that build genuine competency in this area now will find themselves with a durable advantage. The window for differentiation is open — but it will not stay open indefinitely as the field standardises.` },
      ],
    },
    {
      title: `A Practical Guide to Getting Started with ${$searchQuery}`,
      content: [
        { type: 'h2', text: 'Start with the Problem, Not the Technology' },
        { type: 'p',  text: `The most common mistake teams make when approaching ${$searchQuery} is beginning with the technology rather than the problem. The organisations seeing the strongest results start by identifying a specific, measurable pain point and work backwards to the solution.` },
        { type: 'h2', text: 'The Minimum Viable Approach' },
        { type: 'p',  text: `You do not need a large team or a large budget to get started. A focused pilot with clear success metrics, a four-to-six week timeline, and a single owner is consistently more effective than a broad initiative with diffuse accountability.` },
        { type: 'h2', text: 'Common Pitfalls to Avoid' },
        { type: 'p',  text: `Scope creep, lack of executive sponsorship, and failure to define success metrics upfront are the three most frequently cited reasons for stalled initiatives. Address all three before writing a single line of code or signing a vendor contract.` },
        { type: 'h2', text: 'Measuring What Matters' },
        { type: 'p',  text: `Define your north star metric before you begin. Everything else — velocity, quality, cost — should be secondary. Teams that optimise for a single clear outcome consistently outperform those chasing multiple metrics simultaneously.` },
      ],
    },
  ];
  let variantIndex = 0;

  async function regenerate() {
    regenerating = true; editing = false;
    await new Promise(r => setTimeout(r, 1600));
    const v = regenerateVariants[variantIndex % regenerateVariants.length];
    variantIndex++;
    blog = { ...blog, title: v.title, content: v.content, qualityScore: +(8 + Math.random()).toFixed(1), wordCount: 380 + Math.floor(Math.random() * 80) };
    editTitle   = blog.title;
    editContent = blog.content.map(b => b.type === 'h2' ? `## ${b.text}` : b.text).join('\n\n');
    regenerating = false;
  }

  function startEdit() {
    editTitle   = blog.title;
    editContent = blog.content.map(b => b.type === 'h2' ? `## ${b.text}` : b.text).join('\n\n');
    editing = true;
  }
  function saveEdit() {
    blog = {
      ...blog,
      title: editTitle.trim() || blog.title,
      content: editContent.split('\n\n').filter(Boolean).map(line =>
        line.startsWith('## ') ? { type: 'h2', text: line.slice(3).trim() } : { type: 'p', text: line.trim() }
      ),
      wordCount: editContent.split(/\s+/).length,
    };
    editing = false;
  }
  function cancelEdit() { editing = false; }

  function handleSchedule() {
    const [hh, mm] = $publishTime.split(':').map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    if (d <= new Date()) d.setDate(d.getDate() + 1);
    schedulePost({ id: Date.now(), title: blog.title, scheduledAt: d.toISOString(), status: 'scheduled', category: blog.category, cmsStatus: 'pending' });
    published = true;
  }
</script>

<div class="preview-wrap">

  {#if loading || regenerating}
    <div class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">{regenerating ? 'Regenerating with Mistral AI…' : 'Mistral AI is generating your blog…'}</p>
    </div>

  {:else if published}
    <div class="success-wrap">
      <div class="success-card">
        <div class="success-check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 class="success-title">Blog Scheduled</h1>
        <p class="success-sub">Your blog will be published at <strong>{$publishTime}</strong> ({$timezone})</p>
        <div class="success-actions">
          <button class="outline-btn" on:click={() => currentPage.set('dashboard')}>View Queue</button>
          <button class="primary-btn" on:click={() => currentPage.set('home')}>Curate Another</button>
        </div>
      </div>
    </div>

  {:else}
    <!-- Page header -->
    <div class="page-head">
      <button class="back-btn" on:click={() => currentPage.set('discover')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Discover
      </button>
      <div class="page-head-row">
        <div>
          <h1 class="page-title">Blog Preview</h1>
          <p class="page-sub">Generated by Mistral AI · Review before scheduling</p>
        </div>
        {#if !editing}
          <button class="primary-btn" on:click={handleSchedule}>
            Schedule Blog
          </button>
        {/if}
      </div>
    </div>

    <div class="layout">

      <!-- ── Left: Blog content ── -->
      <div class="content-col">

        {#if editing}
          <!-- Edit mode -->
          <div class="edit-card">
            <div class="edit-head">
              <span class="section-label">Editing</span>
              <div class="edit-head-actions">
                <button class="ghost-btn" on:click={cancelEdit}>Cancel</button>
                <button class="primary-btn" on:click={saveEdit}>Save Changes</button>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Title</label>
              <input bind:value={editTitle} placeholder="Blog title…" class="edit-title-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Content — use ## for section headings, blank line between paragraphs</label>
              <textarea bind:value={editContent} rows="20" class="edit-textarea"
                placeholder="## Section Heading&#10;&#10;Paragraph text here…"></textarea>
            </div>
          </div>

        {:else}
          <!-- Blog article -->
          <article class="blog-article">
            <img src={blog.coverImage} alt="" class="blog-cover" />

            <div class="blog-inner">
              <!-- Category + tags -->
              <div class="blog-tags">
                <span class="cat-pill">{blog.category}</span>
                {#each blog.tags as t}<span class="tag-pill">{t}</span>{/each}
                {#if isFeatured}<span class="featured-pill">Featured</span>{/if}
              </div>

              <!-- Title -->
              <h1 class="blog-title">{blog.title}</h1>

              <!-- Byline -->
              <div class="blog-byline">
                <span class="byline-item">Mistral AI</span>
                <span class="byline-dot">·</span>
                <span class="byline-item">{blog.readTime} read</span>
                <span class="byline-dot">·</span>
                <span class="byline-item">{new Date().toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
              </div>

              <!-- Quality signals -->
              <div class="signals-row">
                <span class="signal-pill {scorePillClass(relevanceScore)}">Relevance {relevanceScore}/10</span>
                <span class="signal-pill {scorePillClass(innovationScore)}">Innovation {innovationScore}/10</span>
                <span class="signal-pill {wcStatus === 'ok' ? 'ok' : 'warn'}">{wordCount} words</span>
                {#if bannedFound.length > 0}
                  <span class="signal-pill warn">⚠ {bannedFound.length} flagged term{bannedFound.length > 1 ? 's' : ''}</span>
                {/if}
              </div>

              <!-- Body -->
              <div class="blog-body">
                {#each blog.content as block}
                  {#if block.type === 'h2'}
                    <h2 class="body-h2">{block.text}</h2>
                  {:else}
                    <p class="body-p">{block.text}</p>
                  {/if}
                {/each}
              </div>
            </div>
          </article>
        {/if}
      </div>

      <!-- ── Right: Sidebar ── -->
      <aside class="sidebar">

        <!-- Schedule -->
        <div class="side-card">
          <div class="side-heading">Schedule</div>
          <div class="time-display">
            <span class="time-big">{$publishTime}</span>
            <span class="time-tz">{$timezone}</span>
          </div>
          <div class="countdown">
            Publishes in
            <span class="cd-seg">{pad(countdown.h)}<span class="cd-unit">h</span></span>
            <span class="cd-seg">{pad(countdown.m)}<span class="cd-unit">m</span></span>
            <span class="cd-seg">{pad(countdown.s)}<span class="cd-unit">s</span></span>
          </div>
          <div class="field-group">
            <label class="field-label">Publish time</label>
            <input type="time" bind:value={$publishTime} />
          </div>
          <div class="field-group">
            <label class="field-label">Timezone</label>
            <select bind:value={$timezone}>
              <option value="Asia/Kolkata">IST — Asia/Kolkata</option>
              <option value="Europe/Paris">CET — Europe/Paris</option>
              <option value="America/New_York">EST — America/New_York</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <button class="primary-btn full" on:click={handleSchedule} disabled={editing}>
            Schedule Blog
          </button>
        </div>

        <!-- AI info -->
        <div class="side-card">
          <div class="side-heading">AI Details</div>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Model</span>
              <span class="info-val">Mistral 7B · Ollama</span>
            </div>
            <div class="info-row">
              <span class="info-label">Words</span>
              <span class="info-val">~{blog.wordCount}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Quality</span>
              <span class="info-val">{blog.qualityScore} / 10</span>
            </div>
            <div class="info-row">
              <span class="info-label">Language</span>
              <span class="info-val">English</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="side-card">
          <div class="side-heading">Actions</div>
          <div class="action-list">
            {#if editing}
              <button class="action-btn primary" on:click={saveEdit}>Save Changes</button>
              <button class="action-btn" on:click={cancelEdit}>Cancel Edit</button>
            {:else}
              <button class="action-btn" on:click={startEdit}>Edit Blog</button>
              <button class="action-btn" on:click={regenerate}>Regenerate</button>
            {/if}
            <button class="action-btn danger" on:click={() => currentPage.set('discover')}>Discard</button>
          </div>
        </div>

      </aside>
    </div>
  {/if}
</div>

<style>
  .preview-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }

  /* Loading */
  .loading-state {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 120px 0;
  }
  .loading-text { font-size: 15px; color: var(--text-muted); font-family: var(--sans); }

  /* Success */
  .success-wrap {
    display: flex; align-items: center; justify-content: center;
    padding: 100px 24px;
  }
  .success-card {
    text-align: center; max-width: 400px;
  }
  .success-check {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--green-light); color: var(--green);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .success-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); margin-bottom: 8px;
  }
  .success-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 28px; line-height: 1.6; }
  .success-actions { display: flex; gap: 10px; justify-content: center; }

  /* Page header */
  .page-head {
    padding: 32px 0 28px;
    border-bottom: 1px solid var(--divider);
    margin-bottom: 32px;
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; margin-bottom: 12px; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-black); }
  .page-head-row {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  }
  .page-title {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .page-sub { font-size: 14px; color: var(--text-muted); }

  /* Layout */
  .layout { display: grid; grid-template-columns: 1fr 300px; gap: 32px; align-items: start; }

  /* Blog article */
  .blog-article {
    border: 1px solid var(--divider); border-radius: 8px; overflow: hidden;
    background: var(--white);
  }
  .blog-cover { width: 100%; height: 260px; object-fit: cover; display: block; }
  .blog-inner { padding: 36px 40px 40px; }

  .blog-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .cat-pill {
    font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px;
    background: var(--text-black); color: #fff; letter-spacing: 0.03em;
  }
  .tag-pill {
    font-size: 11px; color: var(--text-muted); background: var(--off-white);
    border: 1px solid var(--divider); padding: 3px 10px; border-radius: 100px;
  }
  .featured-pill {
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
    background: var(--amber-light); color: var(--amber);
  }

  .blog-title {
    font-family: var(--serif); font-size: 30px; font-weight: 700;
    color: var(--text-black); line-height: 1.25; letter-spacing: -0.4px;
    margin-bottom: 14px;
  }

  .blog-byline {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: var(--text-muted);
    padding-bottom: 16px; margin-bottom: 16px;
    border-bottom: 1px solid var(--divider);
  }
  .byline-dot { color: var(--text-hint); }

  /* Quality signals */
  .signals-row {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding-bottom: 20px; margin-bottom: 24px;
    border-bottom: 1px solid var(--divider);
  }
  .signal-pill {
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
    letter-spacing: 0.02em;
  }
  .signal-pill.high { background: var(--green-light); color: var(--green-dark); }
  .signal-pill.mid  { background: var(--amber-light); color: var(--amber); }
  .signal-pill.low  { background: var(--off-white);   color: var(--text-muted); }
  .signal-pill.ok   { background: var(--green-light); color: var(--green-dark); }
  .signal-pill.warn { background: var(--amber-light); color: var(--amber); }

  /* Blog body — Medium-style reading typography */
  .blog-body { }
  .body-h2 {
    font-family: var(--serif); font-size: 20px; font-weight: 700;
    color: var(--text-black); line-height: 1.3; letter-spacing: -0.2px;
    margin: 32px 0 12px;
  }
  .body-p {
    font-family: var(--serif); font-size: 18px; color: var(--text-body);
    line-height: 1.8; margin-bottom: 20px; letter-spacing: 0.01em;
  }

  /* Edit card */
  .edit-card {
    border: 1px solid var(--divider); border-radius: 8px;
    background: var(--white); padding: 28px;
  }
  .edit-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .edit-head-actions { display: flex; gap: 8px; }
  .edit-title-input {
    font-size: 16px; font-weight: 600; font-family: var(--sans);
  }
  .edit-textarea {
    font-family: var(--sans); font-size: 14px; line-height: 1.7;
    resize: vertical;
  }

  /* Sidebar */
  .sidebar { display: flex; flex-direction: column; gap: 16px; }
  .side-card {
    border: 1px solid var(--divider); border-radius: 8px;
    background: var(--white); padding: 20px;
  }
  .side-heading {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }

  /* Time display */
  .time-display {
    display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;
  }
  .time-big {
    font-family: var(--serif); font-size: 32px; font-weight: 700;
    color: var(--text-black); line-height: 1;
  }
  .time-tz { font-size: 12px; color: var(--text-muted); }
  .countdown {
    font-size: 12px; color: var(--text-muted); margin-bottom: 16px;
    display: flex; align-items: center; gap: 4px;
  }
  .cd-seg { font-weight: 600; color: var(--text-black); }
  .cd-unit { font-weight: 400; color: var(--text-muted); font-size: 11px; }

  /* Info list */
  .info-list { display: flex; flex-direction: column; gap: 0; }
  .info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 0; border-bottom: 1px solid var(--divider);
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { font-size: 13px; color: var(--text-muted); }
  .info-val   { font-size: 13px; font-weight: 500; color: var(--text-black); }

  /* Action list */
  .action-list { display: flex; flex-direction: column; gap: 8px; }
  .action-btn {
    display: flex; align-items: center; justify-content: center;
    width: 100%; padding: 10px 16px; border-radius: 8px;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    cursor: pointer; border: 1px solid var(--divider);
    background: var(--white); color: var(--text-body);
    transition: all 0.15s;
  }
  .action-btn:hover { background: var(--off-white); border-color: var(--divider-strong); }
  .action-btn.primary { background: var(--text-black); color: #fff; border-color: var(--text-black); }
  .action-btn.primary:hover { background: #333; }
  .action-btn.danger { color: var(--red); }
  .action-btn.danger:hover { background: var(--red-light); border-color: var(--red); }

  /* Shared buttons */
  .primary-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: var(--text-black); color: #fff; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 10px 20px; border-radius: 100px; white-space: nowrap;
    transition: background 0.15s; flex-shrink: 0;
  }
  .primary-btn:hover:not(:disabled) { background: #333; }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .primary-btn.full { width: 100%; border-radius: 8px; }

  .outline-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--white); color: var(--text-black);
    border: 1px solid var(--divider-strong); cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: var(--sans);
    padding: 10px 20px; border-radius: 100px; transition: background 0.15s;
  }
  .outline-btn:hover { background: var(--off-white); }

  .ghost-btn {
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; transition: color 0.15s;
  }
  .ghost-btn:hover { color: var(--text-black); }

  /* Form fields */
  .field-group { margin-bottom: 14px; }
  .field-group:last-child { margin-bottom: 0; }
  .field-label {
    display: block; font-size: 12px; font-weight: 500;
    color: var(--text-muted); margin-bottom: 6px;
  }
  .section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
  }

  @media (max-width: 860px) {
    .preview-wrap { padding: 0 16px 60px; }
    .layout { grid-template-columns: 1fr; }
    .sidebar { order: -1; }
    .blog-inner { padding: 24px 20px; }
    .blog-title { font-size: 24px; }
    .body-p { font-size: 16px; }
    .page-head-row { flex-direction: column; }
  }
</style>
