<script lang="ts">
  import Note from '$lib/render/Note.svelte'
  import Slide from '$lib/render/Slide.svelte'

  import type { Single, Slide as SlideType } from '$lib/score/beatmap'

  export let singles: Single[]
  export let slides: SlideType[]
</script>

{#each singles as single}
  <Note
    note={single}
    floating={true}
  />
{/each}
{#each slides as slide}
  <Slide
    slide={slide}
    floating={true}
    stepsVisible={false}
  />
{/each}