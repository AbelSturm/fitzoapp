<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { workoutsService, type Workout } from '$lib/services/workouts';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // State
  let workouts: Workout[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      workouts = await workoutsService.getTrainerWorkouts();
    } catch (err) {
      console.error('Error loading workouts:', err);
      error = 'No se pudieron cargar los entrenamientos. Por favor, intenta de nuevo más tarde.';
    } finally {
      loading = false;
    }
  });

  function handleCreateWorkout() {
    goto('/dashboard/trainer/workouts/new');
  }
</script>

<div class="max-w-5xl mx-auto">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Mis Entrenamientos</h1>
    <Button variant="primary" on:click={handleCreateWorkout}>
      Crear entrenamiento
    </Button>
  </div>

  {#if loading}
    <div class="py-10 text-center">
      <p class="text-gray-500">Cargando entrenamientos...</p>
    </div>
  {:else if error}
    <Card>
      <div class="p-4 text-center">
        <p class="text-red-500">{error}</p>
        <Button variant="outline" on:click={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </Card>
  {:else if workouts.length === 0}
    <Card>
      <div class="p-8 text-center">
        <h3 class="text-lg font-medium mb-2">Aún no has creado ningún entrenamiento</h3>
        <p class="text-gray-500 mb-6">
          Comienza creando tu primer entrenamiento y asígnalo a tus atletas.
        </p>
        <Button variant="primary" on:click={handleCreateWorkout}>
          Crear mi primer entrenamiento
        </Button>
      </div>
    </Card>
  {:else}
    <div class="grid gap-4">
      {#each workouts as workout}
        <Card>
          <div class="p-4 flex justify-between items-start">
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
            <div class="flex space-x-2">
              <Button 
                href={`/dashboard/trainer/workouts/${workout.id}`} 
                variant="outline" 
                size="sm"
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div> 