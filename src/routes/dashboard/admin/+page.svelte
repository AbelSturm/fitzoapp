<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { _ } from 'svelte-i18n';

  // Stats for dashboard
  interface Stats {
    totalUsers: number;
    trainers: number;
    athletes: number;
    workouts: number;
    questionnaires: number;
  }

  let stats: Stats = {
    totalUsers: 0,
    trainers: 0,
    athletes: 0,
    workouts: 0,
    questionnaires: 0
  };

  let loading = true;
  let error: string | null = null;
  let dbStatus: string = "Not checked";

  // Function to check database connection
  async function checkDatabaseConnection() {
    try {
      // Test a simple query
      const { data, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        dbStatus = `Connection error: ${testError.message}`;
        console.error('Database connection error:', testError);
        return false;
      }
      
      dbStatus = "Connected successfully";
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      dbStatus = `Connection test failed: ${errorMessage}`;
      console.error('Database connection test failed:', errorMessage);
      return false;
    }
  }

  // Load dashboard stats
  onMount(async () => {
    // First check connection
    await checkDatabaseConnection();
    
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
      
      // Count workouts - using improved query
      try {
        const { data: workoutsData, error: workoutError } = await supabase
          .from('workouts')
          .select('id');
        
        if (workoutError) {
          console.error('Workout count error:', workoutError);
          // Don't set error here to avoid blocking other stats
        } else {
          stats.workouts = Array.isArray(workoutsData) ? workoutsData.length : 0;
          console.log(`Found ${stats.workouts} workouts`);
        }
      } catch (workoutErr) {
        console.error('Workout fetch error:', workoutErr);
        // Don't set error here to avoid blocking other stats
      }
      
      // Count questionnaires - using improved query
      try {
        const { data: questionnairesData, error: questionnaireError } = await supabase
          .from('questionnaires')
          .select('id');
        
        if (questionnaireError) {
          console.error('Questionnaire count error:', questionnaireError);
          // Don't set error here to avoid blocking other stats
        } else {
          stats.questionnaires = Array.isArray(questionnairesData) ? questionnairesData.length : 0;
          console.log(`Found ${stats.questionnaires} questionnaires`);
        }
      } catch (questionnaireErr) {
        console.error('Questionnaire fetch error:', questionnaireErr);
        // Don't set error here to avoid blocking other stats
      }
      
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
  <h1 class="text-3xl font-bold mb-8">{$_('dashboard.admin.title', { default: 'Admin Dashboard' })}</h1>

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
        <div class="text-gray-500 mb-1">{$_('dashboard.statistics.total_users')}</div>
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
        <div class="text-gray-500 mb-1">{$_('dashboard.statistics.trainers')}</div>
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
        <div class="text-gray-500 mb-1">{$_('dashboard.statistics.athletes')}</div>
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
        <div class="text-gray-500 mb-1">{$_('dashboard.statistics.user_ratio')}</div>
        <div class="text-3xl font-bold text-indigo-600">
          {#if loading}
            <div class="animate-pulse h-8 bg-gray-200 rounded"></div>
          {:else}
            {stats.trainers > 0 ? (stats.athletes / stats.trainers).toFixed(1) : 0} : 1
          {/if}
        </div>
        <div class="text-xs text-gray-500 mt-1">{$_('dashboard.statistics.athletes_per_trainer')}</div>
      </div>
    </Card>
  </div>
  
  <!-- Content Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">{$_('dashboard.admin.content_statistics', { default: 'Content Statistics' })}</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">{$_('dashboard.admin.workouts', { default: 'Workouts' })}</span>
            <span class="font-bold">
              {#if loading}
                <div class="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
              {:else}
                {formatNumber(stats.workouts)}
              {/if}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">{$_('dashboard.admin.questionnaires', { default: 'Questionnaires' })}</span>
            <span class="font-bold">
              {#if loading}
                <div class="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
              {:else}
                {formatNumber(stats.questionnaires)}
              {/if}
            </span>
          </div>
          
          <!-- Diagnostic Info - Remove this in production -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <details class="text-xs text-gray-500">
              <summary class="cursor-pointer">Database Connection Info</summary>
              <div class="mt-2">
                <p>Stats loaded: {!loading ? 'Yes' : 'No'}</p>
                <p>Database status: {dbStatus}</p>
                <p>Workouts count: {stats.workouts}</p>
                <p>Questionnaires count: {stats.questionnaires}</p>
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
                <button 
                  class="mt-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                  on:click={async () => {
                    loading = true;
                    await checkDatabaseConnection();
                    
                    try {
                      const { data: workoutsData, error: workoutError } = await supabase
                        .from('workouts')
                        .select('id');
                      
                      if (workoutError) {
                        error = `Diagnostic: ${workoutError.message}`;
                      } else {
                        stats.workouts = workoutsData?.length || 0;
                      }
                    } catch (err) {
                      error = `Diagnostic error loading workouts: ${err instanceof Error ? err.message : String(err)}`;
                    }
                    
                    try {
                      const { data: questionnairesData, error: questionnaireError } = await supabase
                        .from('questionnaires')
                        .select('id');
                      
                      if (questionnaireError) {
                        error = `${error || ''} Questionnaires: ${questionnaireError.message}`;
                      } else {
                        stats.questionnaires = questionnairesData?.length || 0;
                      }
                    } catch (err) {
                      error = `${error || ''} Error loading questionnaires: ${err instanceof Error ? err.message : String(err)}`;
                    }
                    
                    loading = false;
                  }}
                >
                  Refresh Stats
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">{$_('dashboard.admin.quick_actions', { default: 'Quick Actions' })}</h3>
        <div class="grid grid-cols-1 gap-3">
          <Button href="/dashboard/admin/users" variant="primary">
            {$_('dashboard.admin.manage_users', { default: 'Manage Users' })}
          </Button>
          <Button href="/dashboard/admin/workouts" variant="outline">
            {$_('dashboard.admin.view_all_workouts', { default: 'View All Workouts' })}
          </Button>
          <Button href="/dashboard/admin/questionnaires" variant="outline">
            {$_('dashboard.admin.view_all_questionnaires', { default: 'View All Questionnaires' })}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</div> 