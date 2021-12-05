<script lang="ts">
  // Score Components
  import Note from '$lib/render/Note.svelte'
  import Slide from '$lib/render/Slide.svelte'


  import { moving, movingNotes } from '$lib/editing/moving'
  import type { Single, Slide as SlideType } from '$lib/score/beatmap'

  export let singles: Single[]
  export let slides: SlideType[]

  $: movingSingles = singles.filter((single) => $movingNotes.includes(single))
  $: movingSlides = slides.filter((slide) =>
    $movingNotes.includes(slide.head) || $movingNotes.includes(slide.tail) || slide.steps.some((step) => $movingNotes.includes(step))
  )

  function updateMoving() {
    movingSingles = movingSingles
    movingSlides = movingSlides
    if ($moving) {
      setTimeout(updateMoving, 50)
    }
  }

  $: if ($moving) {
    updateMoving()
  }
</script>

{#if $moving}
  {#each movingSingles as single (single)}
    <Note
      note={single}
      floating={true}
    />
  {/each}
  {#each movingSlides as slide (slide)}
    <Slide
      slide={slide}
      floating={true}
      stepsVisible={false}
    />
  {/each}
{/if}