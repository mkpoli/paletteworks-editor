<script lang="ts">
  // Constants
  import { DIAMOND_HEIGHT, DIAMOND_WIDTH } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Slide, SlideNote, SlideStart, SlideStep } from '$lib/score/beatmap'
  
  // Props
  export let slide: Slide

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // Variables
  let PIXI: typeof import('pixi.js')
  let container: PIXI.Container

  onMount(async () => {
    PIXI = await import('pixi.js')
    container = new PIXI.Container()
    container.zIndex = 2
    app.stage.addChild(container)
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

  function drawDiamonds(position: PositionManager) {
    container.removeChildren()
    const { start, end, critical, steps } = slide

    let currentGroup: SlideNote[] = [start];
    const connectedGroups = [...steps, end]
      .reduce((acc: SlideNote[][], ele: SlideNote) => {
        currentGroup.push(ele)
        if (!('ignored' in ele) || !ele.ignored) {
          acc.push([...currentGroup])
          currentGroup = [ele]
        }
        return acc
      }, [])
      .filter((a: SlideNote[]) => a.length >= 3)

    connectedGroups
      .forEach((arr: SlideNote[]) => {
        const origin = arr.shift() as SlideStart | SlideStep
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
  $: container && drawDiamonds($position)
</script>
