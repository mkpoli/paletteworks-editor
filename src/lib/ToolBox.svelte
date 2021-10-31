<script lang="ts">
  import Icon, { addIcon } from '@iconify/svelte'

  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'

  import { ALLOWED_SNAPPINGS, MODE_TEXTURES } from '$lib/editing/modes'
  import type { Mode, SnapTo } from '$lib/editing/modes'

  import { createEventDispatcher } from 'svelte'

  addIcon('custom:logo', {
    body: `<path d="M258 29L472.609 243.609L256 337.821L256 335.486V74L72.2283 257.891L256 337.821V358L103.869 291.478L256 443.708L256 358L481.684 259.316L258 483L37.4242 262.424L31 256L42.1788 244.821L258 29Z" fill="currentColor"></path>`,
    width: 512,
    height: 512
  })

  export let currentMode: Mode
  export let snapTo: SnapTo

  function setMode(mode: string) {
    currentMode = mode as Mode
  }

  let menu: HTMLDivElement

  const dispatch = createEventDispatcher<{
    'save': void,
    'image': void,
    'copy': void,
    'cut': void,
    'paste': void,
  }>()
</script>

<div class="toolbox-container">
  <Menu bind:menu={menu}>
    <MenuTrigger class="menu-trigger" {menu} slot="trigger">
      <Icon icon="custom:logo" width=36 />
      PaletteWorks
      <Icon icon="ph:caret-down-fill" width=15 />
    </MenuTrigger>

    <MenuItem icon="ic:outline-insert-drive-file" text="ファイル (&F)">
      <MenuItem icon="eos-icons:content-new" text="新規 (&N)" disabled={true}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-folder-open" text="開く (&O)" disabled={true}/>
      <MenuDivider/>
      <MenuItem icon="mdi:file-export-outline" text="譜面保存 (&S)" on:click={() => dispatch('save')}/>
      <MenuDivider/>
      <MenuItem icon="ic:baseline-photo-camera" text="画像出力 (&E)" on:click={() => dispatch('image')}/>
    </MenuItem>
    <MenuDivider/>
      <MenuItem icon="ic:sharp-edit" text="編集 (&E)">
        <MenuItem icon="ic:round-undo" text="元に戻す (&U)" disabled={true} />
        <MenuItem icon="ic:round-redo" text="やり直し (&R)" disabled={true} />
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
    {#each Object.entries(MODE_TEXTURES) as [ mode, src ]}
      <button on:click={() => { setMode(mode) }} class:current={ currentMode === mode }>
        <img src={src} alt={`${mode} Mode`} />
      </button>
    {/each}
    <select bind:value={snapTo}>
      {#each ALLOWED_SNAPPINGS as snap}
        <option value={snap}>{snap}分音符</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .toolbox-container {
    display: grid;
    width: 15em;
    grid-template-rows: auto 1fr;
  }

  .toolbox-container :global(.menu-trigger) {
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    gap: 1em;
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

  img {
    height: 5em;
  }

  
  button {
    box-shadow: none;    
    background: transparent;
    width: 100%;
    height: 5em;
    border-radius: 0;
    border: none;
    /* margin: 0; */
    padding: 0;
    border-bottom: 1px solid #fff3;
    /* border: 1px solid #fffa; */
  }

  button > img {
    transition: transform .2s;
  }

  button:focus,
  button.current {
    outline: none;
    filter: brightness(1.65);
  }

  button.current > img {
    transform: scale(1.25);
  }

  select {
    font-size: 1.125em;
    padding: 0.25em 0.5em;
    border-radius: 1em;
    margin: 1em;
  }
</style>