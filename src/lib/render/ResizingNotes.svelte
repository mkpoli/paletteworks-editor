<script lang="ts">
  // Score Components
  import FloatingNotes from './FloatingNotes.svelte'

  import { resizingNotes, resizingTargets } from '$lib/editing/resizing'
  import type { Single, Slide as SlideType } from '$lib/score/beatmap'

  export let singles: Single[]
  export let slides: SlideType[]
  export let resizing: boolean

  let resizingSingles: Single[]
  let resizingSlides: SlideType[]

  function updateresizing() {
    resizingSingles = singles
      .filter((single) => $resizingNotes.includes(single))
      .map((single) => ({ ...single, ...$resizingTargets.get(single) }))

    resizingSlides = slides
      .filter((slide) =>
        $resizingNotes.includes(slide.head) || $resizingNotes.includes(slide.tail) || slide.steps.some((step) => $resizingNotes.includes(step))
      )
      .map((slide) => {
        return {
          ...slide,
          head: { ...slide.head, ...$resizingTargets.get(slide.head) },
          tail: { ... slide.tail, ...$resizingTargets.get(slide.tail) },
          steps: slide.steps.map((step) => ({ ...step, ...$resizingTargets.get(step) }))
        }
      })
  
    if (resizing) {
      setTimeout(updateresizing, 50)
    }
  }

  $: if (resizing) {
    updateresizing()
  }
</script>

{#if resizing}
  <FloatingNotes
    singles={resizingSingles}
    slides={resizingSlides}
  />
{/if}