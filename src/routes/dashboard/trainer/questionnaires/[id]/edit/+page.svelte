<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { questionnairesService, type Question, type Questionnaire } from '$lib/services/questionnaires';
  import { athletes } from '$lib/stores/athletes';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  const questionnaireId = $page.params.id;
  
  // Form state
  let title = '';
  let description = '';
  let questions: Question[] = [];
  let assignedAthletes: string[] = [];
  let submitting = false;
  let loading = true;
  let error = false;
  let errors = {
    title: '',
    questions: ''
  };
  
  // Question type options
  const questionTypes = [
    { value: 'short_text', label: 'Texto corto' },
    { value: 'long_text', label: 'Texto largo' },
    { value: 'number', label: 'Número' },
    { value: 'scale', label: 'Escala (1-10)' }
  ];
  
  onMount(async () => {
    try {
      // Load questionnaire with questions from Supabase
      const questionnaire = await questionnairesService.getQuestionnaire(questionnaireId);
      
      if (!questionnaire) {
        error = true;
        return;
      }
      
      // Initialize form data
      title = questionnaire.title || '';
      description = questionnaire.description || '';
      questions = questionnaire.questions || [];
      // To be implemented with assignments later
      assignedAthletes = [];
    } catch (err) {
      console.error('Error loading questionnaire:', err);
      error = true;
    } finally {
      loading = false;
    }
  });
  
  // Add question
  function addQuestion() {
    const maxId = questions.length > 0 
      ? Math.max(...questions.map(q => parseInt(q.id || '0')))
      : 0;
      
    questions = [
      ...questions,
      {
        id: (maxId + 1).toString(),
        text: '',
        type: 'short_text',
        question_order: questions.length + 1
      }
    ];
  }
  
  // Remove question
  function removeQuestion(index: number) {
    questions = questions.filter((_, i) => i !== index);
    
    // Update question_order for remaining questions
    questions = questions.map((q, i) => ({
      ...q,
      question_order: i + 1
    }));
  }
  
  // Update question
  function updateQuestion(index: number, field: keyof Question, value: any) {
    questions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, [field]: value };
      }
      return question;
    });
  }
  
  // Toggle athlete selection
  function toggleAthlete(athleteId: string) {
    if (assignedAthletes.includes(athleteId)) {
      assignedAthletes = assignedAthletes.filter(id => id !== athleteId);
    } else {
      assignedAthletes = [...assignedAthletes, athleteId];
    }
  }
  
  // Validate form
  function validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    errors = {
      title: '',
      questions: ''
    };
    
    // Validate title
    if (!title.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    
    // Validate questions
    if (questions.length === 0) {
      errors.questions = 'Debes añadir al menos una pregunta';
      isValid = false;
    } else {
      for (const question of questions) {
        if (!question.text?.trim()) {
          errors.questions = 'Todas las preguntas deben tener un texto';
          isValid = false;
          break;
        }
      }
    }
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    submitting = true;
    
    try {
      // Update questionnaire via service
      const success = await questionnairesService.updateQuestionnaire(
        questionnaireId,
        { title, description },
        questions
      );
      
      if (success) {
        // Redirect to questionnaire detail page
        goto(`/dashboard/trainer/questionnaires/${questionnaireId}`);
      } else {
        throw new Error('Failed to update questionnaire');
      }
    } catch (error) {
      console.error('Error updating questionnaire:', error);
    } finally {
      submitting = false;
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
{:else if error}
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
<!-- Edit form -->
{:else}
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center mb-8">
      <div class="mr-4">
        <Button 
          href={`/dashboard/trainer/questionnaires/${questionnaireId}`} 
          variant="outline" 
          size="sm"
        >
          Volver
        </Button>
      </div>
      <h1 class="text-3xl font-bold">Editar cuestionario</h1>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
      <!-- Basic information -->
      <Card title="Información básica">
        <Input
          label="Título"
          name="title"
          bind:value={title}
          placeholder="Ej. Evaluación de recuperación"
          required
          error={errors.title}
        />
        
        <TextArea
          label="Descripción (opcional)"
          name="description"
          bind:value={description}
          placeholder="Explica el propósito del cuestionario"
        />
      </Card>
      
      <!-- Questions -->
      <Card title="Preguntas">
        {#if errors.questions}
          <p class="text-red-600 text-sm mb-4">{errors.questions}</p>
        {/if}
        
        <div class="space-y-6">
          {#each questions as question, index}
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-medium">Pregunta {index + 1}</h3>
                {#if questions.length > 1}
                  <button 
                    type="button" 
                    class="text-red-600 hover:text-red-800"
                    on:click={() => removeQuestion(index)}
                  >
                    Eliminar
                  </button>
                {/if}
              </div>
              
              <TextArea
                label="Texto de la pregunta"
                name={`question-${index}-text`}
                value={question.text || ''}
                placeholder="Ej. ¿Cómo calificarías tu nivel de fatiga hoy?"
                required
                on:input={(e) => updateQuestion(index, 'text', e.detail)}
              />
              
              <div class="mt-4">
                <Select
                  label="Tipo de respuesta"
                  name={`question-${index}-type`}
                  value={question.type}
                  options={questionTypes}
                  on:change={(e) => updateQuestion(index, 'type', e.detail)}
                />
              </div>
            </div>
          {/each}
          
          <Button 
            type="button" 
            variant="outline"
            on:click={addQuestion}
          >
            Añadir pregunta
          </Button>
        </div>
      </Card>
      
      <!-- Assign to athletes (optional) -->
      <Card title="Asignar a atletas (opcional)">
        {#if $athletes.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each $athletes as athlete}
              <div class="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  id={`athlete-${athlete.id}`} 
                  class="mt-1 h-4 w-4 text-purple-600 rounded"
                  checked={assignedAthletes.includes(athlete.id)}
                  on:change={() => toggleAthlete(athlete.id)}
                />
                <label for={`athlete-${athlete.id}`} class="block text-sm">
                  <span class="font-medium">{athlete.name}</span>
                  <span class="block text-gray-500">{athlete.email}</span>
                </label>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500">No hay atletas disponibles para asignar</p>
        {/if}
      </Card>
      
      <!-- Submit button -->
      <div class="flex justify-end">
        <Button 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  </div>
{/if}