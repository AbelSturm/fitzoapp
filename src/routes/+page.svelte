<script lang="ts">
  import { _ } from 'svelte-i18n';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import AdminFeatures from '$lib/components/AdminFeatures.svelte';
  import StatsSection from '$lib/components/StatsSection.svelte';
  import MainFeatures from '$lib/components/MainFeatures.svelte';
  import BusinessFeatures from '$lib/components/BusinessFeatures.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import CtaSection from '$lib/components/CtaSection.svelte';
  
  let email = '';
</script>

<div class="min-h-screen">
  <HeroSection bind:email />
  <AdminFeatures />
  <StatsSection />
  <MainFeatures />
  <BusinessFeatures />
  <Testimonials />
  <CtaSection />
</div>