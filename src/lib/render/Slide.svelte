<script lang="ts">
  // Types
  import type { Slide as SlideType, SlideStep, Note as NoteType, SlideTail, SlideHead } from "$lib/score/beatmap"

  // Components
  import Single from '$lib/render/Single.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'
  
  // Events
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    pathclick: { slide: SlideType }
    pathrightclick: { slide: SlideType }
    stepclick: { note: SlideStep, slide: SlideType },
    dblclick: { note: NoteType },
    tailclick: { note: SlideTail },
    headclick: { note: SlideHead },
    pointerenter: { note: NoteType },
    pointerleave: void,
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
  on:rightclick={() => { dispatch('pathrightclick', { slide }) }}
  on:dblclick={() => { dispatch('dblclick', { note: slide.head })}}
/>

<!-- SLIDE HEAD -->
<Single
  bind:note={head}
  slide={true}
  {critical}
  {floating}
  {moving}
  on:click={() => { dispatch('headclick', { note: head }) }}
  on:rightclick
  on:dblclick
  on:pointerenter={() => { dispatch('pointerenter', { note: head })}}
  on:pointerleave={() => { dispatch('pointerleave') }}
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
<Single
  bind:note={tail}
  slide={true}
  {critical}
  {floating}
  {moving}
  on:click={() => { dispatch('tailclick', { note: tail }) }}
  on:dblclick
  on:pointerenter={() => { dispatch('pointerenter', { note: tail })}}
  on:pointerleave={() => { dispatch('pointerleave') }}
/>