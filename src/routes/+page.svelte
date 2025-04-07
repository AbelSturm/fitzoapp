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
      <h2 class="text-3xl font-bold text-center mb-12">{$_('features.title')}</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
          <div class="text-4xl mb-4">💪</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.workouts.title')}</h3>
          <p class="text-gray-600">
            {$_('features.workouts.description')}
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
          <div class="text-4xl mb-4">📥</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.completion.title')}</h3>
          <p class="text-gray-600">
            {$_('features.completion.description')}
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold mb-4">{$_('features.progress.title')}</h3>
          <p class="text-gray-600">
            {$_('features.progress.description')}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- For Trainers Section -->
  <div class="bg-purple-50 py-20">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center">
        <div class="md:w-1/2 md:pr-12 mb-10 md:mb-0">
          <h2 class="text-3xl font-bold mb-6">{$_('landing.trainers.title')}</h2>
          <ul class="space-y-4">
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.trainers.feature1')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.trainers.feature2')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.trainers.feature3')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.trainers.feature4')}</span>
            </li>
          </ul>
          <a href="/register?role=coach" class="inline-block mt-6 bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {$_('landing.trainers.cta')}
          </a>
        </div>
        <div class="md:w-1/2">
          <div class="bg-white p-4 rounded-xl shadow-md">
            <img src="/images/trainer-dashboard.png" alt="Trainer Dashboard" class="rounded-lg" 
                 on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/600x400?text=Trainer+Dashboard'); }}>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- For Athletes Section -->
  <div class="py-20">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row-reverse items-center">
        <div class="md:w-1/2 md:pl-12 mb-10 md:mb-0">
          <h2 class="text-3xl font-bold mb-6">{$_('landing.athletes.title')}</h2>
          <ul class="space-y-4">
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.athletes.feature1')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.athletes.feature2')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.athletes.feature3')}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{$_('landing.athletes.feature4')}</span>
            </li>
          </ul>
          <a href="/register?role=athlete" class="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {$_('landing.athletes.cta')}
          </a>
        </div>
        <div class="md:w-1/2">
          <div class="bg-white p-4 rounded-xl shadow-md">
            <img src="/images/athlete-dashboard.png" alt="Athlete Dashboard" class="rounded-lg" 
                 on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/600x400?text=Athlete+Dashboard'); }}>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Download App Section -->
  <div class="bg-gray-900 text-white py-20">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-6">{$_('landing.app.title')}</h2>
      <p class="text-xl mb-10 max-w-2xl mx-auto">
        {$_('landing.app.subtitle')}
      </p>
      <div class="flex flex-col sm:flex-row gap-6 justify-center mb-12">
        <a href="#" class="flex items-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.039 13.603c-.023-2.75 2.246-4.077 2.349-4.142-1.282-1.878-3.274-2.136-3.983-2.163-1.684-.172-3.309 1.006-4.164 1.006-.872 0-2.19-.983-3.608-.956-1.835.027-3.554 1.085-4.503 2.728-1.939 3.369-.494 8.324 1.369 11.046.932 1.331 2.027 2.819 3.458 2.762 1.399-.057 1.922-.889 3.613-.889 1.67 0 2.162.889 3.622.855 1.501-.023 2.451-1.342 3.354-2.683.687-.993 1.228-2.073 1.228-2.073-.027-.012-2.357-.904-2.379-3.594-.021-.21 0 0 0 0z"/>
            <path d="M14.55 4.144c.753-.932 1.269-2.207 1.128-3.494-1.092.048-2.452.741-3.236 1.646-.698.82-1.321 2.159-1.159 3.418 1.233.093 2.493-.636 3.267-1.57z"/>
          </svg>
          <div class="text-left">
            <div class="text-xs">{$_('landing.app.appstore.label')}</div>
            <div class="text-lg font-semibold">{$_('landing.app.appstore.name')}</div>
          </div>
        </a>
        <a href="#" class="flex items-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814c-.281.281-.427.663-.427 1.089v18.194c0 .426.147.808.427 1.089l.067.067 10.224-10.224v-.235l-10.224-10.224-.067.067zM14.276 13.039l3.405-3.405-.76-.76-4.12-2.347-3.405 3.405v.235l3.405 3.405.76.76 4.12-2.347z"/>
            <path d="M20.4 11.293l-2.724-1.553-3.462 3.46 3.462 3.462 2.723-1.553c.808-.46 1.35-1.311 1.35-2.278s-.542-1.819-1.35-2.279z"/>
            <path d="M14.276 10.854l-4.12-2.347-7.328 7.328c.274.274.64.431 1.033.431.194 0 .387-.04.567-.12l9.847-5.292z"/>
          </svg>
          <div class="text-left">
            <div class="text-xs">{$_('landing.app.googleplay.label')}</div>
            <div class="text-lg font-semibold">{$_('landing.app.googleplay.name')}</div>
          </div>
        </a>
      </div>
      <div class="flex justify-center">
        <img src="/images/app-mockup.png" alt="Fitzio App" class="max-w-xs" 
             on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/300x600?text=Fitzio+App'); }}>
      </div>
    </div>
  </div>

  <!-- Testimonial Section -->
  <div class="bg-white py-20">
    <div class="container mx-auto px-4 max-w-4xl text-center">
      <h2 class="text-3xl font-bold mb-10">{$_('testimonial.title')}</h2>
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