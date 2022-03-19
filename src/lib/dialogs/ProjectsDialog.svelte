<script lang="ts">
  // Ii8n
  import LL from '$i18n/i18n-svelte'

  // UI Components
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import Icon from "@iconify/svelte"

  import Modal from "$lib/ui/Modal.svelte"
  import TextInput from "$lib/ui/TextInput.svelte"
  import ProjectCard from '$lib/dialogs/ProjectCard.svelte'

  import { confirm } from '$lib/dialogs'

  // Events
  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher<{
    open: { project: Project },
    new: void,
    openfile: void,
    cancel: void,
    delete: {
      id: number,
      name: string | null,
    }
  }>()

  export let opened: boolean
  export let currentProject: Project | null

  import { db, projects as projectObservable, PROJECT_FILE_EXTENSION, seriliseProject } from '$lib/database'
  import type { Project } from '$lib/database'

  import { download } from '$lib/basic/file'

  let projects: Project[] = []
  $: projects = ($projectObservable as Project[] ?? [])

  $: if ($projectObservable) {
    if (projects.length == 0) {
      dispatch('new')
      opened = false
    }
  }

  let container: HTMLDivElement

  import hotkeys from 'hotkeys-js'

  hotkeys('enter', (event) => {
    if (opened && selected !== null && container.contains(document.activeElement)) {
      event.preventDefault()
      dispatch('open', { project: selected })
      opened = false
    }
  })

  hotkeys('left, right, delete', (event, handler) => {
    event.preventDefault()
    if (opened && selected !== null && filtered.includes(selected)) {
      switch (handler.key) {
        case 'left':
          elements[projects.indexOf(filtered.rotatePrev(selected))].focus()
          break
        case 'right':
          elements[projects.indexOf(filtered.rotateNext(selected))].focus()
          break
        case 'delete':
          ondelete().then()
      }
    }
  })

  async function ondelete() {
    if (selected && await confirm($LL.editor?.messages?.deleteConfirm() + '\n\n' + (selected.name ?? 'Untitled'))) {
      const { id, name } = selected
      if (id) dispatch('delete', { id, name })
    }
  }

  let selected: Project | null = null

  let searchKeyword: string = ""

  const elements: HTMLDivElement[] = []

  let firstOpen: boolean = true

  $: if (elements.length !== 0) {
    if (firstOpen) {
      tick().then(() => {
        elements[0].focus()
      })
      firstOpen = false
    }
  }

  async function ondialogopened() {
    const project = projects.find(project => project.id === currentProject?.id) ?? null
    if (project) {
      elements[projects.indexOf(project)]?.focus()
    } else {
      elements[0]?.focus()
    }
  }

  $: filtered = projects.filter(({ name }) => searchKeyword ? (name?.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()) ?? 'Untitled') : true)

</script>

<Modal
  bind:opened
  on:opened={ondialogopened}
  on:closed={() => {
    if (currentProject === null) {
      opened = true
    }
  }}
>
  <div slot="presentation">
    <h2>{$LL.editor.dialog?.projectsTitle()}</h2>
    <div class="close">
      {#if currentProject !== null}
        <ClickableIcon
          icon="gridicons:cross"
          height="1.5em"
          on:click={() => { dispatch('cancel'); opened = false }}
        />
      {/if}
    </div>
    <TextInput
      class="search"
      type="search"
      bind:value={searchKeyword}
    >
      <Icon slot="head" icon="ic:outline-search"/>
      <span slot="tail">{filtered?.length ?? 0}/{projects?.length ?? 0}</span>
    </TextInput>
    <div class="project-container" bind:this={container}>
      {#each filtered as project, index (project.id)}
        <ProjectCard
          {project}
          selected={selected === project}
          on:rename={() => {
            db.projects.put(project)
          }}
          on:open={() => {
            dispatch('open', { project })
            opened = false
          }}
          on:delete={ondelete}
          on:select={() => {
            selected = project
          }}
          on:export={async () => {
            await download(await seriliseProject(project), project.name + PROJECT_FILE_EXTENSION)
          }}
          bind:container={elements[index]}
        />
      {/each}
    </div>
    <Button
      class="open"
      icon="ic:baseline-folder-open"
      on:click={() => {
        dispatch('openfile')
        opened = false
      }}
    >
      {$LL.editor.dialog.openscore()}
    </Button>
    <Button
      class="new"
      icon="mdi:plus-thick"
      on:click={() => {
        dispatch('new')
        opened = false
      }}
    >
    {$LL.editor.dialog.new()}
    </Button>
  </div>
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    /* grid-template: 1fr auto / auto 1fr auto ; */
    grid-template-columns: repeat(6, 3.2em);
    grid-template-rows: repeat(5, 3.2em);
    grid-template-areas:
      "h h h . . x"
      "s s s s s s"
      "t t t t t t"
      "t t t t t t"
      "t t t t t t"
      "p p p o o o"
  }

  .close {
    height: auto;
    width: auto;
  }

  h2 {
    grid-area: h;
    display: block;
    margin: 0;
  }

  [slot=presentation] :global(.open) {
    grid-area: p;
  }
  [slot=presentation] :global(.search) {
    grid-area: s;
  }

  [slot=presentation] :global(.new) {
    grid-area: o;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .project-container {
    grid-area: t;
    display: flex;
    gap: 1em;
    overflow-y: visible;
    overflow-x: auto;
    padding: 0.5em;
  }
</style>
