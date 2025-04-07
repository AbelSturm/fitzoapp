<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { questionnairesService, type Question, type QuestionType } from '$lib/services/questionnaires';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Form state
  let title = '';
  let description = '';
  let questions: Question[] = [
    {
      text: '',
      type: 'short_text',
      question_order: 1
    }
  ];
  let assignedAthletes: string[] = [];
  let athletes: any[] = [];
  let submitting = false;
  let loading = true;
  let errors = {
    title: '',
    questions: '',
    general: ''
  };
  
  // Load athletes on mount
  onMount(async () => {
    try {
      // Here you would call a service to load athletes
      // athletes = await athletesService.getAthletes();
      // For now, we'll just set loading to false
      loading = false;
    } catch (err) {
      console.error('Error loading athletes:', err);
      loading = false;
    }
  });
  
  // Question type options
  const questionTypes = [
    { value: 'short_text', label: 'Texto corto' },
    { value: 'long_text', label: 'Texto largo' },
    { value: 'number', label: 'Número' },
    { value: 'scale', label: 'Escala (1-10)' }
  ];
  
  // Add question
  function addQuestion() {
    questions = [
      ...questions,
      {
        text: '',
        type: 'short_text',
        question_order: questions.length + 1
      }
    ];
  }
  
  // Remove question
  function removeQuestion(index: number) {
    // Remove the question at the specified index
    const updatedQuestions = questions.filter((_, i) => i !== index);
    
    // Update question_order for remaining questions
    questions = updatedQuestions.map((q, i) => ({
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
  
  // Update question type with proper typing
  function updateQuestionType(index: number, value: string) {
    // Ensure the value is a valid QuestionType
    const typeValue = value as QuestionType;
    updateQuestion(index, 'type', typeValue);
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
      questions: '',
      general: ''
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
        if (!question.text.trim()) {
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
      // Create questionnaire using the service
      const questionnaireId = await questionnairesService.createQuestionnaire(
        { title, description },
        questions
      );
      
      if (!questionnaireId) {
        throw new Error('Failed to create questionnaire');
      }
      
      // If there are assigned athletes, assign the questionnaire to them
      if (assignedAthletes.length > 0) {
        await questionnairesService.assignQuestionnaire(questionnaireId, assignedAthletes);
      }
      
      // Redirect to questionnaires list
      goto('/dashboard/trainer/questionnaires');
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      errors.general = 'Error al crear el cuestionario. Por favor, inténtalo de nuevo.';
    } finally {
      submitting = false;
    }
  }
</script>

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
    <h1 class="text-3xl font-bold">Crear cuestionario</h1>
  </div>
  
  {#if errors.general}
    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{errors.general}</p>
        </div>
      </div>
    </div>
  {/if}
  
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
              value={question.text}
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
                on:change={(e) => updateQuestionType(index, e.detail)}
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
      {#if loading}
        <p class="text-gray-500">Cargando atletas...</p>
      {:else if athletes.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each athletes as athlete}
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
        {submitting ? 'Guardando...' : 'Guardar cuestionario'}
      </Button>
    </div>
  </form>
</div> 