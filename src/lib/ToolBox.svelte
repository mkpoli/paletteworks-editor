<script lang="ts">
  import Icon, { addIcon } from '@iconify/svelte'

  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'

  import ToolButton from '$lib/ui/ToolButton.svelte'

  import { ALLOWED_SNAPPINGS, MODES } from '$lib/editing/modes'
  import type { Mode, SnapTo } from '$lib/editing/modes'

  import toast from '$lib/ui/toast'
  import { createEventDispatcher } from 'svelte'

  addIcon('custom:logo', {
    body: `<path d="M258 29L472.609 243.609L256 337.821L256 335.486V74L72.2283 257.891L256 337.821V358L103.869 291.478L256 443.708L256 358L481.684 259.316L258 483L37.4242 262.424L31 256L42.1788 244.821L258 29Z" fill="currentColor"></path>`,
    width: 512,
    height: 512
  })

  export let currentMode: Mode
  export let snapTo: SnapTo

  let menu: HTMLDivElement
  import { KEYBOARD_SHORTCUTS } from './control/keyboard'

  const dispatch = createEventDispatcher<{
    export: void,
    image: void,
    copy: void,
    cut: void,
    paste: void,
    undo: void,
    redo: void,
    new: void,
    open: void,
    selectall: void,
    preferences: void,
  }>()

  import CustomSnappingDialog from './dialogs/CustomSnappingDialog.svelte'
  let customSnappingDialogOpened: boolean = false
  let customSnappingDialogValue: number = 0
  $: customSnappingDialogValue = snapTo
  let snappingSelect: HTMLSelectElement
</script>

<div class="toolbox-container">
  <Menu bind:menu={menu}>
    <MenuTrigger {menu} slot="trigger">
      <button class="menu-trigger">
        <Icon icon="custom:logo" width=36 />
        <span class="title">PaletteWorks</span>
        <Icon icon="ph:caret-down-fill" width=15 />
      </button>
    </MenuTrigger>

    <MenuItem icon="ic:outline-insert-drive-file" text="ファイル (&F)">
      <MenuItem icon="eos-icons:content-new" text="新規 (&N)" on:click={() => dispatch('new')} tooltip={{ description: '新規譜面を作成', keys: KEYBOARD_SHORTCUTS.new, placement: 'right'}}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-folder-open" text="開く (&O)" on:click={() => dispatch('open') } tooltip={{ description: 'プロジェクト等を開く', keys: KEYBOARD_SHORTCUTS.open, placement: 'right'}}/>
      <MenuDivider/>
      <MenuItem icon="mdi:file-export-outline" text="譜面保存 (&S)" on:click={() => dispatch('export')} tooltip={{ description: 'SUSファイルに出力', keys: KEYBOARD_SHORTCUTS.export, placement: 'right'}}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-photo-camera" text="画像出力 (&I)" on:click={() => dispatch('image')} tooltip={{ description: '譜面の画像化', keys: KEYBOARD_SHORTCUTS.image, placement: 'right'}}/>
    </MenuItem>
    <MenuDivider/>
      <MenuItem icon="ic:sharp-edit" text="編集 (&E)">
        <MenuItem icon="ic:round-undo" text="元に戻す (&U)" on:click={() => dispatch('undo')} tooltip={{ description: '前の操作を取り消す', keys: KEYBOARD_SHORTCUTS.undo, placement: 'right'}} />
        <MenuItem icon="ic:round-redo" text="やり直し (&R)" on:click={() => dispatch('redo')} tooltip={{ description: '取り消した操作をやり直す', keys: KEYBOARD_SHORTCUTS.redo, placement: 'right'}}/>
        <MenuDivider/>
        <MenuItem icon="ic:baseline-select-all" text="すべて選択 (&A)" on:click={() => dispatch('selectall')} tooltip={{ description: 'すべてのノーツを選択', keys: KEYBOARD_SHORTCUTS.selectall, placement: 'right'}}/>
        <MenuDivider/>
        <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatch('cut')} />
        <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatch('copy')} />
        <MenuItem icon="mdi:content-save" text="貼り付け (&V)" on:click={() => dispatch('paste')} />
      </MenuItem>
    <MenuDivider/>
    <MenuItem icon="vaadin:cog" text="設定 (&P)" on:click={() => dispatch('preferences')}/>
    <MenuDivider/>
    <MenuItem icon="vaadin:question-circle-o" text="ヘルプ (&H)" href="https://wiki.purplepalette.net/create-charts/steps/create-chart/paletteworks" />
  </Menu>

  <div class="tool-container">
    {#each MODES as mode}
      <ToolButton {mode} bind:currentMode />
    {/each}
    <select bind:value={snapTo} on:change={() => {
      if (snappingSelect.selectedIndex === snappingSelect.options.length - 1) {
        customSnappingDialogOpened = true
        customSnappingDialogValue = snapTo
        return
      }
    }} bind:this={snappingSelect} on:blur={() => {
      if (snappingSelect.selectedIndex === snappingSelect.options.length - 1) {
        customSnappingDialogOpened = true
        customSnappingDialogValue = snapTo
        return
      }
    }}>
      {#each ALLOWED_SNAPPINGS as snap}
        <option value={snap}>{snap}分音符</option>
      {/each}
      <option value={snapTo} on:click={() => { customSnappingDialogOpened = true }}>カスタム {customSnappingDialogValue}</option>
    </select>
  </div>
</div>

<CustomSnappingDialog
  bind:opened={customSnappingDialogOpened}
  bind:value={customSnappingDialogValue}
  on:ok={() => {
    if (isNaN(customSnappingDialogValue)) {
      toast.error('数値を入力してください')
      return
    }

    if (customSnappingDialogValue < 1 || customSnappingDialogValue > 1920) {
      toast.error('1から1920までの数値を入力してください')
      return
    }

    snapTo = customSnappingDialogValue
  }}
/>
<style>
  .toolbox-container {
    display: grid;
    /* width: 15em; */
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  .title {
    font-size: 1.5em;
    font-weight: bold;
    vertical-align: baseline;
  }

  .toolbox-container .menu-trigger {
    border: none;
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Jura', sans-serif;
    font-weight: 800;
    font-size: 1em;
    gap: 0.5em;
    background: rgba(0, 0, 0, 0.025);
    color: var(--color-text-main);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.45);
  }

  .toolbox-container .menu-trigger:hover {
    filter: brightness(1.5);
  }

  .tool-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .tool-container::-webkit-scrollbar {
    display: none;
  }

  select {
    font-size: 1.125em;
    padding: 0.25em 0.5em;
    border-radius: 1em;
    margin: 1em;
  }
</style>