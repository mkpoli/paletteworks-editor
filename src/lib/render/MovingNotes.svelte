<script lang="ts">
  // Score Components
  import FloatingNotes from './FloatingNotes.svelte'

  import { movingNotes, movingTargets } from '$lib/editing/moving'
  import type { Single, Slide as SlideType } from '$lib/score/beatmap'

  export let singles: Single[]
  export let slides: SlideType[]
  export let moving: boolean

  let movingSingles: Single[]
  let movingSlides: SlideType[]

  function updateMoving() {
    movingSingles = singles
      .filter((single) => $movingNotes.includes(single))
      .map((single) => ({ ...single, ...$movingTargets.get(single) }))
    movingSlides = slides
    .filter((slide) =>
      $movingNotes.includes(slide.head) || $movingNotes.includes(slide.tail) || slide.steps.some((step) => $movingNotes.includes(step))
    )
    .map((slide) => {
      return {
        ...slide,
        head: { ...slide.head, ...$movingTargets.get(slide.head) },
        tail: { ... slide.tail, ...$movingTargets.get(slide.tail) },
        steps: slide.steps.map((step) => ({ ...step, ...$movingTargets.get(step) }))
      }
    })
    if (moving) {
      setTimeout(updateMoving, 50)
    }
  }

  $: if (moving) {
    updateMoving()
  }
</script>

{#if moving}
  <FloatingNotes
    singles={movingSingles}
    slides={movingSlides}
  />
{/if}