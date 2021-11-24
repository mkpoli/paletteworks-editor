<script lang="ts">
  // UI Components
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import Icon from "@iconify/svelte"

  import Modal from "$lib/ui/Modal.svelte"
  import TextInput from "$lib/ui/TextInput.svelte"
  import ProjectCard from '$lib/dialogs/ProjectCard.svelte'

  // Events
  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher<{
    open: { project: Project },
    new: void,
    openfile: void,
    cancel: void,
  }>()

  export let opened: boolean

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

  function ondelete() {
    if (selected && confirm('本当に削除しますか？')) {
      db.projects.delete(selected.id!)
    }
  }
</script>

<Modal bind:opened on:open={async () => {
  await tick()
  selected = projects.length ? projects[0] : null
}}>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <h2>譜面一覧</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { dispatch('cancel'); opened = false }}
      />
    </div>
    <TextInput
      class="search"
      bind:value={searchKeyword}
    >
      <Icon slot="head" icon="ic:outline-search"/>
    </TextInput>
    <div class="project-container">
      {#each projects.filter(({ name }) => searchKeyword ? name.includes(searchKeyword) : true) as project}
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