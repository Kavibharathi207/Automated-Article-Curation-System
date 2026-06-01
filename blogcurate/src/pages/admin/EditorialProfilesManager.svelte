<script>
  import { onMount } from 'svelte';
  import EditorialProfileModal from '../../components/EditorialProfileModal.svelte';
  import { mockEditorialProfiles } from '../../data/editorialProfiles.js';
  import { adminThemes, currentAdminPage } from '../../stores/store.js';

  let profiles = [];
  let selectedProfile = null;
  let showProfileModal = false;
  let isRegenerating = new Set();

  onMount(() => {
    // Load mock profiles
    profiles = mockEditorialProfiles;
  });

  function openProfile(profile) {
    selectedProfile = profile;
    showProfileModal = true;
  }

  function closeModal() {
    showProfileModal = false;
    selectedProfile = null;
  }

  function regenerateProfile(profileId) {
    isRegenerating = new Set([...isRegenerating, profileId]);
    
    // Simulate regeneration (in production, this calls the backend)
    setTimeout(() => {
      const idx = profiles.findIndex(p => p.id === profileId);
      if (idx >= 0) {
        profiles[idx] = {
          ...profiles[idx],
          generatedAt: new Date().toISOString(),
          lastCalibrationQuality: Math.random() * 0.15 + 0.80, // 0.80-0.95
        };
      }
      isRegenerating.delete(profileId);
      isRegenerating = isRegenerating;
    }, 1500);
  }

  function getQualityColor(quality) {
    if (quality >= 0.85) return '#10b981';
    if (quality >= 0.75) return '#f59e0b';
    return '#ef4444';
  }

  function getQualityLabel(quality) {
    if (quality >= 0.85) return 'Excellent';
    if (quality >= 0.75) return 'Good';
    return 'Fair';
  }

  function getDaysAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }
</script>

