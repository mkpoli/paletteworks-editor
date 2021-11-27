<script lang="ts">
  import feverPNG from '$assets/fever.png'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Fever } from '$lib/score/beatmap'

  // Constants
  import { LANE_AREA_WIDTH, MARGIN } from '$lib/consts'
  const FEVER_GAP = 5

  // Props
  export let fever: Fever

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Variables
  let PIXI: typeof import('pixi.js')
  let feverStart: PIXI.Sprite
  let feverEnd: PIXI.Sprite
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')
    const TEXTURE = PIXI.Texture.from(feverPNG)

    feverStart = new PIXI.Sprite(TEXTURE)
    feverEnd = new PIXI.Sprite(TEXTURE)
    feverStart.scale.set(0.5)
    feverEnd.scale.set(0.5)
    feverStart.anchor.set(0, 0.5)
    feverEnd.anchor.set(0, 0.5)
    feverStart.x = MARGIN + LANE_AREA_WIDTH + FEVER_GAP
    feverEnd.x = MARGIN + LANE_AREA_WIDTH + FEVER_GAP
    graphics = new PIXI.Graphics()
  })

  $: fever && feverStart && feverEnd && drawFever($position)

  function drawFever(position: PositionManager) {
    const [startTick, endTick] = fever!
    feverStart.y = position.calcY(startTick)
    feverEnd.y = position.calcY(endTick)
  }

  $: if (fever) {
    app.stage.addChild(feverStart)
    app.stage.addChild(feverEnd)
    app.stage.addChild(graphics)
  } else {
    app.stage.removeChild(feverStart)
    app.stage.removeChild(feverEnd)
    app.stage.removeChild(graphics)
  }
</script>
