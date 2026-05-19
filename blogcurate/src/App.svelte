<script>
  import { appMode } from './stores/store.js';
  import LandingPage from './pages/LandingPage.svelte';
  import UserShell   from './components/UserShell.svelte';
  import AdminShell  from './components/AdminShell.svelte';

  let prevMode = null;
  $: { prevMode = $appMode; }
</script>

{#if $appMode === 'landing'}
  <LandingPage />
{:else if $appMode === 'user'}
  <UserShell />
{:else if $appMode === 'admin'}
  <AdminShell />
{/if}
