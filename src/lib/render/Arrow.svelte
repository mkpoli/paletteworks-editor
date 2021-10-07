<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Flick } from "$lib/score/beatmap"
  import { LANE_WIDTH, MARGIN, NOTE_HEIGHT } from '$lib/consts';

  import { getContext, onMount, SvelteComponent } from "svelte";
  import { calcY } from '$lib/timing';

  let Sprite: typeof SvelteComponent
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  onMount(async () => {
    ({ Sprite } = await import('svelte-pixi'));
  })

  export let critical: boolean
  export let lane: number
  export let tick: number
  export let width: number
  export let flick: Flick
  export let measureHeight: number
</script>

<svelte:component
  this={Sprite}
  texture={
    TEXTURES[
      `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.min(width, 6) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
    ]
  }
  anchor={{
    x: 0.5,
    y: 0.5 
  }}
  x={
    MARGIN + (lane - 1 + width / 2) * LANE_WIDTH
  }
  y={calcY(tick, measureHeight) - NOTE_HEIGHT + 15}
  scale={{
    x: 0.25 * (flick === 'left' ? 1 : -1),
    y: 0.25
  }}
/>
