<script lang="ts">
  // Types
  import type { Slide as SlideType, SlideStep, Note as NoteType, SlideTail, SlideHead } from "$lib/score/beatmap"

  // Components
  import Note from '$lib/render/Note.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'
  
  // Events
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    pathclick: { slide: SlideType }
    stepclick: { note: SlideStep, slide: SlideType },
    dblclick: { note: NoteType },
    tailclick: { note: SlideTail },
    headclick: { note: SlideHead },
  }>()

  // Props
  export let slide: SlideType
  export let stepsVisible: boolean
  export let moving: boolean = false
  export let floating: boolean = false
  
  $: ({ head, tail, critical, steps } = slide)

  function onstepclick(event: CustomEvent<{ note: NoteType }>) {
    dispatch('stepclick', { note: event.detail.note as SlideStep, slide  }) 
  }
</script>

<!-- SLIDE PATH -->
<SlidePath
  notes={[head, ...steps.filter((x) => !x.ignored), tail]}
  {critical}
  {floating}
  {moving}
  on:click={() => { dispatch('pathclick', { slide }) }}
  on:dblclick={() => { dispatch('dblclick', { note: slide.head })}}
/>

<!-- SLIDE HEAD -->
<Note
  bind:note={head}
  slide={true}
  {critical}
  {floating}
  {moving}
  on:click={() => { dispatch('headclick', { note: head }) }}
  on:rightclick
  on:dblclick
/>

<!-- SLIDE STEPS -->
<SlideSteps
  bind:slide
  {stepsVisible}
  {floating}
  {moving}
  on:rightclick
  on:dblclick
  on:click={(event) => { onstepclick(event) }}
/>

<!-- SLIDE END -->
<Note
  bind:note={tail}
  slide={true}
  {critical}
  {floating}
  {moving}
  on:click={() => { dispatch('tailclick', { note: tail }) }}
  on:dblclick
/>