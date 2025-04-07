<script lang="ts">
  export let type: "button" | "submit" | "reset" = "button";
  export let variant: "primary" | "secondary" | "outline" | "danger" = "primary";
  export let size: "sm" | "md" | "lg" = "md";
  export let disabled: boolean = false;
  export let fullWidth: boolean = false;
  export let href: string = "";
  
  // Variant classes
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white border-transparent",
    secondary: "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
    outline: "bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white border-transparent"
  };
  
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  const classes = `
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${fullWidth ? 'w-full' : ''} 
    rounded-lg font-medium border transition-colors duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
</script>

{#if href}
  <a {href} class={classes} on:click role="button" tabindex="0">
    <slot />
  </a>
{:else}
  <button 
    {type} 
    class={classes} 
    {disabled} 
    on:click 
    on:submit
  >
    <slot />
  </button>
{/if} 