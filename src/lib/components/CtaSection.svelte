<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-10 md:mb-0">
        <h2 class="text-3xl font-bold mb-6">{$_('cta.title')}</h2>
        <p class="text-lg mb-6">{$_('cta.subtitle')}</p>
        
        <div class="mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{$_('cta.no_credit_card')}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{$_('cta.cancel_anytime')}</span>
        </div>
      </div>
      
      <div class="md:w-1/2 bg-purple-500 p-10 rounded-xl">
        <div class="mb-4">
          <label for="footer-email" class="block text-white text-lg font-medium mb-2">{$_('cta.email_label')}</label>
          <input 
            type="email" 
            id="footer-email" 
            class="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500" 
            placeholder={$_('cta.email_placeholder')}
          />
        </div>
        
        <button class="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          {$_('cta.button')}
        </button>
      </div>
    </div>
  </div>
</div> 