<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { questionnairesService, type Questionnaire, type Question, type QuestionnaireAssignment } from '$lib/services/questionnaires';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { supabase } from '$lib/supabaseClient';

  const questionnaireId = $page.params.id;
  
  let questionnaire: Questionnaire | null = null;
  let assignments: QuestionnaireAssignment[] = [];
  let loading = true;
  let error: string | null = null;

  // Load questionnaire details
  onMount(async () => {
    try {
      loading = true;
      
      // Load questionnaire details
      questionnaire = await questionnairesService.getQuestionnaire(questionnaireId);
      
      if (!questionnaire) {
        error = 'Questionnaire not found';
        return;
      }
      
      // Load questionnaire assignments directly
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('questionnaire_assignments')
        .select('*')
        .eq('questionnaire_id', questionnaireId);
        
      if (!assignmentsError) {
        assignments = assignmentsData || [];
      } else {
        console.error('Error loading questionnaire assignments:', assignmentsError);
      }
      
    } catch (err: any) {
      console.error('Error loading questionnaire details:', err);
      error = err.message || 'Failed to load questionnaire details';
    } finally {
      loading = false;
    }
  });

  // Delete a questionnaire
  async function deleteQuestionnaire() {
    if (!confirm('Are you sure you want to delete this questionnaire?')) {
      return;
    }
    
    try {
      const success = await questionnairesService.deleteQuestionnaire(questionnaireId);
      
      if (success) {
        // Navigate back to questionnaires page
        window.location.href = '/dashboard/admin/questionnaires';
      } else {
        error = 'Failed to delete questionnaire';
      }
    } catch (err: any) {
      console.error('Error deleting questionnaire:', err);
      error = err.message || 'Failed to delete questionnaire';
    }
  }

  // Format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get user details
  async function getUserName(userId: string): Promise<string> {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .single();
      
      if (fetchError || !data) {
        return 'Unknown User';
      }
      
      if (data.first_name || data.last_name) {
        return `${data.first_name || ''} ${data.last_name || ''}`.trim();
      }
      
      return data.email;
    } catch (err) {
      console.error('Error fetching user details:', err);
      return 'Unknown User';
    }
  }

  // Get status badge class
  function getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get question type display
  function getQuestionTypeDisplay(type: string): string {
    switch (type) {
      case 'short_text':
        return 'Short Text';
      case 'long_text':
        return 'Long Text';
      case 'number':
        return 'Number';
      case 'scale':
        return 'Scale (1-10)';
      default:
        return type;
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center">
      <div class="mr-4">
        <Button href="/dashboard/admin/questionnaires" variant="outline" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Questionnaires
        </Button>
      </div>
      <h1 class="text-3xl font-bold">Questionnaire Details</h1>
    </div>
    
    {#if questionnaire}
      <button
        on:click={deleteQuestionnaire}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Questionnaire
      </button>
    {/if}
  </div>

  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="p-12 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
    </div>
  {:else if questionnaire}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="md:col-span-2">
        <!-- Questionnaire details -->
        <Card title="Questionnaire Information">
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium">{questionnaire.title}</h3>
              <p class="text-gray-500 mt-1">{questionnaire.description || 'No description provided'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-gray-500">Created:</span>
                <p>{formatDate(questionnaire.created_at)}</p>
              </div>
              
              <div>
                <span class="text-sm text-gray-500">Created by:</span>
                <p>{#await getUserName(questionnaire.created_by || '')}{:then name}{name}{/await}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- Questions -->
        <div class="mt-6">
          <Card title={`Questions (${questionnaire.questions?.length || 0})`}>
            {#if !questionnaire.questions || questionnaire.questions.length === 0}
              <p class="text-gray-500">No questions found for this questionnaire.</p>
            {:else}
              <div class="space-y-4">
                {#each questionnaire.questions as question, index}
                  <div class="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-medium">{index + 1}. {question.text}</h4>
                        <p class="text-sm text-gray-600 mt-1">
                          Type: {getQuestionTypeDisplay(question.type)}
                        </p>
                      </div>
                      <span class="text-xs text-gray-500">
                        Order: {question.question_order}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
        </div>
      </div>

      <!-- Assignments -->
      <div>
        <Card title={`Assignments (${assignments.length})`}>
          {#if assignments.length === 0}
            <p class="text-gray-500">This questionnaire has not been assigned to any athletes.</p>
          {:else}
            <div class="space-y-3">
              {#each assignments as assignment}
                <div class="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-medium">
                        {#await getUserName(assignment.assigned_to)}
                          Loading...
                        {:then name}
                          {name}
                        {/await}
                      </span>
                      
                      <div class="flex flex-col text-sm text-gray-500 mt-1">
                        <span>Assigned: {formatDate(assignment.assigned_at)}</span>
                        {#if assignment.due_date}
                          <span>Due: {formatDate(assignment.due_date)}</span>
                        {/if}
                      </div>
                    </div>
                    
                    <span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusBadgeClass(assignment.status)}">
                      {assignment.status || 'pending'}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card>
      </div>
    </div>
  {:else}
    <div class="p-8 text-center text-gray-500">
      Questionnaire not found or has been deleted.
    </div>
  {/if}
</div> 