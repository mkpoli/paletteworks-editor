import preprocess from 'svelte-preprocess'
import path from 'path'
import static_ from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    adapter: static_(),
    vite: {
      assetsInclude: ['**/*.fnt'],
      resolve: {
        alias: {
          $assets: path.resolve('./src/assets'),
          $i18n: path.resolve('./src/i18n'),
        },
      },
      define: {
        'process.env.PACKAGE_VERSION': JSON.stringify(
          process.env.npm_package_version
        ),
      },
    },
  },
}

export default config
