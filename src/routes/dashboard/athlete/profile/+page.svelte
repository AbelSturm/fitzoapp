<script lang="ts">
  import { onMount } from 'svelte';
  import { athletesService, type Athlete } from '$lib/services/athletes';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  let trainers: Athlete[] = [];
  let loading = true;
  let error = false;
  
  // Load trainers on mount
  onMount(async () => {
    try {
      trainers = await athletesService.getAthleteTrainers();
    } catch (err) {
      console.error('Error loading trainers:', err);
      error = true;
    } finally {  
      loading = false;
    }
  });
  
  // Format date
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('es', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-8">Mi perfil</h1>
  
  <!-- Trainers Section -->
  <div class="mb-8">
    <Card title="Mis entrenadores">
      <!-- Loading state -->
      {#if loading}
        <div class="text-center py-8">
          <p class="text-gray-500">Cargando entrenadores...</p>
        </div>
      <!-- Error state -->
      {:else if error}
        <div class="text-center py-8">
          <p class="text-red-500 mb-4">Error al cargar los entrenadores</p>
          <Button on:click={() => window.location.reload()} variant="outline">
            Intentar de nuevo
          </Button>
        </div>
      <!-- Trainers List -->
      {:else if trainers.length > 0}
        <div class="space-y-4">
          {#each trainers as trainer}
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 class="text-lg font-medium">{trainer.name}</h3>
                  <p class="text-gray-600">{trainer.email}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    Asignado desde: {formatDate(trainer.created_at || '')}
                  </p>
                </div>
                
                <div class="mt-4 md:mt-0">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {trainer.status || 'Activo'}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8">
          <p class="text-gray-500">No tienes entrenadores asignados.</p>
        </div>
      {/if}
    </Card>
  </div>
  
  <!-- Personal Information -->
  <Card title="Información personal">
    <p class="text-gray-500 text-center py-4">
      Pronto podrás actualizar tu información personal aquí.
    </p>
  </Card>
</div> 