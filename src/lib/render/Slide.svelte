<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Slide as SlideType } from "$lib/score/beatmap";

  // Svelte
  import { getContext, onMount, SvelteComponent } from "svelte";

  // Components
  import Note from '$lib/render/Note.svelte'
  let Graphics: typeof SvelteComponent
  let Container: typeof SvelteComponent
  let PIXI: typeof import('pixi.js')
  onMount(async () => {
    ({ Graphics, Container } = await import('svelte-pixi'));
    PIXI = await import('pixi.js')
  })
  import { position } from '$lib/position'

  import { drawDiamonds, drawSlidePath } from "$lib/render/renderer";
  export let slide: SlideType

  let measureHeight: number
  position.subscribe((v) => {
    measureHeight = v.measureHeight
  })

  let { start, end, critical, steps } = slide

  let container: PIXI.Container

  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  $: if (PIXI) drawDiamonds(slide, measureHeight, container, PIXI, TEXTURES)

</script>

<!-- SLIDE PATH -->
<svelte:component
  this={Graphics}
  draw={(graphics) => {drawSlidePath(
    graphics, [
      start, ...steps.filter((x) => !x.ignored) , end
    ], critical, measureHeight)}}
/>

<!-- SLIDE START -->
<Note
  type={
    critical ? 'critical' : 'slide'
  }
  {...{ lane: start.lane, tick: start.tick, width: start.width, measureHeight }}
/>

<!-- SLIDE STEPS -->
<svelte:component
  this={Container}
  bind:instance={container}
/>

<!-- SLIDE END -->
<Note
  type={
    critical
      ? 'critical'
      : end.flick !== 'no'
        ? 'flick'
        : 'slide'
  }
  {...{ lane: end.lane, tick: end.tick, width: end.width, measureHeight }}
/>