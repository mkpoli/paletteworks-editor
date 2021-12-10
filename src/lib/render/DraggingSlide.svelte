<script lang="ts">
  import Slide from '$lib/render/Slide.svelte'
  import type { Slide as SlideType } from "$lib/score/beatmap"
  export let draggingSlide: SlideType | null
</script>

{#if draggingSlide !== null}
  <Slide
    slide={draggingSlide}
    stepsVisible={false}
  />
{/if}