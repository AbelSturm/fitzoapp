<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16">
  <div class="container mx-auto px-4 text-center mb-8">
    <h2 class="text-3xl font-bold mb-4">
      {$_('businessFeatures.title')}
    </h2>
  </div>
  
  <div class="container mx-auto px-4">
    <div class="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Feature 1 - Client Management -->
      <div class="border border-gray-200 p-8 rounded-xl">
        <div class="w-16 h-16 mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-teal-600">{$_('businessFeatures.client.title')}</h3>
        <p class="text-gray-600 mb-6">
          {$_('businessFeatures.client.description')}
        </p>
        <a href="/features/client-management" class="text-orange-500 hover:text-orange-600 font-medium inline-flex items-center">
          {$_('businessFeatures.learn_more')}
        </a>
      </div>

      <!-- Feature 2 - Payments -->
      <div class="border border-gray-200 p-8 rounded-xl">
        <div class="w-16 h-16 mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-teal-600">{$_('businessFeatures.payments.title')}</h3>
        <p class="text-gray-600 mb-6">
          {$_('businessFeatures.payments.description')}
        </p>
        <a href="/features/payments" class="text-orange-500 hover:text-orange-600 font-medium inline-flex items-center">
          {$_('businessFeatures.learn_more')}
        </a>
      </div>

      <!-- Feature 3 - Progress Tracking -->
      <div class="border border-gray-200 p-8 rounded-xl">
        <div class="w-16 h-16 mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-teal-600">{$_('businessFeatures.progress.title')}</h3>
        <p class="text-gray-600 mb-6">
          {$_('businessFeatures.progress.description')}
        </p>
        <a href="/features/progress-tracking" class="text-orange-500 hover:text-orange-600 font-medium inline-flex items-center">
          {$_('businessFeatures.learn_more')}
        </a>
      </div>
    </div>
  </div>
</div> 