<script lang="ts">
  // Score Components
  import FloatingNotes from './FloatingNotes.svelte'

  // Types
  import type { Single, Slide as SlideType } from '$lib/score/beatmap'

  // Functions
  import { clipboardOffsets, flippasted, pasted } from '$lib/editing/clipboard'

  // Stores
  import { cursor } from '$lib/position'
  import { ctrlKey, altKey } from '$lib/control/keyboard'

  // Variables
  let pastedSingles: Single[]
  let pastedSlides: SlideType[]

  // Reactive
  $: ({ singles: pastedSingles, slides: pastedSlides } = !$altKey
    ? pasted($cursor)
    : flippasted($cursor))
</script>

{#if $ctrlKey && $clipboardOffsets.size > 0}
  <FloatingNotes singles={pastedSingles} slides={pastedSlides} />
{/if}
