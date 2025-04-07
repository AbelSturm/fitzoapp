<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { questionnairesService } from '$lib/services/questionnaires';
  
  // Questionnaire interface
  interface AthleteQuestionnaire {
    id: string;
    title: string;
    description: string;
    assignedDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
  }
  
  // Page state
  let questionnaires: AthleteQuestionnaire[] = [];
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
  
  // Load questionnaires data
  onMount(async () => {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        error = 'No se ha encontrado una sesión activa.';
        loading = false;
        return;
      }
      
      // Fetch assigned questionnaires
      const assignmentsList = await questionnairesService.getAthleteQuestionnaires();
        
      if (assignmentsList.length > 0) {
        // Transform data to match our interface
        questionnaires = assignmentsList.map(assignment => ({
          id: assignment.questionnaire_id,
          title: assignment.questionnaire?.title || 'Sin título',
          description: assignment.questionnaire?.description || '',
          assignedDate: assignment.assigned_at || new Date().toISOString(),
          status: assignment.status || 'pending',
          dueDate: assignment.due_date
        }));
      }
    } catch (err) {
      console.error('Error loading questionnaires data:', err);
      error = 'Ha ocurrido un error al cargar los cuestionarios.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-7xl mx-auto px-4">
  <section class="mb-8">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl md:text-3xl font-bold text-purple-900">Mis Cuestionarios</h1>
      <Button href="/dashboard/athlete" variant="outline" size="sm">
        Volver al Dashboard
      </Button>
    </div>
    <p class="text-gray-600 mt-2">
      Aquí puedes ver todos los cuestionarios asignados y responder a ellos.
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
        <p class="mt-4 text-gray-600">Cargando cuestionarios...</p>
      </div>
    </div>
  {:else if questionnaires.length === 0}
    <Card>
      <div class="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mt-4">No tienes cuestionarios asignados</h3>
        <p class="text-gray-500 mt-2">
          Cuando tu entrenador te asigne cuestionarios, aparecerán aquí.
        </p>
      </div>
    </Card>
  {:else}
    <div class="space-y-6">
      <!-- Questionnaires list -->
      {#each questionnaires as questionnaire}
        <Card padding="p-5">
          <div class="flex flex-col md:flex-row justify-between">
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <h3 class="text-lg font-semibold text-gray-900">{questionnaire.title}</h3>
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                  questionnaire.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : questionnaire.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {questionnaire.status === 'completed' 
                    ? 'Completado' 
                    : questionnaire.status === 'in_progress'
                      ? 'En progreso'
                      : 'Pendiente'}
                </span>
              </div>
              <p class="text-gray-600 mt-2">{questionnaire.description}</p>
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs font-medium text-gray-500 uppercase">Fecha asignada</div>
                  <div class="mt-1 text-sm text-gray-900">{formatDate(questionnaire.assignedDate)}</div>
                </div>
                {#if questionnaire.dueDate}
                <div>
                  <div class="text-xs font-medium text-gray-500 uppercase">Fecha límite</div>
                  <div class="mt-1 text-sm text-gray-900">{formatDate(questionnaire.dueDate)}</div>
                </div>
                {/if}
              </div>
            </div>
            
            <div class="flex flex-col gap-2 mt-4 md:mt-0 md:ml-6 md:w-48">
              {#if questionnaire.status !== 'completed'}
                <Button 
                  href={`/dashboard/athlete/questionnaires/${questionnaire.id}`} 
                  variant="primary" 
                  fullWidth={true}
                >
                  {questionnaire.status === 'in_progress' ? 'Continuar' : 'Responder'}
                </Button>
              {:else}
                <Button 
                  href={`/dashboard/athlete/questionnaires/${questionnaire.id}`} 
                  variant="outline" 
                  fullWidth={true}
                >
                  Ver respuestas
                </Button>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div> 