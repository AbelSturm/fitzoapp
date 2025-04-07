<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { questionnairesService, type Questionnaire, type Question } from '$lib/services/questionnaires';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  
  const questionnaireId = $page.params.id;
  let questionnaire: Questionnaire | null = null;
  let questions: Question[] = [];
  let assignedAthleteNames: string[] = [];
  let showDeleteModal = false;
  let isDeleting = false;
  let loading = true;
  let error = false;
  
  // Question type display names
  const questionTypeMap = {
    'short_text': 'Texto corto',
    'long_text': 'Texto largo',
    'number': 'Número',
    'scale': 'Escala (1-10)'
  };
  
  onMount(async () => {
    try {
      // Load questionnaire with questions from Supabase
      const result = await questionnairesService.getQuestionnaire(questionnaireId);
      
      if (!result) {
        error = true;
        return;
      }
      
      questionnaire = result;
      questions = result.questions || [];
      
      // Get assigned athletes (to be implemented later)
      // For now, we'll leave it empty
    } catch (err) {
      console.error('Error loading questionnaire:', err);
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
  
  // Delete questionnaire
  async function deleteQuestionnaire() {
    isDeleting = true;
    
    try {
      const success = await questionnairesService.deleteQuestionnaire(questionnaireId);
      if (success) {
        goto('/dashboard/trainer/questionnaires');
      } else {
        throw new Error('Failed to delete questionnaire');
      }
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      isDeleting = false;
      showDeleteModal = false;
    }
  }
</script>

<!-- Loading state -->
{#if loading}
  <div class="max-w-4xl mx-auto">
    <Card>
      <div class="text-center py-8">
        <p class="text-gray-500">Cargando cuestionario...</p>
      </div>
    </Card>
  </div>
<!-- Error state -->
{:else if error || !questionnaire}
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center mb-8">
      <div class="mr-4">
        <Button 
          href="/dashboard/trainer/questionnaires" 
          variant="outline" 
          size="sm"
        >
          Volver
        </Button>
      </div>
      <h1 class="text-3xl font-bold">Cuestionario no encontrado</h1>
    </div>
    
    <Card>
      <p class="text-gray-500">
        El cuestionario que buscas no existe o ha sido eliminado.
      </p>
    </Card>
  </div>
<!-- Questionnaire details -->
{:else}
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <div class="mr-4">
          <Button 
            href="/dashboard/trainer/questionnaires" 
            variant="outline" 
            size="sm"
          >
            Volver
          </Button>
        </div>
        <h1 class="text-3xl font-bold">{questionnaire.title}</h1>
      </div>
      
      <div class="flex space-x-4">
        <Button 
          href={`/dashboard/trainer/questionnaires/${questionnaireId}/edit`} 
          variant="outline"
        >
          Editar
        </Button>
        
        <Button 
          variant="danger"
          on:click={() => showDeleteModal = true}
        >
          Eliminar
        </Button>
      </div>
    </div>
    
    <div class="space-y-8">
      <!-- Basic information -->
      <Card title="Información">
        <div class="space-y-4">
          {#if questionnaire.description}
            <div>
              <h3 class="text-sm font-medium text-gray-500">Descripción</h3>
              <p class="mt-1">{questionnaire.description}</p>
            </div>
          {/if}
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Fecha de creación</h3>
            <p class="mt-1">{formatDate(questionnaire.created_at || '')}</p>
          </div>
          
          {#if assignedAthleteNames.length > 0}
            <div>
              <h3 class="text-sm font-medium text-gray-500">Asignado a</h3>
              <ul class="mt-1 list-disc list-inside">
                {#each assignedAthleteNames as name}
                  <li>{name}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div>
              <h3 class="text-sm font-medium text-gray-500">Asignado a</h3>
              <p class="mt-1 italic">No está asignado a ningún atleta</p>
            </div>
          {/if}
        </div>
      </Card>
      
      <!-- Questions -->
      <Card title="Preguntas">
        <div class="space-y-6">
          {#if questions.length > 0}
            {#each questions as question, index}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium">Pregunta {index + 1}</h3>
                    <p class="mt-2">{question.text}</p>
                  </div>
                  <div class="text-sm bg-gray-100 px-3 py-1 rounded-full">
                    {questionTypeMap[question.type] || question.type}
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <p class="text-gray-500 italic">
              Este cuestionario no tiene preguntas.
            </p>
          {/if}
        </div>
      </Card>
      
      <!-- Responses overview (if any) -->
      <Card title="Respuestas">
        <p class="text-gray-500 italic">
          Esta funcionalidad estará disponible pronto.
        </p>
      </Card>
    </div>
  </div>
  
  <!-- Delete confirmation modal -->
  {#if showDeleteModal}
    <Modal 
      title="Eliminar cuestionario" 
      onClose={() => showDeleteModal = false}
    >
      <p class="mb-4">
        ¿Estás seguro de que quieres eliminar el cuestionario <strong>{questionnaire.title}</strong>?
        Esta acción no se puede deshacer.
      </p>
      
      <div class="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          on:click={() => showDeleteModal = false}
        >
          Cancelar
        </Button>
        
        <Button 
          variant="danger" 
          disabled={isDeleting}
          on:click={deleteQuestionnaire}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </Modal>
  {/if}
{/if}