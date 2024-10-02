<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // Typing
  import type {
    Note,
    EaseType,
    DiamondType,
    Slide,
    Single,
  } from '$lib/score/beatmap'
  import {
    hasEaseType,
    isSlideStep,
    isSlideHead,
    toDiamondType,
  } from '$lib/score/beatmap'

  // Menu Components
  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'

  // Functions
  import { tick, createEventDispatcher } from 'svelte'

  type Events = {
    changeBPM: { tick: number; bpm: number }
    playSound: string
    delete: { notes: Note[] }
    copy: { notes: Note[] }
    cut: { notes: Note[] }
    paste: void
    flippaste: void
    changecurve: {
      note: Note | null
      type?: EaseType
    }
    changediamond: {
      note: Note | null
      type?: DiamondType
    }
    selectall: void
    duplicate: {
      notes: Note[]
    }
    flip: {
      notes: Note[]
    }
    vflip: {
      notes: Note[]
    }
    shrink: {
      notes: Note[]
    }
    divide: {
      slide: Slide
      lastCursor: Cursor
    }
    combine: {
      slides: [Slide, Slide]
    }
    toslide: {
      notes: Note[]
    }
    tostream: {
      slide: Slide
    }
    fix: {
      notes: Note[]
    }
  }

  const dispatch = createEventDispatcher<Events>()

  type EventsForNotes = {
    [K in keyof Events]: Events[K] extends { notes: Note[] } ? K : never
  }[keyof Events]
  function dispatchNotes(event: EventsForNotes) {
    if ($selectedNotes.length > 0) {
      dispatch(event, { notes: $selectedNotes })
    } else if (currentNote !== null) {
      dispatch(event, { notes: [currentNote] })
    }
  }

  function changecurve(type?: EaseType) {
    dispatch('changecurve', { note: currentNote, type })
  }

  function changediamond(type?: DiamondType) {
    dispatch('changediamond', { note: currentNote, type })
  }

  function diamondTypeEquals(note: Note, type: DiamondType) {
    return isSlideStep(note) && toDiamondType(note) === type
  }

  // Stores
  import { selectedNotes } from '$lib/editing/selection'
  import { clipboardSingles, clipboardSlides } from '$lib/editing/clipboard'
  import { cursor, Cursor } from '$lib/position'
  import { getSlideNotes } from '$lib/editing/slides'

  // Props
  export let canvasContainer: HTMLDivElement
  export let currentNote: Note | null
  export let currentSlide: Slide | null
  export let singles: Single[]
  export let slides: Slide[]

  let lastCursor: Cursor

  // Variables
  let menu: HTMLDivElement

  $: overlappingSlides = calcOverlappingSlides(currentNote, $selectedNotes)

  function calcOverlappingSlides(
    note: Note | null,
    selectedNotes: Note[]
  ): [Slide, Slide] | null {
    if (
      selectedNotes.length === 2 &&
      selectedNotes[0].tick === selectedNotes[1].tick &&
      selectedNotes[0].lane === selectedNotes[1].lane &&
      selectedNotes[0].width === selectedNotes[1].width
    ) {
      let slideA
      let slideB

      if (isSlideHead(selectedNotes[0])) {
        slideA = slides.find((slide) => slide.tail === selectedNotes[1])
        slideB = slides.find((slide) => slide.head === selectedNotes[0])
      }

      if (isSlideHead(selectedNotes[1])) {
        slideA = slides.find((slide) => slide.tail === selectedNotes[0])
        slideB = slides.find((slide) => slide.head === selectedNotes[1])
      }

      if (slideA && slideB) {
        return [slideA, slideB]
      }
    }

    if (!note) return null

    for (let slide of slides) {
      if (slide.head === note) {
        const partner = slides.find(
          (s) =>
            s !== slide &&
            s.tail.tick === note.tick &&
            s.tail.lane === note.lane &&
            s.tail.width === note.width
        )
        if (partner) return [slide, partner]
      }

      if (slide.tail === note) {
        const partner = slides.find(
          (s) =>
            s !== slide &&
            s.head.tick === note.tick &&
            s.head.lane === note.lane &&
            s.head.width === note.width
        )
        if (partner) return [slide, partner]
      }
    }

    return null
  }

  function isSingle(note: Note): boolean {
    return singles.includes(note as Single)
  }
</script>

