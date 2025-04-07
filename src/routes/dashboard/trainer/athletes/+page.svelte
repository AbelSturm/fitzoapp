<script lang="ts">
  import { onMount } from 'svelte';
  import { athletesService, type Athlete } from '$lib/services/athletes';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  
  let athletes: Athlete[] = [];
  let loading = true;
  let error = false;
  
  // For adding a new athlete
  let newAthleteEmail = '';
  let addingAthlete = false;
  let addAthleteError = '';
  let addAthleteSuccess = '';
  
  // For search
  let searchTerm = '';
  let searchResults: Athlete[] = [];
  let searching = false;
  
  // Load athletes on mount
  onMount(async () => {
    try {
      athletes = await athletesService.getTrainerAthletes();
    } catch (err) {
      console.error('Error loading athletes:', err);
      error = true;
    } finally {
      loading = false;
    }
  });
  
  // Add athlete by email
  async function handleAddAthlete() {
    // Reset status
    addAthleteError = '';
    addAthleteSuccess = '';
    
    if (!newAthleteEmail.trim()) {
      addAthleteError = 'El correo electrónico es requerido';
      return;
    }
    
    addingAthlete = true;
    
    try {
      const success = await athletesService.addAthleteByEmail(newAthleteEmail);
      
      if (success) {
        addAthleteSuccess = 'Atleta añadido correctamente';
        newAthleteEmail = '';
        
        // Refresh the athlete list
        athletes = await athletesService.getTrainerAthletes();
      } else {
        throw new Error('No se pudo añadir el atleta');
      }
    } catch (err) {
      console.error('Error adding athlete:', err);
      addAthleteError = err instanceof Error 
        ? err.message 
        : 'Error al añadir atleta. Por favor, inténtalo de nuevo.';
    } finally {
      addingAthlete = false;
    }
  }
  
  // Remove athlete
  async function removeAthlete(athleteId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este atleta de tu lista?')) {
      return;
    }
    
    try {
      await athletesService.removeAthlete(athleteId);
      athletes = athletes.filter(a => a.id !== athleteId);
    } catch (err) {
      console.error('Error removing athlete:', err);
      alert('Error al eliminar atleta');
    }
  }
  
  // Search for athletes
  async function handleSearch() {
    if (!searchTerm.trim()) {
      searchResults = [];
      return;
    }
    
    searching = true;
    
    try {
      searchResults = await athletesService.searchAthletes(searchTerm);
    } catch (err) {
      console.error('Error searching athletes:', err);
      searchResults = [];
    } finally {
      searching = false;
    }
  }
  
  // Format date
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
    <h1 class="text-3xl font-bold">Mis Atletas</h1>
  </div>
  
  <!-- Add athlete form -->
  <div class="mb-8">
    <Card title="Añadir nuevo atleta">
      <form on:submit|preventDefault={handleAddAthlete} class="space-y-4">
        <div>
          <Input
            label="Correo electrónico del atleta"
            name="email"
            type="email"
            bind:value={newAthleteEmail}
            placeholder="correo@ejemplo.com"
            error={addAthleteError}
          />
          {#if addAthleteSuccess}
            <p class="mt-1 text-sm text-green-600">{addAthleteSuccess}</p>
          {/if}
          <p class="text-sm text-gray-500 mt-1">
            El atleta debe estar registrado en el sistema para añadirlo a tu lista.
          </p>
        </div>
        
        <div class="flex justify-end">
          <Button 
            type="submit" 
            disabled={addingAthlete}
          >
            {addingAthlete ? 'Añadiendo...' : 'Añadir atleta'}
          </Button>
        </div>
      </form>
    </Card>
  </div>
  
  <!-- Loading state -->
  {#if loading}
    <Card>
      <div class="text-center py-8">
        <p class="text-gray-500">Cargando atletas...</p>
      </div>
    </Card>
  <!-- Error state -->
  {:else if error}
    <Card>
      <div class="text-center py-8">
        <p class="text-red-500 mb-4">Error al cargar los atletas</p>
        <Button on:click={() => window.location.reload()} variant="outline">
          Intentar de nuevo
        </Button>
      </div>
    </Card>
  <!-- Athletes List -->
  {:else}
    <Card title="Mis atletas">
      {#if athletes.length > 0}
        <div class="space-y-4">
          {#each athletes as athlete}
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 class="text-lg font-medium">{athlete.name}</h3>
                  <p class="text-gray-600">{athlete.email}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    Añadido el {formatDate(athlete.created_at || '')}
                  </p>
                </div>
                
                <div class="mt-4 md:mt-0 flex items-center space-x-2">
                  <Button 
                    href={`/dashboard/trainer/athletes/${athlete.id}`} 
                    variant="outline" 
                    size="sm"
                  >
                    Ver detalles
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    size="sm"
                    on:click={() => removeAthlete(athlete.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8">
          <p class="text-gray-500 mb-4">No tienes atletas asignados</p>
          <p class="text-sm text-gray-600">
            Usa el formulario de arriba para añadir atletas a tu lista.
          </p>
        </div>
      {/if}
    </Card>
  {/if}
</div> 