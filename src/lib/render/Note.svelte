<script lang="ts">
  import { NOTE_HEIGHT, Z_INDEX } from '$lib/consts'
  import { getContext, onDestroy, onMount } from "svelte"
  import { position } from '$lib/position'
  import { preferences } from '$lib/preferences'
  import { NotePlane } from './note'

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
  export let floating: boolean = false

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
  // let instance: PIXI.NineSlicePlane
  let instance: NotePlane

  let colorMatrixFilter: InstanceType<typeof PIXI.filters.ColorMatrixFilter>
  let alphaFilter: InstanceType<typeof PIXI.filters.AlphaFilter>
  onMount(() => {
    const texture = TEXTURES[NOTE_TEXTURE[type]]
    instance = new NotePlane(texture)

    colorMatrixFilter = new PIXI.filters.ColorMatrixFilter()
    
    alphaFilter = new PIXI.filters.AlphaFilter()

    instance.filters = [colorMatrixFilter, alphaFilter]
    instance.zIndex = floating ? Z_INDEX.FLOATING_NOTE : Z_INDEX.NOTE
    instance.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    mainContainer.addChild(instance)
  })

  onDestroy(() => {
    mainContainer.removeChild(instance)
  })
  
  $: x = $position.calcMidX(lane, width)
  $: y = $position.calcY(tick)
  $: rawWidth = width * $position.laneWidth
  $: height = $preferences.noteHeight * 30
  $: type = calcType(critical, flick, slide)
  $: if (instance) instance.update(x, y, rawWidth, height)
  $: if (instance) instance.texture = TEXTURES[NOTE_TEXTURE[type]]
  $: if (instance) colorMatrixFilter.tint(tint)
  $: if (instance) alphaFilter.alpha = alpha
  $: if (instance) console.log('width', width, ' vertices', instance.vertices, 'uvcoords', instance.uvCoords)

  function calcType(critical: boolean, flick: Flick, slide: boolean): Type {
    return critical
            ? 'critical'
            : flick !== 'no'
              ? 'flick'
              : slide
                ? 'slide'
                : 'tap'
  }
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
