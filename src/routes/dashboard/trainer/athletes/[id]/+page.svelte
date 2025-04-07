<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { athletesService, type Athlete } from '$lib/services/athletes';
  import { questionnairesService } from '$lib/services/questionnaires';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  const athleteId = $page.params.id;
  let athlete: Athlete | null = null;
  let loading = true;
  let error = false;
  
  // Questionnaire assignments
  let assignedQuestionnaires = [];
  let loadingQuestionnaires = true;
  
  onMount(async () => {
    try {
      // Get athlete data
      const athletes = await athletesService.getTrainerAthletes();
      athlete = athletes.find(a => a.id === athleteId) || null;
      
      if (!athlete) {
        error = true;
        return;
      }
      
      // Get questionnaire assignments for this athlete
      // This will be implemented later when we have the assignments functionality
      loadingQuestionnaires = false;
    } catch (err) {
      console.error('Error loading athlete details:', err);
      error = true;
    } finally {
      loading = false;
    }
  });
  
  // Format date
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Remove athlete
  async function removeAthlete() {
    if (!confirm('¿Estás seguro de que quieres eliminar este atleta de tu lista?')) {
      return;
    }
    
    try {
      await athletesService.removeAthlete(athleteId);
      goto('/dashboard/trainer/athletes');
    } catch (err) {
      console.error('Error removing athlete:', err);
      alert('Error al eliminar atleta');
    }
  }
</script>

<!-- Loading state -->
{#if loading}
  <div class="max-w-4xl mx-auto">
    <Card>
      <div class="text-center py-8">
        <p class="text-gray-500">Cargando detalles del atleta...</p>
      </div>
    </Card>
  </div>
<!-- Error state -->
{:else if error || !athlete}
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center mb-8">
      <div class="mr-4">
        <Button 
          href="/dashboard/trainer/athletes" 
          variant="outline" 
          size="sm"
        >
          Volver
        </Button>
      </div>
      <h1 class="text-3xl font-bold">Atleta no encontrado</h1>
    </div>
    
    <Card>
      <p class="text-gray-500">
        El atleta que buscas no existe o no tienes acceso a él.
      </p>
    </Card>
  </div>
<!-- Athlete details -->
{:else}
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <div class="mr-4">
          <Button 
            href="/dashboard/trainer/athletes" 
            variant="outline" 
            size="sm"
          >
            Volver
          </Button>
        </div>
        <h1 class="text-3xl font-bold">{athlete.name}</h1>
      </div>
      
      <div class="flex space-x-4">
        <Button 
          variant="danger"
          on:click={removeAthlete}
        >
          Eliminar
        </Button>
      </div>
    </div>
    
    <div class="space-y-8">
      <!-- Basic information -->
      <Card title="Información">
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Correo electrónico</h3>
            <p class="mt-1">{athlete.email}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Fecha de asignación</h3>
            <p class="mt-1">{formatDate(athlete.created_at || '')}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Estado</h3>
            <p class="mt-1">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {athlete.status || 'Activo'}
              </span>
            </p>
          </div>
        </div>
      </Card>
      
      <!-- Assigned questionnaires -->
      <Card title="Cuestionarios asignados">
        {#if loadingQuestionnaires}
          <div class="text-center py-4">
            <p class="text-gray-500">Cargando cuestionarios...</p>
          </div>
        {:else if assignedQuestionnaires.length === 0}
          <div class="text-center py-4">
            <p class="text-gray-500">No hay cuestionarios asignados a este atleta</p>
            <div class="mt-4">
              <Button 
                href="/dashboard/trainer/questionnaires/new" 
                variant="outline"
                size="sm"
              >
                Crear nuevo cuestionario
              </Button>
            </div>
          </div>
        {:else}
          <div class="space-y-4">
            <!-- List of assigned questionnaires will go here -->
          </div>
        {/if}
      </Card>
      
      <!-- Workouts assigned (to be implemented) -->
      <Card title="Entrenamientos asignados">
        <div class="text-center py-4">
          <p class="text-gray-500">Esta funcionalidad estará disponible próximamente</p>
        </div>
      </Card>
    </div>
  </div>
{/if} 