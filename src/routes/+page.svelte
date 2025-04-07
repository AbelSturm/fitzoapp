<script lang="ts">
  import { _ } from 'svelte-i18n';
  let email = '';
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-purple-900 to-purple-800 text-white">
    <div class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-5xl font-bold mb-6">
        {$_('hero.title')}
      </h1>
      <p class="text-xl mb-12 max-w-2xl mx-auto">
        {$_('hero.subtitle')}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/register?role=coach" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          {$_('hero.coach_cta')}
        </a>
        <a href="/register?role=athlete" class="bg-white hover:bg-gray-100 text-purple-900 px-8 py-3 rounded-lg font-medium transition-colors">
          {$_('hero.athlete_cta')}
        </a>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <div class="py-20">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center">
          <div class="text-4xl mb-4">💪</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.workouts.title')}</h3>
          <p class="text-gray-600">
            {$_('features.workouts.description')}
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center">
          <div class="text-4xl mb-4">📥</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.completion.title')}</h3>
          <p class="text-gray-600">
            {$_('features.completion.description')}
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center">
          <div class="text-4xl mb-4">💰</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.progress.title')}</h3>
          <p class="text-gray-600">
            {$_('features.progress.description')}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Testimonial Section -->
  <div class="bg-white py-20">
    <div class="container mx-auto px-4 max-w-4xl text-center">
      <blockquote class="text-2xl font-light italic text-gray-700 mb-6">
        {$_('testimonial.quote')}
      </blockquote>
      <p class="text-gray-600">{$_('testimonial.author')}</p>
    </div>
  </div>

  <!-- CTA Section -->
  <div class="py-20 bg-gray-50">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-8">{$_('cta.title')}</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/register" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          {$_('cta.create_account')}
        </a>
        <a href="/login" class="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors border border-gray-200">
          {$_('cta.login')}
        </a>
      </div>
    </div>
  </div>
</div>