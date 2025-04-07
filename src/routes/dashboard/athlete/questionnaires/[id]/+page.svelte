<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import { questionnairesService } from '$lib/services/questionnaires';
  import type { Question, QuestionType, QuestionnaireResponse, QuestionnaireAssignment } from '$lib/services/questionnaires';

  // Get questionnaire ID from URL
  const questionnaireId = $page.params.id;
  
  // Page state
  let loading = true;
  let submitting = false;
  let error: string | null = null;
  let success = false;
  
  // Questionnaire data
  let questionnaire = {
    id: '',
    title: '',
    description: '',
    assignedAt: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed'
  };
  
  let questions: Question[] = [];
  let responses: Record<string, string | number> = {};
  let assignmentId = '';
  let existingResponses: QuestionnaireResponse[] = [];
  
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
  
  // Validation function
  function validateResponses() {
    // Check if all questions have been answered
    const unansweredQuestions = questions.filter(q => {
      if (q.type === 'scale' || q.type === 'number') {
        return responses[q.id as string] === undefined;
      } else {
        return !responses[q.id as string] || (responses[q.id as string] as string).trim() === '';
      }
    });
    
    if (unansweredQuestions.length > 0) {
      error = 'Por favor, responde a todas las preguntas.';
      return false;
    }
    
    error = null;
    return true;
  }
  
  // Submit questionnaire responses
  async function submitQuestionnaire() {
    if (!validateResponses()) return;
    
    try {
      submitting = true;
      error = null;
      
      // Format responses for submission
      const formattedResponses = Object.keys(responses).map(questionId => {
        const question = questions.find(q => q.id === questionId);
        
        if (question?.type === 'scale' || question?.type === 'number') {
          return {
            questionId,
            number: Number(responses[questionId])
          };
        } else {
          return {
            questionId,
            text: responses[questionId].toString()
          };
        }
      });
      
      // Submit responses to Supabase
      const submitSuccess = await questionnairesService.submitResponses(
        assignmentId,
        formattedResponses
      );
      
      if (submitSuccess) {
        questionnaire.status = 'completed';
        success = true;
      } else {
        error = 'Hubo un error al enviar tus respuestas. Inténtalo de nuevo.';
      }
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      error = 'Ha ocurrido un error al enviar el cuestionario.';
    } finally {
      submitting = false;
    }
  }
  
  // Load questionnaire and questions
  onMount(async () => {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        error = 'No se ha encontrado una sesión activa.';
        loading = false;
        return;
      }
      
      // Get the questionnaire assignment
      const assignments = await questionnairesService.getAthleteQuestionnaires();
      const assignment = assignments.find(a => a.questionnaire_id === questionnaireId);
      
      if (!assignment || !assignment.questionnaire) {
        error = 'No se ha encontrado el cuestionario solicitado.';
        loading = false;
        return;
      }
      
      // Store the assignment ID
      assignmentId = assignment.id || '';
      
      // Format questionnaire data
      questionnaire = {
        id: assignment.questionnaire_id,
        title: assignment.questionnaire.title,
        description: assignment.questionnaire.description || '',
        assignedAt: assignment.assigned_at || '',
        status: assignment.status || 'pending'
      };
      
      // Get questions for this questionnaire
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .order('question_order', { ascending: true });
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        error = 'Error al cargar las preguntas.';
        loading = false;
        return;
      }
      
      if (questionsData) {
        questions = questionsData;
      }
      
      // If questionnaire is already completed, fetch existing responses
      if (questionnaire.status === 'completed') {
        existingResponses = await questionnairesService.getAssignmentResponses(assignmentId);
        
        // Format responses into our responses object
        existingResponses.forEach(response => {
          if (response.response_number !== null && response.response_number !== undefined) {
            responses[response.question_id] = response.response_number;
          } else if (response.response_text) {
            responses[response.question_id] = response.response_text;
          }
        });
      } 
      // If questionnaire is not completed, update status to in_progress
      else if (questionnaire.status === 'pending') {
        await questionnairesService.updateAssignmentStatus(assignmentId, 'in_progress');
        questionnaire.status = 'in_progress';
      }
      
    } catch (err) {
      console.error('Error loading questionnaire data:', err);
      error = 'Ha ocurrido un error al cargar el cuestionario.';
    } finally {
      loading = false;
    }
  });
  
  // Helper to render the appropriate input for different question types
  function renderQuestionInput(question: Question, readOnly: boolean) {
    const questionId = question.id as string;
    
    switch(question.type) {
      case 'short_text':
        return `
          <Input
            type="text"
            value="${responses[questionId] as string || ''}"
            on:input="{(e) => { if (!readOnly) responses[questionId] = e.currentTarget.value }}"
            placeholder="Tu respuesta"
            disabled={${readOnly}}
          />
        `;
      case 'long_text':
        return `
          <TextArea
            value="${responses[questionId] as string || ''}"
            on:input="{(e) => { if (!readOnly) responses[questionId] = e.currentTarget.value }}"
            placeholder="Tu respuesta detallada"
            rows={4}
            disabled={${readOnly}}
          />
        `;
      case 'number':
        return `
          <Input
            type="number"
            value="${responses[questionId] as number || ''}"
            on:input="{(e) => { if (!readOnly) responses[questionId] = Number(e.currentTarget.value) }}"
            placeholder="0"
            disabled={${readOnly}}
          />
        `;
      case 'scale':
        const scaleValue = responses[questionId] !== undefined ? responses[questionId] : 5;
        return `
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">1</span>
              <span class="text-sm font-medium text-gray-500">10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value="${scaleValue}"
              on:input="{(e) => { if (!readOnly) responses[questionId] = Number(e.currentTarget.value) }}"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              disabled={${readOnly}}
            />
            <div class="text-center">
              <span class="text-lg font-semibold text-purple-800">${scaleValue}</span>
            </div>
          </div>
        `;
      default:
        return null;
    }
  }
