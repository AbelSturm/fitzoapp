<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { workoutsService, type Workout, type Exercise, type WorkoutAssignment } from '$lib/services/workouts';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // Get workout ID from the URL
  const workoutId = $page.params.id;

  // State
  let workout: Workout | null = null;
  let assignedAthletes: WorkoutAssignment[] = [];
  let loading = true;
  let error = '';
  let confirmingDelete = false;

  onMount(async () => {
    try {
      // Load workout and assigned athletes
      workout = await workoutsService.getWorkout(workoutId);
      if (workout) {
        assignedAthletes = await workoutsService.getWorkoutAssignments(workoutId);
      } else {
        error = 'No se encontró el entrenamiento solicitado.';
      }
    } catch (err) {
      console.error('Error loading workout:', err);
      error = 'No se pudo cargar el entrenamiento. Por favor, intenta de nuevo más tarde.';
    } finally {
      loading = false;
    }
  });

  // Navigate back to the workouts list
  function goBack() {
    goto('/dashboard/trainer/workouts');
  }

  // Delete the workout
  async function deleteWorkout() {
    if (!confirmingDelete) {
      confirmingDelete = true;
      return;
    }

    try {
      const success = await workoutsService.deleteWorkout(workoutId);
      if (success) {
        goto('/dashboard/trainer/workouts');
      } else {
        error = 'No se pudo eliminar el entrenamiento. Por favor, intenta de nuevo.';
        confirmingDelete = false;
      }
    } catch (err) {
      console.error('Error deleting workout:', err);
      error = 'Ocurrió un error al eliminar el entrenamiento.';
      confirmingDelete = false;
    }
  }

  // Cancel deletion
  function cancelDelete() {
    confirmingDelete = false;
  }
</script>

<div class="max-w-5xl mx-auto">
  {#if loading}
    <div class="py-10 text-center">
      <p class="text-gray-500">Cargando entrenamiento...</p>
    </div>
  {:else if error}
    <Card>
      <div class="p-4 text-center">
        <p class="text-red-500">{error}</p>
        <Button variant="outline" on:click={goBack}>
          Volver
        </Button>
      </div>
    </Card>
  {:else if workout}
    <div class="mb-6 flex justify-between items-center">
      <div>
        <Button variant="outline" size="sm" on:click={goBack}>
          &larr; Volver a entrenamientos
        </Button>
        <h1 class="text-3xl font-bold mt-2">{workout.title}</h1>
      </div>
      <div class="flex space-x-2">
        <Button 
          href={`/dashboard/trainer/workouts/${workoutId}/edit`} 
          variant="outline"
        >
          Editar
        </Button>
        <Button 
          variant={confirmingDelete ? "danger" : "outline"}
          on:click={confirmingDelete ? cancelDelete : deleteWorkout}
        >
          {confirmingDelete ? 'Cancelar' : 'Eliminar'}
        </Button>
        {#if confirmingDelete}
          <Button variant="danger" on:click={deleteWorkout}>
            Confirmar eliminación
          </Button>
        {/if}
      </div>
    </div>

    <!-- Workout Details -->
    <Card>
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-2">Detalles del entrenamiento</h2>
        <p class="text-gray-700 mb-4">{workout.description}</p>
        
        <div class="text-sm text-gray-500">
          Creado: {new Date(workout.created_at || '').toLocaleDateString('es', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>
    </Card>

    <!-- Exercises -->
    <h2 class="text-xl font-semibold mt-8 mb-4">Ejercicios</h2>
    <Card>
      {#if workout.exercises && workout.exercises.length > 0}
        <div class="divide-y">
          {#each workout.exercises as exercise, index}
            <div class="p-4">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-medium">{index + 1}. {exercise.name}</h3>
                  <p class="text-gray-600 mt-1">
                    {exercise.sets} series × {exercise.reps} {exercise.reps === 1 ? 'repetición' : 'repeticiones'} | 
                    Descanso: {exercise.rest} seg
                  </p>
                  {#if exercise.notes}
                    <p class="text-sm text-gray-500 mt-2">
                      Notas: {exercise.notes}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="p-4 text-center text-gray-500">
          No hay ejercicios en este entrenamiento.
        </div>
      {/if}
    </Card>

    <!-- Assigned Athletes -->
    <h2 class="text-xl font-semibold mt-8 mb-4">Atletas asignados</h2>
    <Card>
      {#if assignedAthletes.length > 0}
        <div class="divide-y">
          {#each assignedAthletes as assignment}
            <div class="p-4 flex justify-between items-center">
              <div>
                <h3 class="font-medium">{assignment.athlete?.name || 'Atleta'}</h3>
                <p class="text-sm text-gray-500">{assignment.athlete?.email || ''}</p>
              </div>
              <div class="flex items-center">
                <span class="px-2 py-1 text-xs rounded-full {
                  assignment.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : assignment.status === 'canceled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }">
                  {assignment.status === 'completed' 
                    ? 'Completado' 
                    : assignment.status === 'canceled' 
                      ? 'Cancelado' 
                      : 'Pendiente'}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="p-4 text-center">
          <p class="text-gray-500">No hay atletas asignados a este entrenamiento.</p>
          <div class="mt-4">
            <Button 
              href={`/dashboard/trainer/workouts/${workoutId}/assign`} 
              variant="outline"
            >
              Asignar atletas
            </Button>
          </div>
        </div>
      {/if}
    </Card>
  {/if}
</div> 