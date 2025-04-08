<script lang="ts">
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { locale, _ } from 'svelte-i18n';

  // Navigation items for admin dashboard
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard/admin',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>`
    },
    {
      label: 'Users',
      path: '/dashboard/admin/users',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>`
    },
    {
      label: 'Workouts',
      path: '/dashboard/admin/workouts',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>`
    },
    {
      label: 'Questionnaires',
      path: '/dashboard/admin/questionnaires',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>`
    },
    {
      label: 'Statistics',
      path: '/dashboard/admin/statistics',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>`
    }
  ];

  // Handle user logout
  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/login');
  }

  function handleLanguageChange(event: Event) {
    locale.set((event.target as HTMLSelectElement).value);
  }
</script>

<div class="bg-purple-900 text-white h-screen w-64 flex flex-col shadow-xl fixed z-10 top-0 left-0 md:sticky">
  <!-- Logo area -->
  <div class="p-6 border-b border-purple-800">
    <h2 class="text-xl font-bold">Fitzio Admin</h2>
  </div>
  
  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-4">
    <ul class="space-y-1">
      {#each navItems as item}
        <li>
          <a 
            href={item.path} 
            class="flex items-center px-6 py-3 text-gray-100 hover:bg-purple-800 {$page.url.pathname === item.path ? 'bg-purple-800 border-r-4 border-white' : ''}"
          >
            <span class="mr-3">
              {@html item.icon}
            </span>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  <!-- User controls -->
  <div class="p-4 border-t border-purple-800">
    <!-- Language selector -->
    <div class="mb-4">
      <label for="language-select" class="block text-sm font-medium text-gray-100 mb-2">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          Language
        </div>
      </label>
      <div class="relative group">
        <select 
          id="language-select"
          bind:value={$locale} 
          on:change={handleLanguageChange}
          class="w-full appearance-none pl-4 pr-10 py-2.5 text-sm rounded-lg bg-purple-800/40 backdrop-blur-sm border border-white/20 text-white shadow-lg hover:bg-purple-800/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ca">Català</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
    
    <button 
      on:click={handleLogout}
      class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-600 focus:outline-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  </div>
</div> 