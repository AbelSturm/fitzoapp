import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('es', () => import('./locales/es.json'));
register('ca', () => import('./locales/ca.json'));

init({
  fallbackLocale: 'en',
  initialLocale: browser ? window.navigator.language.split('-')[0] : 'en',
});