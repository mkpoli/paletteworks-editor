<script lang="ts">
  import Single from '$lib/render/Single.svelte'
  import Slide from '$lib/render/Slide.svelte'

  import type { Single as SingleType, Slide as SlideType } from '$lib/score/beatmap'

  export let singles: SingleType[]
  export let slides: SlideType[]
</script>

{#each singles as single}
  <Single
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