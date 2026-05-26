<script>
  import { appMode, dark } from './stores/store.js';
  import LandingPage from './pages/LandingPage.svelte';
  import UserShell   from './components/UserShell.svelte';
  import AdminShell  from './components/AdminShell.svelte';
  import Toast       from './components/Toast.svelte';
</script>

<div class="app" class:dark={$dark}>
  {#if $appMode === 'landing'}
    <LandingPage />
  {:else if $appMode === 'user'}
    <UserShell />
  {:else if $appMode === 'admin'}
    <AdminShell />
  {/if}
  <Toast />
</div>