<Menu bind:menu>
  <MenuTrigger
    contextArea={canvasContainer}
    {menu}
    slot="trigger"
    on:hidden={async () => {
      await tick()
      currentNote = null
      currentSlide = null
      overlappingSlides = null
    }}
    on:show={() => {
      lastCursor = { ...$cursor }
    }}
  />

  <!-- Deletion -->
  {#if $selectedNotes.length || currentNote}
    <MenuItem
      icon="mdi:delete"
      text={currentNote
        ? $LL.editor.menu.delete()
        : $LL.editor.menu.deleteall()}
      on:click={() => dispatchNotes('delete')}
    />
  {/if}

  <!-- Clipboard -->
  {#if $selectedNotes.length || currentNote}
    <MenuDivider />
    <MenuItem
      icon="ic:content-cut"
      text={$LL.editor.menu.cut()}
      on:click={() => dispatchNotes('cut')}
    />
    <MenuItem
      icon="mdi:content-copy"
      text={$LL.editor.menu.copy()}
      on:click={() => dispatchNotes('copy')}
    />
  {/if}
  <MenuItem
    icon="mdi:content-paste"
    text={$LL.editor.menu.paste()}
    on:click={() => dispatch('paste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />
  <MenuItem
    icon="ic:round-content-paste-go"
    text={$LL.editor.menu.flippaste()}
    on:click={() => dispatch('flippaste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />

  <!-- Selection -->
  {#if !$selectedNotes.length && !currentNote}
    <MenuDivider />
    <MenuItem
      icon="ic:baseline-select-all"
      text={$LL.editor.menu.selectall()}
      on:click={() => dispatch('selectall')}
    />
  {/if}

  <!-- Duplication -->
  {#if $selectedNotes.length || currentNote}
    <MenuDivider />
    <MenuItem
      icon="mdi:content-duplicate"
      text={$LL.editor.menu.duplicate()}
      on:click={() => dispatchNotes('duplicate')}
    />
  {/if}

  <!-- Flip (Mirroring) -->
  {#if $selectedNotes.length}
    <MenuDivider />
    <MenuItem
      icon="mdi:flip-horizontal"
      text={$LL.editor.menu.flip()}
      on:click={() => dispatch('flip', { notes: $selectedNotes })}
    />
    {#if $selectedNotes.length >= 2}
      <MenuItem
        icon="mdi:flip-vertical"
        text={$LL.editor.menu.vflip()}
        on:click={() => dispatch('vflip', { notes: $selectedNotes })}
      />
    {/if}
  {:else if currentSlide}
    <MenuDivider />
    <MenuItem
      icon="mdi:flip-horizontal"
      text={$LL.editor.menu.flip()}
      on:click={() => {
        if (currentSlide)
          dispatch('flip', { notes: getSlideNotes(currentSlide) })
      }}
    />
    <MenuItem
      icon="mdi:flip-vertical"
      text={$LL.editor.menu.vflip()}
      on:click={() => {
        if (currentSlide)
          dispatch('vflip', { notes: getSlideNotes(currentSlide) })
      }}
    />
  {:else if currentNote}
    <MenuDivider />
    <MenuItem
      icon="mdi:flip-horizontal"
      text={$LL.editor.menu.flip()}
      on:click={() => {
        if (currentNote) dispatch('flip', { notes: [currentNote] })
      }}
    />
  {/if}

  <!-- Slide Notes -->
  {#if !$selectedNotes.length && currentNote !== null && 'easeType' in currentNote}
    <MenuDivider />
    <MenuItem
      icon="custom:straight"
      text={$LL.editor.menu.straight()}
      on:click={() => {
        changecurve(false)
        currentNote = currentNote
      }}
      checked={currentNote.easeType === false}
    />
    <MenuItem
      icon="custom:curve-in"
      text={$LL.editor.menu.curvein()}
      on:click={() => {
        changecurve('easeOut')
        currentNote = currentNote
      }}
      checked={currentNote.easeType === 'easeOut'}
    />
    <MenuItem
      icon="custom:curve-out"
      text={$LL.editor.menu.curveout()}
      on:click={() => {
        changecurve('easeIn')
        currentNote = currentNote
      }}
      checked={currentNote.easeType === 'easeIn'}
    />
  {/if}
  {#if !$selectedNotes.length && currentNote !== null && 'ignored' in currentNote}
    <MenuDivider />
    <MenuItem
      icon="custom:diamond-visible"
      text={$LL.editor.menu.visible()}
      on:click={() => {
        changediamond('visible')
        currentNote = currentNote
      }}
      checked={toDiamondType(currentNote) === 'visible'}
    />
    <MenuItem
      icon="custom:diamond-ignored"
      text={$LL.editor.menu.ignored()}
      on:click={() => {
        changediamond('ignored')
        currentNote = currentNote
      }}
      checked={toDiamondType(currentNote) === 'ignored'}
    />
    <MenuItem
      icon="custom:diamond-invisible"
      text={$LL.editor.menu.invisible()}
      on:click={() => {
        changediamond('invisible')
        currentNote = currentNote
      }}
      checked={toDiamondType(currentNote) === 'invisible'}
    />
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(hasEaseType)}
    <MenuDivider />
    <MenuItem
      icon="custom:straight"
      text={$LL.editor.menu.straight()}
      on:click={() => {
        changecurve(false)
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every(
        (note) => 'easeType' in note && note.easeType === false
      )}
      indeterminate={$selectedNotes.some(
        (note) => 'easeType' in note && note.easeType === false
      )}
    />
    <MenuItem
      icon="custom:curve-in"
      text={$LL.editor.menu.curvein()}
      on:click={() => {
        changecurve('easeOut')
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every(
        (note) => 'easeType' in note && note.easeType === 'easeOut'
      )}
      indeterminate={$selectedNotes.some(
        (note) => 'easeType' in note && note.easeType === 'easeOut'
      )}
    />
    <MenuItem
      icon="custom:curve-out"
      text={$LL.editor.menu.curveout()}
      on:click={() => {
        changecurve('easeIn')
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every(
        (note) => 'easeType' in note && note.easeType === 'easeIn'
      )}
      indeterminate={$selectedNotes.some(
        (note) => 'easeType' in note && note.easeType === 'easeIn'
      )}
    />
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(isSlideStep)}
    <MenuDivider />
    <MenuItem
      icon="custom:diamond-visible"
      text={$LL.editor.menu.visible()}
      on:click={() => {
        changediamond('visible')
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every((note) =>
        diamondTypeEquals(note, 'visible')
      )}
      indeterminate={$selectedNotes.some((note) =>
        diamondTypeEquals(note, 'visible')
      )}
    />
    <MenuItem
      icon="custom:diamond-ignored"
      text={$LL.editor.menu.ignored()}
      on:click={() => {
        changediamond('ignored')
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every((note) =>
        diamondTypeEquals(note, 'ignored')
      )}
      indeterminate={$selectedNotes.some((note) =>
        diamondTypeEquals(note, 'ignored')
      )}
    />
    <MenuItem
      icon="custom:diamond-invisible"
      text={$LL.editor.menu.invisible()}
      on:click={() => {
        changediamond('invisible')
        $selectedNotes = $selectedNotes
      }}
      checked={$selectedNotes.every((note) =>
        diamondTypeEquals(note, 'invisible')
      )}
      indeterminate={$selectedNotes.some((note) =>
        diamondTypeEquals(note, 'invisible')
      )}
    />
  {/if}
  {#if $selectedNotes.length === 2 && $selectedNotes.every(isSlideStep)}
    <MenuDivider />
    <MenuItem
      icon="ci:shrink"
      text={$LL.editor.menu.shrink()}
      on:click={() => {
        dispatch('shrink', { notes: $selectedNotes })
      }}
    />
  {/if}
  {#if $selectedNotes.some((note) => !Number.isInteger(note.tick))}
    <MenuDivider />
    <MenuItem
      icon="ph:number-square-one"
      text={$LL.editor.menu.fixTick()}
      on:click={() => {
        dispatch('fix', { notes: $selectedNotes })
      }}
    />
  {/if}

  <!-- Slide -->
  {#if !$selectedNotes.length && currentSlide}
    <MenuDivider />
    <MenuItem
      icon="iconoir:divide-selection-2"
      text={$LL.editor.menu.divide()}
      on:click={() => {
        if (currentSlide)
          dispatch('divide', { slide: currentSlide, lastCursor })
      }}
    />
  {/if}
  {#if overlappingSlides}
    <MenuDivider />
    <MenuItem
      icon="mdi:vector-combine"
      text={$LL.editor.menu.combine()}
      on:click={() => {
        if (overlappingSlides)
          dispatch('combine', { slides: overlappingSlides })
      }}
    />
  {/if}

  <!-- Slide <-> Stream -->
  {#if $selectedNotes.length && $selectedNotes.every(isSingle)}
    <MenuDivider />
    <MenuItem
      icon="uil:exchange"
      text={$LL.editor.menu.toslide()}
      on:click={() => {
        dispatch('toslide', { notes: $selectedNotes })
      }}
    />
  {/if}
  {#if !$selectedNotes.length && currentSlide}
    <MenuDivider />
    <MenuItem
      icon="uil:exchange"
      text={$LL.editor.menu.tostream()}
      on:click={() => {
        if (currentSlide) dispatch('tostream', { slide: currentSlide })
      }}
    />
  {/if}
</Menu>
