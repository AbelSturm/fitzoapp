<script lang="ts">
  import { _ } from 'svelte-i18n';
  export let email = '';
</script>

<div class="bg-gradient-to-br from-purple-900 to-purple-800 text-white py-16">
  <div class="container mx-auto px-4 py-10">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/2 flex flex-col justify-center mb-10 md:mb-0">
        <p class="text-lg font-medium mb-3 uppercase tracking-wider">{$_('hero.tagline')}</p>
        <h1 class="text-5xl font-bold mb-6">
          {$_('hero.title')}
        </h1>
        <p class="text-xl mb-6">
          {$_('hero.description')}
        </p>
        
        <div class="mb-8">
          <label for="email" class="block text-white text-lg font-medium mb-2">{$_('hero.email_label')}</label>
          <div class="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              id="email" 
              bind:value={email} 
              class="w-full sm:w-80 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={$_('hero.email_placeholder')}
            />
            <button class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              {$_('hero.cta_button')}
            </button>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex items-center gap-2">
            <div class="text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm">{$_('hero.feature_one')}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm">{$_('hero.feature_two')}</span>
          </div>
        </div>
      </div>
      <div class="md:w-1/2 flex justify-center items-center relative">
        <div class="bg-white p-4 rounded-xl shadow-lg max-w-md w-full">
          <img src="/images/dashboard-preview.png" alt={$_('hero.dashboard_alt')} class="rounded-lg w-full" 
               on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/600x400?text=Dashboard+Preview'); }}>
        </div>
        <!-- Floating testimonial -->
        <div class="absolute -bottom-8 right-0 bg-white text-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
          <div class="flex gap-2">
            <div class="flex text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p class="font-medium mt-2">{$_('hero.testimonial_highlight')}</p>
          <div class="mt-2 text-sm text-gray-600">
            <p>{$_('hero.testimonial_author')}</p>
            <p>{$_('hero.testimonial_role')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 