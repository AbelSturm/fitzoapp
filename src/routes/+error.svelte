<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
</script>

<div class="min-h-[70vh] flex flex-col justify-center items-center bg-gray-50 px-4 py-20">
  <div class="text-center">
    <h1 class="text-9xl font-bold text-purple-900 mb-4">{$page.status}</h1>
    
    <p class="text-2xl font-semibold mb-6">
      {#if $page.status === 404}
        {$_('error.404_title', { default: 'Page Not Found' })}
      {:else}
        {$_('error.generic_title', { default: 'An Error Occurred' })}
      {/if}
    </p>
    
    <p class="text-lg text-gray-600 mb-10 max-w-md mx-auto">
      {#if $page.status === 404}
        {$_('error.404_message', { default: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.' })}
      {:else}
        {$_('error.generic_message', { default: 'Something went wrong. Please try again later or contact support if the problem persists.' })}
      {/if}
    </p>
    
    <div class="space-y-4">
      <a
        href="/"
        class="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {$_('error.back_home', { default: 'Back to Home' })}
      </a>
      
      <p class="mt-4 text-gray-600">
        {$_('error.support_text', { default: 'If you need help, please email us at:' })} 
        <a href="mailto:support@fitzio.app" class="text-purple-700 hover:underline font-medium">
          support@fitzio.app
        </a>
      </p>
    </div>
  </div>
</div> 