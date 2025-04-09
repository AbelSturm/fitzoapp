<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16 bg-purple-900 text-white">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold mb-12">
      {$_('mainFeatures.title')}
    </h2>
    
    <!-- Feature Tabs -->
    <div class="flex flex-wrap justify-center gap-4 mb-16">
      <button class="px-6 py-3 bg-orange-500 text-white rounded-lg">{$_('mainFeatures.tabs.workout')}</button>
      <button class="px-6 py-3 bg-transparent hover:bg-purple-800 text-white rounded-lg">{$_('mainFeatures.tabs.videos')}</button>
      <button class="px-6 py-3 bg-transparent hover:bg-purple-800 text-white rounded-lg">{$_('mainFeatures.tabs.messaging')}</button>
      <button class="px-6 py-3 bg-transparent hover:bg-purple-800 text-white rounded-lg">{$_('mainFeatures.tabs.metrics')}</button>
    </div>
    
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 text-left md:pr-12 mb-10 md:mb-0">
        <h3 class="text-3xl font-bold mb-6">{$_('mainFeatures.workout.title')}</h3>
        <p class="text-lg mb-6">
          {$_('mainFeatures.workout.description')}
        </p>
      </div>
      <div class="md:w-1/2">
        <img src="/images/workout-logging.png" alt={$_('mainFeatures.workout.image_alt')} class="rounded-lg shadow-lg" 
             on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/600x400?text=Workout+Logging+Screenshot'); }}>
      </div>
    </div>
  </div>
</div> 