<script lang="ts">
  import { NOTE_HEIGHT } from '$lib/consts';  
  import { getContext, onDestroy, onMount } from "svelte";
  import { selectedNotes } from '$lib/editing/selection'
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
  $: realCritical = critical || ('critical' in note && note.critical) // critical ==

  $: type = realCritical
                ? 'noteC.png'
                : flick !== 'no'
                  ? 'noteF.png'
                  : slide
                    ? 'noteL.png'
                    : 'noteN.png'

  const NOTE_WIDTH = 30
  $: noteWidth = width * NOTE_WIDTH

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // Variables
  let PIXI: typeof import('pixi.js')
  let instance: PIXI.NineSlicePlane
  let currentRect: PIXI.Rectangle

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

  $: inscreen = instance && instance.y < $position.containerHeight + app.stage.pivot.y && instance.y > app.stage.pivot.y

  // $: if (instance) {
  //   if (inscreen) {
  //     app.stage.addChild(instance)
  //   } else {
  //     app.stage.removeChild(instance)
  //   }
  // }
</script>

<!-- FLICK ARROW -->
{#if flick !== 'no'}
  <Arrow
    {...{ lane, tick, width, critical: realCritical, flick }}
  />
{/if}

{#if inscreen}
  <NoteControl
    on:move
    on:movestart
    on:moveend
    on:click
    on:rightclick
    on:dblclick
    draw={$selectedNotes.includes(note)}
    rect={currentRect}
    bind:note
  />
{/if}