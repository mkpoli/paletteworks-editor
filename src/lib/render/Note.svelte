<script lang="ts">
  import { NOTE_HEIGHT } from '$lib/consts';  
  import { getContext, onDestroy, onMount } from "svelte";
  import { selectedNotes } from '$lib/selection'
  import { position } from '$lib/position'

  import type PIXI from 'pixi.js'
  import type { Flick, Note as NoteType } from '$lib/score/beatmap'

  import Arrow from '$lib/render/Arrow.svelte'
  import NoteControl from './NoteControl.svelte'

  export let note: NoteType
  export let critical: boolean = false
  export let slide: boolean = false

  const { lane, tick, width } = note
  const flick: Flick = 'flick' in note ? note.flick : 'no'
  critical = 'critical' in note ? note.critical : critical

  const type = critical
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

  onMount(async () => {
    PIXI = await import('pixi.js')

    const texture = TEXTURES[type]
    instance = new PIXI.NineSlicePlane(
      texture,
      250, 0, 250, 0
    )
    instance.width = noteWidth
    instance.height = NOTE_HEIGHT
    instance.pivot.x = noteWidth * 0.5
    instance.pivot.y = NOTE_HEIGHT * 0.5
    instance.scale.x = 354 / (248 + 30)
    instance.scale.y = 1
    instance.zIndex = 1
    app.stage.addChild(instance)
  })

  $: if (instance) {
    instance.x = $position.calcMidX(lane, width)
    instance.y = $position.calcY(tick)
    currentRect = new PIXI.Rectangle(
      $position.calcX(lane), $position.calcY(tick) - 0.5 * 0.5 * NOTE_HEIGHT,
      noteWidth, 0.5 * NOTE_HEIGHT
    )
  }

  onDestroy(() => {
    app.stage.removeChild(instance)
  })
</script>

<!-- FLICK ARROW -->
{#if flick !== 'no'}
  <Arrow
    {...{ lane, tick, width, critical, flick }}
  />
{/if}

<NoteControl draw={$selectedNotes.includes(note)} rect={currentRect}></NoteControl>