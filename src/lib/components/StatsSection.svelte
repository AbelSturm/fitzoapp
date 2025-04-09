<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16 bg-purple-900 text-white">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white bg-opacity-10 p-8 rounded-xl text-center">
        <div class="text-5xl font-bold mb-2">{$_('stats.coaches.value')}</div>
        <div class="text-green-400 uppercase tracking-wide text-sm">{$_('stats.coaches.label')}</div>
        <div class="text-xs text-green-200 mt-1">{$_('stats.demo_note')}</div>
      </div>
      <div class="bg-white bg-opacity-10 p-8 rounded-xl text-center">
        <div class="text-5xl font-bold mb-2">{$_('stats.clients.value')}</div>
        <div class="text-green-400 uppercase tracking-wide text-sm">{$_('stats.clients.label')}</div>
        <div class="text-xs text-green-200 mt-1">{$_('stats.demo_note')}</div>
      </div>
      <div class="bg-white bg-opacity-10 p-8 rounded-xl text-center">
        <div class="text-5xl font-bold mb-2">{$_('stats.workouts.value')}</div>
        <div class="text-green-400 uppercase tracking-wide text-sm">{$_('stats.workouts.label')}</div>
        <div class="text-xs text-green-200 mt-1">{$_('stats.demo_note')}</div>
      </div>
    </div>
  </div>
</div> 