<script lang="ts">
  import { onMount } from 'svelte';
  import { questionnairesService, type Questionnaire } from '$lib/services/questionnaires';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Store for questionnaires data
  let questionnaires: Questionnaire[] = [];
  let loading = true;
  let error = false;
  
  // Load questionnaires on mount
  onMount(async () => {
    try {
      questionnaires = await questionnairesService.getTrainerQuestionnaires();
    } catch (err) {
      console.error('Error loading questionnaires:', err);
      error = true;
    } finally {
      loading = false;
    }
  });
  
  // Function to get assigned athlete names for a questionnaire
  function getAssignedAthleteCount(questionnaireId: string): string {
    // This will be implemented later when we have the assignment data
    return 'Pendiente de asignar';
  }
  
  // Function to format date
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('es', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Cuestionarios</h1>
    <Button href="/dashboard/trainer/questionnaires/new" variant="primary">
      Crear nuevo cuestionario
    </Button>
  </div>
  
  <!-- Loading state -->
  {#if loading}
    <Card>
      <div class="text-center py-8">
        <p class="text-gray-500">Cargando cuestionarios...</p>
      </div>
    </Card>
  <!-- Error state -->
  {:else if error}
    <Card>
      <div class="text-center py-8">
        <p class="text-red-500 mb-4">Error al cargar los cuestionarios</p>
        <Button on:click={() => window.location.reload()} variant="outline">
          Intentar de nuevo
        </Button>
      </div>
    </Card>
  <!-- Questionnaires List -->
  {:else}
    <div class="space-y-4">
      {#if questionnaires.length > 0}
        {#each questionnaires as questionnaire}
          <Card>
            <div class="flex flex-col md:flex-row md:justify-between md:items-start">
              <div class="flex-1">
                <h3 class="text-xl font-medium">{questionnaire.title}</h3>
                {#if questionnaire.description}
                  <p class="text-gray-600 mt-1 line-clamp-2">{questionnaire.description}</p>
                {/if}
                
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                  <div>
                    <span class="font-medium">Preguntas:</span> {questionnaire.question_count || 0}
                  </div>
                  <div>
                    <span class="font-medium">Atletas:</span> {getAssignedAthleteCount(questionnaire.id || '')}
                  </div>
                  <div>
                    <span class="font-medium">Creado:</span> {formatDate(questionnaire.created_at || '')}
                  </div>
                </div>
              </div>
              
              <div class="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
                <Button 
                  href={`/dashboard/trainer/questionnaires/${questionnaire.id}`} 
                  variant="outline" 
                  size="sm"
                >
                  Ver detalles
                </Button>
              </div>
            </div>
          </Card>
        {/each}
      {:else}
        <Card>
          <div class="text-center py-8">
            <p class="text-gray-500 mb-4">No hay cuestionarios disponibles</p>
            <Button href="/dashboard/trainer/questionnaires/new" variant="primary">
              Crear nuevo cuestionario
            </Button>
          </div>
        </Card>
      {/if}
    </div>
  {/if}
</div> 