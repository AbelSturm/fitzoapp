<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { workoutsService, type Workout, type Exercise, type WorkoutAssignment } from '$lib/services/workouts';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { supabase } from '$lib/supabaseClient';

  const workoutId = $page.params.id;
  
  let workout: Workout | null = null;
  let assignments: WorkoutAssignment[] = [];
  let loading = true;
  let error: string | null = null;

  // Load workout details
  onMount(async () => {
    try {
      loading = true;
      
      // Load workout details
      workout = await workoutsService.getWorkout(workoutId);
      
      if (!workout) {
        error = 'Workout not found';
        return;
      }
      
      // Load workout assignments directly
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('workout_assignments')
        .select('*')
        .eq('workout_id', workoutId);
        
      if (!assignmentsError) {
        assignments = assignmentsData || [];
      } else {
        console.error('Error loading workout assignments:', assignmentsError);
      }
      
    } catch (err: any) {
      console.error('Error loading workout details:', err);
      error = err.message || 'Failed to load workout details';
    } finally {
      loading = false;
    }
  });

  // Delete a workout
  async function deleteWorkout() {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }
    
    try {
      const success = await workoutsService.deleteWorkout(workoutId);
      
      if (success) {
        // Navigate back to workouts page
        window.location.href = '/dashboard/admin/workouts';
      } else {
        error = 'Failed to delete workout';
      }
    } catch (err: any) {
      console.error('Error deleting workout:', err);
      error = err.message || 'Failed to delete workout';
    }
  }

  // Format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get user details
  async function getUserName(userId: string): Promise<string> {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .single();
      
      if (fetchError || !data) {
        return 'Unknown User';
      }
      
      if (data.first_name || data.last_name) {
        return `${data.first_name || ''} ${data.last_name || ''}`.trim();
      }
      
      return data.email;
    } catch (err) {
      console.error('Error fetching user details:', err);
      return 'Unknown User';
    }
  }

  // Get status badge class
  function getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center">
      <div class="mr-4">
        <Button href="/dashboard/admin/workouts" variant="outline" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workouts
        </Button>
      </div>
      <h1 class="text-3xl font-bold">Workout Details</h1>
    </div>
    
    {#if workout}
      <button
        on:click={deleteWorkout}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Workout
      </button>
    {/if}
  </div>

  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="p-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
    </div>
  {:else if workout}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="md:col-span-2">
        <!-- Workout details -->
        <Card title="Workout Information">
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium">{workout.title}</h3>
              <p class="text-gray-500 mt-1">{workout.description || 'No description provided'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-gray-500">Created:</span>
                <p>{formatDate(workout.created_at)}</p>
              </div>
              
              <div>
                <span class="text-sm text-gray-500">Created by:</span>
                <p>{#await getUserName(workout.created_by || '')}{:then name}{name}{/await}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- Exercises -->
        <div class="mt-6">
          <Card title={`Exercises (${workout.exercises?.length || 0})`}>
            {#if !workout.exercises || workout.exercises.length === 0}
              <p class="text-gray-500">No exercises found for this workout.</p>
            {:else}
              <div class="space-y-4">
                {#each workout.exercises as exercise, index}
                  <div class="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-medium">{index + 1}. {exercise.name}</h4>
                        <p class="text-sm text-gray-600 mt-1">
                          {exercise.sets} sets × {exercise.reps} {exercise.reps === 1 ? 'rep' : 'reps'}
                          {#if exercise.rest}
                            <span class="ml-2">• {exercise.rest}s rest</span>
                          {/if}
                        </p>
                        {#if exercise.notes}
                          <p class="text-sm text-gray-500 mt-1">Notes: {exercise.notes}</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
        </div>
      </div>

      <!-- Assignments -->
      <div>
        <Card title={`Assignments (${assignments.length})`}>
          {#if assignments.length === 0}
            <p class="text-gray-500">This workout has not been assigned to any athletes.</p>
          {:else}
            <div class="space-y-3">
              {#each assignments as assignment}
                <div class="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-medium">
                        {#await getUserName(assignment.assigned_to)}
                          Loading...
                        {:then name}
                          {name}
                        {/await}
                      </span>
                      
                      <div class="flex flex-col text-sm text-gray-500 mt-1">
                        <span>Assigned: {formatDate(assignment.assigned_at)}</span>
                        {#if assignment.due_date}
                          <span>Due: {formatDate(assignment.due_date)}</span>
                        {/if}
                      </div>
                    </div>
                    
                    <span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusBadgeClass(assignment.status)}">
                      {assignment.status || 'pending'}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card>
      </div>
    </div>
  {:else}
    <div class="p-8 text-center text-gray-500">
      Workout not found or has been deleted.
    </div>
  {/if}
</div> 