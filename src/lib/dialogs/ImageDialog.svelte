<script lang="ts">
  // UI Components
  import Modal from "$lib/ui/Modal.svelte"
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"

  // Types
  import type PIXI from 'pixi.js'

  // Functions
  import { getContext, onMount } from "svelte";
  import { download } from "$lib/basic/file"
  import { snap } from "$lib/basic/math"
  import { MARGIN_BOTTOM, RESOLUTION } from "$lib/consts"
  import { position } from "$lib/position"

  // PIXI
  let PIXI: typeof import('pixi.js')
  onMount(async () => {
    PIXI = await import('pixi.js')
    generatePreview()
  })

  let container: HTMLDivElement

  const app = getContext<PIXI.Application>('app')

  export let opened: boolean
  export let maxMeasure: number

  function generateCanvas(resolution: number): HTMLCanvasElement {
    const measureHeight = $position.measureHeight
    const fullHeight = MARGIN_BOTTOM + maxMeasure * measureHeight + measureHeight 
    const COLUMN_HEIGHT = snap(8192, measureHeight * RESOLUTION)
    const columns = Math.ceil(fullHeight * RESOLUTION / COLUMN_HEIGHT) + 2
    const COLUMN_WIDTH = app.renderer.width * 0.9
    const renderTexture = PIXI.RenderTexture.create({
      width: COLUMN_WIDTH * columns, height: COLUMN_HEIGHT,
      resolution
    })
    
    for (let i = 0; i < columns; i++) {
      app.renderer.render(app.stage, {
        renderTexture, clear: false,
        transform: new PIXI.Matrix(
          RESOLUTION, 0, 0, RESOLUTION,
          i * COLUMN_WIDTH,
          snap((i + 1) * (COLUMN_HEIGHT - measureHeight * RESOLUTION) + app.stage.pivot.y * RESOLUTION, measureHeight * RESOLUTION) + measureHeight * RESOLUTION - innerHeight * RESOLUTION) //fullHeight - 2 * innerHeight
      })
    }
    const canvas = app.renderer.plugins.extract.canvas(renderTexture)
    return canvas
  }

  let preview: HTMLCanvasElement = null

  function generatePreview() {
    const canvas = generateCanvas(0.05)
    preview = canvas
    container.appendChild(canvas)
  }

  $: if (preview && $position) {
    container.removeChild(preview)
    generatePreview()
  }

  function downloadImage() {
    const canvas = generateCanvas(0.35)
    canvas.toBlob((blob: Blob) => {
      download(blob, `${new Date().toISOString().replace(':', '-')}.png`)
    })
  }
</script>

<Modal bind:opened>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <h2>画像出力</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { opened = false }}
      />
    </div>
    <div class="canvas-container" bind:this={container}></div>
    <Button
      class="ok"
      icon='ic:baseline-photo-camera'
      on:click={() => { downloadImage(); opened = false }}
    >
      出力する
    </Button>
  </div> 
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    grid-template-columns: repeat(5, 3em);
    grid-template-areas:
      "h h . . x"
      "t t t t t"
      "t t t t t"
      ". o o o ."
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
    max-height: 50vh;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>