<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { goto } from '$app/navigation';
  
  // User profile data
  let profile = {
    id: '',
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: 'athlete'
  };
  
  // State variables
  let loading = true;
  let updating = false;
  let error: string | null = null;
  let success = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let changingPassword = false;
  let deletingAccount = false;
  let showDeleteConfirmation = false;
  let deleteConfirmText = '';
  
  // Load user profile data
  onMount(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        error = 'No se ha encontrado una sesión activa.';
        loading = false;
        return;
      }
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        error = 'Error al cargar la información del perfil.';
      } else if (profileData) {
        profile = {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          role: profileData.role
        };
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      error = 'Ha ocurrido un error al cargar los datos del perfil.';
    } finally {
      loading = false;
    }
  });
  
  // Update profile information
  async function updateProfile() {
    try {
      updating = true;
      success = false;
      error = null;
      
      // Check if username is already taken
      if (profile.username) {
        const { data: existingUser, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', profile.username)
          .neq('id', profile.id)
          .single();
        
        if (existingUser) {
          error = 'Este nombre de usuario ya está en uso. Por favor, elige otro.';
          updating = false;
          return;
        }
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profile.username || null,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null
        })
        .eq('id', profile.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        error = 'Error al actualizar el perfil. Inténtalo de nuevo.';
      } else {
        success = true;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error = 'Ha ocurrido un error al actualizar el perfil.';
    } finally {
      updating = false;
    }
  }
  
  // Update password
  async function updatePassword() {
    try {
      changingPassword = true;
      success = false;
      error = null;
      
      // Validate passwords
      if (newPassword !== confirmPassword) {
        error = 'Las contraseñas no coinciden.';
        changingPassword = false;
        return;
      }
      
      // Update password in Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (passwordError) {
        console.error('Error updating password:', passwordError);
        error = 'Error al actualizar la contraseña. Asegúrate de que cumple con los requisitos de seguridad.';
      } else {
        success = true;
        // Clear password fields
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
      }
    } catch (err) {
      console.error('Error updating password:', err);
      error = 'Ha ocurrido un error al actualizar la contraseña.';
    } finally {
      changingPassword = false;
    }
  }
  
  // Delete user account
  async function deleteAccount() {
    try {
      deletingAccount = true;
      error = null;
      
      // Verify confirmation text
      if (deleteConfirmText !== profile.email) {
        error = 'El texto de confirmación no coincide con tu correo electrónico.';
        deletingAccount = false;
        return;
      }
      
      // Delete user data from profiles table
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);
      
      if (deleteProfileError) {
        console.error('Error deleting profile:', deleteProfileError);
        error = 'Error al eliminar el perfil. Inténtalo de nuevo.';
        deletingAccount = false;
        return;
      }
      
      // Delete user auth account
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(profile.id);
      
      if (deleteAuthError) {
        console.error('Error deleting auth account:', deleteAuthError);
        error = 'Error al eliminar la cuenta. Sin embargo, tu perfil ha sido eliminado.';
        
        // Sign out user even if there was an error with auth deletion
        await supabase.auth.signOut();
        goto('/');
        return;
      }
      
      // Sign out and redirect to home page
      await supabase.auth.signOut();
      goto('/');
      
    } catch (err) {
      console.error('Error deleting account:', err);
      error = 'Ha ocurrido un error al eliminar la cuenta.';
    } finally {
      deletingAccount = false;
      showDeleteConfirmation = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto px-4">
  <section class="mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-purple-900">Configuración de perfil</h1>
    <p class="text-gray-600 mt-2">
      Actualiza tu información personal y configuración de la cuenta.
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
  
  {#if success}
    <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">Los cambios han sido guardados correctamente.</p>
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
        <p class="mt-4 text-gray-600">Cargando información del perfil...</p>
      </div>
    </div>
  {:else}
    <div class="space-y-6">
      <!-- Profile Information -->
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Información personal</h2>
          
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled={true}
              />
              <p class="mt-1 text-xs text-gray-500">El correo electrónico no se puede cambiar.</p>
            </div>
            
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <Input
                id="username"
                type="text"
                bind:value={profile.username}
                placeholder="Escribe tu nombre de usuario"
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  id="firstName"
                  type="text"
                  bind:value={profile.first_name}
                  placeholder="Escribe tu nombre"
                />
              </div>
              
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <Input
                  id="lastName"
                  type="text"
                  bind:value={profile.last_name}
                  placeholder="Escribe tu apellido"
                />
              </div>
            </div>
            
            <div class="flex justify-end">
              <Button
                variant="primary"
                on:click={updateProfile}
                disabled={updating}
              >
                {updating ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <!-- Password Change -->
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Cambiar contraseña</h2>
          
          <div class="space-y-4">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <Input
                id="newPassword"
                type="password"
                bind:value={newPassword}
                placeholder="Escribe tu nueva contraseña"
              />
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
            
            <div class="flex justify-end">
              <Button
                variant="primary"
                on:click={updatePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <!-- Delete Account -->
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Eliminar cuenta</h2>
          
          <div class="space-y-4">
            <p class="text-gray-600">
              Al eliminar tu cuenta, se borrarán permanentemente todos tus datos y no se podrán recuperar.
            </p>
            
            {#if showDeleteConfirmation}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-600 font-medium mb-3">Esta acción no se puede deshacer</p>
                <p class="text-gray-700 mb-3">Para confirmar, por favor escribe tu correo electrónico: <strong>{profile.email}</strong></p>
                
                <div class="mb-3">
                  <Input
                    type="text"
                    bind:value={deleteConfirmText}
                    placeholder="Escribe tu correo electrónico"
                  />
                </div>
                
                <div class="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    on:click={() => showDeleteConfirmation = false}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="danger"
                    on:click={deleteAccount}
                    disabled={deletingAccount || deleteConfirmText !== profile.email}
                  >
                    {deletingAccount ? 'Eliminando...' : 'Eliminar cuenta permanentemente'}
                  </Button>
                </div>
              </div>
            {:else}
              <div class="flex justify-end">
                <Button
                  variant="danger"
                  on:click={() => showDeleteConfirmation = true}
                >
                  Eliminar cuenta
                </Button>
              </div>
            {/if}
          </div>
        </div>
      </Card>
    </div>
  {/if}
</div> 