<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { onMount } from 'svelte';
  import { locale, _ } from 'svelte-i18n';
  import '$lib/i18n';
  import { page } from '$app/stores';

  // Set initial locale immediately
  const browserLang = typeof window !== 'undefined' 
    ? window.navigator.language.split('-')[0]
    : 'en';
    
  locale.set(['en', 'es', 'ca'].includes(browserLang) ? browserLang : 'en');

  onMount(() => {
    // Update locale on mount if needed
    const currentLang = window.navigator.language.split('-')[0];
    if (['en', 'es', 'ca'].includes(currentLang)) {
      locale.set(currentLang);
    }
  });

  // Check if current page is in dashboard
  $: isDashboard = $page.url.pathname.startsWith('/dashboard');
</script>

<div class="min-h-screen flex flex-col">
  {#if !isDashboard}
    <Header />
  {/if}
  <main class="flex-grow">
    <slot />
  </main>
  {#if !isDashboard}
    <Footer />
  {/if}
</div>