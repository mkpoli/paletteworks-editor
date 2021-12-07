<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'
  import type { Flick } from "$lib/score/beatmap"

  // Functions
  import { getContext, onDestroy, onMount } from "svelte";

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Props
  export let critical: boolean
  export let x: number
  export let y: number
  export let width: number
  export let flick: Flick
  export let alpha: number = 1
  export let zIndex: number = 3
  let sprite: PIXI.Sprite

  onMount(() => {
    sprite = new PIXI.Sprite()
    sprite.anchor.x = 0.5
    sprite.anchor.y = 0.5
    sprite.scale.y = 0.25
    sprite.zIndex = zIndex
    app.stage.addChild(sprite)
  })

  onDestroy(() => {
    app.stage.removeChild(sprite)
  })
  
  $: if (sprite) {
    sprite.x = x
    sprite.y = y
    sprite.alpha = alpha
  }

  $: if (sprite) {
    sprite.texture = TEXTURES[
      `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.min(width, 6) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
    ]
    sprite.scale.x = 0.25 * (flick === 'left' ? 1 : -1)
  }
</script>
