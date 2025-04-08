<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<footer class="bg-white border-t">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-center items-center gap-8 text-gray-600">
      <a href="mailto:support@fitzio.app" class="hover:text-gray-900">{$_('footer.contact')}</a>
      <a href="/privacy" class="hover:text-gray-900">{$_('footer.privacy')}</a>
    </div>
    
    <div class="mt-8 text-center text-gray-500 text-sm">
      <p>&copy; {new Date().getFullYear()} Fitzio. {$_('footer.rights')}</p>
    </div>
  </div>
</footer>