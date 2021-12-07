<script lang="ts">
  import { NOTE_HEIGHT, LANE_WIDTH } from '$lib/consts';  
  import { getContext } from "svelte";
  import { selectedNotes } from '$lib/editing/selection'
  import { position } from '$lib/position'

  import type PIXI from 'pixi.js'
  import type { Flick, Note as NoteType, Type } from '$lib/score/beatmap'

  // Components
  import Note from '$lib/render/Note.svelte'
  import NoteControl from '$lib/render/NoteControl.svelte'

  export let note: NoteType
  export let critical: boolean = false
  export let slide: boolean = false
  export let moving: boolean = false
  export let floating: boolean = false
  export let resizing: boolean = false

  $: ({ lane, tick, width } = note)
  let flick: Flick
  $: flick = 'flick' in note ? note.flick : 'no'
  $: realCritical = critical || ('critical' in note && note.critical) // critical ==

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Variables
  let currentRect: PIXI.Rectangle

  $: currentRect = new PIXI.Rectangle(
      $position.calcX(lane), $position.calcY(tick) - 0.5 * 0.5 * NOTE_HEIGHT,
      width * LANE_WIDTH, 0.5 * NOTE_HEIGHT
    )
</script>

<Note
  {lane}
  {tick}
  {width}
  {flick}
  critical={realCritical}
  {slide}
  alpha={resizing || floating ? 0.5 : 1}
  tint={moving ? 0xb0b0b0 : 0xffffff}
/>

<NoteControl
  on:click
  on:rightclick
  on:dblclick
  on:pointerenter
  on:pointerleave
  draw={$selectedNotes.includes(note)}
  rect={currentRect}
  bind:note
/>