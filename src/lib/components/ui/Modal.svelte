<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let title: string = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  const dispatch = createEventDispatcher();
  const onClose = () => dispatch('close');
  
  // Handle ESC key press to close modal
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
  
  // Get the modal size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    document.body.classList.add('overflow-hidden');
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.classList.remove('overflow-hidden');
    };
  });
</script>

<!-- Backdrop -->
<div 
  class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  on:click|self={onClose}
>
  <!-- Modal content -->
  <div class="bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} transform transition-all">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-lg font-medium">{title}</h3>
      <button 
        class="text-gray-400 hover:text-gray-500 focus:outline-none"
        on:click={onClose}
      >
        <span class="sr-only">Close</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Body -->
    <div class="px-6 py-4">
      <slot />
    </div>
  </div>
</div> 