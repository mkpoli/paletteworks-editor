<script lang="ts">
  import type { Project } from '$lib/projects'
  import { createEventDispatcher, onMount, tick } from 'svelte'

  // UI Components
  import Menu from "$lib/ui/Menu.svelte"
  import MenuDivider from "$lib/ui/MenuDivider.svelte"
  import MenuItem from "$lib/ui/MenuItem.svelte"
  import MenuTrigger from "$lib/ui/MenuTrigger.svelte"

  const dispatch = createEventDispatcher<{
    rename: { name: string }
    delete: void,
    open: void,
    select: void
  }>()

  export let project: Project
  export let selected: boolean

  let renaming: boolean = true
  
  let menu: HTMLDivElement

  let container: HTMLDivElement

  function renamed() {
    renaming = false
    dispatch('rename')
  }

  $: if (!selected) renaming = false
  
  let renameInput: HTMLInputElement

  let tooltipTarget: HTMLDivElement
  let tooltipContent: HTMLDivElement
  import tippy, { followCursor } from 'tippy.js'

  onMount(() => {
    tippy(tooltipTarget, {
      content: tooltipContent,
      placement: 'bottom-start',
      theme: 'meta',
      delay: [0, 0],
      followCursor: true,
      plugins: [followCursor]
    })
  })
</script>

<div
  class="project"
  class:selected
  on:focus={() => { dispatch('select') }}
  tabIndex=0
  bind:this={container}
>
  <div class="preview" on:dblclick={() => { dispatch('open') }} bind:this={tooltipTarget}>
    {#if project.preview}
      <img src={URL.createObjectURL(project.preview)} alt="Preview" />
    {/if}
  </div>
  <div bind:this={tooltipContent}>
    <dl>
      <dt>タイトル</dt>
      <dd>{project.metadata.title}</dd>
      <dt>アーティスト</dt>
      <dd>{project.metadata.title}</dd>
      <dt>更新時間</dt>
      <dd>{project.updated}</dd>
    </dl>
  </div>
  <div class="name" on:dblclick={() => { renaming = true }}>
    {#if renaming && selected}
      <input
        type="text"
        bind:value={project.name}
        on:blur={renamed}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            renamed()
          }
        }}
        bind:this={renameInput}
      />
    {:else}
      {project.name}
    {/if}
  </div>
</div>

<Menu bind:menu>
  <MenuTrigger contextArea={container} menu={menu} />
  <MenuItem
    icon="mdi:open-in-new"
    text="開く"
    on:click={() => { dispatch('open') }}
  />
  <MenuDivider/>
  <MenuItem
    icon="ic:sharp-edit"
    text="リネーム"
    on:click={async () => { renaming = true; await tick(); renameInput.focus() }}
  />
  <MenuDivider/>
  <MenuItem
    icon="ic:delete"
    text="削除"
    on:click={() => { dispatch('delete') }}
  />
</Menu>

<style>
  .project {
    /* border: 1px solid #fff; */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 8em;
    gap: 0.2em;
    color: var(--color-text-darker);
    flex-shrink: 0;

    --color-selected: #007BF8;
  }

  .project:hover {
    color: var(--color-text-main);
  }

  .project.selected {
    color: var(--color-selected);
  }

  img {
    width: 100%;
    height: 100%;
  }

  .preview {
    width: 100%;
    height: auto;
    flex-grow: 1;
    border: 1px solid var(--color-text-darker);
    overflow: hidden;
    border-radius: 1em;
  }
  
  .project:hover .preview {
    border: 2px solid var(--color-text-main);
  }

  .project.selected .preview {
    border: 2px solid var(--color-selected);
    box-shadow: 0 0 6px 0 var(--color-selected);
  }

  input {
    color: var(--color-text-main);
    padding: 0 0.5em;
    width: 100%;
    min-width: none;
  }

  :global(.tippy-box[data-theme~='meta']) {
    display: flex;
    align-items: center;
    justify-content: center;

    background: linear-gradient(122deg, rgba(116, 80, 244, 0.65) 0%, rgba(65, 78, 255, 0.65) 100%);
    padding: 0.5em 1em;
    color: var(--color-text-darker);

    box-shadow: 0 3px 12px #402860;
    border-radius: 0.5em;
    backdrop-filter: blur(4px);
    text-shadow: 1px 1px 2px #402860;
  }

  dl {
    font-weight: bold;
  }

  dd {
    font-weight: normal;
  }
</style>