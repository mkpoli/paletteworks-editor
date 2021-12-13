<script lang="ts">
  import { NOTE_HEIGHT } from '$lib/consts'
  import { getContext, onDestroy, onMount } from "svelte"
  import { position } from '$lib/position'

  import type PIXI from 'pixi.js'
  import type { Flick, Type } from '$lib/score/beatmap'

  export let tick: number
  export let lane: number
  export let width: number
  export let critical: boolean
  export let flick: Flick
  export let slide: boolean
  export let alpha: number = 1
  export let tint: number = 0xFFFFFF
  export let zIndex: number = 1

  import Arrow from '$lib/render/Arrow.svelte'

  const NOTE_TEXTURE: Record<Type, string> = {
    tap: 'noteN.png',
    critical: 'noteC.png',
    flick: 'noteF.png',
    slide: 'noteL.png',
  }

  // Contexts
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let instance: PIXI.NineSlicePlane

  onMount(() => {
    const texture = TEXTURES[NOTE_TEXTURE[type]]
    instance = new PIXI.NineSlicePlane(
      texture,
      100, 0, 100, 0
    )
    instance.height = NOTE_HEIGHT
    instance.pivot.y = NOTE_HEIGHT * 0.5
    instance.scale.x = 0.25
    instance.scale.y = 1
    instance.zIndex = zIndex
    instance.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    mainContainer.addChild(instance)
  })

  onDestroy(() => {
    mainContainer.removeChild(instance)
  })
  
  $: x = $position.calcMidX(lane, width)
  $: y = $position.calcY(tick)
  $: rawWidth = width * 123 + 100
  $: type = calcType(critical, flick, slide)

  function calcType(critical: boolean, flick: Flick, slide: boolean): Type {
    return critical
            ? 'critical'
            : flick !== 'no'
              ? 'flick'
              : slide
                ? 'slide'
                : 'tap'
  }

  $: if (instance) instance.x = x
  $: if (instance) instance.y = y
  $: if (instance) instance.width = rawWidth
  $: if (instance) instance.pivot.x = rawWidth * 0.5
  $: if (instance) instance.texture = TEXTURES[NOTE_TEXTURE[type]]
  $: if (instance) instance.alpha = alpha
  $: if (instance) instance.tint = tint
</script>

<!-- FLICK ARROW -->
<Arrow
  x={x}
  y={y - NOTE_HEIGHT + 15}
  {width}
  critical={type === 'critical'}
  {flick}
  {alpha}
/>
