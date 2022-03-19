<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  import type { Project } from '$lib/database'
  import { createEventDispatcher, onMount, tick } from 'svelte'

  // UI Components
  import Menu from '$lib/ui/Menu.svelte'
  import MenuDivider from '$lib/ui/MenuDivider.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'

  const dispatch = createEventDispatcher<{
    rename: { name: string }
    delete: void
    open: void
    select: void
    export: void
  }>()

  export let project: Project
  export let selected: boolean

  let renaming: boolean = true

  let menu: HTMLDivElement

  export let container: HTMLDivElement | undefined = undefined

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
      plugins: [followCursor],
    })
  })
</script>

<div
  class="project"
  on:focus={() => {
    dispatch('select')
  }}
  tabIndex="0"
  bind:this={container}
>
  <div
    class="preview"
    on:dblclick={() => {
      dispatch('open')
    }}
    bind:this={tooltipTarget}
  >
    {#if project.preview}
      <img src={URL.createObjectURL(project.preview)} alt="Preview" />
    {/if}
  </div>
  <div bind:this={tooltipContent}>
    <dl>
      <dt>{$LL.editor.panel.title()}</dt>
      <dd>{project.metadata.title}</dd>
      <dt>{$LL.editor.panel.artist()}</dt>
      <dd>{project.metadata.artist}</dd>
      <dt>{$LL.editor.panel.updatedTime()}</dt>
      <dd>{project.updated}</dd>
    </dl>
  </div>
  <div
    class="name"
    on:dblclick={() => {
      renaming = true
    }}
  >
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
      {project.name || 'Untitled'}
    {/if}
  </div>
</div>

<Menu bind:menu>
  <MenuTrigger contextArea={container} {menu} />
  <MenuItem
    icon="mdi:open-in-new"
    text={$LL.editor.menu.open()}
    on:click={() => {
      dispatch('open')
    }}
  />
  <MenuDivider />
  <MenuItem
    icon="ic:sharp-edit"
    text={$LL.editor.menu.rename()}
    on:click={async () => {
      renaming = true
      await tick()
      renameInput.focus()
    }}
  />
  <MenuDivider />
  <MenuItem
    icon="mdi:export"
    text={$LL.editor.menu.export()}
    on:click={() => {
      dispatch('export')
    }}
  />
  <MenuDivider />
  <MenuItem
    icon="ic:delete"
    text={$LL.editor.menu.delete()}
    on:click={() => {
      dispatch('delete')
    }}
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

    --color-selected: #007bf8;
  }

  .project:hover {
    color: var(--color-text-main);
  }

  .project:focus {
    outline: none;
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

  .project:focus .preview {
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

    background: linear-gradient(
      122deg,
      rgba(116, 80, 244, 0.65) 0%,
      rgba(65, 78, 255, 0.65) 100%
    );
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
