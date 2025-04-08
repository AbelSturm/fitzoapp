<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { questionnairesService } from '$lib/services/questionnaires';
  
  // Define extended questionnaire type to include question_count
  interface QuestionnaireWithCount {
    id: string;
    title: string;
    description?: string;
    created_by?: string;
    created_at?: string;
    question_count?: number;
  }

  let questionnaires: QuestionnaireWithCount[] = [];
  let loading = true;
  let error: string | null = null;
  let searchTerm = '';
  let trainerFilter = '';

  // Load questionnaires on mount
  onMount(async () => {
    await loadQuestionnaires();
  });

  // Load all questionnaires from database
  async function loadQuestionnaires() {
    try {
      loading = true;
      error = null;

      // Query questionnaires directly from the questionnaires table
      const { data, error: fetchError } = await supabase
        .from('questionnaires')
        .select('id, title, description, created_at, created_by')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      questionnaires = data || [];

      // If successful, get question counts for each questionnaire
      if (!fetchError && data) {
        // Get question counts in a separate query
        for (const questionnaire of data) {
          const { count, error: countError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('questionnaire_id', questionnaire.id);
            
          if (!countError) {
            (questionnaire as QuestionnaireWithCount).question_count = count || 0;
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading questionnaires:', err);
      error = err.message || 'Failed to load questionnaires';
    } finally {
      loading = false;
    }
  }

  // Function to get trainer details
  async function loadTrainers() {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'trainer');
      
      if (fetchError) throw fetchError;
      
      return data || [];
    } catch (err) {
      console.error('Error loading trainers:', err);
      return [];
    }
  }

  // Delete a questionnaire
  async function deleteQuestionnaire(id: string) {
    if (!confirm('Are you sure you want to delete this questionnaire?')) {
      return;
    }
    
    try {
      const success = await questionnairesService.deleteQuestionnaire(id);
      
      if (success) {
        // Refresh the questionnaire list
        await loadQuestionnaires();
      } else {
        error = 'Failed to delete questionnaire';
      }
    } catch (err: any) {
      console.error('Error deleting questionnaire:', err);
      error = err.message || 'Failed to delete questionnaire';
    }
  }

  // Filter questionnaires based on search term and trainer filter
  $: filteredQuestionnaires = questionnaires.filter(questionnaire => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (questionnaire.description && questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply trainer filter
    const matchesTrainer = trainerFilter === '' || (questionnaire.created_by === trainerFilter);
    
    return matchesSearch && matchesTrainer;
  });

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="max-w-7xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Questionnaire Management</h1>

  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Filters & search -->
  <div class="mb-6">
    <Card>
      <div class="p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div class="flex-1 min-w-0">
            <label for="search" class="sr-only">Search questionnaires</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                bind:value={searchTerm}
                placeholder="Search questionnaires by title or description"
                class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div class="w-full md:w-auto">
            <select
              bind:value={trainerFilter}
              class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Trainers</option>
              {#await loadTrainers()}
                <option disabled>Loading trainers...</option>
              {:then trainers}
                {#each trainers as trainer}
                  <option value={trainer.id}>
                    {trainer.first_name || ''} {trainer.last_name || ''} ({trainer.email})
                  </option>
                {/each}
              {/await}
            </select>
          </div>
        </div>
        
        <div class="mt-4 flex items-center justify-between flex-wrap gap-2">
          <div class="text-sm text-gray-500">
            {filteredQuestionnaires.length} questionnaires found
          </div>
          
          <div class="flex space-x-2">
            <button
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
              on:click={() => {
                searchTerm = '';
                trainerFilter = '';
              }}
            >
              Clear Filters
            </button>
            
            <button
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              on:click={loadQuestionnaires}
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <!-- Questionnaires list -->
  <Card>
    {#if loading}
      <div class="p-8 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900"></div>
      </div>
    {:else if filteredQuestionnaires.length === 0}
      <div class="p-8 text-center text-gray-500">
        No questionnaires found matching your filters.
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredQuestionnaires as questionnaire}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{questionnaire.title}</div>
                  <div class="text-sm text-gray-500">
                    {#if questionnaire.description}
                      {questionnaire.description.length > 50 ? 
                        `${questionnaire.description.substring(0, 50)}...` : 
                        questionnaire.description}
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {questionnaire.question_count || 0} questions
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {questionnaire.created_at ? formatDate(questionnaire.created_at) : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <Button 
                      href={`/dashboard/admin/questionnaires/${questionnaire.id}`} 
                      variant="outline" 
                      size="sm"
                    >
                      View Details
                    </Button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      on:click={() => deleteQuestionnaire(questionnaire.id || '')}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div> 