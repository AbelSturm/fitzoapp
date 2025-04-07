<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { workoutsService, type Exercise } from '$lib/services/workouts';
  import { athletesService, type Athlete } from '$lib/services/athletes';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Form state
  let title = '';
  let description = '';
  let exercises: Exercise[] = [
    {
      name: '',
      sets: 3,
      reps: 10,
      rest: 60,
      notes: '',
      exercise_order: 1
    }
  ];
  let assignedAthletes: string[] = [];
  let athletes: Athlete[] = [];
  let submitting = false;
  let error = '';
  let errors = {
    title: '',
    description: '',
    exercises: ''
  };

  // Variables to store string representations of number fields
  let setsStrings: string[] = exercises.map(e => e.sets.toString());
  let repsStrings: string[] = exercises.map(e => e.reps.toString());
  let restStrings: string[] = exercises.map(e => e.rest.toString());

  onMount(async () => {
    try {
      // Load athletes for assignment
      athletes = await athletesService.getTrainerAthletes();
    } catch (err) {
      console.error('Error loading athletes:', err);
    }
  });
  
  // Add exercise
  function addExercise() {
    exercises = [
      ...exercises,
      {
        name: '',
        sets: 3,
        reps: 10,
        rest: 60,
        notes: '',
        exercise_order: exercises.length + 1
      }
    ];
    
    // Update string arrays when adding exercise
    setsStrings = [...setsStrings, '3'];
    repsStrings = [...repsStrings, '10'];
    restStrings = [...restStrings, '60'];
  }
  
  // Remove exercise
  function removeExercise(index: number) {
    exercises = exercises.filter((_, i) => i !== index);
    setsStrings = setsStrings.filter((_, i) => i !== index);
    repsStrings = repsStrings.filter((_, i) => i !== index);
    restStrings = restStrings.filter((_, i) => i !== index);
    
    // Update exercise order
    exercises = exercises.map((exercise, i) => ({
      ...exercise,
      exercise_order: i + 1
    }));
  }
  
  // Update exercises from string fields
  function updateSets(index: number, value: string) {
    setsStrings[index] = value;
    exercises[index].sets = parseInt(value) || 1;
    exercises = [...exercises]; // Trigger reactivity
  }
  
  function updateReps(index: number, value: string) {
    repsStrings[index] = value;
    exercises[index].reps = parseInt(value) || 1;
    exercises = [...exercises]; // Trigger reactivity
  }
  
  function updateRest(index: number, value: string) {
    restStrings[index] = value;
    exercises[index].rest = parseInt(value) || 0;
    exercises = [...exercises]; // Trigger reactivity
  }
  
  // Update exercise
  function updateExerciseName(index: number, value: string) {
    exercises = exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, name: value };
      }
      return exercise;
    });
  }
  
  function updateExerciseNotes(index: number, value: string) {
    exercises = exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, notes: value };
      }
      return exercise;
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
      description: '',
      exercises: ''
    };
    
    // Validate title
    if (!title.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    
    // Validate description
    if (!description.trim()) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    }
    
    // Validate exercises
    if (exercises.length === 0) {
      errors.exercises = 'Debes añadir al menos un ejercicio';
      isValid = false;
    } else {
      for (const exercise of exercises) {
        if (!exercise.name.trim()) {
          errors.exercises = 'Todos los ejercicios deben tener un nombre';
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
    error = '';
    
    try {
      // Create workout in Supabase
      const workoutId = await workoutsService.createWorkout(
        { title, description },
        exercises
      );
      
      if (!workoutId) {
        throw new Error('No se pudo crear el entrenamiento');
      }
      
      // Assign to athletes if any selected
      if (assignedAthletes.length > 0) {
        await workoutsService.assignWorkout(workoutId, assignedAthletes);
      }
      
      // Redirect to workouts list
      goto('/dashboard/trainer/workouts');
    } catch (err) {
      console.error('Error creating workout:', err);
      error = 'Ocurrió un error al crear el entrenamiento. Por favor, intenta de nuevo.';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="max-w-5xl mx-auto">
  <div class="mb-6">
    <Button variant="outline" size="sm" href="/dashboard/trainer/workouts">
      &larr; Volver a entrenamientos
    </Button>
    <h1 class="text-3xl font-bold mt-2">Crear nuevo entrenamiento</h1>
  </div>
  
  {#if error}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600">{error}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
    <Card>
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-4">Información básica</h2>
        
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <Input 
            id="title" 
            bind:value={title} 
            placeholder="Nombre del entrenamiento" 
            error={errors.title}
          />
        </div>
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <TextArea 
            id="description" 
            bind:value={description} 
            placeholder="Describe el objetivo de este entrenamiento" 
            error={errors.description}
          />
        </div>
      </div>
    </Card>
    
    <div class="mt-6">
      <Card>
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Ejercicios</h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              on:click={addExercise}
            >
              Añadir ejercicio
            </Button>
          </div>
          
          {#if errors.exercises}
            <p class="mb-4 text-sm text-red-600">{errors.exercises}</p>
          {/if}
          
          {#each exercises as exercise, index}
            <div class="mb-6 p-4 bg-gray-50 rounded-md">
              <div class="flex justify-between items-center mb-3">
                <h3 class="font-medium">Ejercicio {index + 1}</h3>
                {#if exercises.length > 1}
                  <button 
                    type="button" 
                    class="text-red-600 hover:text-red-800 text-sm" 
                    on:click={() => removeExercise(index)}
                  >
                    Eliminar
                  </button>
                {/if}
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <Input 
                    bind:value={exercise.name} 
                    placeholder="Ej: Sentadillas" 
                  />
                </div>
                
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Series
                    </label>
                    <Input 
                      type="number"
                      value={setsStrings[index]}
                      on:input={(e) => updateSets(index, e.currentTarget.value)} 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Reps
                    </label>
                    <Input 
                      type="number"
                      value={repsStrings[index]}
                      on:input={(e) => updateReps(index, e.currentTarget.value)} 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Descanso (seg)
                    </label>
                    <Input 
                      type="number"
                      value={restStrings[index]}
                      on:input={(e) => updateRest(index, e.currentTarget.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <TextArea 
                  bind:value={exercise.notes} 
                  placeholder="Instrucciones o consejos adicionales"
                />
              </div>
            </div>
          {/each}
        </div>
      </Card>
    </div>
    
    {#if athletes.length > 0}
      <div class="mt-6">
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Asignar a atletas (opcional)</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {#each athletes as athlete}
                <div 
                  class="p-3 border rounded-md cursor-pointer {
                    assignedAthletes.includes(athlete.id || '') 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }"
                  on:click={() => toggleAthlete(athlete.id || '')}
                >
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignedAthletes.includes(athlete.id || '')}
                      class="mr-2"
                      readonly
                    />
                    <div>
                      <p class="font-medium">{athlete.name}</p>
                      <p class="text-sm text-gray-500">{athlete.email}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </Card>
      </div>
    {/if}
    
    <div class="mt-6 flex justify-end">
      <Button 
        type="submit" 
        variant="primary" 
        disabled={submitting}
      >
        {submitting ? 'Creando...' : 'Crear entrenamiento'}
      </Button>
    </div>
  </form>
</div> 