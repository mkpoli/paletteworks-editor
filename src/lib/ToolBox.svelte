<script lang="ts">
  import Icon, { addIcon } from '@iconify/svelte'

  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'

  import ToolButton from '$lib/ui/ToolButton.svelte'

  import { ALLOWED_SNAPPINGS, MODES, MODE_DESCRIPTIONS, MODE_SHORTCUTS, MODE_SHORTCUTS_NUMERAL, MODE_TEXTURES } from '$lib/editing/modes'
  import type { Mode, SnapTo } from '$lib/editing/modes'

  import { createEventDispatcher } from 'svelte'

  addIcon('custom:logo', {
    body: `<path d="M258 29L472.609 243.609L256 337.821L256 335.486V74L72.2283 257.891L256 337.821V358L103.869 291.478L256 443.708L256 358L481.684 259.316L258 483L37.4242 262.424L31 256L42.1788 244.821L258 29Z" fill="currentColor"></path>`,
    width: 512,
    height: 512
  })

  export let currentMode: Mode
  export let snapTo: SnapTo

  let menu: HTMLDivElement

  const dispatch = createEventDispatcher<{
    'save': void,
    'image': void,
    'copy': void,
    'cut': void,
    'paste': void,
    'undo': void,
    'redo': void,
    'new': void,
    'open': void,
  }>()

  import CustomSnappingDialog from './dialogs/CustomSnappingDialog.svelte'
  import { toast } from '@zerodevx/svelte-toast'
  let customSnappingDialogOpened: boolean = false
  let customSnappingDialogValue: number = 0
  $: customSnappingDialogValue = snapTo
  let snappingSelect: HTMLSelectElement
</script>

<div class="toolbox-container">
  <Menu bind:menu={menu}>
    <MenuTrigger class="menu-trigger" {menu} slot="trigger">
      <Icon icon="custom:logo" width=36 />
      <span class="title">PaletteWorks</span>
      <Icon icon="ph:caret-down-fill" width=15 />
    </MenuTrigger>

    <MenuItem icon="ic:outline-insert-drive-file" text="ファイル (&F)">
      <MenuItem icon="eos-icons:content-new" text="新規 (&N)" on:click={() => dispatch('new')}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-folder-open" text="開く (&O)" on:click={() => dispatch('open') } />
      <MenuDivider/>
      <MenuItem icon="mdi:file-export-outline" text="譜面保存 (&S)" on:click={() => dispatch('save')}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-photo-camera" text="画像出力 (&E)" on:click={() => dispatch('image')}/>
    </MenuItem>
    <MenuDivider/>
      <MenuItem icon="ic:sharp-edit" text="編集 (&E)">
        <MenuItem icon="ic:round-undo" text="元に戻す (&U)" on:click={() => dispatch('undo')} />
        <MenuItem icon="ic:round-redo" text="やり直し (&R)" on:click={() => dispatch('redo')} />
        <MenuDivider/>
        <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatch('cut')} />
        <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatch('copy')} />
        <MenuItem icon="mdi:content-save" text="貼り付け (&V)" on:click={() => dispatch('paste')} />
      </MenuItem>
    <MenuDivider/>
    <MenuItem icon="vaadin:cog" text="設定 (&P)" disabled={true} />
    <MenuDivider/>
    <MenuItem icon="vaadin:question-circle-o" text="ヘルプ (&H)" disabled={true} />
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
    }} bind:this={snappingSelect} on:blur={(event) => {
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
      toast.push('数値を入力してください')
      return
    }

    if (customSnappingDialogValue < 1 || customSnappingDialogValue > 1920) {
      toast.push('1から1920までの数値を入力してください')
      return
    }

    snapTo = customSnappingDialogValue
  }}
/>
<style>
  .toolbox-container {
    display: grid;
    width: 15em;
    grid-template-rows: auto 1fr;
  }

  .title {
    font-size: 1.5em;
    font-weight: bold;
    vertical-align: baseline;
  }

  .toolbox-container :global(.menu-trigger) {
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Jura', sans-serif;
    font-weight: 800;
    font-size: 1em;
    gap: 0.5em;
    background: rgba(0, 0, 0, 0.025);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.45);
  }

  .toolbox-container :global(.menu-trigger:hover) {
    filter: brightness(1.5);
  }

  .tool-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    /* gap: 1em; */
  }

  select {
    font-size: 1.125em;
    padding: 0.25em 0.5em;
    border-radius: 1em;
    margin: 1em;
  }
</style>