<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface User {
    id: string;
    email: string;
    role: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
  }

  let users: User[] = [];
  let loading = true;
  let error: string | null = null;
  let searchTerm = '';
  let roleFilter = '';

  // Load users on mount
  onMount(async () => {
    await loadUsers();
  });

  // Load users from database
  async function loadUsers() {
    try {
      loading = true;
      error = null;

      // Fetch all users from profiles table
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      users = data || [];
    } catch (err: any) {
      console.error('Error loading users:', err);
      error = err.message || 'Failed to load users';
    } finally {
      loading = false;
    }
  }

  // Filter users based on search term and role
  $: filteredUsers = users.filter(user => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply role filter
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get role badge class
  function getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'trainer':
        return 'bg-blue-100 text-blue-800';
      case 'athlete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">User Management</h1>

  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Filters & search -->
  <Card class="mb-6">
    <div class="p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex-1 min-w-0">
          <label for="search" class="sr-only">Search users</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              bind:value={searchTerm}
              placeholder="Search users by email, name or username"
              class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        
        <div class="w-full md:w-auto">
          <select
            bind:value={roleFilter}
            class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="athlete">Athlete</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div class="text-sm text-gray-500">
          {filteredUsers.length} users found
        </div>
        
        <div class="flex space-x-2">
          <button
            type="button"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
            on:click={() => {
              searchTerm = '';
              roleFilter = '';
            }}
          >
            Clear Filters
          </button>
          
          <button
            type="button"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
            on:click={loadUsers}
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  </Card>

  <!-- Users list -->
  <Card>
    {#if loading}
      <div class="p-8 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900"></div>
      </div>
    {:else if filteredUsers.length === 0}
      <div class="p-8 text-center text-gray-500">
        No users found matching your filters.
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredUsers as user}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{user.email}</div>
                  <div class="text-sm text-gray-500">
                    {#if user.first_name || user.last_name}
                      {user.first_name || ''} {user.last_name || ''}
                    {:else if user.username}
                      @{user.username}
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getRoleBadgeClass(user.role)}">
                    {user.role}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    href={`/dashboard/admin/users/${user.id}`} 
                    variant="outline" 
                    size="sm"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div> 