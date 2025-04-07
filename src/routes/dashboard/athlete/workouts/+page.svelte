<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Workout interface
  interface AthleteWorkout {
    id: string;
    title: string;
    description: string;
    assignedDate: string;
    completed: boolean;
    completedAt: string | null;
    exerciseCount: number;
  }
  
  // Page state
  let workouts: AthleteWorkout[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Format date to more readable format
  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    });
  }
  
  // Function to mark a workout as completed
  async function markWorkoutCompleted(id: string) {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      loading = true;
      
      // Update the workout assignment status in Supabase
      const { error: updateError } = await supabase
        .from('workout_assignments')
        .update({ status: 'completed' })
        .eq('workout_id', id)
        .eq('assigned_to', session.user.id);
        
      if (updateError) {
        console.error('Error marking workout as completed:', updateError);
        error = 'Error al marcar el entrenamiento como completado. Inténtalo de nuevo.';
        return;
      }
      
      // Update local state
      workouts = workouts.map(workout => {
        if (workout.id === id) {
          return { 
            ...workout, 
            completed: true,
            completedAt: new Date().toISOString()
          };
        }
        return workout;
      });
      
      error = null;
    } catch (err) {
      console.error('Error marking workout as completed:', err);
      error = 'Ha ocurrido un error. Inténtalo de nuevo.';
    } finally {
      loading = false;
    }
  }
  
  // Load workouts data
  onMount(async () => {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        error = 'No se ha encontrado una sesión activa.';
        loading = false;
        return;
      }
      
      // Fetch assigned workouts from Supabase with exercise counts
      const { data: workoutAssignments, error: workoutError } = await supabase
        .from('workout_assignments')
        .select(`
          workout_id,
          status,
          assigned_at,
          workouts:workout_id (
            id, 
            title,
            description,
            created_at,
            exercises:exercises (
              id
            )
          )
        `)
        .eq('assigned_to', session.user.id)
        .order('assigned_at', { ascending: false });
        
      if (workoutError) {
        console.error('Error fetching workout assignments:', workoutError);
        error = 'Error al cargar los entrenamientos.';
      } else if (workoutAssignments && workoutAssignments.length > 0) {
        // Transform workout data to match our interface
        workouts = workoutAssignments.map((assignment: any) => ({
          id: assignment.workout_id,
          title: assignment.workouts.title,
          description: assignment.workouts.description,
          assignedDate: assignment.assigned_at || assignment.workouts.created_at,
          completed: assignment.status === 'completed',
          completedAt: assignment.status === 'completed' ? assignment.assigned_at : null,
          exerciseCount: assignment.workouts.exercises ? assignment.workouts.exercises.length : 0
        }));
      }
    } catch (err) {
      console.error('Error loading workouts data:', err);
      error = 'Ha ocurrido un error al cargar los entrenamientos.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-7xl mx-auto px-4">
  <section class="mb-8">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl md:text-3xl font-bold text-purple-900">Mis Entrenamientos</h1>
      <Button href="/dashboard/athlete" variant="outline" size="sm">
        Volver al Dashboard
      </Button>
    </div>
    <p class="text-gray-600 mt-2">
      Aquí puedes ver todos tus entrenamientos asignados y su estado.
    </p>
  </section>
  
  {#if error}
    <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="text-center">
        <svg class="animate-spin h-10 w-10 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600">Cargando entrenamientos...</p>
      </div>
    </div>
  {:else if workouts.length === 0}
    <Card>
      <div class="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mt-4">No tienes entrenamientos asignados</h3>
        <p class="text-gray-500 mt-2">
          Cuando tu entrenador te asigne entrenamientos, aparecerán aquí.
        </p>
      </div>
    </Card>
  {:else}
    <div class="space-y-6">
      <!-- Filter/Sort controls could be added here -->
      
      <!-- Workouts list -->
      {#each workouts as workout}
        <Card padding="p-5">
          <div class="flex flex-col md:flex-row justify-between">
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <h3 class="text-lg font-semibold text-gray-900">{workout.title}</h3>
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${workout.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {workout.completed ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              <p class="text-gray-600 mt-2">{workout.description}</p>
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs font-medium text-gray-500 uppercase">Fecha asignada</div>
                  <div class="mt-1 text-sm text-gray-900">{formatDate(workout.assignedDate)}</div>
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-500 uppercase">Ejercicios</div>
                  <div class="mt-1 text-sm text-gray-900">{workout.exerciseCount}</div>
                </div>
                {#if workout.completed}
                <div>
                  <div class="text-xs font-medium text-gray-500 uppercase">Completado el</div>
                  <div class="mt-1 text-sm text-gray-900">{formatDate(workout.completedAt)}</div>
                </div>
                {/if}
              </div>
            </div>
            
            <div class="flex flex-col gap-2 mt-4 md:mt-0 md:ml-6 md:w-48">
              <Button 
                href={`/dashboard/athlete/workouts/${workout.id}`} 
                variant="primary" 
                fullWidth={true}
              >
                Ver detalles
              </Button>
              
              {#if !workout.completed}
                <Button 
                  on:click={() => markWorkoutCompleted(workout.id)} 
                  variant="outline" 
                  fullWidth={true}
                  disabled={loading}
                >
                  Marcar completado
                </Button>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div> 