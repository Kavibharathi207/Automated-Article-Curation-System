<script>
  import { login, signup, appMode } from '../stores/store.js';

  let mode = 'login';
  let name = '', email = '', password = '';
  let error = '', loading = false;

  async function submit() {
    error = '';
    if (!email.trim() || !password.trim()) { error = 'All fields are required.'; return; }
    if (mode === 'signup' && !name.trim()) { error = 'Name is required.'; return; }
    loading = true;
    await new Promise(r => setTimeout(r, 600));
    const result = mode === 'login'
      ? login(email.trim(), password)
      : signup(name.trim(), email.trim(), password);
    if (!result.ok) error = result.error;
    loading = false;
  }
</script>

<div class="auth-page">
  <div class="auth-box">
    <button class="back-btn" on:click={() => appMode.set('landing')}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Back to Home
    </button>

    <div class="auth-logo">ACS</div>
    <div class="auth-sub">Automated Curation System</div>

    <div class="auth-divider"></div>

    <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
    <p>{mode === 'login' ? 'Welcome back to your workspace.' : 'Start curating smarter content.'}</p>

    <form on:submit|preventDefault={submit}>
      {#if mode === 'signup'}
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input bind:value={name} placeholder="Your full name" autocomplete="name" />
        </div>
      {/if}
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" bind:value={email} placeholder="you@example.com" autocomplete="email" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" bind:value={password} placeholder="••••••••" autocomplete="current-password" />
      </div>
      {#if error}
        <div class="form-error">{error}</div>
      {/if}
      <button class="btn btn-primary btn-full" style="margin-top:12px" disabled={loading}>
        {#if loading}<span class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>{/if}
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>

    <div class="auth-switch">
      {#if mode === 'login'}
        New here? <button on:click={() => { mode = 'signup'; error = ''; }}>Create account</button>
      {:else}
        Already have an account? <button on:click={() => { mode = 'login'; error = ''; }}>Sign in</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh; display: flex;
    align-items: center; justify-content: center;
    background: var(--off-white); padding: 24px;
  }
  .auth-box {
    background: var(--white); width: 100%; max-width: 400px;
    padding: 40px; border-radius: 8px; border: 1px solid var(--divider);
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: var(--text-muted); font-family: var(--sans);
    padding: 0; margin-bottom: 28px; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-black); }
  .auth-logo {
    font-family: var(--serif); font-size: 28px; font-weight: 700;
    color: var(--text-black); margin-bottom: 4px;
  }
  .auth-sub { font-size: 14px; color: var(--text-muted); }
  .auth-divider { border-top: 1px solid var(--divider); margin: 24px 0; }
  .auth-box h2 {
    font-family: var(--sans); font-size: 18px; font-weight: 500;
    color: var(--text-black); margin-bottom: 4px;
  }
  .auth-box p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
  .form-error { font-size: 13px; color: var(--red); margin-top: 8px; }
  .auth-switch {
    text-align: center; margin-top: 20px;
    font-size: 14px; color: var(--text-muted);
  }
  .auth-switch button {
    background: none; border: none; cursor: pointer;
    color: var(--green); font-size: 14px; font-family: var(--sans);
    text-decoration: underline; padding: 0;
  }
</style>
