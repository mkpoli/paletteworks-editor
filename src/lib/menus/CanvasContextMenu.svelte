<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // Typing
  import type { Note, EaseType, DiamondType, Slide } from '$lib/score/beatmap'
  import { hasEaseType, isSlideStep, toDiamondType } from '$lib/score/beatmap'

  // Menu Components
  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'

  // Functions
  import { tick, createEventDispatcher } from 'svelte'

  type Events = {
    changeBPM: { tick: number, bpm: number },
    playSound: string,
    delete: { notes: Note[] },
    copy: { notes: Note[] },
    cut: { notes: Note[] },
    paste: void,
    flippaste: void,
    changecurve: {
      note: Note | null,
      type?: EaseType
    },
    changediamond: {
      note: Note | null,
      type?: DiamondType
    },
    selectall: void,
    duplicate: {
      notes: Note[]
    },
    flip: {
      notes: Note[]
    },
    shrink: {
      notes: Note[]
    },
    divide: {
      slide: Slide,
      lastCursor: Cursor
    }
  }

  const dispatch = createEventDispatcher<Events>()

  type EventsForNotes = {
    [K in keyof Events]: Events[K] extends { notes: Note[] } ? K : never
  }[keyof Events]
  function dispatchNotes(event: EventsForNotes, note: Note | null) {
    if (note) {
      dispatch(event, { notes: [note] })
    } else {
      dispatch(event, { notes: $selectedNotes })
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

  // Props
  export let canvasContainer: HTMLDivElement
  export let currentNote: Note | null
  export let currentSlide: Slide | null
  
  let lastCursor: Cursor

  // Variables
  let menu: HTMLDivElement
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
    }}
    on:show={() => {
      lastCursor = {...$cursor}
    }}
  ></MenuTrigger>
  {#if $selectedNotes.length || currentNote}
    <MenuItem icon="mdi:delete" text={ currentNote ? $LL.editor.menu.delete() : $LL.editor.menu.deleteall()} on:click={() => dispatchNotes('delete', currentNote)} />
    <MenuDivider/>
    <MenuItem icon="ic:content-cut" text={$LL.editor.menu.cut()} on:click={() => dispatchNotes('cut', currentNote)} />
    <MenuItem icon="mdi:content-copy" text={$LL.editor.menu.copy()} on:click={() => dispatchNotes('copy', currentNote)} />
  {/if}
  <MenuItem icon="mdi:content-paste" text={$LL.editor.menu.paste()} on:click={() => dispatch('paste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />
  <MenuItem icon="ic:round-content-paste-go" text={$LL.editor.menu.flippaste()} on:click={() => dispatch('flippaste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />
  <MenuDivider/>
  <MenuItem icon="ic:baseline-select-all" text={$LL.editor.menu.selectall()} on:click={() => dispatch('selectall')}/>
  {#if $selectedNotes.length || currentNote}
    <MenuDivider/>
    <MenuItem icon="mdi:content-duplicate" text={$LL.editor.menu.duplicate()} on:click={() => dispatchNotes('duplicate', currentNote)} />
  {/if}
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:flip-horizontal" text={$LL.editor.menu.flip()} on:click={() => dispatch('flip', { notes: $selectedNotes })} />
  {/if}
  {#if !$selectedNotes.length && currentNote !== null && 'easeType' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:straight" text={$LL.editor.menu.straight()} on:click={() => { changecurve(false); currentNote = currentNote }} checked={currentNote.easeType === false}/>
    <MenuItem icon="custom:curve-in" text={$LL.editor.menu.curvein()} on:click={() => { changecurve('easeOut'); currentNote = currentNote }} checked={currentNote.easeType === 'easeOut'}/>
    <MenuItem icon="custom:curve-out" text={$LL.editor.menu.curveout()} on:click={() => { changecurve('easeIn'); currentNote = currentNote }} checked={currentNote.easeType === 'easeIn'}/>
  {/if}
  {#if !$selectedNotes.length && currentNote !== null && 'ignored' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:diamond-visible" text={$LL.editor.menu.visible()} on:click={() => { changediamond('visible'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'visible'}/>
    <MenuItem icon="custom:diamond-ignored" text={$LL.editor.menu.ignored()} on:click={() => { changediamond('ignored'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'ignored'}/>
    <MenuItem icon="custom:diamond-invisible" text={$LL.editor.menu.invisible()} on:click={() => { changediamond('invisible'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'invisible'}/>
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(hasEaseType)}
    <MenuDivider/>
    <MenuItem
      icon="custom:straight"
      text={$LL.editor.menu.straight()}
      on:click={() => { changecurve(false); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === false)}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === false)}
    />
    <MenuItem
      icon="custom:curve-in"
      text={$LL.editor.menu.curvein()}
      on:click={() => { changecurve('easeOut'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === 'easeOut')}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === 'easeOut')}
    />
    <MenuItem
      icon="custom:curve-out"
      text={$LL.editor.menu.curveout()}
      on:click={() => { changecurve('easeIn'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === 'easeIn')}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === 'easeIn')}
    />
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(isSlideStep)}
    <MenuDivider/>
    <MenuItem
      icon="custom:diamond-visible"
      text={$LL.editor.menu.visible()}
      on:click={() => { changediamond('visible'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'visible'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'visible'))}
    />
    <MenuItem
      icon="custom:diamond-ignored"
      text={$LL.editor.menu.ignored()}
      on:click={() => { changediamond('ignored'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'ignored'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'ignored'))}
    />
    <MenuItem
      icon="custom:diamond-invisible"
      text={$LL.editor.menu.invisible()}
      on:click={() => { changediamond('invisible'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'invisible'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'invisible'))}
    />
  {/if}
  {#if $selectedNotes.length === 2 && $selectedNotes.every(isSlideStep)}
    <MenuDivider/>
    <MenuItem
      icon="ci:shrink"
      text={$LL.editor.menu.shrink()}
      on:click={() => { dispatch('shrink', { notes: $selectedNotes }) }}
    />
  {/if}
  {#if currentSlide}
    <MenuDivider/>
    <MenuItem
      icon="iconoir:divide-selection-2"
      text={$LL.editor.menu.divide()}
      on:click={() => { if (currentSlide) dispatch('divide', { slide: currentSlide, lastCursor }) }}
    />
  {/if}
</Menu>