</script>

<div class="max-w-4xl mx-auto px-4">
  <section class="mb-8">
    <div class="flex justify-between items-center">
      <Button href="/dashboard/athlete/questionnaires" variant="outline" size="sm">
        ← Volver a cuestionarios
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
  
  {#if success}
    <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">Tus respuestas han sido enviadas correctamente.</p>
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
        <p class="mt-4 text-gray-600">Cargando cuestionario...</p>
      </div>
    </div>
  {:else if questionnaire.id}
    <!-- Questionnaire Header -->
    <div class="mb-8">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-purple-900">{questionnaire.title}</h1>
          <p class="text-gray-600 mt-2">{questionnaire.description}</p>
        </div>
        <span class={`px-3 py-1 rounded-full text-sm font-medium ${
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
      
      {#if questionnaire.assignedAt}
        <div class="mt-4">
          <div class="text-xs font-medium text-gray-500 uppercase">Fecha asignada</div>
          <div class="mt-1 text-sm text-gray-900">{formatDate(questionnaire.assignedAt)}</div>
        </div>
      {/if}
    </div>
    
    <!-- Questions Section -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Preguntas</h2>
      
      {#if questions.length === 0}
        <Card>
          <div class="p-6 text-center">
            <p class="text-gray-500">Este cuestionario no tiene preguntas.</p>
          </div>
        </Card>
      {:else}
        <div class="space-y-6">
          {#each questions as question, index}
            <Card>
              <div class="p-5">
                <div class="mb-4">
                  <div class="flex items-center">
                    <div class="bg-purple-100 text-purple-800 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 ml-3">{question.text}</h3>
                  </div>
                  
                  <div class="mt-4">
                    <div class="text-xs font-medium text-gray-500 uppercase mb-2">
                      {#if question.type === 'short_text'}
                        Respuesta corta
                      {:else if question.type === 'long_text'}
                        Respuesta detallada
                      {:else if question.type === 'number'}
                        Número
                      {:else if question.type === 'scale'}
                        Escala (1-10)
                      {/if}
                    </div>
                    
                    <div class="mt-1">
                      {#if questionnaire.status === 'completed'}
                        {@html renderQuestionInput(question, true)}
                      {:else}
                        {@html renderQuestionInput(question, false)}
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          {/each}
          
          {#if questionnaire.status !== 'completed'}
            <div class="mt-8 flex justify-end">
              <Button 
                on:click={submitQuestionnaire} 
                variant="primary" 
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar respuestas'}
              </Button>
            </div>
          {/if}
        </div>
      {/if}
    </section>
  {:else}
    <Card>
      <div class="p-6 text-center">
        <p class="text-gray-500">No se ha encontrado el cuestionario solicitado.</p>
      </div>
    </Card>
  {/if}
</div> 