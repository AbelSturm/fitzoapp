<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import AdminSidebar from '$lib/components/admin/Sidebar.svelte';

  let loading = true;
  let isAdmin = false;

  // Check if user is authenticated and has admin role
  onMount(async () => {
    try {
      // Get current session
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        // No session, redirect to login
        goto('/login');
        return;
      }

      // Check if user has admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        goto('/login');
        return;
      }

      if (profile.role !== 'admin') {
        // Not an admin, redirect to appropriate dashboard
        console.log('Unauthorized access attempt to admin dashboard');
        goto(`/dashboard/${profile.role}`);
        return;
      }

      // User is confirmed as admin
      isAdmin = true;
    } catch (err) {
      console.error('Error in admin auth check:', err);
      goto('/login');
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
  </div>
{:else if isAdmin}
  <div class="flex h-screen">
    <AdminSidebar />
    <div class="flex-1 overflow-auto p-4 md:p-8">
      <slot />
    </div>
  </div>
{/if} 