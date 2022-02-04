<script lang="ts">
  import { clamp } from '$lib/basic/math'

  import {
    COLORS,
    MARGIN_BOTTOM,
    SCROLLBAR_WIDTH,
  } from '$lib/consts'
  import { calcScrollTick } from '$lib/editing/scrolling'
  import { pointer, position } from '$lib/position'
  import { scrollY } from '$lib/editing/scrolling'
  import type PIXI from 'pixi.js'

  import { getContext, onDestroy, onMount, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher<{
    scroll: number
  }>()

  const app = getContext<PIXI.Application>('app')
  const container = getContext<PIXI.Container>('container')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  export let currentTick: number
  export let maxTick: number

  let scrollbar: PIXI.Container
  let thumb: PIXI.Graphics
  let playhead: PIXI.Graphics

  const ALPHA_DEFAULT = 0.2
  const ALPHA_DRAGGING = 1
  const TINT_DEFAULT = 0xffffff
  const TINT_DRAGGING = 0x7f95f1

  function calcMappedY(tick: number) {
    return $position.containerHeight * (1 - tick / maxTick)
  }

  $: containerHeight = $position.containerHeight

  let dragging = false
  let pointerOffset = 0

  $: if (scrollbar) {
    scrollbar.x = $position.containerWidth - SCROLLBAR_WIDTH
  }

  onMount(() => {
    scrollbar = new PIXI.Container()
    scrollbar.interactive = true
    scrollbar.hitArea = new PIXI.Rectangle(
      0,
      0,
      SCROLLBAR_WIDTH,
      containerHeight
    )
    container.addChild(scrollbar)

    thumb = new PIXI.Graphics()
    thumb.alpha = ALPHA_DEFAULT

    thumb.interactive = true

    thumb.addEventListener('pointerdown', () => {
      dragging = true
      thumb.alpha = ALPHA_DRAGGING
      thumb.tint = TINT_DRAGGING
      pointerOffset = $pointer.y - (thumbY + thumb.height / 2)
    })
    app.renderer.view.addEventListener('pointermove', () => {
      if (!dragging) return

      dispatch(
        'scroll',
        calcScrollTick(
          $position.containerHeight -
            MARGIN_BOTTOM -
            (containerHeight * containerHeight) /
              ($pointer.y + pointerOffset),
          $position.zoom
        )
      )
    })

    function ondragend() {
      thumb.alpha = ALPHA_DEFAULT
      thumb.tint = TINT_DEFAULT
      if (dragging) {
        dragging = false
      }
    }

    thumb.addEventListener('pointerup', ondragend)
    thumb.addEventListener('pointerupoutside', ondragend)

    thumb.addEventListener('pointerenter', () => {
      thumb.tint = TINT_DRAGGING
    })
    thumb.addEventListener('pointerleave', () => {
      if (!dragging) {
        thumb.tint = TINT_DEFAULT
      }
    })

    scrollbar.addChild(thumb)

    scrollbar.addEventListener('click', () => {
      if (!dragging) {
        dispatch(
          'scroll',
          calcScrollTick(
            $position.containerHeight -
            MARGIN_BOTTOM -
            (containerHeight * containerHeight) /
              ($pointer.y + thumbHeight / 2),
          $position.zoom)
        )
      }
    })

    playhead = new PIXI.Graphics()

    // TODO: selection = new PIXI.Graphics()
    scrollbar.addChild(playhead)
  })

  $: thumbHeight =
    (containerHeight * containerHeight) / $position.calcDistanceY(maxTick)
  $: thumbY =
    clamp(
      thumbHeight,
      (containerHeight * containerHeight) /
        ($position.containerHeight - MARGIN_BOTTOM - $scrollY),
      containerHeight
    ) - thumbHeight
  $: if (thumb) {
    thumb.clear()
    thumb.beginFill(0xffffff)
    thumb.drawRect(0, thumbY, SCROLLBAR_WIDTH, thumbHeight)
    thumb.endFill()
  }

  $: if (playhead) {
    playhead.clear()
    const y = calcMappedY(currentTick)
    playhead.lineStyle(1, COLORS.COLOR_PLAYHEAD)
    playhead.moveTo(0, y)
    playhead.lineTo(SCROLLBAR_WIDTH, y)
  }

  onDestroy(() => {
    container.removeChild(thumb)
    container.removeChild(playhead)
  })
</script>
