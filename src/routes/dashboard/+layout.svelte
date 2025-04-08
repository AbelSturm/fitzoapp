<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data;

  // Just keep the logout handler function for internal components to use
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      goto('/');
    }
  }

  // Generate page title based on the current URL path
  $: pathSegments = $page.url.pathname.split('/').filter(Boolean);
  $: currentRole = pathSegments[1] || '';
  $: currentSection = pathSegments[2] || 'Dashboard';
  $: pageTitle = `Fitzio | ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <slot />
</div>