<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'
  import type { Flick } from "$lib/score/beatmap"

  // Functions
  import { getContext, onDestroy, onMount } from "svelte";

  // Contexts
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Props
  export let critical: boolean
  export let x: number
  export let y: number
  export let width: number
  export let flick: Flick
  export let alpha: number = 1

  let sprite: PIXI.Sprite

  onMount(() => {
    sprite = new PIXI.Sprite()
    sprite.anchor.x = 0.5
    sprite.anchor.y = 0.5
    sprite.scale.y = 0.25
    sprite.zIndex = 4
    mainContainer.addChild(sprite)
  })

  onDestroy(() => {
    mainContainer.removeChild(sprite)
  })
  
  $: if (sprite) sprite.alpha = alpha
  $: if (sprite) sprite.x = x
  $: if (sprite) sprite.y = y
  $: if (sprite) sprite.visible = flick !== 'no'
  $: if (sprite) sprite.texture = TEXTURES[
      `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.min(width, 6) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
    ]
  $: if (sprite) sprite.scale.x = 0.25 * (flick === 'left' ? 1 : -1)
</script>
