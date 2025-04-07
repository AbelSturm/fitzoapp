<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { workouts } from '$lib/stores/workouts';
  import { questionnaires } from '$lib/stores/questionnaires';
  import { athletes } from '$lib/stores/athletes';
  import { questionnairesService } from '$lib/services/questionnaires';
  import { athletesService } from '$lib/services/athletes';
  import { workoutsService, type Workout } from '$lib/services/workouts';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { supabase } from '$lib/supabaseClient';

  // Extended workout type for dashboard
  interface DashboardWorkout extends Workout {
    exercise_count?: number;
  }

  // Data for dashboard stats
  let totalWorkouts = 0;
  let totalQuestionnaires = 0;
  let totalAthletes = 0;
  let loading = true;
  let recentWorkouts: DashboardWorkout[] = [];
  
  // Welcome message state
  let showWelcome = false;
  
  // Hide welcome message and save preference
  async function dismissWelcome() {
    showWelcome = false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('profiles')
          .update({ has_seen_welcome: true })
          .eq('id', session.user.id);
      }
    } catch (err) {
      console.error('Error updating welcome message preference:', err);
    }
  }
  
  // Load data from Supabase
  onMount(async () => {
    try {
      // Check if user has seen welcome message
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_seen_welcome')
          .eq('id', session.user.id)
          .single();
          
        showWelcome = profile?.has_seen_welcome !== true;
      }
      
      // Load questionnaires count
      const questionnairesData = await questionnairesService.getTrainerQuestionnaires();
      totalQuestionnaires = questionnairesData.length;
      
      // Load athletes count
      const athletesData = await athletesService.getTrainerAthletes();
      totalAthletes = athletesData.length;
      
      // Load workouts count and recent workouts
      const workoutsData = await workoutsService.getTrainerWorkouts();
      totalWorkouts = workoutsData.length;
      recentWorkouts = workoutsData.slice(0, 2);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-7xl mx-auto">
  <!-- First-time welcome message -->
  {#if showWelcome}
    <div class="bg-purple-100 border-l-4 border-purple-500 p-4 mb-8 rounded-md">
      <div class="flex justify-between items-center">
        <p class="text-purple-800">{$_('dashboard.trainer.first_time_welcome')}</p>
        <button 
          class="text-purple-800 hover:text-purple-900 font-medium"
          on:click={dismissWelcome}
        >
          {$_('dashboard.dismiss_welcome')}
        </button>
      </div>
    </div>
  {/if}

  <h1 class="text-3xl font-bold mb-8">{$_('dashboard.trainer.welcome')}</h1>
  
  <!-- Stats cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Card>
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900">Entrenamientos</h3>
        <p class="mt-2 text-3xl font-bold text-purple-600">
          {#if loading}
            <span class="text-gray-400">...</span>
          {:else}
            {totalWorkouts}
          {/if}
        </p>
        <div class="mt-4">
          <Button 
            href="/dashboard/trainer/workouts" 
            variant="outline" 
            size="sm"
          >
            Ver todos
          </Button>
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900">Cuestionarios</h3>
        <p class="mt-2 text-3xl font-bold text-purple-600">
          {#if loading}
            <span class="text-gray-400">...</span>
          {:else}
            {totalQuestionnaires}
          {/if}
        </p>
        <div class="mt-4">
          <Button 
            href="/dashboard/trainer/questionnaires" 
            variant="outline" 
            size="sm"
          >
            Ver todos
          </Button>
        </div>
      </div>
    </Card>
    
    <Card>
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900">Atletas</h3>
        <p class="mt-2 text-3xl font-bold text-purple-600">
          {#if loading}
            <span class="text-gray-400">...</span>
          {:else}
            {totalAthletes}
          {/if}
        </p>
        <div class="mt-4">
          <Button 
            href="/dashboard/trainer/athletes" 
            variant="outline" 
            size="sm"
          >
            Ver todos
          </Button>
        </div>
      </div>
    </Card>
  </div>
  
  <!-- Quick actions -->
  <Card title="Acciones rápidas">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button 
        href="/dashboard/trainer/workouts/new" 
        variant="primary"
      >
        Crear nuevo entrenamiento
      </Button>
      
      <Button 
        href="/dashboard/trainer/questionnaires/new" 
        variant="primary"
      >
        Crear nuevo cuestionario
      </Button>
    </div>
  </Card>
  
  <!-- Recent workouts -->
  <div class="mt-8">
    <h2 class="text-xl font-bold mb-4">Entrenamientos recientes</h2>
    <div class="space-y-4">
      {#if loading}
        <p class="text-gray-500">Cargando entrenamientos recientes...</p>
      {:else if recentWorkouts.length > 0}
        {#each recentWorkouts as workout}
          <Card>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium">{workout.title}</h3>
                <p class="text-gray-600 mt-1">{workout.description}</p>
                <p class="text-sm text-gray-500 mt-2">
                  Ejercicios: {workout.exercise_count || 0} | 
                  Creado: {new Date(workout.created_at || '').toLocaleDateString('es', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Button 
                href={`/dashboard/trainer/workouts/${workout.id}`} 
                variant="outline" 
                size="sm"
              >
                Ver detalles
              </Button>
            </div>
          </Card>
        {/each}
      {:else}
        <p class="text-gray-500">No hay entrenamientos disponibles</p>
      {/if}
    </div>
  </div>
</div>