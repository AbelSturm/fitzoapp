<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  export let data;

  // Just keep the logout handler function for internal components to use
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      goto('/login');
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <slot />
</div>