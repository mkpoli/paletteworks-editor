<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing'
  import type { Score, Single, Slide as SlideType } from '$lib/score/beatmap';

  import { getContext } from 'svelte'
  import { calcX, calcY } from '$lib/timing'
  import { Pixi, Text, Graphics } from 'svelte-pixi'
  import { LANE_WIDTH, MARGIN, MARGIN_BOTTOM, TEXT_MARGIN } from '$lib/consts'
  import { drawBackground, drawBPMs, drawSnappingElements, drawPlayhead } from '$lib/render/renderer';

  // Notes
  import Note from '$lib/render/Note.svelte'
  import Arrow from '$lib/render/Arrow.svelte'
  import Slide from '$lib/render/Slide.svelte'

  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let measureHeight: number
  export let currentTick: number
  export let maxTick: number
  export let maxMeasure: number
  export let pointerLane: number
  export let pointerTick: number
  export let currentMode: Mode
  export let innerHeight: number

  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  export let singles: Single[]
  export let slides: SlideType[]
  export let bpms: Map<number, number>
</script>

<Pixi {app}>
  <!-- PLAYHEAD -->
  <Graphics
    draw={(graphics) => {
      drawPlayhead(graphics, PIXI, calcY(currentTick, measureHeight))
    }}
  />

  <!-- BACKGROUND -->
  <Graphics
    draw={(graphics) => { drawBackground(PIXI, graphics, measureHeight, calcY(maxTick, measureHeight), maxMeasure, innerHeight) }}
  />

  <!-- BPM -->
  <Graphics
    draw={(graphics) => { drawBPMs(graphics, PIXI, bpms, measureHeight) }}
  />

  <!-- SINGLE NOTES -->
  {#each singles as { lane, tick, width, critical, flick }}
    <Note
      type={
        critical
          ? 'critical'
          : flick !== 'no'
            ? 'flick'
            : 'tap'
          }
      {...{ lane, tick, width, measureHeight }}
    />
  {/each}

  <!-- SLIDE NOTES -->
  {#each slides as slide}
    <Slide {slide} {measureHeight} />
  {/each}

  <!-- FLICK ARROW -->
  {#each singles as { lane, tick, width, critical, flick }}
    {#if flick !== 'no'}
      <Arrow
        {...{ lane, tick, width, critical, flick, measureHeight }}
      />
    {/if}
  {/each}
  {#each slides as { end: { lane, tick, width, flick }, critical }}
    {#if flick !== 'no'}
      <Arrow
        {...{ lane, tick, width, critical, flick, measureHeight }}
      />
    {/if}
  {/each}

  <!-- FLOATING ITEMS -->
  <Graphics
    draw={(graphics) => {
      drawSnappingElements(
        graphics, PIXI, TEXTURES, currentMode,
        calcX(pointerLane) + LANE_WIDTH, calcY(pointerTick, measureHeight),
        bpms.has(pointerTick)
      )
    }}
  />
</Pixi>