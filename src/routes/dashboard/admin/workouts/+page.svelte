<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { workoutsService, type Workout } from '$lib/services/workouts';
  import { _ } from 'svelte-i18n';

  // Define extended workout type to include exercise_count
  interface WorkoutWithCount {
    id: string;
    title: string;
    description?: string;
    created_at?: string;
    created_by?: string;
    exercise_count?: number;
    trainer_profile?: {
      id?: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      email?: string;
    };
  }

  let workouts: WorkoutWithCount[] = [];
  let loading = true;
  let error: string | null = null;
  let searchTerm = '';
  let trainerFilter = '';

  // Load workouts on mount
  onMount(async () => {
    await loadWorkouts();
  });

  // Load all workouts from database
  async function loadWorkouts() {
    try {
      loading = true;
      error = null;

      // Query workouts directly from the workouts table
      const { data, error: fetchError } = await supabase
        .from('workouts')
        .select('id, title, description, created_at, created_by')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      workouts = data || [];

      // If successful, get exercise counts for each workout
      if (!fetchError && data) {
        // Get exercise counts in a separate query
        for (const workout of data) {
          const { count, error: countError } = await supabase
            .from('exercises')
            .select('*', { count: 'exact', head: true })
            .eq('workout_id', workout.id);
            
          if (!countError) {
            (workout as WorkoutWithCount).exercise_count = count || 0;
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading workouts:', err);
      error = err.message || 'Failed to load workouts';
    } finally {
      loading = false;
    }
  }

  // Function to get trainer details
  async function loadTrainers() {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'trainer');
      
      if (fetchError) throw fetchError;
      
      return data || [];
    } catch (err) {
      console.error('Error loading trainers:', err);
      return [];
    }
  }

  // Delete a workout
  async function deleteWorkout(id: string) {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }
    
    try {
      const success = await workoutsService.deleteWorkout(id);
      
      if (success) {
        // Refresh the workout list
        await loadWorkouts();
      } else {
        error = 'Failed to delete workout';
      }
    } catch (err: any) {
      console.error('Error deleting workout:', err);
      error = err.message || 'Failed to delete workout';
    }
  }

  // Filter workouts based on search term and trainer filter
  $: filteredWorkouts = workouts.filter(workout => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (workout.description && workout.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply trainer filter
    const matchesTrainer = trainerFilter === '' || (workout.created_by === trainerFilter);
    
    return matchesSearch && matchesTrainer;
  });

  // Format date
  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="max-w-7xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">{$_('dashboard.admin.workouts_title', { default: 'Workout Management' })}</h1>

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
  <div class="mb-6">
    <Card>
      <div class="p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div class="flex-1 min-w-0">
            <label for="search" class="sr-only">{$_('dashboard.admin.workouts_search', { default: 'Search workouts' })}</label>
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
                placeholder={$_('dashboard.admin.workouts_search_placeholder', { default: 'Search workouts by title or trainer' })}
                class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div class="w-full md:w-auto">
            <select
              bind:value={trainerFilter}
              class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Trainers</option>
              {#await loadTrainers()}
                <option disabled>Loading trainers...</option>
              {:then trainers}
                {#each trainers as trainer}
                  <option value={trainer.id}>
                    {trainer.first_name || ''} {trainer.last_name || ''} ({trainer.email})
                  </option>
                {/each}
              {/await}
            </select>
          </div>
        </div>
        
        <div class="mt-4 flex items-center justify-between flex-wrap gap-2">
          <div class="text-sm text-gray-500">
            {$_('dashboard.admin.workouts_found', { default: `${filteredWorkouts.length} workouts found` })}
          </div>
          
          <div class="flex space-x-2">
            <button
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
              on:click={() => {
                searchTerm = '';
              }}
            >
              {$_('dashboard.admin.clear_filters', { default: 'Clear Filters' })}
            </button>
            
            <button
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              on:click={loadWorkouts}
            >
              {$_('dashboard.admin.refresh_list', { default: 'Refresh List' })}
            </button>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <!-- Workouts list -->
  <Card>
    {#if loading}
      <div class="p-8 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900"></div>
      </div>
    {:else if filteredWorkouts.length === 0}
      <div class="p-8 text-center text-gray-500">
        {$_('dashboard.admin.workouts_no_workouts', { default: 'No workouts found matching your filters.' })}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{$_('dashboard.admin.workouts_table_title', { default: 'Title' })}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{$_('dashboard.admin.workouts_table_trainer', { default: 'Trainer' })}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{$_('dashboard.admin.workouts_table_created', { default: 'Created' })}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{$_('dashboard.admin.workouts_table_exercises', { default: 'Exercises' })}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{$_('dashboard.admin.table.actions', { default: 'Actions' })}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredWorkouts as workout}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{workout.title}</div>
                  <div class="text-sm text-gray-500">
                    {#if workout.description}
                      {workout.description.length > 50 ? workout.description.substring(0, 50) + '...' : workout.description}
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {#if workout.trainer_profile}
                      {#if workout.trainer_profile.first_name || workout.trainer_profile.last_name}
                        {workout.trainer_profile.first_name || ''} {workout.trainer_profile.last_name || ''}
                      {:else if workout.trainer_profile.username}
                        @{workout.trainer_profile.username}
                      {:else}
                        {workout.trainer_profile.email}
                      {/if}
                    {:else}
                      {$_('dashboard.admin.workouts_unknown', { default: 'Unknown' })}
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(workout.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {workout.exercise_count || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    href={`/dashboard/admin/workouts/${workout.id}`} 
                    variant="outline" 
                    size="sm"
                  >
                    {$_('dashboard.admin.view_details', { default: 'View Details' })}
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