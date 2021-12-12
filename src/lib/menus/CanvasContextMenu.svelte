<script lang="ts">
  // Type Definitions
  import { Note, EaseType, DiamondType, hasEaseType, isSlideStep, toDiamondType } from '$lib/score/beatmap'

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

  // Props
  export let canvasContainer: HTMLDivElement
  export let currentNote: Note | null

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
    }}
  ></MenuTrigger>
  {#if $selectedNotes.length || currentNote}
    <MenuItem icon="mdi:delete" text={ currentNote ? "削除" : "削除（全部）"} on:click={() => dispatchNotes('delete', currentNote)} />
    <MenuDivider/>
    <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatchNotes('cut', currentNote)} />
    <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatchNotes('copy', currentNote)} />
  {/if}
  <MenuItem icon="mdi:content-save" text="貼り付け (&V)" on:click={() => dispatch('paste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />
  <MenuDivider/>
  <MenuItem icon="ic:baseline-select-all" text="すべて選択 (&A)" on:click={() => dispatch('selectall')}/>
  {#if $selectedNotes.length || currentNote}
    <MenuDivider/>
    <MenuItem icon="mdi:content-duplicate" text="複製 (&D)" on:click={() => dispatchNotes('duplicate', currentNote)} />
  {/if}
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:flip-horizontal" text="左右ミラー (&H)" on:click={() => dispatch('flip', { notes: $selectedNotes })} />
  {/if}
  {#if !$selectedNotes.length && currentNote !== null && 'easeType' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:straight" text="直線" on:click={() => { changecurve(false); currentNote = currentNote }} checked={currentNote.easeType === false}/>
    <MenuItem icon="custom:curve-in" text="加速" on:click={() => { changecurve('easeOut'); currentNote = currentNote }} checked={currentNote.easeType === 'easeOut'}/>
    <MenuItem icon="custom:curve-out" text="減速" on:click={() => { changecurve('easeIn'); currentNote = currentNote }} checked={currentNote.easeType === 'easeIn'}/>
  {/if}
  {#if !$selectedNotes.length && currentNote !== null && 'ignored' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:diamond-visible" text="可視" on:click={() => { changediamond('visible'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'visible'}/>
    <MenuItem icon="custom:diamond-ignored" text="無視" on:click={() => { changediamond('ignored'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'ignored'}/>
    <MenuItem icon="custom:diamond-invisible" text="不可視" on:click={() => { changediamond('invisible'); currentNote = currentNote }} checked={toDiamondType(currentNote) === 'invisible'}/>
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(hasEaseType)}
    <MenuDivider/>
    <MenuItem
      icon="custom:straight"
      text="直線"
      on:click={() => { changecurve(false); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === false)}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === false)}
    />
    <MenuItem
      icon="custom:curve-in"
      text="加速"
      on:click={() => { changecurve('easeOut'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === 'easeOut')}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === 'easeOut')}
    />
    <MenuItem
      icon="custom:curve-out"
      text="減速"
      on:click={() => { changecurve('easeIn'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => 'easeType' in note && note.easeType === 'easeIn')}
      indeterminate={$selectedNotes.some((note) => 'easeType' in note && note.easeType === 'easeIn')}
    />
  {/if}
  {#if $selectedNotes.length && $selectedNotes.some(isSlideStep)}
    <MenuDivider/>
    <MenuItem
      icon="custom:diamond-visible"
      text="可視"
      on:click={() => { changediamond('visible'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'visible'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'visible'))}
    />
    <MenuItem
      icon="custom:diamond-ignored"
      text="無視"
      on:click={() => { changediamond('ignored'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'ignored'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'ignored'))}
    />
    <MenuItem
      icon="custom:diamond-invisible"
      text="不可視"
      on:click={() => { changediamond('invisible'); $selectedNotes = $selectedNotes }}
      checked={$selectedNotes.every((note) => diamondTypeEquals(note, 'invisible'))}
      indeterminate={$selectedNotes.some((note) => diamondTypeEquals(note, 'invisible'))}
    />
  {/if}
  {#if $selectedNotes.length === 2 && $selectedNotes.every(isSlideStep)}
    <MenuDivider/>
    <MenuItem
      icon="ci:shrink"
      text="縮める"
      on:click={() => { dispatch('shrink', { notes: $selectedNotes }) }}
    />
  {/if}
</Menu>