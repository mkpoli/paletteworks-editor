<script lang="ts">
  import { NOTE_HEIGHT, Z_INDEX } from '$lib/consts'
  import { getContext, onDestroy, onMount } from "svelte"
  import { position } from '$lib/position'
  import { preferences } from '$lib/preferences'

  import type PIXI from 'pixi.js'
  import type { Writable } from 'svelte/store'
  import { calcType, type Flick, type Type } from '$lib/score/beatmap'

  export let tick: number
  export let lane: number
  export let width: number
  export let critical: boolean
  export let flick: Flick
  export let slide: boolean
  export let alpha: number = 1
  export let tint: number = 0xFFFFFF
  export let floating: boolean = false

  // Contexts
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const noteTextures = getContext<Writable<Record<Type, PIXI.Texture[]>>>('noteTextures')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let note: PIXI.Sprite
  let arrow: PIXI.Sprite

  onMount(() => {
    note = new PIXI.Sprite()
    note.zIndex = floating ? Z_INDEX.FLOATING_NOTE : Z_INDEX.NOTE
    note.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    note.anchor.set(0.5)
    mainContainer.addChild(note)

    arrow = new PIXI.Sprite()
    arrow.zIndex = floating ? Z_INDEX.FLOATING_ARROW : Z_INDEX.ARROW
    arrow.anchor.set(0.5)
    arrow.scale.y = 0.25
  })

  onDestroy(() => {
    mainContainer.removeChild(note)
    mainContainer.removeChild(arrow)
  })
  
  $: x = $position.calcMidX(lane, width)
  $: y = $position.calcY(tick)
  $: if (note) note.position.set(x, y)
  $: type = calcType(critical, flick, slide)
  $: if (note) note.texture = $noteTextures[type][width - 1]
  $: if (note) note.tint = tint
  $: if (note) note.alpha = alpha

  $: if (arrow) {
    if (flick !== 'no') {
      mainContainer.addChild(arrow)
    } else {
      mainContainer.removeChild(arrow)
    }
  }

  $: if (arrow) arrow.alpha = alpha
  $: if (arrow) arrow.x = x
  $: if (arrow) arrow.y = y - NOTE_HEIGHT * $preferences.noteHeight - 10
  $: if (arrow) arrow.visible = flick !== 'no'
  $: if (arrow) arrow.texture = TEXTURES[
      `notes_flick_arrow${ type === 'critical' ? '_crtcl' : ''}_0${ Math.min(width, 6) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
    ]
  $: if (arrow) arrow.scale.x = 0.25 * (flick === 'left' ? 1 : -1)
</script>
