<script lang="ts">
  // UI Components
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import Icon from "@iconify/svelte"

  import Modal from "$lib/ui/Modal.svelte"
  import TextInput from "$lib/ui/TextInput.svelte"
  import ProjectCard from '$lib/dialogs/ProjectCard.svelte'

  // Events
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    open: { project: Project },
    new: void,
    openfile: void,
    cancel: void,
    delete: number
  }>()

  export let opened: boolean
  export let currentProject: Project | null

  import { db, projects as projectObservable } from '$lib/projects'
  import type { Project } from '$lib/projects'

  let projects: Project[] = []
  $: projects = ($projectObservable ?? [])

  $: if ($projectObservable) {
    if (projects.length == 0) {
      dispatch('new')
      opened = false
    }
  }

  let selected: Project | null = null

  let searchKeyword: string

  $: filtered = projects.filter(({ name }) => searchKeyword ? name.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()) : true)
</script>

<Modal
  bind:opened
  on:opened={() => {
    selected = projects.find(project => project.id === currentProject?.id) ?? null
  }}
  on:closed={() => {
    if (currentProject === null) {
      opened = true
    }
  }}
>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <h2>譜面一覧</h2>
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
      bind:value={searchKeyword}
    >
      <Icon slot="head" icon="ic:outline-search"/>
      <span slot="tail">{filtered?.length ?? 0}/{projects?.length ?? 0}</span>
    </TextInput>
    <div class="project-container"> 
      {#each filtered as project}
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
          on:delete={() => {
            if (selected && confirm('本当に削除しますか？')) {
              dispatch('delete', selected.id)
            }
          }}
          on:select={() => {
            selected = project
          }}
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
      SUSを開く
    </Button>
    <Button
      class="new"
      icon="mdi:plus-thick"
      on:click={() => {
        dispatch('new')
        opened = false
      }}
    >
      新規作成
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