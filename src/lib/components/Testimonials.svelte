<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="py-16 bg-gradient-to-br from-purple-900 to-purple-800 text-white">
  <div class="container mx-auto px-4">
    <h2 class="text-5xl font-bold mb-4 text-center">Loved by world-class trainers</h2>
    <p class="text-lg text-center mb-12">Personal trainers around the world reach for Fitzio by choice.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- Testimonial 1 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          {$_('testimonials.testimonial1.quote')}
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user1.png" alt={$_('testimonials.testimonial1.author')} class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">{$_('testimonials.testimonial1.author')}</p>
            <p class="text-gray-300">{$_('testimonials.testimonial1.company')}</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 2 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          {$_('testimonials.testimonial2.quote')}
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user2.png" alt={$_('testimonials.testimonial2.author')} class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">{$_('testimonials.testimonial2.author')}</p>
            <p class="text-gray-300">{$_('testimonials.testimonial2.company')}</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 3 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          "Fitzio is 🔥 for real. It's changed how I deliver workouts to my clients."
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user3.png" alt="Steven Tey" class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">Steven Tey</p>
            <p class="text-gray-300">Dub</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 4 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          "Fitzio is at least a 2x improvement over spreadsheets. It's amazing having all client data in one place."
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user4.png" alt="Ben Bernard" class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">Ben Bernard</p>
            <p class="text-gray-300">Instacart</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 5 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          "Started using Fitzio yesterday & I'm blown away. It's how client management should feel."
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user5.png" alt="Logan Kilpatrick" class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">Logan Kilpatrick</p>
            <p class="text-gray-300">Google</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 6 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          {$_('testimonials.testimonial3.quote')}
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user6.png" alt={$_('testimonials.testimonial3.author')} class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">{$_('testimonials.testimonial3.author')}</p>
            <p class="text-gray-300">{$_('testimonials.testimonial3.company')}</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 7 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          "I really like how Fitzio tracks client progress. It noticed workout consistency patterns and suggested adjustments to improve client retention!"
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user7.png" alt="Wes Bos" class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">Wes Bos</p>
            <p class="text-gray-300">Internet</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial 8 -->
      <div class="bg-gradient-to-br from-purple-800 to-purple-700 p-6 rounded-xl shadow-lg">
        <p class="text-lg mb-6">
          "Fitzio is the best personal training software right now, avoid others at your own peril"
        </p>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img src="/images/testimonials/user8.png" alt="Johannes Schickling" class="w-full h-full object-cover" 
                on:error={e => { e.currentTarget.setAttribute('src', 'https://placehold.co/200x200?text=User'); }}>
          </div>
          <div>
            <p class="font-semibold text-orange-300">Johannes Schickling</p>
            <p class="text-gray-300">Prisma</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 