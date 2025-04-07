<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';

  // Get user ID from URL params
  const userId = $page.params.id;
  
  interface User {
    id: string;
    email: string;
    role: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    has_seen_welcome: boolean;
    created_at: string;
  }
  
  // State variables
  let user: User | null = null;
  let loading = true;
  let editMode = false;
  let saving = false;
  let error: string | null = null;
  let successMessage: string | null = null;
  
  // Form fields
  let editRole = '';
  
  onMount(async () => {
    await loadUserDetails();
  });
  
  // Load user details
  async function loadUserDetails() {
    try {
      loading = true;
      error = null;
      successMessage = null;
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!data) {
        throw new Error('User not found');
      }
      
      user = data as User;
      if (user) {
        editRole = user.role;
      }
    } catch (err: any) {
      console.error('Error loading user details:', err);
      error = err.message || 'Failed to load user details';
    } finally {
      loading = false;
    }
  }
  
  // Update user role
  async function updateUserRole() {
    try {
      saving = true;
      error = null;
      successMessage = null;
      
      // Call the admin function to update user role
      const { data, error: updateError } = await supabase
        .rpc('admin_update_user_role', {
          user_id: userId,
          new_role: editRole
        });
      
      if (updateError) throw updateError;
      
      successMessage = 'User role updated successfully';
      await loadUserDetails(); // Reload user data
      editMode = false;
    } catch (err: any) {
      console.error('Error updating user role:', err);
      error = err.message || 'Failed to update user role';
    } finally {
      saving = false;
    }
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

<div class="max-w-4xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">User Details</h1>
    <Button 
      variant="outline" 
      href="/dashboard/admin/users"
    >
      Back to Users
    </Button>
  </div>
  
  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if successMessage}
    <div class="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-green-700">{successMessage}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if loading}
    <div class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
    </div>
  {:else if user}
    <Card>
      <div class="p-6">
        <div class="mb-8 pb-4 border-b">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Basic Information</h2>
            <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full {getRoleBadgeClass(user.role)}">
              {user.role}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-500">User ID</p>
              <p class="font-medium">{user.id}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">{user.email}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Username</p>
              <p class="font-medium">{user.username || '—'}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Created</p>
              <p class="font-medium">{formatDate(user.created_at)}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">First Name</p>
              <p class="font-medium">{user.first_name || '—'}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Last Name</p>
              <p class="font-medium">{user.last_name || '—'}</p>
            </div>
          </div>
        </div>
        
        <!-- Role Management -->
        <div class="mt-8">
          <h3 class="text-lg font-semibold mb-4">Role Management</h3>
          
          {#if !editMode}
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Current Role</p>
                <p class="font-medium">{user.role}</p>
              </div>
              
              <Button 
                variant="outline" 
                on:click={() => editMode = true}
              >
                Change Role
              </Button>
            </div>
          {:else}
            <form on:submit|preventDefault={updateUserRole} class="space-y-4">
              <div>
                <label for="role" class="block text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <select
                  id="role"
                  bind:value={editRole}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  disabled={saving}
                >
                  <option value="trainer">Trainer</option>
                  <option value="athlete">Athlete</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div class="flex space-x-3">
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={saving || editRole === user.role}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  on:click={() => {
                    editMode = false;
                    editRole = user?.role || '';
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </Card>
  {:else}
    <div class="text-center p-12 bg-gray-50 rounded-lg">
      <p class="text-gray-700">User not found</p>
    </div>
  {/if}
</div> 