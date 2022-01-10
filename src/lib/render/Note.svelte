<script lang="ts">
  import { NOTE_HEIGHT, Z_INDEX } from '$lib/consts'
  import { getContext, onDestroy, onMount } from "svelte"
  import { position } from '$lib/position'
  import { preferences } from '$lib/preferences'

  import type PIXI from 'pixi.js'
  import type { Writable } from 'svelte/store'
  import { calcType, type Flick, type Type } from '$lib/score/beatmap'

  export let tick: number
  export let lane: number
  export let width: number
  export let critical: boolean
  export let flick: Flick
  export let slide: boolean
  export let alpha: number = 1
  export let tint: number = 0xFFFFFF
  export let floating: boolean = false

  import Arrow from '$lib/render/Arrow.svelte'


  // Contexts
  const noteTextures = getContext<Writable<Record<Type, PIXI.Texture[]>>>('noteTextures')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let sprite: PIXI.Sprite

  onMount(() => {
    console.log('rendering note')
    sprite = new PIXI.Sprite()
    sprite.zIndex = floating ? Z_INDEX.FLOATING_NOTE : Z_INDEX.NOTE
    sprite.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    sprite.anchor.set(0.5)
    mainContainer.addChild(sprite)
  })

  onDestroy(() => {
    mainContainer.removeChild(sprite)
  })
  
  $: x = $position.calcMidX(lane, width)
  $: y = $position.calcY(tick)
  $: if (sprite) sprite.position.set(x, y)
  $: type = calcType(critical, flick, slide)
  $: if (sprite) sprite.texture = $noteTextures[type][width - 1]
  $: if (sprite) sprite.tint = tint
  $: if (sprite) sprite.alpha = alpha
</script>

<!-- FLICK ARROW -->
<Arrow
  x={x}
  y={y - NOTE_HEIGHT * $preferences.noteHeight - 10}
  {width}
  critical={type === 'critical'}
  {flick}
  {alpha}
  {floating}
/>
