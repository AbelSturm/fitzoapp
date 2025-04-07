<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // Stats for dashboard
  let stats = {
    totalUsers: 0,
    trainers: 0,
    athletes: 0,
    workouts: 0,
    questionnaires: 0
  };

  let loading = true;
  let error: string | null = null;

  // Load dashboard stats
  onMount(async () => {
    try {
      // Count users by role
      const { count: trainerCount, error: trainerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'trainer');
      
      const { count: athleteCount, error: athleteError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'athlete');
      
      if (trainerError) throw trainerError;
      if (athleteError) throw athleteError;
      
      stats.trainers = trainerCount || 0;
      stats.athletes = athleteCount || 0;
      stats.totalUsers = stats.trainers + stats.athletes;
      
      // Count workouts
      const { count: workoutCount, error: workoutError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true });
      
      if (workoutError) throw workoutError;
      stats.workouts = workoutCount || 0;
      
      // Count questionnaires
      const { count: questionnaireCount, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('*', { count: 'exact', head: true });
      
      if (questionnaireError) throw questionnaireError;
      stats.questionnaires = questionnaireCount || 0;
      
    } catch (err: any) {
      console.error('Error loading admin dashboard stats:', err);
      error = err.message || 'Error loading dashboard data';
    } finally {
      loading = false;
    }
  });

  // Function to format large numbers
  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
</script>

<div class="max-w-7xl mx-auto">
  <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card>
      <div class="text-center p-4">
        <div class="text-gray-500 mb-1">Total Users</div>
        <div class="text-3xl font-bold text-purple-700">
          {#if loading}
            <div class="animate-pulse h-8 bg-gray-200 rounded"></div>
          {:else}
            {formatNumber(stats.totalUsers)}
          {/if}
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <div class="text-gray-500 mb-1">Trainers</div>
        <div class="text-3xl font-bold text-blue-600">
          {#if loading}
            <div class="animate-pulse h-8 bg-gray-200 rounded"></div>
          {:else}
            {formatNumber(stats.trainers)}
          {/if}
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <div class="text-gray-500 mb-1">Athletes</div>
        <div class="text-3xl font-bold text-green-600">
          {#if loading}
            <div class="animate-pulse h-8 bg-gray-200 rounded"></div>
          {:else}
            {formatNumber(stats.athletes)}
          {/if}
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <div class="text-gray-500 mb-1">User Ratio</div>
        <div class="text-3xl font-bold text-indigo-600">
          {#if loading}
            <div class="animate-pulse h-8 bg-gray-200 rounded"></div>
          {:else}
            {stats.trainers > 0 ? (stats.athletes / stats.trainers).toFixed(1) : 0} : 1
          {/if}
        </div>
        <div class="text-xs text-gray-500 mt-1">Athletes per Trainer</div>
      </div>
    </Card>
  </div>
  
  <!-- Content Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">Content Statistics</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Workouts</span>
            <span class="font-bold">
              {#if loading}
                <div class="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
              {:else}
                {formatNumber(stats.workouts)}
              {/if}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Questionnaires</span>
            <span class="font-bold">
              {#if loading}
                <div class="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
              {:else}
                {formatNumber(stats.questionnaires)}
              {/if}
            </span>
          </div>
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 gap-3">
          <Button href="/dashboard/admin/users" variant="primary">
            Manage Users
          </Button>
          <Button href="/dashboard/admin/workouts" variant="outline">
            View All Workouts
          </Button>
          <Button href="/dashboard/admin/questionnaires" variant="outline">
            View All Questionnaires
          </Button>
        </div>
      </div>
    </Card>
  </div>
</div> 