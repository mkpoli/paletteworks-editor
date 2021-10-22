<script lang="ts">
  // Constants
  import { NOTE_HEIGHT } from '$lib/consts';

  // Types
  import type PIXI from 'pixi.js'
  import type { Flick } from "$lib/score/beatmap"

  // Functions
  import { getContext, onMount } from "svelte";

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Props
  export let critical: boolean
  export let lane: number
  export let tick: number
  export let width: number
  export let flick: Flick

  // Stores
  import { position } from '$lib/position'

  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  let sprite: PIXI.Sprite

  let PIXI: typeof import('pixi.js')
  onMount(async () => {
    PIXI = await import('pixi.js')
    sprite = new PIXI.Sprite(TEXTURES[
      `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.min(width, 6) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
    ])
    sprite.anchor.x = 0.5
    sprite.anchor.y = 0.5
    sprite.scale.x = 0.25 * (flick === 'left' ? 1 : -1)
    sprite.scale.y = 0.25
    sprite.zIndex = 3
    app.stage.addChild(sprite)
  })

  $: if (sprite) {
    sprite.x = $position.calcMidX(lane, width)
    sprite.y = $position.calcY(tick) - NOTE_HEIGHT + 15
  }
</script>
