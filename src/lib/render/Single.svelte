<script lang="ts">
  import { selectedNotes } from '$lib/editing/selection'

  import type { Flick, Note as NoteType } from '$lib/score/beatmap'

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
  {floating}
/>

<NoteControl
  on:click
  on:rightclick
  on:dblclick
  on:pointerenter
  on:pointerleave
  {lane}
  {tick}
  {width}
  draw={$selectedNotes.includes(note)}
  bind:note
/>