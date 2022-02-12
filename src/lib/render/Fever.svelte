<script lang="ts">
  import feverStartPNG from '$assets/fever_start.png'
  import feverEndPNG from '$assets/fever_end.png'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Fever } from '$lib/score/beatmap'

  // Constants
  import { Z_INDEX } from '$lib/consts'
  const FEVER_GAP = 5

  // Props
  export let fever: Fever

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let feverStart: PIXI.Sprite
  let feverEnd: PIXI.Sprite
  let graphics: PIXI.Graphics

  onMount(async () => {
    feverStart = new PIXI.Sprite(PIXI.Texture.from(feverStartPNG))
    feverEnd = new PIXI.Sprite(PIXI.Texture.from(feverEndPNG))
    feverStart.zIndex = Z_INDEX.GAMESCRIPT
    feverEnd.zIndex = Z_INDEX.GAMESCRIPT
    feverStart.scale.set(0.5)
    feverEnd.scale.set(0.5)
    feverStart.anchor.set(0, 0.5)
    feverEnd.anchor.set(0, 0.5)

    graphics = new PIXI.Graphics()
  })

  $: fever && feverStart && feverEnd && drawFever($position)

  function drawFever(position: PositionManager) {
    const [startTick, endTick] = fever!
    const left = position.calcLeft()
    feverStart.x = left + position.laneAreaWidth + FEVER_GAP
    feverEnd.x = left + position.laneAreaWidth + FEVER_GAP
    feverStart.y = position.calcY(startTick)
    feverEnd.y = position.calcY(endTick)
  }

  $: if (fever) {
    mainContainer.addChild(feverStart)
    mainContainer.addChild(feverEnd)
    mainContainer.addChild(graphics)
  } else {
    mainContainer.removeChild(feverStart)
    mainContainer.removeChild(feverEnd)
    mainContainer.removeChild(graphics)
  }
</script>
