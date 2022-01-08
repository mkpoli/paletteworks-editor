<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'
  
  // Functions
  import { debounce } from 'throttle-debounce'
  import { getContext, onDestroy, onMount } from 'svelte'
  
  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')
        
  // Stores
  import { position, PositionManager } from '$lib/position'
  import { scrollY } from '$lib/editing/scrolling'

  // Variables
  let container: PIXI.Container

  // Events
  // const dispatch = createEventDispatcher<{
  //   scrollTo: number,
  // }>()

  // Props
  export let maxMeasure: number

  // Constants
  import { CANVAS_MINIMAP_WIDTH, MAIN_WIDTH, MARGIN_BOTTOM, Z_INDEX } from '$lib/consts'
  const MINIMAP_RESOLUTION = 0.15
  $: minimapRect = new PIXI.Rectangle(
    CANVAS_MINIMAP_WIDTH - MAIN_WIDTH * MINIMAP_RESOLUTION,
    0,
    MAIN_WIDTH * MINIMAP_RESOLUTION,
    0.5 * $position.containerHeight
  )
  $: deltaScroll = 0.95 * $scrollY

  onMount(() => {
    container = new PIXI.Container()
    container.zIndex = Z_INDEX.MINIMAP
    container.hitArea = minimapRect
    container.interactive = true
/*     container.addEventListener('click', (event) => {
      // dispatch('scrollTo', minimapRect.bottom - (event.global.y + 0.5 * $position.containerHeight * MINIMAP_RESOLUTION) / MINIMAP_RESOLUTION)
      // dispatch('scrollTo', minimapRect.bottom - MINIMAP_RESOLUTION * (event.global.y + deltaScroll) - $scrollY)
      // dispatch('scrollTo', - ((0.5 * $position.containerHeight - event.global.y) / MINIMAP_RESOLUTION - $position.containerHeight) / 0.95)
      dispatch('scrollTo', (event.global.y - minimapRect.bottom) / MINIMAP_RESOLUTION + $position.containerHeight - 0.05 * $scrollY)
      // console.log('clicked at (', event.global.x, event.global.y, ')')
    }) */
    app.stage.addChild(container)
  })

  onDestroy(() => {
    app.stage.removeChild(container)
  })

  $: if ($position && container) debounce(1500, () => drawMinimap($position, $scrollY))()
  
  function drawMinimap({ measureHeight, containerHeight }: PositionManager, scrollY: number) {
    container.removeChildren() // Clear container

    const fullHeight = MARGIN_BOTTOM + maxMeasure * measureHeight + 0.5 * measureHeight - containerHeight
    const rows = Math.ceil(fullHeight / containerHeight)

    const screenArea = new PIXI.Graphics()
    screenArea.beginFill(0xffffff, 0.1)
    screenArea.drawRect(
      minimapRect.x,
      minimapRect.bottom - (containerHeight - scrollY) * MINIMAP_RESOLUTION - deltaScroll * MINIMAP_RESOLUTION,
      minimapRect.width,
      containerHeight * MINIMAP_RESOLUTION
    )
    screenArea.endFill()
    container.addChild(screenArea)

    // 0.5 * containerHeight - i * containerHeight * MINIMAP_RESOLUTION - containerHeight * MINIMAP_RESOLUTION

    for (let i = 0; i < rows; i++) {
      // const color = getColor(0xFF00A0, i)
      // const helperGraphics = new PIXI.Graphics()
      // helperGraphics.lineStyle(2, color)
      // container.addChild(helperGraphics)

      const region = new PIXI.Rectangle(
        0,
        - i * containerHeight - scrollY,
        MAIN_WIDTH,
        containerHeight
      )
      // helperGraphics.drawRoundedRect(
      //   region.x + 15,
      //   region.y - scrollY,
      //   region.width - 30,
      //   region.height,
      //   5
      // )

      const section = new PIXI.Rectangle(
        minimapRect.x,
        minimapRect.bottom - 
          MINIMAP_RESOLUTION * ((i + 1) * containerHeight + deltaScroll),
        minimapRect.width,
        containerHeight * MINIMAP_RESOLUTION
      )
      // helperGraphics.drawRect(
      //   section.x,
      //   section.y,
      //   minimapRect.width,
      //   containerHeight * MINIMAP_RESOLUTION,
      // )

      if (section.top <= minimapRect.bottom && section.bottom >= 0) {
        const renderTexture = app.renderer.generateTexture(mainContainer,  {
          resolution: MINIMAP_RESOLUTION,
          scaleMode: PIXI.SCALE_MODES.NEAREST,
          region,
          multisample: PIXI.MSAA_QUALITY.HIGH
        })
      
        const sprite = new PIXI.Sprite()
        sprite.x = section.x
        sprite.y = section.y
        sprite.width = section.width
        sprite.height = section.height
        sprite.texture = renderTexture
        container.addChild(sprite)
        
        const mask = new PIXI.Graphics()
        mask.beginFill(0xFFFFFF)
        mask.drawRect(
          minimapRect.x,
          minimapRect.y,
          minimapRect.width,
          minimapRect.height
        )
        sprite.mask = mask
      }
    }
  }
</script>
