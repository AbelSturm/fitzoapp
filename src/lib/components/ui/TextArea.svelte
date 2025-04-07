<script lang="ts">
  export let name: string = "";
  export let id: string = name;
  export let label: string = "";
  export let placeholder: string = "";
  export let value: string = "";
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = "";
  export let rows: number = 4;
  
  // Bind the value to enable two-way binding
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('input', value);
  }
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="mb-4">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <textarea
    {name}
    {id}
    {placeholder}
    {required}
    {disabled}
    {rows}
    on:input={handleInput}
    class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 
           focus:border-transparent {error ? 'border-red-500' : ''}"
  >{value}</textarea>
  
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div> 