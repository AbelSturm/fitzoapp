<script lang="ts">
  export let name: string = "";
  export let id: string = name;
  export let label: string = "";
  export let value: string = "";
  export let options: Array<{value: string, label: string}> = [];
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = "";
  export let placeholder: string = "Select an option";
  
  // Bind the value to enable two-way binding
  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = target.value;
    dispatch('change', value);
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
  
  <select
    {name}
    {id}
    {required}
    {disabled}
    on:change={handleChange}
    class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
           bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 
           focus:border-transparent {error ? 'border-red-500' : ''}"
  >
    <option value="" disabled selected={!value}>{placeholder}</option>
    {#each options as option}
      <option value={option.value} selected={value === option.value}>
        {option.label}
      </option>
    {/each}
  </select>
  
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div> 