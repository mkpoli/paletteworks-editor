<script lang="ts">
  // Types
  import type { Slide as SlideType, SlideStep, Note as NoteType } from "$lib/score/beatmap"

  // Components
  import Note from '$lib/render/Note.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'
  
  // Events
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    click: { slide: SlideType }
    stepclick: { note: SlideStep, slide: SlideType },
    dblclick: { note: NoteType }
  }>()

  // Props
  export let slide: SlideType
  export let stepsVisible: boolean
  
  $: ({ head, tail, critical, steps } = slide)

  function onstepclick(event: CustomEvent<{ note: NoteType }>) {
    dispatch('stepclick', { note: event.detail.note as SlideStep, slide  }) 
  }
</script>

<!-- SLIDE PATH -->
<SlidePath
  notes={[head, ...steps.filter((x) => !x.ignored), tail]}
  {critical}
  on:click={() => { dispatch('click', { slide }) }}
  on:dblclick={() => { dispatch('dblclick', { note: slide.head })}}
/>

<!-- SLIDE HEAD -->
<Note
  bind:note={head}
  slide={true}
  {critical}
  on:click={() => { dispatch('click', { slide }) }}
  on:rightclick
  on:move
  on:movestart
  on:moveend
  on:dblclick
/>

<!-- SLIDE STEPS -->
<SlideSteps
  bind:slide
  {stepsVisible}
  on:movestart
  on:move
  on:moveend
  on:rightclick
  on:dblclick
  on:click={(event) => { onstepclick(event) }}
/>

<!-- SLIDE END -->
<Note
  bind:note={tail}
  slide={true}
  {critical}
  on:click={() => { dispatch('click', { slide }) }}
  on:move
  on:movestart
  on:moveend
  on:dblclick
/>