<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // Mock user data - will be replaced with actual user data later
  let user = {
    firstName: "Alex",
    email: ""
  };

  // Data for dashboard stats
  let totalWorkouts = 0;
  let totalQuestionnaires = 0;
  let totalTrainers = 0;
  let loading = true;
  
  // Define interfaces for our data
  interface AthleteWorkout {
    id: string;
    title: string;
    description: string;
    assignedDate: string;
    completed: boolean;
  }
  
  interface Questionnaire {
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }
  
  // Define interfaces for Supabase data responses
  interface WorkoutAssignment {
    workout_id: string;
    status: 'pending' | 'completed' | 'canceled';
    assigned_at: string | null;
    workouts: {
      id: string;
      title: string;
      description: string;
      created_at: string;
    };
  }
  
  interface QuestionnaireAssignment {
    questionnaire_id: string;
    status: 'pending' | 'completed' | 'canceled';
    assigned_at: string | null;
    questionnaires: {
      id: string;
      title: string;
      description: string;
    };
  }
  
  // Initialize with empty arrays (will be populated from Supabase)
  let assignedWorkouts: AthleteWorkout[] = [];
  let pendingQuestionnaires: Questionnaire[] = [];
  
  // Stats for progress summary
  let stats = {
    completedWorkouts: 0,
    totalWorkouts: 0,
    completedQuestionnaires: 0,
    pendingQuestionnaires: 0
  };
  
  // Format date to more readable format
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    });
  }

  // Function to mark a workout as completed
  async function markWorkoutCompleted(id: string) {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      // Update the workout assignment status in Supabase
      const { error } = await supabase
        .from('workout_assignments')
        .update({ status: 'completed' })
        .eq('workout_id', id)
        .eq('assigned_to', session.user.id);
        
      if (error) {
        console.error('Error marking workout as completed:', error);
        return;
      }
      
      // Update local state
      assignedWorkouts = assignedWorkouts.map(workout => {
        if (workout.id === id) {
          return { ...workout, completed: true };
        }
        return workout;
      });
      
      // Update stats
      updateStats();
      
    } catch (err) {
      console.error('Error marking workout as completed:', err);
    }
  }

  // Update the statistics based on the current data
  function updateStats() {
    stats.completedWorkouts = assignedWorkouts.filter(w => w.completed).length;
    stats.totalWorkouts = assignedWorkouts.length;
    stats.pendingQuestionnaires = pendingQuestionnaires.length;
  }
  
  // Load data
  onMount(async () => {
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get user profile to display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          user.email = profile.email;
          // Extract a name from email (temporary solution until we have a proper name field)
          user.firstName = profile.email.split('@')[0].split('.')[0];
          // Capitalize first letter
          user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
        }
        
        // 1. Fetch assigned workouts from Supabase
        const { data: workoutAssignments, error: workoutError } = await supabase
          .from('workout_assignments')
          .select(`
            workout_id,
            status,
            assigned_at,
            workouts:workout_id (
              id, 
              title,
              description,
              created_at
            )
          `)
          .eq('assigned_to', session.user.id);
          
        if (workoutError) {
          console.error('Error fetching workout assignments:', workoutError);
        } else if (workoutAssignments && workoutAssignments.length > 0) {
          // Transform workout data to match our interface
          assignedWorkouts = workoutAssignments.map((assignment: any) => ({
            id: assignment.workout_id,
            title: assignment.workouts.title,
            description: assignment.workouts.description,
            assignedDate: assignment.assigned_at || assignment.workouts.created_at,
            completed: assignment.status === 'completed'
          }));
        }
        
        // 2. Fetch questionnaires from Supabase
        const { data: questionnaireAssignments, error: questionnaireError } = await supabase
          .from('questionnaire_assignments')
          .select(`
            questionnaire_id,
            status,
            assigned_at,
            questionnaires:questionnaire_id (
              id,
              title,
              description
            )
          `)
          .eq('assigned_to', session.user.id)
          .neq('status', 'completed');  // Only fetch pending questionnaires
          
        if (questionnaireError) {
          console.error('Error fetching questionnaire assignments:', questionnaireError);
        } else if (questionnaireAssignments && questionnaireAssignments.length > 0) {
          // Transform questionnaire data to match our interface
          pendingQuestionnaires = questionnaireAssignments.map((assignment: any) => ({
            id: assignment.questionnaire_id,
            title: assignment.questionnaires.title,
            description: assignment.questionnaires.description,
            completed: false
          }));
        }
        
        // 3. Get completed questionnaires count
        const { count: completedQuestionnairesCount, error: countError } = await supabase
          .from('questionnaire_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', session.user.id)
          .eq('completed', true);
          
        if (!countError && completedQuestionnairesCount !== null) {
          stats.completedQuestionnaires = completedQuestionnairesCount;
        }
      }
      
      // Update statistics based on fetched data
      updateStats();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-7xl mx-auto px-4">
  <!-- Welcome Message Section -->
  <section class="mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-purple-900">
      ¡Hola, {user.firstName}! ¿Listo para entrenar hoy?
    </h1>
    <p class="text-gray-600 mt-2">
      Aquí tienes una visión general de tus actividades pendientes.
    </p>
  </section>
  
  <!-- Assigned Workouts Section -->
  <section class="mb-10">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Entrenamientos asignados</h2>
      <Button href="/dashboard/athlete/workouts" variant="outline" size="sm">
        Ver todos
      </Button>
    </div>
    
    {#if loading}
      <Card>
        <div class="p-6 flex justify-center">
          <p class="text-gray-500">Cargando entrenamientos...</p>
        </div>
      </Card>
    {:else if assignedWorkouts.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each assignedWorkouts as workout}
          <Card padding="p-4">
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-medium text-gray-900">{workout.title}</h3>
              <span class={`px-2 py-1 rounded-full text-xs font-medium ${workout.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {workout.completed ? 'Completado' : 'Pendiente'}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              Asignado: {formatDate(workout.assignedDate)}
            </p>
            <p class="text-sm text-gray-600 mt-2 mb-4">
              {workout.description}
            </p>
            <div class="flex justify-between mt-4">
              <Button 
                href={`/dashboard/athlete/workouts/${workout.id}`} 
                variant="outline" 
                size="sm"
              >
                Ver detalles
              </Button>
              
              {#if !workout.completed}
                <Button 
                  on:click={() => markWorkoutCompleted(workout.id)} 
                  variant="primary" 
                  size="sm"
                >
                  Marcar como completado
                </Button>
              {/if}
            </div>
          </Card>
        {/each}
      </div>
    {:else}
      <Card>
        <div class="p-6 text-center">
          <p class="text-gray-500">No tienes entrenamientos asignados actualmente.</p>
        </div>
      </Card>
    {/if}
  </section>
  
  <!-- Pending Questionnaires Section -->
  <section class="mb-10">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Cuestionarios pendientes</h2>
      <Button href="/dashboard/athlete/questionnaires" variant="outline" size="sm">
        Ver todos
      </Button>
    </div>
    
    {#if loading}
      <Card>
        <div class="p-6 flex justify-center">
          <p class="text-gray-500">Cargando cuestionarios...</p>
        </div>
      </Card>
    {:else if pendingQuestionnaires.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each pendingQuestionnaires as questionnaire}
          <Card padding="p-4">
            <h3 class="text-lg font-medium text-gray-900">{questionnaire.title}</h3>
            <p class="text-sm text-gray-600 mt-2 mb-4">
              {questionnaire.description}
            </p>
            <div class="flex justify-end mt-4">
              <Button 
                href={`/dashboard/athlete/questionnaires/${questionnaire.id}`} 
                variant="primary" 
                size="sm"
              >
                Responder
              </Button>
            </div>
          </Card>
        {/each}
      </div>
    {:else}
      <Card>
        <div class="p-6 text-center">
          <p class="text-gray-500">No tienes cuestionarios pendientes actualmente.</p>
        </div>
      </Card>
    {/if}
  </section>
  
  <!-- Progress Summary Section -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Resumen de progreso</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card padding="p-4">
        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-700">Entrenamientos</h3>
          <div class="mt-2 flex items-center justify-center">
            <span class="text-3xl font-bold text-purple-600">{stats.completedWorkouts}</span>
            <span class="text-gray-500 ml-2">/ {stats.totalWorkouts} completados</span>
          </div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-purple-600 h-2.5 rounded-full" style="width: {stats.totalWorkouts ? (stats.completedWorkouts / stats.totalWorkouts) * 100 : 0}%"></div>
          </div>
        </div>
      </Card>
      
      <Card padding="p-4">
        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-700">Cuestionarios</h3>
          <div class="mt-2 flex items-center justify-center">
            <span class="text-3xl font-bold text-purple-600">{stats.completedQuestionnaires}</span>
            <span class="text-gray-500 ml-2">completados en total</span>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            {stats.pendingQuestionnaires} pendientes actualmente
          </p>
        </div>
      </Card>
    </div>
  </section>
</div>