<div class="page">
  <div class="header">
    <div>
      <h1 class="page-title">Editorial Profiles</h1>
      <p class="page-subtitle">AI-analyzed summaries of theme editorial characteristics, updated weekly</p>
    </div>
  </div>

  <div style="border-top:1px solid var(--divider);margin-bottom:32px"></div>

  {#if profiles.length === 0}
    <div class="empty-state">
      <h3>No editorial profiles yet</h3>
      <p>Profiles will be generated automatically when themes are calibrated.</p>
    </div>
  {:else}
    <div class="profiles-grid">
      {#each profiles as profile (profile.id)}
        {@const regenerating = isRegenerating.has(profile.id)}
        <div class="profile-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">{profile.themeName}</h3>
              <p class="card-date">Generated {getDaysAgo(profile.generatedAt)}</p>
            </div>
          </div>

          <div class="card-content">
            <!-- Quick Stats -->
            <div class="stats-row">
              <div class="stat">
                <span class="stat-label">Articles</span>
                <span class="stat-value">{profile.articlesAnalyzed}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Acceptance</span>
                <span class="stat-value">{(profile.acceptanceRate * 100).toFixed(0)}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Quality</span>
                <div class="quality-indicator" style="--color: {getQualityColor(profile.lastCalibrationQuality)}">
                  {getQualityLabel(profile.lastCalibrationQuality)}
                </div>
              </div>
            </div>

            <!-- Editorial Spirit Preview -->
            <div class="spirit-section">
              <p class="spirit-label">Editorial Spirit</p>
              <p class="spirit-text">{profile.editorialSpirit.substring(0, 120)}...</p>
            </div>

            <!-- Key Keywords -->
            <div class="keywords-section">
              <p class="keywords-label">Top Keywords</p>
              <div class="keywords-preview">
                {#each profile.dominantKeywords.slice(0, 3) as { keyword }}
                  <span class="keyword-badge">{keyword}</span>
                {/each}
                {#if profile.dominantKeywords.length > 3}
                  <span class="keyword-badge keyword-more">+{profile.dominantKeywords.length - 3} more</span>
                {/if}
              </div>
            </div>

            <!-- Sectors -->
            <div class="sectors-section">
              <p class="sectors-label">Sectors Covered</p>
              <div class="sectors-preview">
                {#each profile.coveredSectors.slice(0, 2) as { sector, articleCount }}
                  <div class="sector-mini">
                    <span class="sector-name">{sector}</span>
                    <span class="sector-count">{articleCount} articles</span>
                  </div>
                {/each}
                {#if profile.coveredSectors.length > 2}
                  <div class="sector-mini sector-more">
                    +{profile.coveredSectors.length - 2} sectors
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button
              class="btn btn-secondary btn-sm"
              on:click={() => regenerateProfile(profile.id)}
              disabled={regenerating}
            >
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              class="btn btn-primary btn-sm"
              on:click={() => openProfile(profile)}
            >
              View Profile
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Info Box -->
  <div class="info-box">
    <h4>How Editorial Profiles Work</h4>
    <ul>
      <li><strong>Weekly Analysis:</strong> Every Monday at 9 AM UTC, the AI analyzes the 50 most recent published articles for each theme</li>
      <li><strong>Keyword Extraction:</strong> Identifies dominant keywords and maps them to sectors</li>
      <li><strong>Editorial Spirit:</strong> Generates a 50-word statement defining what makes an article worth publishing vs generic</li>
      <li><strong>Downstream Impact:</strong> Profiles guide article scoring, recommendation algorithms, and editorial feedback</li>
      <li><strong>Metrics:</strong> Calibration quality reflects how well the profile matches actual editorial decisions</li>
    </ul>
  </div>

</div>

<EditorialProfileModal
  profile={selectedProfile}
  isOpen={showProfileModal}
  on:close={closeModal}
/>

<style>
  .page {
    padding: 0;
    color: var(--text-primary);
  }

  .header {
    padding: 32px;
    background: var(--bg-primary);
  }

  .page-title {
    margin: 0 0 8px 0;
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 700;
    color: var(--text-black);
    letter-spacing: -0.3px;
  }

  .page-subtitle {
    margin: 0;
    font-size: 14px;
    font-family: var(--sans);
    color: var(--text-muted);
  }

  .empty-state {
    padding: 60px 32px;
    text-align: center;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: var(--text-primary);
  }

  .empty-state p {
    margin: 0;
    color: var(--text-secondary);
  }

  .profiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    padding: 32px;
  }

  .profile-card {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border: 1px solid var(--divider);
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
    color: var(--text-primary);
  }
  .profile-card:hover {
    border-color: var(--text-black);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px;
    border-bottom: 1px solid var(--divider);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .card-title {
    margin: 0 0 4px 0;
    font-family: var(--sans);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-black);
  }

  .card-date {
    margin: 0;
    font-family: var(--sans);
    font-size: 12px;
    color: var(--text-muted);
  }

  .card-content {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: var(--text-primary);
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    color: var(--text-primary);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: var(--bg-secondary);
    border-radius: 6px;
    border: 1px solid var(--divider);
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
  }

  .stat-value {
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-black);
  }

  .quality-indicator {
    font-size: 12px;
    font-weight: 600;
    color: var(--color);
  }

  .spirit-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--text-primary);
  }

  .spirit-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
    margin: 0;
  }

  .spirit-text {
    margin: 0;
    font-family: var(--sans);
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-body);
    padding: 8px;
    background: var(--off-white);
    border-radius: 6px;
    border-left: 3px solid var(--text-black);
  }

  .keywords-section,
  .sectors-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--text-primary);
  }

  .keywords-label,
  .sectors-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
    margin: 0;
  }

  .keywords-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .keyword-badge {
    display: inline-block;
    padding: 4px 8px;
    background: var(--off-white);
    color: var(--text-body);
    border: 1px solid var(--divider);
    border-radius: 100px;
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
  }

  .keyword-more {
    background: var(--white);
    color: var(--text-muted);
  }

  .sectors-preview {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sector-mini {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: var(--bg-primary);
    border-radius: 4px;
    border: 1px solid var(--divider);
    font-size: 12px;
    color: var(--text-primary);
  }

  .sector-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .sector-count {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .sector-more {
    color: var(--text-secondary);
    font-size: 11px;
    justify-content: center;
  }

  .card-footer {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-primary);
    border-top: 1px solid var(--divider);
    color: var(--text-primary);
  }

  .btn-sm {
    font-family: var(--sans);
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 100px;
  }

  .info-box {
    margin: 32px;
    padding: 20px;
    background: var(--off-white);
    border-radius: 8px;
    border-left: 4px solid var(--text-black);
    color: var(--text-body);
  }

  .info-box h4 {
    margin: 0 0 12px 0;
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-black);
  }

  .info-box ul {
    margin: 0;
    padding: 0 0 0 20px;
    list-style: disc;
  }

  .info-box li {
    margin: 6px 0;
    font-family: var(--sans);
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .info-box strong {
    font-weight: 600;
    color: var(--text-body);
  }

  @media (max-width: 768px) {
    .profiles-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
