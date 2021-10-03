<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Slide as SlideType, SlideNote } from "$lib/beatmap";

  // Svelte
  import { getContext, onMount, SvelteComponent } from "svelte";

  // Components
  import Note from '$lib/render/Note.svelte'
  let Graphics: typeof SvelteComponent
  let Sprite: typeof SvelteComponent
  onMount(async () => {
    ({ Graphics, Sprite } = await import('svelte-pixi'));
  })

  import { drawSlidePath } from "$lib/renderer";
  import { calcX, calcY } from "$lib/timing";
  import { DIAMOND_HEIGHT, DIAMOND_PIVOT, DIAMOND_WIDTH, NOTE_WIDTH } from "$lib/consts";

  export let slide: SlideType
  export let measureHeight: number
  let { start, end, critical, steps } = slide


  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // slides.forEach(({ start, end, steps, critical }) => {
  //   [start, ...steps, end].reduce((acc: [SlideNode, SlideNode][], ele: SlideNode, ind: number, arr: SlideNode[]) => {
  //     if (ind < arr.length - 1) {
  //       acc.push([arr[ind], arr[ind + 1]])
  //     }
  //     return acc
  //   }, [] as [SlideNode, SlideNode][])
  //   .forEach(([origin, target]) => {
  //     const easeInRatio = 'easeType' in origin && origin.easeType === 'easeIn' ? EASE_RATIOS.curved : EASE_RATIOS.straight
  //     const easeOutRatio = 'easeType' in origin && origin.easeType === 'easeOut' ? EASE_RATIOS.curved : EASE_RATIOS.straight

  //     const origin_x_left = calcX(origin.lane) + SHRINK_WIDTH
  //     const origin_x_right = calcX(origin.lane) + origin.width * LANE_WIDTH - SHRINK_WIDTH
  //     const origin_y = calcY(origin.tick, measureHeight) 
      
  //     const target_x_left = calcX(target.lane) + SHRINK_WIDTH
  //     const target_x_right = calcX(target.lane) + target.width * LANE_WIDTH - SHRINK_WIDTH
  //     const target_y = calcY(target.tick, measureHeight)

  //     graphics.beginFill(critical ? COLORS.COLOR_SLIDE_PATH : COLORS.COLOR_SLIDE_PATH_CRITICAL, COLORS.ALPHA_SLIDE_PATH)
  //     graphics.moveTo(origin_x_left, origin_y)
  //     graphics.bezierCurveTo(origin_x_left, origin_y - (origin_y - target_y) * easeInRatio, target_x_left, target_y + (origin_y - target_y) * easeOutRatio, target_x_left, target_y)
  //     // graphics.moveTo(target_x_left, target_y)
  //     graphics.lineTo(target_x_right, target_y)
  //     graphics.bezierCurveTo(target_x_right, target_y + (origin_y - target_y) * easeOutRatio, origin_x_right, origin_y - (origin_y - target_y) * easeInRatio, origin_x_right, origin_y)
  //     graphics.closePath()
  //     graphics.endFill()
  //     // graphics.lineTo(origin_x_right, origin_y)
  //     // graphics.moveTo(origin_x_right, origin_y)
  //   })
  // })
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
{#each steps as { lane, tick, width, diamond }}
  {#if diamond}
    <svelte:component
      this={Sprite}
      texture={TEXTURES[`notes_long_among${critical ? '_crtcl' : ''}.png`]}
      anchor={{
        x: DIAMOND_PIVOT[0],
        y: DIAMOND_PIVOT[1]
      }}
      x={calcX(lane) + (width * NOTE_WIDTH) / 2 - DIAMOND_WIDTH}
      y={calcY(tick, measureHeight)}
      width={DIAMOND_WIDTH}
      height={DIAMOND_HEIGHT}
    />
  {/if}
{/each}

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