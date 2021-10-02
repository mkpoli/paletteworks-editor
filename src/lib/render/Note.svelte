<script lang="ts">
  import { LANE_WIDTH, MARGIN, NOTE_HEIGHT } from '$lib/consts';
  import { calcY } from '$lib/timing';

  import type PIXI from 'pixi.js'

  import { getContext, onMount, SvelteComponent } from "svelte";

  const TYPE2TEXTURE = {
    tap: 'noteN.png',
    flick: 'noteF.png',
    critical: 'noteC.png',
    slide: 'noteL.png'
  }
  export let type: 'tap' | 'flick' | 'critical' | 'slide'
  export let lane: number
  export let tick: number
  export let width: number
  export let measureHeight: number

  const NOTE_WIDTH = 30
  $: noteWidth = width * NOTE_WIDTH

  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  let PIXI: typeof import('pixi.js')
  let Container: typeof SvelteComponent
  let instance: PIXI.NineSlicePlane
  onMount(async () => {
    ({ Container } = await import('svelte-pixi'));
    (PIXI = await import('pixi.js'))

    const texture = TEXTURES[TYPE2TEXTURE[type]]
    instance = new PIXI.NineSlicePlane(
      texture,
      250, 0, 250, 0
    )
    instance = instance
  })
</script>

{#if instance}
<svelte:component
  this={Container}
  bind:instance
  x={MARGIN + (lane - 1 + width / 2) * LANE_WIDTH}
  y={calcY(tick, measureHeight)}
  width={noteWidth}
  height={NOTE_HEIGHT}
  pivot={{
    x: noteWidth * 0.5,
    y: NOTE_HEIGHT * 0.5
  }}
  scale={{
    x: 354 / (248 + 30),
    y: 1
  }}
>
  <slot />
</svelte:component>
{/if}