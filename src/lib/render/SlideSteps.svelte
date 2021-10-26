<script lang="ts">
  // Constants
  import { COLORS, DIAMOND_HEIGHT, DIAMOND_WIDTH, LANE_WIDTH, NOTE_HEIGHT, NOTE_WIDTH } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Slide, SlideNote, SlideHead, SlideStep } from '$lib/score/beatmap'
  import NoteControl from './NoteControl.svelte'
  
  // Props
  export let slide: Slide
  export let stepsVisible: boolean

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // Stores
  import { selectedNotes } from '$lib/selection'

  // Variables
  let PIXI: typeof import('pixi.js')
  let container: PIXI.Container
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')

    container = new PIXI.Container()
    container.zIndex = 3
    app.stage.addChild(container)
    
    graphics = new PIXI.Graphics()
    graphics.zIndex = 2
    app.stage.addChild(graphics)
  })

  onDestroy(() => {
    app.stage.removeChild(container)
    app.stage.removeChild(graphics)
  })

  // Draw
  function createDiamond(x: number, y: number, critical: boolean): PIXI.Sprite {
    const sprite = new PIXI.Sprite(TEXTURES[`notes_long_among${critical ? '_crtcl' : ''}.png`])
    sprite.x = x
    sprite.y = y
    sprite.anchor.x = 0.5 
    sprite.anchor.y = 0.5
    sprite.width = DIAMOND_WIDTH
    sprite.height = DIAMOND_HEIGHT
    return sprite
  }

  function drawDiamonds(position: PositionManager, slide: Slide) {
    container.removeChildren()
    const { head, tail, critical, steps } = slide

    let currentGroup: SlideNote[] = [head]
    const connectedGroups = [...steps, tail]
      .reduce((acc: SlideNote[][], ele: SlideNote) => {
        currentGroup.push(ele)
        if (!('ignored' in ele) || !ele.ignored) {
          acc.push([...currentGroup])
          currentGroup = [ele]
        }
        return acc
      }, [])
      // .filter((a: SlideNote[]) => a.length >= 3)
    connectedGroups
      .forEach((arr: SlideNote[]) => {
        const origin = arr.shift() as SlideHead | SlideStep
        const originX = position.calcMidX(origin.lane, origin.width)
        const originY = position.calcY(origin.tick)

        const target = arr.pop()
        const targetX = position.calcMidX(target.lane, target.width)
        const targetY = position.calcY(target.tick)

        if ('diamond' in origin && origin.diamond) {
          container.addChild(createDiamond(originX, originY, critical))
        }

        arr
          .filter((current: SlideStep) => current.diamond)
          .forEach((current) => {
            const currentY = position.calcY(current.tick)

            const a = (targetY - originY) / Math.pow(targetX - originX, 2)

            
            let currentX: number

            switch (origin.easeType) {
              case 'easeIn':
                currentX = (originX > targetX ? 1 : -1) * Math.abs(Math.sqrt((currentY - targetY) / -a)) + targetX
                break
              case 'easeOut':
                currentX = (originX > targetX ? -1 : 1) * Math.abs(Math.sqrt((currentY - originY) / a)) + originX
                break
              default:
                currentX = ((currentY - originY) / (targetY - originY)) * (targetX - originX) + originX
                break
            }
            container.addChild(createDiamond(currentX, currentY, critical))
          })
      })
  }

  const SLIDE_STEP_MARGIN_X = -5
  const SLIDE_STEP_MARGIN_Y = 0
  function drawSteps(position: PositionManager, slide: Slide, visible: boolean) {
    graphics.clear()

    if (!visible) {
      return
    }
    slide.steps.forEach(({ lane, tick, width, ignored }) => {

      const noteWidth = width * LANE_WIDTH
      const currentRect = new PIXI.Rectangle(
        position.calcX(lane), position.calcY(tick) - 0.5 * 0.5 * NOTE_HEIGHT,
        noteWidth, 0.5 * NOTE_HEIGHT
      )

      // graphics.lineStyle(0)
      // 案１      
      if (!ignored) {
        graphics.lineStyle(3, COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP)
        graphics.beginFill(COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP_FILL)
        graphics.drawRoundedRect(
          currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
          currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y,
          5
        )
        graphics.endFill()
        graphics.lineStyle(3, 0xFFFFFF, COLORS.ALPHA_SLIDE_STEP)
        graphics.moveTo(currentRect.left - SLIDE_STEP_MARGIN_X, position.calcY(tick))
        graphics.lineTo(currentRect.right + SLIDE_STEP_MARGIN_X, position.calcY(tick))
      } else {
        graphics.lineStyle(3, 0x00FFF8, COLORS.ALPHA_SLIDE_STEP)
        graphics.beginFill(0x00FFF8, COLORS.ALPHA_SLIDE_STEP_FILL)
        graphics.drawRoundedRect(
          currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
          currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y,
          5
        )
        graphics.endFill()
        graphics.lineStyle(3, 0xFFFFFF, COLORS.ALPHA_SLIDE_STEP)
        graphics.moveTo(currentRect.left - SLIDE_STEP_MARGIN_X, position.calcY(tick))
        graphics.lineTo(currentRect.right + SLIDE_STEP_MARGIN_X, position.calcY(tick))
      }
      
      // 案２      
      // if (!ignored) {
      //   graphics.lineStyle(3, 0xFFFFFF, COLORS.ALPHA_SLIDE_STEP)
      //   graphics.beginFill(0xFFFFFF, COLORS.ALPHA_SLIDE_STEP_FILL)
      //   graphics.drawRoundedRect(
      //     currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
      //     currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y,
      //     5
      //   )
      //   graphics.endFill()
      //   graphics.lineStyle(3, COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP)
      //   graphics.moveTo(currentRect.left - SLIDE_STEP_MARGIN_X, position.calcY(tick))
      //   graphics.lineTo(currentRect.right + SLIDE_STEP_MARGIN_X, position.calcY(tick))
      // } else {
      //   graphics.lineStyle(3, COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP)
      //   graphics.beginFill(COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP_FILL)
      //   graphics.drawRoundedRect(
      //     currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
      //     currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y,
      //     5
      //   )
      //   graphics.endFill()
      //   graphics.lineStyle(3, 0xFFFFFF, COLORS.ALPHA_SLIDE_STEP)
      //   graphics.moveTo(currentRect.left - SLIDE_STEP_MARGIN_X, position.calcY(tick))
      //   graphics.lineTo(currentRect.right + SLIDE_STEP_MARGIN_X, position.calcY(tick))
      // }

      //   graphics.lineStyle(3, 0xFFFFFF, 1)
      //   graphics.beginFill(0xFFFFFF, 1)
      //   graphics.drawRoundedRect(
      //     currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
      //     currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y,
      //     5
      //   )
      //   graphics.endFill()
      // }

  
      // graphics.beginFill(COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP_FILL)
      // if (!ignored) {
      //   graphics.drawRect(
      //     currentRect.x - SLIDE_STEP_MARGIN_X, currentRect.y - SLIDE_STEP_MARGIN_Y,
      //     currentRect.width + 2 * SLIDE_STEP_MARGIN_X, currentRect.height + 2 * SLIDE_STEP_MARGIN_Y
      //   )
      // } else {
      //   graphics.lineStyle(3, COLORS.COLOR_SLIDE_STEP, COLORS.ALPHA_SLIDE_STEP)
      //   graphics.moveTo(currentRect.left, currentRect.top)
      //   graphics.lineTo(currentRect.right, currentRect.top)
      //   graphics.moveTo(currentRect.left, currentRect.bottom)
      //   graphics.lineTo(currentRect.right, currentRect.bottom)
      // }
      // graphics.endFill()
    })
  }
  $: if (container) {
    drawDiamonds($position, slide)
    drawSteps($position, slide, stepsVisible)
  }
</script>

{#if PIXI}
  {#each slide.steps as step}
    <NoteControl
      draw={$selectedNotes.includes(step)}
      rect={new PIXI.Rectangle(
        $position.calcX(step.lane) - SLIDE_STEP_MARGIN_X, $position.calcY(step.tick) - 0.5 * 0.5 * NOTE_HEIGHT,
        step.width * LANE_WIDTH + 2 * SLIDE_STEP_MARGIN_X, 0.5 * NOTE_HEIGHT
      )}
      bind:note={step}
      on:movestart
      on:move
      on:moveend
    ></NoteControl>
  {/each}
{/if}