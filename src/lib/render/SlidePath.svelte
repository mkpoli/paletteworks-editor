<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte'
  
  import COLORS from '$lib/colors'
  import { LANE_WIDTH } from '$lib/consts';
  import { position } from '$lib/position'
  
  import type { SlideNote } from '$lib/score/beatmap'
  import type PIXI from 'pixi.js'

  export let notes: SlideNote[]
  export let critical: boolean 

  const dispatch = createEventDispatcher<{
    'click': void,
    'dblclick': void,
  }>()

  const EASE_RATIOS = {
    curved: 0.5,
    straight: 0
  }
  const SHRINK_WIDTH = LANE_WIDTH / 8

  let graphics: PIXI.Graphics
  let PIXI: typeof import('pixi.js')
  const app = getContext<PIXI.Application>('app')
  onMount(async () => {
    PIXI = await import('pixi.js')
    graphics = new PIXI.Graphics()
    graphics.interactive = true
    graphics.addListener('click', () => {
      dispatch('click')
    })
    graphics.addListener('dblclick', () => {
      dispatch('dblclick')
    })
    app.stage.addChild(graphics)
  })

  onDestroy(() => {
    app.stage.removeChild(graphics)
  })

  $: graphics && $position && drawSlidePath(notes)
  export function drawSlidePath(slideNotes: SlideNote[]) {
    graphics.clear()
    slideNotes
    .reduce((acc: [SlideNote, SlideNote][], _: SlideNote, ind: number, arr: SlideNote[]) => {
        if (ind < arr.length - 1) {
          acc.push([arr[ind], arr[ind + 1]])
        }
        return acc
      }, [] as [SlideNote, SlideNote][])
      .forEach(([origin, target]) => {
        const easeInRatio = 'easeType' in origin && origin.easeType === 'easeIn' ? EASE_RATIOS.curved : EASE_RATIOS.straight
        const easeOutRatio = 'easeType' in origin && origin.easeType === 'easeOut' ? EASE_RATIOS.curved : EASE_RATIOS.straight

        const origin_x_left = $position.calcX(origin.lane) + SHRINK_WIDTH
        const origin_x_right = $position.calcX(origin.lane) + origin.width * LANE_WIDTH - SHRINK_WIDTH
        const origin_y = $position.calcY(origin.tick) 
        
        const target_x_left = $position.calcX(target.lane) + SHRINK_WIDTH
        const target_x_right = $position.calcX(target.lane) + target.width * LANE_WIDTH - SHRINK_WIDTH
        const target_y = $position.calcY(target.tick)

        graphics.beginFill(critical ? COLORS.COLOR_SLIDE_PATH : COLORS.COLOR_SLIDE_PATH_CRITICAL, COLORS.ALPHA_SLIDE_PATH)
        graphics.moveTo(origin_x_left, origin_y)
        graphics.bezierCurveTo(origin_x_left, origin_y - (origin_y - target_y) * easeInRatio, target_x_left, target_y + (origin_y - target_y) * easeOutRatio, target_x_left, target_y)
        // graphics.moveTo(target_x_left, target_y)
        graphics.lineTo(target_x_right, target_y)
        graphics.bezierCurveTo(target_x_right, target_y + (origin_y - target_y) * easeOutRatio, origin_x_right, origin_y - (origin_y - target_y) * easeInRatio, origin_x_right, origin_y)
        graphics.closePath()
        graphics.endFill()
        // graphics.lineTo(origin_x_right, origin_y)
        // graphics.moveTo(origin_x_right, origin_y)
      })    
  }
</script>
 