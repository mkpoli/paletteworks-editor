<script lang="ts">
  // Types
  import type { Slide as SlideType } from "$lib/score/beatmap"

  // Components
  import Note from '$lib/render/Note.svelte'
  import SlidePath from '$lib/render/SlidePath.svelte'
  import SlideSteps from '$lib/render/SlideSteps.svelte'

  // Props
  export let slide: SlideType

  $: ({ start, end, critical, steps } = slide)
</script>

<!-- SLIDE PATH -->
<SlidePath
  notes={[start, ...steps.filter((x) => !x.ignored), end]}
  {critical}
/>

<!-- SLIDE START -->
<Note
  note={start}
  slide={true}
  {critical}
/>

<!-- SLIDE STEPS -->
<SlideSteps
  {slide}
/>

<!-- SLIDE END -->
<Note
  note={end}
  slide={true}
  {critical}
/>