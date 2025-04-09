<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16">
  <div class="container mx-auto px-4 text-center mb-16">
    <h2 class="text-3xl font-bold mb-2">{$_('adminFeatures.title')}</h2>
  </div>
  
  <div class="container mx-auto px-4">
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Feature 1 -->
      <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
        <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4">{$_('adminFeatures.connect.title')}</h3>
        <p class="text-gray-600">
          {$_('adminFeatures.connect.description')}
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
        <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4">{$_('adminFeatures.track.title')}</h3>
        <p class="text-gray-600">
          {$_('adminFeatures.track.description')}
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
        <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4">{$_('adminFeatures.delivery.title')}</h3>
        <p class="text-gray-600">
          {$_('adminFeatures.delivery.description')}
        </p>
      </div>

      <!-- Feature 4 -->
      <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
        <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-4">{$_('adminFeatures.video.title')}</h3>
        <p class="text-gray-600">
          {$_('adminFeatures.video.description')}
        </p>
      </div>
    </div>
  </div>
</div> 