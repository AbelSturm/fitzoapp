<script lang="ts">
  import { locale, _ } from 'svelte-i18n';
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import type { Session } from '@supabase/supabase-js';
  
  let isOpen = false;
  let session: Session | null = null;

  // Variables to track user profile
  let userRole: string | null = null;
  let dashboardUrl: string = '/dashboard';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' }
  ];

  function setLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    locale.set(target.value);
  }

  async function getUserProfile() {
    if (!session) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id);
      
      if (error) {
        console.error('Error fetching profile in header:', error.message);
        // User profile might have been deleted, sign out
        await supabase.auth.signOut();
        return;
      }
      
      if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        userRole = profile.role;
        dashboardUrl = `/dashboard/${profile.role}`;
      } else {
        // No profile found, sign out
        console.warn('No profile found for user in header');
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Unexpected error in header:', err);
      await supabase.auth.signOut();
    }
  }

  // Get session on mount
  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    
    if (session) {
      await getUserProfile();
    }
    
    // Subscribe to auth changes
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session = newSession;
      
      if (session) {
        await getUserProfile();
      } else {
        userRole = null;
        dashboardUrl = '/dashboard';
      }
    });
  });
</script>

<header class="bg-white shadow-sm">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        <span class="text-2xl font-bold text-purple-900">Fitzio</span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-4">
        <!-- Language Selector -->
        <div class="relative group mr-4">
          <select
            class="appearance-none bg-white/90 border border-gray-300 rounded-lg text-gray-800 pl-3 pr-10 py-2 text-sm shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            value={$locale}
            on:change={setLanguage}
          >
            {#each languages as lang}
              <option value={lang.code}>{lang.name}</option>
            {/each}
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {#if session}
          <!-- User is logged in -->
          <a href={dashboardUrl} class="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <span>{$_('nav.dashboard')}</span>
          </a>
        {:else}
          <!-- User is not logged in -->
          <a href="/login" class="text-gray-700 hover:text-gray-900">{$_('nav.login')}</a>
          <a
            href="/register"
            class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {$_('nav.create_account')}
          </a>
        {/if}
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden"
        on:click={() => isOpen = !isOpen}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if isOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          {/if}
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    {#if isOpen}
      <div class="md:hidden py-4 border-t">
        <div class="space-y-4">
          <!-- Language Selector -->
          <div class="px-2">
            <div class="relative">
              <select
                class="appearance-none w-full bg-white/90 border border-gray-300 rounded-lg text-gray-800 pl-3 pr-10 py-2.5 text-sm shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                value={$locale}
                on:change={setLanguage}
              >
                {#each languages as lang}
                  <option value={lang.code}>{lang.name}</option>
                {/each}
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {#if session}
            <!-- User is logged in -->
            <a href={dashboardUrl} class="flex items-center gap-2 px-2 py-2 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <span>{$_('nav.dashboard')}</span>
            </a>
          {:else}
            <!-- User is not logged in -->
            <a href="/login" class="block text-gray-700 py-2">{$_('nav.login')}</a>
            <a
              href="/register"
              class="block bg-orange-500 text-white px-4 py-2 rounded-lg text-center"
            >
              {$_('nav.create_account')}
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</header>