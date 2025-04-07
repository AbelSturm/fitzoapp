<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Workout ID from the URL
  const workoutId = $page.params.id;
  
  // Interfaces for our data
  interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    rest: number;
    notes: string | null;
    order: number;
  }
  
  interface Workout {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    assignedAt: string | null;
    completed: boolean;
    completedAt: string | null;
  }
  
  // Page state
  let workout: Workout | null = null;
  let exercises: Exercise[] = [];
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
  async function markWorkoutCompleted() {
    if (!workout) return;
    
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      loading = true;
      
      // Update the workout assignment status in Supabase
      const { error: updateError } = await supabase
        .from('workout_assignments')
        .update({ status: 'completed' })
        .eq('workout_id', workoutId)
        .eq('assigned_to', session.user.id);
        
      if (updateError) {
        console.error('Error marking workout as completed:', updateError);
        error = 'Error al marcar el entrenamiento como completado. Inténtalo de nuevo.';
        return;
      }
      
      // Update local state
      workout = {
        ...workout,
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      error = null;
    } catch (err) {
      console.error('Error marking workout as completed:', err);
      error = 'Ha ocurrido un error. Inténtalo de nuevo.';
    } finally {
      loading = false;
    }
  }
  
  // Load workout and exercises data
  onMount(async () => {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        error = 'No se ha encontrado una sesión activa.';
        loading = false;
        return;
      }
      
      // 1. Fetch workout details and assignment status
      const { data: workoutAssignment, error: workoutError } = await supabase
        .from('workout_assignments')
        .select(`
          workout_id,
          status,
          assigned_at,
          workouts:workout_id (
            id, 
            title,
            description,
            created_at
          )
        `)
        .eq('workout_id', workoutId)
        .eq('assigned_to', session.user.id)
        .single();
      
      if (workoutError) {
        if (workoutError.code === 'PGRST116') {
          // Not found error
          error = 'Este entrenamiento no está asignado a ti o no existe.';
        } else {
          console.error('Error fetching workout:', workoutError);
          error = 'Error al cargar el entrenamiento.';
        }
        loading = false;
        return;
      }
      
      if (workoutAssignment) {
        // Format workout data
        const workoutData = workoutAssignment.workouts as any;
        workout = {
          id: workoutAssignment.workout_id,
          title: workoutData.title,
          description: workoutData.description,
          createdAt: workoutData.created_at,
          assignedAt: workoutAssignment.assigned_at,
          completed: workoutAssignment.status === 'completed',
          completedAt: workoutAssignment.status === 'completed' ? workoutAssignment.assigned_at : null
        };
        
        // 2. Fetch exercises for this workout
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('id, name, sets, reps, rest_seconds, notes, exercise_order')
          .eq('workout_id', workoutId)
          .order('exercise_order', { ascending: true });
        
        if (exerciseError) {
          console.error('Error fetching exercises:', exerciseError);
          error = 'Error al cargar los ejercicios.';
        } else if (exerciseData) {
          // Format exercises data
          exercises = exerciseData.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest_seconds,
            notes: ex.notes,
            order: ex.exercise_order
          }));
        }
      } else {
        error = 'No se encontró el entrenamiento.';
      }
    } catch (err) {
      console.error('Error loading workout data:', err);
      error = 'Ha ocurrido un error al cargar el entrenamiento.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-4xl mx-auto px-4">
  <section class="mb-8">
    <div class="flex justify-between items-center">
      <Button href="/dashboard/athlete/workouts" variant="outline" size="sm">
        ← Volver a entrenamientos
      </Button>
    </div>
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
        <p class="mt-4 text-gray-600">Cargando entrenamiento...</p>
      </div>
    </div>
  {:else if workout}
    <!-- Workout Header -->
    <div class="mb-8">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-purple-900">{workout.title}</h1>
          <p class="text-gray-600 mt-2">{workout.description}</p>
        </div>
        <span class={`px-3 py-1 rounded-full text-sm font-medium ${workout.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {workout.completed ? 'Completado' : 'Pendiente'}
        </span>
      </div>
      
      <div class="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div class="text-xs font-medium text-gray-500 uppercase">Fecha asignada</div>
          <div class="mt-1 text-sm text-gray-900">{formatDate(workout.assignedAt || workout.createdAt)}</div>
        </div>
        <div>
          <div class="text-xs font-medium text-gray-500 uppercase">Ejercicios</div>
          <div class="mt-1 text-sm text-gray-900">{exercises.length}</div>
        </div>
        {#if workout.completed}
        <div>
          <div class="text-xs font-medium text-gray-500 uppercase">Completado el</div>
          <div class="mt-1 text-sm text-gray-900">{formatDate(workout.completedAt)}</div>
        </div>
        {/if}
      </div>
      
      {#if !workout.completed}
        <div class="mt-6">
          <Button 
            on:click={markWorkoutCompleted} 
            variant="primary" 
            disabled={loading}
          >
            Marcar entrenamiento como completado
          </Button>
        </div>
      {/if}
    </div>
    
    <!-- Exercises Section -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Ejercicios</h2>
      
      {#if exercises.length === 0}
        <Card>
          <div class="p-6 text-center">
            <p class="text-gray-500">Este entrenamiento no tiene ejercicios asignados.</p>
          </div>
        </Card>
      {:else}
        <div class="space-y-4">
          {#each exercises as exercise, index}
            <Card>
              <div class="p-5">
                <div class="flex items-center">
                  <div class="bg-purple-100 text-purple-800 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 ml-3">{exercise.name}</h3>
                </div>
                
                <div class="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div class="text-xs font-medium text-gray-500 uppercase">Series</div>
                    <div class="mt-1 text-lg font-semibold text-gray-900">{exercise.sets}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium text-gray-500 uppercase">Repeticiones</div>
                    <div class="mt-1 text-lg font-semibold text-gray-900">{exercise.reps}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium text-gray-500 uppercase">Descanso</div>
                    <div class="mt-1 text-lg font-semibold text-gray-900">{exercise.rest} seg</div>
                  </div>
                </div>
                
                {#if exercise.notes}
                  <div class="mt-4">
                    <div class="text-xs font-medium text-gray-500 uppercase">Notas</div>
                    <div class="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
                      {exercise.notes}
                    </div>
                  </div>
                {/if}
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div> 