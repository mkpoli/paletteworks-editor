import preprocess from 'svelte-preprocess'
import loadVersion from 'vite-plugin-package-version'
import path from 'path'
/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    vite: {
      resolve: {
        alias: {
          '$assets': path.resolve('./src/assets')
        }
      },
      plugins: [
        loadVersion()
      ]
    }
  }
}

export default config
