<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { locale, _ } from 'svelte-i18n';
  
  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard/athlete',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>`
    },
    { 
      label: 'Mis Entrenamientos', 
      path: '/dashboard/athlete/workouts',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>`
    },
    { 
      label: 'Mis Cuestionarios', 
      path: '/dashboard/athlete/questionnaires',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>`
    },
    { 
      label: 'Configuración', 
      path: '/dashboard/athlete/settings',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>`
    }
  ];
  
  // Determine if mobile menu is open
  let isMobileMenuOpen = false;
  
  // Function to toggle mobile menu
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
  
  // Function to handle logout
  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/login');
  }

  function handleLanguageChange(event: Event) {
    locale.set((event.target as HTMLSelectElement).value);
  }
</script>

<!-- Desktop Sidebar -->
<div class="hidden md:block md:fixed md:inset-y-0 left-0 md:w-72 z-10">
  <div class="flex flex-col h-full bg-gradient-to-b from-purple-900 to-purple-700 shadow-xl">
    <div class="flex-1 flex flex-col pt-8 pb-6 overflow-y-auto">
      <div class="flex items-center justify-center flex-shrink-0 px-6 mb-8">
        <div class="flex items-center space-x-2">
          <div class="bg-white p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-white text-xl font-bold">Fitzio</span>
        </div>
      </div>
      
      <nav class="flex-1 px-4 space-y-2">
        {#each navItems as item}
          <a 
            href={item.path} 
            class="group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 
                  {$page.url.pathname === item.path 
                    ? 'bg-white text-purple-900 shadow-md transform translate-x-1' 
                    : 'text-purple-100 hover:bg-purple-800 hover:text-white'}"
          >
            <div class="transition-transform duration-200 {$page.url.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}">
              {@html item.icon}
            </div>
            <span class="ml-4">{item.label}</span>
          </a>
        {/each}
      </nav>
      
      <div class="px-6 mt-6">
        <!-- Language selector -->
        <div class="mb-4">
          <label for="language-select" class="block text-sm font-medium text-gray-300 mb-2">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Language
            </div>
          </label>
          <select 
            id="language-select"
            bind:value={$locale} 
            on:change={handleLanguageChange}
            class="w-full text-sm rounded-md bg-green-800 border-green-700 text-white focus:ring-green-500 focus:border-green-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="ca">Català</option>
          </select>
        </div>
        
        <button 
          class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg text-purple-100 hover:bg-purple-800 hover:text-white transition-all duration-200"
          on:click={handleLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Simplified mobile header -->
<div class="md:hidden fixed top-0 left-0 right-0 z-20 bg-white shadow-sm">
  <div class="px-4 flex items-center justify-between h-16">
    <button 
      type="button" 
      class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-900 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
      on:click={toggleMobileMenu}
    >
      <span class="sr-only">Open main menu</span>
      <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    
    <div class="flex items-center">
      <div class="bg-purple-800 p-1.5 rounded-lg shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span class="text-purple-900 text-lg font-bold ml-2">Fitzio</span>
    </div>
    
    <div class="w-10"></div> <!-- Spacer to balance the layout -->
  </div>
</div>

<!-- Mobile menu overlay -->
{#if isMobileMenuOpen}
  <div 
    class="md:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 transition-opacity duration-300"
    on:click={toggleMobileMenu}
  ></div>
  
  <!-- Mobile sidebar -->
  <div 
    class="md:hidden fixed inset-y-0 left-0 w-72 max-w-[80%] bg-gradient-to-b from-purple-900 to-purple-700 shadow-xl z-40 
           transform transition-transform duration-300 ease-in-out {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}"
  >
    <div class="flex flex-col h-full">
      <!-- Close button -->
      <div class="absolute top-3 right-3">
        <button 
          type="button" 
          class="p-2 rounded-full bg-purple-800 text-white hover:bg-purple-700 focus:outline-none transition-colors duration-200"
          on:click={toggleMobileMenu}
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Sidebar content -->
      <div class="flex-1 flex flex-col pt-16 pb-6 overflow-y-auto">
        <div class="flex items-center justify-center px-6 mb-8">
          <div class="flex items-center space-x-2">
            <div class="bg-white p-2 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-white text-xl font-bold">Fitzio</span>
          </div>
        </div>
        
        <nav class="flex-1 px-4 space-y-2">
          {#each navItems as item}
            <a 
              href={item.path} 
              class="group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 
                    {$page.url.pathname === item.path 
                      ? 'bg-white text-purple-900 shadow-md transform translate-x-1' 
                      : 'text-purple-100 hover:bg-purple-800 hover:text-white'}"
              on:click={toggleMobileMenu}
            >
              <div class="transition-transform duration-200 {$page.url.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}">
                {@html item.icon}
              </div>
              <span class="ml-4">{item.label}</span>
            </a>
          {/each}
        </nav>
        
        <div class="px-6 mt-6">
          <!-- Language selector -->
          <div class="mb-4">
            <label for="language-select" class="block text-sm font-medium text-gray-300 mb-2">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Language
              </div>
            </label>
            <select 
              id="language-select"
              bind:value={$locale} 
              on:change={handleLanguageChange}
              class="w-full text-sm rounded-md bg-green-800 border-green-700 text-white focus:ring-green-500 focus:border-green-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ca">Català</option>
            </select>
          </div>
          
          <button 
            class="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg text-purple-100 hover:bg-purple-800 hover:text-white transition-all duration-200"
            on:click={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
{/if} 