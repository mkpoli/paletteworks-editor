<script lang="ts">
  import '$lib/basic/collections'

  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte'

  import { LANE_WIDTH, COLORS, Z_INDEX } from '$lib/consts'
  import { position } from '$lib/position'

  import type { IEase, SlideNote } from '$lib/score/beatmap'
  import type PIXI from 'pixi.js'
  import { lerp, easeInQuad, easeOutQuad } from '$lib/basic/math'

  export let notes: SlideNote[]
  export let critical: boolean
  export let floating: boolean = false
  export let moving: boolean = false

  const dispatch = createEventDispatcher<{
    click: void
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
        dispatch('click')
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
  export function drawSlidePath(slideNotes: SlideNote[]) {
    planeContainer.removeChildren()

    slideNotes.pairwise().forEach(([origin, target]) => {
      const origin_x_left = $position.calcX(origin.lane)
      const origin_x_right =
        $position.calcX(origin.lane) + origin.width * LANE_WIDTH
      const origin_y = $position.calcY(origin.tick)

      const target_x_left = $position.calcX(target.lane)
      const target_x_right =
        $position.calcX(target.lane) + target.width * LANE_WIDTH
      const target_y = $position.calcY(target.tick)

      const STEPS = Math.ceil((origin_y - target_y) / 10)

      const points = []
      const uvs = []

      if ((origin as IEase).easeType) {
        for (let i = 0; i < STEPS; i++) {
          const xL = lerp(
            target_x_left,
            origin_x_left,
            ((origin as IEase).easeType === 'easeIn' ? easeOutQuad : easeInQuad)(
              i / STEPS
            )
          )
          const xR = lerp(
            target_x_right,
            origin_x_right,
            ((origin as IEase).easeType === 'easeIn' ? easeOutQuad: easeInQuad)(
              i / STEPS
            )
          )
          const y = lerp(target_y, origin_y, i / STEPS)
          points.push(xL, y, xR, y)
          uvs.push(SIDE_RATIO, i / STEPS, 1 - SIDE_RATIO, i / STEPS)
        }
      }

      const plane = new PIXI.SimplePlane(
        critical ? TEXTURES['path_critical.png'] : TEXTURES['path.png'],
        2,
        (origin as IEase).easeType ? STEPS + 2 : 2
      )
      plane.geometry
        .getBuffer('aVertexPosition')
        .update([
          target_x_left,
          target_y,
          target_x_right,
          target_y,
          ...points,
          origin_x_left,
          origin_y,
          origin_x_right,
          origin_y,
        ])
      plane.geometry.getBuffer('aTextureCoord').update([
        SIDE_RATIO,
        0,
        1 - SIDE_RATIO,
        0,
        ...uvs,
        SIDE_RATIO,
        1,
        1 - SIDE_RATIO,
        1,
      ])
      planeContainer.addChild(plane)
    })
  }
</script>
