<script lang="ts">
  import Sidebar from '$lib/components/trainer/Sidebar.svelte';
</script>

<div class="h-screen flex overflow-hidden bg-gray-50">
  <!-- Sidebar is rendered outside the main container to position it at the edge -->
  <Sidebar />
  
  <!-- Main content with proper margin to account for sidebar -->
  <div class="flex flex-col w-full ml-0 md:ml-72">
    <!-- Main content area -->
    <main class="flex-1 relative overflow-y-auto focus:outline-none p-6 pt-20 md:pt-6">
      <slot />
    </main>
  </div>
</div> 