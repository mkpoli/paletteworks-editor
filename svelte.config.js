import preprocess from 'svelte-preprocess'
import path from 'path'
import vercel from '@sveltejs/adapter-vercel'
/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    adapter: vercel(),
    vite: {
      resolve: {
        alias: {
          '$assets': path.resolve('./src/assets')
        }
      },
      define: {
        'process.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version)
      }
    }
  }
}

export default config
