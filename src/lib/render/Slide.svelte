<script lang="ts">
  // Types
  import type { Slide as SlideType } from "$lib/score/beatmap"

  // Components
  import Note from '$lib/render/Note.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'

  // Props
  export let slide: SlideType
  export let stepsVisible: boolean

  $: ({ head, tail, critical, steps } = slide)
</script>

<!-- SLIDE PATH -->
<SlidePath
  notes={[head, ...steps.filter((x) => !x.ignored), tail]}
  {critical}
  on:click
/>

<!-- SLIDE START -->
<Note
  bind:note={head}
  slide={true}
  {critical}
  on:click
  on:move
  on:movestart
  on:moveend
/>

<!-- SLIDE STEPS -->
<SlideSteps
  bind:slide
  {stepsVisible}
  on:movestart
  on:move
  on:moveend
/>

<!-- SLIDE END -->
<Note
  bind:note={tail}
  slide={true}
  {critical}
  on:click
  on:move
  on:movestart
  on:moveend
/>