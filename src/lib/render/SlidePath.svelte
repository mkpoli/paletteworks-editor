<script lang="ts">
  import '$lib/basic/collections'

  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte'

  import { COLORS, Z_INDEX } from '$lib/consts'
  import { preferences } from '$lib/preferences'
  import { position } from '$lib/position'

  import type { IEase, SlideNote } from '$lib/score/beatmap'
  import type PIXI from 'pixi.js'
  import { lerp, easeInQuad, easeOutQuad } from '$lib/basic/math'
  import { MOUSE_BUTTON } from '$lib/control/pointer'

  export let notes: SlideNote[]
  export let critical: boolean
  export let floating: boolean = false
  export let moving: boolean = false

  const dispatch = createEventDispatcher<{
    click: { event: PointerEvent }
    rightclick: { event: PointerEvent }
    dblclick: void
  }>()

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')
  const TEXTURES =
    getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  let planeContainer: PIXI.Container
  let colorMatrixFilter: InstanceType<typeof PIXI.filters.ColorMatrixFilter>
  onMount(() => {
    planeContainer = new PIXI.Container()
    planeContainer.zIndex = floating
      ? Z_INDEX.FLOATING_SLIDE_PATH
      : Z_INDEX.SLIDE_PATH
    planeContainer.interactive = true
    planeContainer.addEventListener('click', (event) => {
      if (event.detail === 1) {
        if (event.button === MOUSE_BUTTON.LEFT) {
          dispatch('click')
        } else if (event.button === MOUSE_BUTTON.RIGHT) {
          dispatch('rightclick')
        }
      } else if (event.detail === 2) {
        dispatch('dblclick')
      }
    })
    colorMatrixFilter = new PIXI.filters.ColorMatrixFilter()
    planeContainer.filters = [
      new PIXI.filters.FXAAFilter(),
      colorMatrixFilter,
      new PIXI.filters.AlphaFilter(floating ? COLORS.ALPHA_FLOATING : 1),
    ]
    mainContainer.addChild(planeContainer)
  })

  onDestroy(() => {
    mainContainer.removeChild(planeContainer)
  })

  $: planeContainer && $position && drawSlidePath(notes)
  $: if (colorMatrixFilter)
    colorMatrixFilter.tint(moving ? COLORS.COLOR_MOVING_TINT : 0xffffff)

  const SIDE_RATIO = 32 / 448
  const SHRINK_WIDTH = 1
  export function drawSlidePath(slideNotes: SlideNote[]) {
    planeContainer.removeChildren()

    slideNotes.pairwise().forEach(([origin, target]) => {
      const origin_x_left = $position.calcX(origin.lane) + SHRINK_WIDTH
      const origin_x_right =
        $position.calcX(origin.lane) + origin.width * $preferences.laneWidth - SHRINK_WIDTH
      const origin_y = $position.calcY(origin.tick)

      const target_x_left = $position.calcX(target.lane) + SHRINK_WIDTH
      const target_x_right =
        $position.calcX(target.lane) + target.width * $preferences.laneWidth - SHRINK_WIDTH
      const target_y = $position.calcY(target.tick)

      const STEPS = Math.ceil((origin_y - target_y) / 10)

      const points = []
      const uvs = []

      const SIDE_WIDTH = 7
      
      if ((origin as IEase).easeType) {
        for (let i = 0; i < STEPS; i++) {
          const percentage = i / STEPS
          const xL = lerp(
            target_x_left,
            origin_x_left,
            ((origin as IEase).easeType === 'easeIn' ? easeOutQuad : easeInQuad)(
              percentage
            )
          )
          const xR = lerp(
            target_x_right,
            origin_x_right,
            ((origin as IEase).easeType === 'easeIn' ? easeOutQuad: easeInQuad)(
              percentage
            )
          )
          

          const y = lerp(target_y, origin_y, percentage)
          points.push(xL - SIDE_WIDTH, y, xL, y, xR, y, xR + SIDE_WIDTH, y)
          uvs.push(0, percentage, SIDE_RATIO, percentage, 1 - SIDE_RATIO, percentage, 1, percentage)
        }
      }

      const plane = new PIXI.SimplePlane(
        critical ? TEXTURES['path_critical.png'] : TEXTURES['path.png'],
        4,
        (origin as IEase).easeType ? STEPS + 2 : 2
      )
      plane.geometry
        .getBuffer('aVertexPosition')
        .update([
          target_x_left - SIDE_WIDTH,
          target_y,
          target_x_left,
          target_y,
          target_x_right,
          target_y,
          target_x_right + SIDE_WIDTH,
          target_y,
          ...points,
          origin_x_left - SIDE_WIDTH,
          origin_y,
          origin_x_left,
          origin_y,
          origin_x_right,
          origin_y,
          origin_x_right + SIDE_WIDTH,
          origin_y,
        ])
      plane.geometry.getBuffer('aTextureCoord').update([
        0,
        0,
        SIDE_RATIO,
        0,
        1 - SIDE_RATIO,
        0,
        1,
        0,
        ...uvs,
        0,
        1,
        SIDE_RATIO,
        1,
        1 - SIDE_RATIO,
        1,
        1,
        1,
      ])
      planeContainer.addChild(plane)
    })
  }
</script>
