<script lang="ts">
  import { NOTE_HEIGHT } from '$lib/consts';  
  import { createEventDispatcher, getContext, onDestroy, onMount } from "svelte";
  import { selectedNotes } from '$lib/selection'
  import { position } from '$lib/position'

  import type PIXI from 'pixi.js'
  import type { Flick, Note as NoteType } from '$lib/score/beatmap'

  import Arrow from '$lib/render/Arrow.svelte'
  import NoteControl from './NoteControl.svelte'

  export let note: NoteType
  export let critical: boolean = false
  export let slide: boolean = false

  $: ({ lane, tick, width } = note)
  let flick: Flick
  $: flick = 'flick' in note ? note.flick : 'no'
  $: critical = 'critical' in note ? note.critical : critical

  $: type = critical
                ? 'noteC.png'
                : flick !== 'no'
                  ? 'noteF.png'
                  : slide
                    ? 'noteL.png'
                    : 'noteN.png'

  const NOTE_WIDTH = 30
  $: noteWidth = width * NOTE_WIDTH
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  let PIXI: typeof import('pixi.js')
  let instance: PIXI.NineSlicePlane
  let currentRect: PIXI.Rectangle

  const dispatch = createEventDispatcher<{
    'click': void
  }>()

  onMount(async () => {
    PIXI = await import('pixi.js')

    const texture = TEXTURES[type]
    instance = new PIXI.NineSlicePlane(
      texture,
      100, 0, 100, 0
    )
    instance.height = NOTE_HEIGHT
    instance.pivot.y = NOTE_HEIGHT * 0.5
    instance.scale.x = 0.25
    instance.scale.y = 1
    instance.zIndex = 1
    instance.interactive = true
    instance.addListener('click', () => {
      dispatch('click')
    })
    app.stage.addChild(instance)
  })

  onDestroy(() => {
    app.stage.removeChild(instance)
  })

  $: if (instance) {
    instance.texture = TEXTURES[type]
    instance.x = $position.calcMidX(lane, width)
    instance.y = $position.calcY(tick)
    instance.width = width * 123 + 100
    instance.pivot.x = instance.width * 0.5
    currentRect = new PIXI.Rectangle(
      $position.calcX(lane), $position.calcY(tick) - 0.5 * 0.5 * NOTE_HEIGHT,
      noteWidth, 0.5 * NOTE_HEIGHT
    )
  }
</script>

<!-- FLICK ARROW -->
{#if flick !== 'no'}
  <Arrow
    {...{ lane, tick, width, critical, flick }}
  />
{/if}

<NoteControl draw={$selectedNotes.includes(note)} rect={currentRect}></NoteControl>