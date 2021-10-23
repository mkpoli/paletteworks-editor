<script lang="ts">
  // Types
  import type { Slide as SlideType } from "$lib/score/beatmap"

  // Components
  import Note from '$lib/render/Note.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'

  // Props
  export let slide: SlideType

  $: ({ head, tail, critical, steps } = slide)
</script>

<!-- SLIDE PATH -->
<SlidePath
  notes={[head, ...steps.filter((x) => !x.ignored), tail]}
  {critical}
/>

<!-- SLIDE START -->
<Note
  note={head}
  slide={true}
  {critical}
/>

<!-- SLIDE STEPS -->
<SlideSteps
  {slide}
/>

<!-- SLIDE END -->
<Note
  note={tail}
  slide={true}
  {critical}
/>