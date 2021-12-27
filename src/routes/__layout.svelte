<script context="module" lang="ts">
	import { initI18n } from '$i18n/i18n-svelte'
	import type { Load } from '@sveltejs/kit'
  export const load: Load = async ({ session }) => {
    await initI18n(session.locale)
    return {}
  }
  // import type { Locales } from '$i18n/i18n-types'
	// import { replaceLocaleInUrl } from '../utils'
	// import { baseLocale, locales } from '$i18n/i18n-util'
	// export const load: Load = async ({ page, session }) => {
	// 	const lang = page.params.lang as Locales
	// 	// redirect to preferred language if user comes from page root
	// 	if (!lang) {
	// 		return {
	// 			status: 302,
	// 			redirect: `/${session.locale}`,
	// 		}
	// 	}
	// 	// redirect to base locale if language is not present
	// 	if (!locales.includes(lang)) {
	// 		return {
	// 			status: 302,
	// 			redirect: replaceLocaleInUrl(page.path, baseLocale),
	// 		}
	// 	}
	// 	// delete session locale since we don't need it to be sent to the client
	// 	delete session.locale
	// 	await initI18n(lang)
	// 	return {}
	// }
</script>

<script>
  import '@mszu/pixi-ssr-shim'
  import '$lib/style.css'
</script>

<slot />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Jura:wght@500&family=M+PLUS+1p:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>