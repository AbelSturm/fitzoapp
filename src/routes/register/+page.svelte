<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let username = '';
  let firstName = '';
  let lastName = '';
  let role = $page.url.searchParams.get('role') || '';
  let loading = false;
  let error: string | null = null;

  // Check for existing session on mount
  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (session) {
      try {
        // User is already logged in, get their role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id);

        if (profileError) {
          console.error('Error fetching profile, user might be deleted:', profileError.message);
          // Sign out the user since their profile is missing
          await supabase.auth.signOut();
          return;
        }

        if (profileData && profileData.length > 0 && profileData[0].role) {
          // Redirect to appropriate dashboard
          console.log('User already logged in, redirecting to dashboard');
          window.location.href = `/dashboard/${profileData[0].role}`;
        } else {
          // Handle case where profile exists but has no role
          console.warn('User profile has no role assigned');
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
        // Sign out in case of error
        await supabase.auth.signOut();
      }
    }
  });

  async function handleRegister() {
    try {
      loading = true;
      error = null;

      // Validate username
      if (username) {
        // Check if username is already taken
        const { data: existingUsers, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username);
        
        if (existingUsers && existingUsers.length > 0) {
          throw new Error($_('auth.username_taken') || 'This username is already taken. Please choose another one.');
        }
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Handle specific error cases with more user-friendly messages
        if (authError.message.includes('already registered')) {
          throw new Error($_('auth.user_already_exists') || 'The email is already registered. Please use a different email or login to your account.');
        }
        throw authError;
      }

      if (data.user) {
        // Insert user profile with role and new fields
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              // Ensure role can only be trainer or athlete
              role: role === 'trainer' || role === 'athlete' ? role : 'athlete',
              username: username || null,
              first_name: firstName || null,
              last_name: lastName || null
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(profileError.message || 'Failed to create user profile');
        }

        // Sign out the user after successful registration to avoid auto-login issues
        await supabase.auth.signOut();
        
        // Redirect to login page with success parameter
        goto(`/login?registered=true&email=${encodeURIComponent(email)}`);
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      error = e.message || 'An unexpected error occurred during registration';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
    <div>
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-2">
        {$_('auth.register_title')}
      </h1>
      <p class="text-center text-gray-600">
        {$_('auth.have_account')}
        <a href="/login" class="text-purple-600 hover:text-purple-500 font-medium">
          {$_('auth.login')}
        </a>
      </p>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleRegister}>
      {#if error}
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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

      <div class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            {$_('auth.email')}
          </label>
          <div class="mt-1">
            <input
              type="email"
              id="email"
              bind:value={email}
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            {$_('auth.username')}
          </label>
          <div class="mt-1">
            <input
              type="text"
              id="username"
              bind:value={username}
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              {$_('auth.first_name')}
            </label>
            <div class="mt-1">
              <input
                type="text"
                id="firstName"
                bind:value={firstName}
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              {$_('auth.last_name')}
            </label>
            <div class="mt-1">
              <input
                type="text"
                id="lastName"
                bind:value={lastName}
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            {$_('auth.password')}
          </label>
          <div class="mt-1">
            <input
              type="password"
              id="password"
              bind:value={password}
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">
            {$_('auth.role')}
          </label>
          <div class="mt-1">
            <select
              id="role"
              bind:value={role}
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">{$_('auth.select_role')}</option>
              <option value="trainer">{$_('auth.trainer')}</option>
              <option value="athlete">{$_('auth.athlete')}</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium shadow-sm transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {/if}
          {loading ? $_('auth.creating_account') : $_('auth.create_account')}
        </button>
      </div>
    </form>
  </div>
</div>