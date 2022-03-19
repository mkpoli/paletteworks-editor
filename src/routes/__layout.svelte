<script context="module" lang="ts">
  import type { Locales } from '$i18n/i18n-types'
  import type { Load } from '@sveltejs/kit'
  import { loadLocaleAsync } from '$i18n/i18n-util.async'
  export const load: Load = async ({ session }) => {
    const locale = (session as any).locale
    await loadLocaleAsync(locale)
    return {
      props: {
        locale,
      },
    }
  }
</script>

<script lang="ts">
  import '@mszu/pixi-ssr-shim'
  import '$lib/style.css'

  import { setLocale } from '$i18n/i18n-svelte'
  export let locale: Locales
  setLocale(locale)
</script>

<slot />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Jura:wght@500&family=M+PLUS+1p:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>
