<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // UI Components
  import Modal from '$lib/ui/Modal.svelte'
  import Button from '$lib/ui/Button.svelte'
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Constants
  import { MARGIN_BOTTOM, RESOLUTION, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '$lib/consts'

  // Functions
  import { getContext } from 'svelte'
  import { download } from '$lib/basic/file'
  import { clamp, snap } from '$lib/basic/math'
  import { position, scrollY } from '$lib/position'

  // Props
  export let opened: boolean
  export let maxMeasure: number
  export let zoom: number


  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')
      
  let container: HTMLDivElement
  let preview: HTMLCanvasElement

  function generateCanvas(resolution: number): HTMLCanvasElement {
    const measureHeight = $position.measureHeight
    const fullHeight = MARGIN_BOTTOM + maxMeasure * measureHeight + measureHeight
    // const COLUMN_HEIGHT = snap(8192, measureHeight * RESOLUTION)
    const COLUMN_HEIGHT = clamp(8192, snap(measureHeight * RESOLUTION, 8192), Infinity)
    // const COLUMN_HEIGHT = 8192
    const columns = Math.ceil(fullHeight * RESOLUTION / COLUMN_HEIGHT) + 2
    const COLUMN_WIDTH = app.renderer.width * 0.9
    const renderTexture = PIXI.RenderTexture.create({
      width: COLUMN_WIDTH * columns, height: COLUMN_HEIGHT,
      resolution
    })
    
    for (let i = 0; i < columns; i++) {
      app.renderer.render(mainContainer, {
        renderTexture, clear: false,
        transform: new PIXI.Matrix(
          RESOLUTION, 0, 0, RESOLUTION,
          i * COLUMN_WIDTH,
          snap((i + 1) * (COLUMN_HEIGHT - measureHeight * RESOLUTION) + $scrollY * RESOLUTION, measureHeight * RESOLUTION) + measureHeight * RESOLUTION - innerHeight * RESOLUTION) //fullHeight - 2 * innerHeight
      })
    }
    const canvas = app.renderer.plugins.extract.canvas(renderTexture)
    return canvas
  }

  function generatePreview() {
    preview = generateCanvas(0.1)
    container.appendChild(preview)
  }

  $: if (opened && container && $position) {
    if (preview) {
      container.removeChild(preview)
    }
    generatePreview()
  }

  function downloadImage() {
    const canvas = generateCanvas(0.35)
    canvas.toBlob((blob: Blob | null) => {
      download(blob!, `${new Date().toISOString().replace(':', '-')}.png`)
    })
  }
</script>

<Modal bind:opened>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <h2>{$LL.editor.dialog.imageTitle()}</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { opened = false }}
      />
    </div>
    <div class="canvas-container" bind:this={container}></div>
    <div class="zoom-container">
      <ZoomIndicator
        bind:zoom
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={ZOOM_STEP}
      />
    </div>
    <Button
      class="ok"
      icon='ic:baseline-photo-camera'
      on:click={() => { downloadImage(); opened = false }}
    >
      {$LL.editor.dialog.export()}
    </Button>
  </div> 
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    grid-template-columns: repeat(7, 3em);
    grid-template-areas:
      "h h h h . . x"
      "t t t t t t z"
      "t t t t t t z"
      ". o o o o o ."
  }

  .close {
    height: auto;
    width: auto;
  }

  h2 {
    grid-area: h;
    display: block;
    margin: 0;
  }

  [slot=presentation] :global(.ok) {
    grid-area: o;

    background: linear-gradient(180deg, #009C70 0%, #008080 100%);
  }

  [slot=presentation] .canvas-container {
    grid-area: t;
    height: 50vh;
    overflow-x: auto;
  }

  .canvas-container :global(canvas) {
    height: 100%;
    width: auto;
  }

  .zoom-container {
    grid-area: z;

    display: flex;
    flex-direction: column;
    justify-content: end;
    flex-grow: 0;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>