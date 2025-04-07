<script lang="ts">
  export let title: string = "";
  export let padding: string = "p-6";
  export let rounded: string = "rounded-lg";
  export let shadow: string = "shadow";
  export let bgColor: string = "bg-white";
</script>

<div class="{bgColor} {rounded} {shadow} {padding}">
  {#if title}
    <h2 class="text-xl font-semibold mb-4">{title}</h2>
  {/if}
  <slot />
</div> 