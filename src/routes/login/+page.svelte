<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { redirect } from '@sveltejs/kit';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let email = '';
  let password = '';
  let loading = false;
  let error: string | null = null;
  let showWelcomeMessage = false;
  let registeredEmail = '';

  // Check for existing session on mount
  onMount(async () => {
    // Check for registration success parameter
    const registered = $page.url.searchParams.get('registered');
    registeredEmail = $page.url.searchParams.get('email') || '';
    
    if (registered === 'true') {
      showWelcomeMessage = true;
      if (registeredEmail) {
        email = registeredEmail;
      }
    }
    
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

  async function handleLogin() {
    try {
      console.log('Starting login process...');
      loading = true;
      error = null;
      showWelcomeMessage = false;
      
      console.log('Attempting to sign in with:', { email });
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign-in response:', { data, authError });

      if (authError) {
        console.error('Authentication error:', authError);
        throw authError;
      }

      console.log('Auth successful:', data);

      if (data.user) {
        console.log('Fetching user profile for ID:', data.user.id);
        // Get user role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id);

        console.log('Profile query result:', { profileData, profileError });

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          error = 'Error fetching profile. Please try again.';
          return;
        }

        if (!profileData || profileData.length === 0) {
          console.error('No profile found for user');
          error = 'Profile not found. Please contact support.';
          return;
        }

        const profile = profileData[0];
        console.log('User profile found:', profile);

        // Redirect based on role
        if (profile.role === 'trainer' || profile.role === 'athlete' || profile.role === 'admin') {
          const redirectUrl = `/dashboard/${profile.role}`;
          console.log('Redirecting to:', redirectUrl);
          
          // Force a reload to ensure session is established properly
          window.location.href = window.location.origin + redirectUrl;
        } else {
          console.error('Invalid role found:', profile.role);
          error = 'Invalid role. Please contact support.';
        }
      } else {
        console.warn('No user data returned after authentication');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      error = e.message;
    } finally {
      loading = false;
      console.log('Login process completed');
    }
  }
</script>

<svelte:head>
  <title>Fitzio | Login</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
    <div>
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-2">
        {$_('auth.login_title')}
      </h1>
      <p class="text-center text-gray-600">
        {$_('auth.no_account')}
        <a href="/register" class="text-purple-600 hover:text-purple-500 font-medium">
          {$_('auth.create_account')}
        </a>
      </p>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      {#if showWelcomeMessage}
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{$_('auth.registration_success', { values: { email: registeredEmail } })}</p>
            </div>
          </div>
        </div>
      {/if}

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
          {loading ? $_('auth.logging_in') : $_('auth.login')}
        </button>
      </div>
    </form>
  </div>
</div>